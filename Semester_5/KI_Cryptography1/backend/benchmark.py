"""Controlled benchmark CLI. Run from backend/: python benchmark.py --help."""

import argparse
import csv
import hashlib
import json
import secrets
from contextlib import closing
from copy import deepcopy
from dataclasses import replace
from pathlib import Path
from uuid import uuid4

from app.benchmarking import benchmark_environment, save_samples
from app.crypto_services import CIPHER_NAMES, CryptoService, IntegrityError
from app.db.database import connect_db, migrate_db

DEFAULT_SIZES = [100, 512 * 1024, 2 * 1024**2, 5 * 1024**2, 100 * 1024**2]
FIELDS = dict(zip(DEFAULT_SIZES, ["text", "ktp", "ktm", "proposal", "video"]))


def check_correctness(crypto: CryptoService, cipher: str) -> None:
    data = b"benchmark correctness: dummy bytes"
    sealed = crypto.seal(data, cipher=cipher, context="correctness")
    if crypto.open(sealed, context="correctness") != data:
        raise RuntimeError(f"{cipher}: hasil dekripsi berbeda")
    damaged = replace(
        sealed, ciphertext=bytes([sealed.ciphertext[0] ^ 1]) + sealed.ciphertext[1:]
    )
    for payload, context in [(damaged, "correctness"), (sealed, "different-item")]:
        try:
            crypto.open(payload, context=context)
        except IntegrityError:
            continue
        raise RuntimeError(f"{cipher}: manipulasi tidak ditolak")
    if (
        crypto.seal(data, cipher=cipher, context="correctness").ciphertext
        == sealed.ciphertext
    ):
        raise RuntimeError(f"{cipher}: enkripsi berulang menghasilkan ciphertext sama")


def run_benchmark(
    database_path: Path,
    *,
    sizes: list[int] = DEFAULT_SIZES,
    repeats: int = 30,
    warmup: int = 3,
    csv_path: Path | None = None,
) -> str:
    if (
        repeats < 1
        or warmup < 0
        or not sizes
        or any(size <= 0 for size in sizes)
        or len(set(sizes)) != len(sizes)
    ):
        raise ValueError("Ukuran harus positif dan unik; repeats >= 1; warmup >= 0")
    crypto = CryptoService(
        secrets.token_hex(32)
    )  # Ephemeral benchmark key, never saved or logged.
    for cipher in CIPHER_NAMES:
        check_correctness(crypto, cipher)
    run_id = str(uuid4())
    env = deepcopy(benchmark_environment())
    env.update(repeats=repeats, warmup=warmup, sizes_bytes=sizes)
    samples = []
    for size in sizes:
        data = secrets.token_bytes(size)
        expected_hash = hashlib.sha256(data).digest()
        for iteration in range(warmup + repeats):
            offset = iteration % len(CIPHER_NAMES)
            order = CIPHER_NAMES[offset:] + CIPHER_NAMES[:offset]
            for cipher in order:
                timings = [] if iteration >= warmup else None
                context = str(uuid4())
                sealed = crypto.seal(
                    data, cipher=cipher, context=context, timings=timings
                )
                recovered = crypto.open(sealed, context=context, timings=timings)
                if hashlib.sha256(recovered).digest() != expected_hash:
                    raise RuntimeError(f"{cipher}: round-trip gagal untuk {size} byte")
                if timings is not None:
                    samples.extend(
                        {
                            "cipher": cipher,
                            "operation": op,
                            "field": FIELDS.get(size, "synthetic"),
                            "size_bytes": size,
                            "duration_ns": duration,
                        }
                        for op, duration in timings
                    )
                del sealed, recovered
    migrate_db(database_path)
    with closing(connect_db(database_path)) as db:
        with db:
            save_samples(
                db, run_id=run_id, source="controlled", samples=samples, env=env
            )
    if csv_path is not None:
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        with csv_path.open("w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(
                stream,
                fieldnames=[
                    "run_id",
                    "source",
                    "cipher",
                    "operation",
                    "field",
                    "size_bytes",
                    "duration_ns",
                    "env",
                ],
            )
            writer.writeheader()
            writer.writerows(
                {
                    "run_id": run_id,
                    "source": "controlled",
                    **sample,
                    "env": json.dumps(env, sort_keys=True),
                }
                for sample in samples
            )
    return run_id


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Benchmark AES-CTR, DES-CTR, RC4-drop3072, HMAC, dan AES-GCM key wrapping"
    )
    parser.add_argument(
        "--database",
        type=Path,
        help="Database tujuan; default mengikuti DATABASE_PATH di .env",
    )
    parser.add_argument(
        "--sizes", type=int, nargs="+", default=DEFAULT_SIZES, metavar="BYTES"
    )
    parser.add_argument("--repeats", type=int, default=30)
    parser.add_argument("--warmup", type=int, default=3)
    parser.add_argument("--csv", type=Path, help="Ekspor sampel mentah ke CSV")
    args = parser.parse_args()
    if args.repeats < 30 or args.warmup < 3:
        parser.error("CLI mengikuti PRD: repeats minimal 30 dan warmup minimal 3")
    if not args.database:
        from app.core.config import get_settings

        args.database = get_settings().database_path_abs
    try:
        run_id = run_benchmark(
            args.database,
            sizes=args.sizes,
            repeats=args.repeats,
            warmup=args.warmup,
            csv_path=args.csv,
        )
    except (ValueError, RuntimeError) as error:
        parser.exit(1, f"Benchmark gagal: {error}\n")
    print(
        json.dumps(
            {
                "run_id": run_id,
                "source": "controlled",
                "database": str(args.database),
                "repeats": args.repeats,
                "warmup": args.warmup,
                "sizes_bytes": args.sizes,
            }
        )
    )


if __name__ == "__main__":
    main()
