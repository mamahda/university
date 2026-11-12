import csv
import json
import sys
from contextlib import closing
from dataclasses import replace
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.crypto_services import CryptoService, IntegrityError
from app.db.database import connect_db, migrate_db


@pytest.mark.parametrize("cipher", ["aes", "des", "rc4"])
def test_phase_timings_roundtrip_and_tamper(cipher):
    crypto = CryptoService("benchmark-tests-root-key-not-used-in-app")
    timings = []
    sealed = crypto.seal(
        b"dummy benchmark data", cipher=cipher, context="item", timings=timings
    )
    assert (
        crypto.open(sealed, context="item", timings=timings) == b"dummy benchmark data"
    )
    assert sorted(operation for operation, _ in timings) == [
        "dec",
        "enc",
        "hmac",
        "hmac",
        "wrap",
    ]
    assert all(duration > 0 for _, duration in timings)
    if cipher == "aes":
        assert len(sealed.nonce) == 8
    damaged = replace(
        sealed, ciphertext=bytes([sealed.ciphertext[0] ^ 1]) + sealed.ciphertext[1:]
    )
    with pytest.raises(IntegrityError):
        crypto.open(damaged, context="item")
    with pytest.raises(IntegrityError):
        crypto.open(replace(sealed, hmac_tag=b""), context="item")


def test_controlled_runner_persists_raw_samples_and_exports_csv(tmp_path):
    from benchmark import run_benchmark

    database = tmp_path / "benchmark.db"
    export = tmp_path / "samples.csv"
    run_id = run_benchmark(
        database, sizes=[100, 1024], repeats=2, warmup=1, csv_path=export
    )
    with closing(connect_db(database)) as db:
        rows = db.execute("SELECT * FROM benchmark_runs").fetchall()
    assert len(rows) == 2 * 2 * 3 * 5
    assert {row["run_id"] for row in rows} == {run_id}
    assert {row["source"] for row in rows} == {"controlled"}
    assert all(row["duration_ns"] > 0 for row in rows)
    env = json.loads(rows[0]["env"])
    assert env["parameters"]["rc4"]["drop_bytes"] == 3072
    assert env["parameters"]["rc4"]["hmac"] is True
    with export.open(newline="", encoding="utf-8") as stream:
        records = list(csv.DictReader(stream))
    assert len(records) == len(rows)
    assert not ({"key", "plaintext", "ciphertext"} & records[0].keys())


def test_summary_keeps_runs_separate_and_computes_throughput_quartiles(tmp_path):
    from app.benchmarking import benchmark_summary

    database = tmp_path / "benchmark.db"
    migrate_db(database)
    with closing(connect_db(database)) as db:
        for number, (run, duration) in enumerate(
            [
                ("first", 1_000_000_000),
                ("first", 4_000_000_000),
                ("second", 10_000_000_000),
            ]
        ):
            db.execute(
                "INSERT INTO benchmark_runs (id, run_id, cipher, operation, field, size_bytes, duration_ns, source, env) VALUES (?, ?, 'aes', 'enc', 'synthetic', 1000000, ?, 'controlled', '{}')",
                (str(number), run, duration),
            )
        summary = benchmark_summary(db, source="controlled", run_id="first")
        row = summary["rows"][0]
        assert row["n"] == 2
        assert row["median_mb_s"] == pytest.approx(0.625)
        assert row["q1_mb_s"] == pytest.approx(0.4375)
        assert row["q3_mb_s"] == pytest.approx(0.8125)
        assert row["sufficient_samples"] is False
        assert benchmark_summary(db, source="controlled")["run_id"] == "second"
        assert benchmark_summary(db, source="live")["rows"] == []


