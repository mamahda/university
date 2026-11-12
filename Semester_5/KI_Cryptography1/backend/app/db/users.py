"""Akun pengguna. Email tidak disimpan di tabel `users`: pencarian memakai
`email_index` (blind index HMAC), nilai emailnya sendiri terenkripsi sebagai item
`email` milik user."""

import sqlite3
from uuid import uuid4

from app.core.crypto import get_crypto_service
from app.db.items import read_item, write_item


def email_index(email: str) -> bytes:
    return get_crypto_service().email_index(email)


def email_taken(db: sqlite3.Connection, email: str) -> bool:
    return (
        db.execute(
            "SELECT 1 FROM users WHERE email_index = ?", (email_index(email),)
        ).fetchone()
        is not None
    )


def create_user(
    db: sqlite3.Connection,
    *,
    email: str,
    password_hash: str,
    role: str,
    verification_status: str | None = None,
    must_change_password: bool = False,
) -> str:
    """Buat user + simpan emailnya terenkripsi. Kembalikan id user."""
    email = email.strip().lower()
    user_id = str(uuid4())
    columns = ["id", "email_index", "password_hash", "role", "must_change_password"]
    values = [user_id, email_index(email), password_hash, role, int(must_change_password)]
    if verification_status is not None:
        columns.append("verification_status")
        values.append(verification_status)
    db.execute(
        f"INSERT INTO users ({', '.join(columns)}) VALUES ({', '.join('?' * len(columns))})",
        values,
    )
    write_item(db, owner_user_id=user_id, field="email", value=email)
    return user_id


def get_email(db: sqlite3.Connection, user_id: str) -> str | None:
    return read_item(db, owner_user_id=user_id, field="email")
