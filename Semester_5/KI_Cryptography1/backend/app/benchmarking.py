"""Raw benchmark samples and summaries shared by CLI, live storage and API."""

import hashlib
import json
import platform
import sqlite3
from collections import defaultdict
from copy import deepcopy
from functools import lru_cache
from statistics import median, quantiles
from uuid import uuid4

import Crypto

LIVE_RUN = f"live-{uuid4()}"
SAMPLE_TARGET = 30


@lru_cache
def benchmark_environment() -> dict:
    try:
        from Crypto.Util import _cpu_features

        aes_ni = bool(_cpu_features.have_aes_ni())
    except (ImportError, AttributeError):
        aes_ni = None
    return {
        "cpu": platform.processor() or platform.machine(),
        "aes_ni": aes_ni,
        "python": platform.python_version(),
        "pycryptodome": Crypto.__version__,
        "os": platform.platform(),
        "protocol": "crypto-phases-v1",
        "parameters": {
            "aes": {"key_bits": 256, "nonce_bytes": 8, "hmac": True},
            "des": {"key_bits": 56, "nonce_bytes": 4, "hmac": True},
            "rc4": {
                "key_bits": 128,
                "nonce_bytes": 0,
                "drop_bytes": 3072,
                "hmac": True,
            },
        },
    }


def save_samples(
    db: sqlite3.Connection, *, run_id: str, source: str, samples: list[dict], env: dict
) -> None:
    encoded = json.dumps(env, sort_keys=True)
    db.executemany(
        "INSERT INTO benchmark_runs (id, run_id, cipher, operation, field, size_bytes, duration_ns, source, env) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
            (
                str(uuid4()),
                run_id,
                sample["cipher"],
                sample["operation"],
                sample["field"],
                sample["size_bytes"],
                sample["duration_ns"],
                source,
                encoded,
            )
            for sample in samples
        ],
    )


def record_live(
    db: sqlite3.Connection,
    *,
    timings: list[tuple[str, int]],
    cipher: str,
    field: str,
    size_bytes: int,
    nonce_bytes: int,
    legacy_rc4: bool = False,
) -> None:
    env = deepcopy(benchmark_environment())
    env["parameters"][cipher]["nonce_bytes"] = nonce_bytes
    if legacy_rc4:
        env["parameters"]["rc4"].update(drop_bytes=0, hmac=False)
    signature = hashlib.sha256(json.dumps(env, sort_keys=True).encode()).hexdigest()[
        :12
    ]
    save_samples(
        db,
        run_id=f"{LIVE_RUN}-{signature}",
        source="live",
        env=env,
        samples=[
            {
                "cipher": cipher,
                "operation": operation,
                "field": field,
                "size_bytes": size_bytes,
                "duration_ns": duration,
            }
            for operation, duration in timings
        ],
    )


def _quartiles(values: list[float]) -> tuple[float, float, float]:
    if len(values) == 1:
        return values[0], values[0], values[0]
    q1, _, q3 = quantiles(values, n=4, method="inclusive")
    return q1, median(values), q3


def benchmark_summary(
    db: sqlite3.Connection,
    *,
    source: str = "controlled",
    run_id: str | None = None,
    operation: str | None = None,
) -> dict:
    runs = db.execute(
        "SELECT run_id, MIN(created_at) AS created_at, COUNT(*) AS sample_count FROM benchmark_runs WHERE source = ? GROUP BY run_id ORDER BY MAX(rowid) DESC",
        (source,),
    ).fetchall()
    if run_id is None and runs:
        run_id = runs[0]["run_id"]
    if run_id is not None and not any(row["run_id"] == run_id for row in runs):
        raise LookupError("Run benchmark tidak ditemukan untuk sumber ini")
    response = {
        "run_id": run_id,
        "source": source,
        "env": None,
        "rows": [],
        "runs": [dict(row) for row in runs],
    }
    if run_id is None:
        return response
    # Read the whole run so filtering operations cannot hide incompatible environment records.
    records = db.execute(
        "SELECT * FROM benchmark_runs WHERE source = ? AND run_id = ?", (source, run_id)
    ).fetchall()
    environments = [json.loads(row["env"]) for row in records]
    if any(env != environments[0] for env in environments):
        raise ValueError(
            "Satu run memuat lingkungan berbeda; jalankan ulang benchmark dengan run_id baru"
        )
    response["env"] = environments[0]
    groups = defaultdict(list)
    for record in records:
        if operation is None or record["operation"] == operation:
            groups[
                (record["cipher"], record["operation"], record["size_bytes"])
            ].append(record["duration_ns"])
    for (cipher, op, size), durations in sorted(groups.items()):
        q1, middle, q3 = _quartiles(durations)
        throughputs = (
            [
                size / 1_000_000 / (duration / 1e9)
                for duration in durations
                if duration > 0
            ]
            if op != "wrap"
            else []
        )
        rate_q1, rate_median, rate_q3 = (
            _quartiles(throughputs) if throughputs else (None, None, None)
        )
        response["rows"].append(
            {
                "cipher": cipher,
                "operation": op,
                "size_bytes": size,
                "n": len(durations),
                "median_ns": middle,
                "q1_ns": q1,
                "q3_ns": q3,
                "median_mb_s": rate_median,
                "q1_mb_s": rate_q1,
                "q3_mb_s": rate_q3,
                "sufficient_samples": len(durations) >= SAMPLE_TARGET,
            }
        )
    return response