def test_cli_runs_prd_minimum_and_rejects_short_runs(tmp_path):
    import subprocess

    script = Path(__file__).resolve().parents[1] / "benchmark.py"
    command = [
        sys.executable,
        str(script),
        "--database",
        str(tmp_path / "cli.db"),
        "--sizes",
        "100",
        "--repeats",
        "30",
        "--warmup",
        "3",
    ]
    completed = subprocess.run(command, capture_output=True, text=True, check=True)
    run_id = json.loads(completed.stdout)["run_id"]
    with closing(connect_db(tmp_path / "cli.db")) as db:
        assert (
            db.execute(
                "SELECT COUNT(*) FROM benchmark_runs WHERE run_id = ?", (run_id,)
            ).fetchone()[0]
            == 30 * 3 * 5
        )
    invalid = subprocess.run(
        [*command, "--repeats", "1"], capture_output=True, text=True
    )
    assert invalid.returncode != 0


def test_aes_legacy_nonce_still_readable():
    from Crypto.Cipher import AES
    from app.crypto_services._mac import compute_tag
    from app.crypto_services.envelope import SealedCiphertext, build_aad, wrap_keys
    from app.crypto_services.keyring import Keyring

    root = "legacy-aes-root-key-at-least-32-characters"
    enc_key, mac_key, old_nonce = (
        bytes(range(32)),
        bytes(range(32, 64)),
        b"123456789012",
    )
    aad = build_aad("legacy-aes", "aes", 1)
    ciphertext = AES.new(enc_key, AES.MODE_CTR, nonce=old_nonce).encrypt(
        b"old aes data"
    )
    nonce, wrapped, tag = wrap_keys(Keyring(root).kek(1), enc_key + mac_key, aad)
    sealed = SealedCiphertext(
        "aes",
        old_nonce,
        nonce,
        wrapped,
        tag,
        1,
        compute_tag(mac_key, aad, old_nonce, ciphertext),
        ciphertext,
    )
    assert CryptoService(root).open(sealed, context="legacy-aes") == b"old aes data"


def test_rc4_legacy_ciphertext_still_readable():
    from Crypto.Cipher import ARC4
    from app.crypto_services.envelope import SealedCiphertext, build_aad, wrap_keys
    from app.crypto_services.keyring import Keyring

    root = "legacy-test-root-key-at-least-32-characters"
    enc_key = bytes(range(16))
    nonce, wrapped, tag = wrap_keys(
        Keyring(root).kek(1), enc_key, build_aad("legacy", "rc4", 1)
    )
    sealed = SealedCiphertext(
        "rc4", None, nonce, wrapped, tag, 1, b"", ARC4.new(enc_key).encrypt(b"old data")
    )
    assert CryptoService(root).open(sealed, context="legacy") == b"old data"


def test_database_crypto_operations_record_live_timings(tmp_path, monkeypatch):
    monkeypatch.setenv("ROOT_KEY", "live-test-root-key-at-least-32-characters")
    monkeypatch.setenv("JWT_SECRET_KEY", "live-test-jwt-key-at-least-32-characters")
    from app.core.config import get_settings

    get_settings.cache_clear()
    from app.db.ciphertexts import store_ciphertexts, load_plaintext

    database = tmp_path / "live.db"
    migrate_db(database)
    with closing(connect_db(database)) as db:
        db.execute(
            "INSERT INTO users (id, email_index, password_hash, role) VALUES ('user', ?, 'hash', 'peserta')",
            (b"index",),
        )
        db.execute(
            "INSERT INTO items (id, owner_user_id, field, storage, size_bytes) VALUES ('item', 'user', 'full_name', 'db', 4)"
        )
        store_ciphertexts(db, item_id="item", plaintext=b"data", storage="db")
        assert load_plaintext(db, "item") == b"data"
        rows = db.execute("SELECT * FROM benchmark_runs").fetchall()
    assert {row["source"] for row in rows} == {"live"}
    assert len(rows) == 3 * 3 + 3 * 2  # simpan: 3 cipher; baca: dekripsi ketiganya
    assert {row["cipher"] for row in rows if row["operation"] == "dec"} == {"aes", "des", "rc4"}
    assert {row["field"] for row in rows} == {"full_name"}
    get_settings.cache_clear()
