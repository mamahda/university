"""SQLite setup for the Schematics NIC backend."""

import sqlite3
from contextlib import closing
from pathlib import Path


# Skema versi kripto (tabel `ciphertexts`, `users.email_index`). Skema plaintext lama
# masih ada di "migrations_before_crypto" sebagai arsip, tidak lagi dijalankan.
MIGRATIONS = Path(__file__).with_name("migrations")


def connect_db(database_path: str | Path) -> sqlite3.Connection:
    """Open a configured SQLite connection. The caller closes it."""
    connection = sqlite3.connect(database_path, timeout=5, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA busy_timeout = 5000")
    connection.execute("PRAGMA journal_mode = WAL")
    return connection


def _reject_plaintext_database(connection: sqlite3.Connection) -> None:
    """Database dari skema plaintext lama tidak bisa dipakai tanpa konversi data."""
    columns = {row["name"] for row in connection.execute("PRAGMA table_info(users)")}
    if "email" in columns and "email_index" not in columns:
        raise RuntimeError(
            "Database ini masih berskema plaintext (users.email). Hapus file database "
            "(data/ dan storage/) lalu jalankan ulang, atau konversi datanya dulu."
        )


def migrate_db(database_path: str | Path) -> None:
    """Apply pending numbered SQL migrations to the database."""
    Path(database_path).parent.mkdir(parents=True, exist_ok=True)
    with closing(connect_db(database_path)) as connection:
        _reject_plaintext_database(connection)
        current = connection.execute("PRAGMA user_version").fetchone()[0]
        migrations = sorted(MIGRATIONS.glob("[0-9][0-9][0-9]_*.sql"))
        versions = [int(path.name.split("_", 1)[0]) for path in migrations]

        if current > (versions[-1] if versions else 0):
            raise RuntimeError("Database schema is newer than the available migrations")
        if versions != list(range(1, len(versions) + 1)):
            raise RuntimeError("Migration files must be numbered consecutively from 001")

        for version, migration in zip(versions, migrations):
            if version <= current:
                continue
            try:
                connection.executescript(migration.read_text(encoding="utf-8"))
            except Exception:
                if connection.in_transaction:
                    connection.rollback()
                raise
