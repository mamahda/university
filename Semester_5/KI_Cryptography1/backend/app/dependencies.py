"""Dependency dan helper yang dipakai bersama oleh semua router."""

import sqlite3
from collections.abc import Generator

from fastapi import Depends, HTTPException, Request
from starlette import status

from app.core.config import Settings, get_settings
from app.core.security import CurrentUser, get_current_user
from app.db.database import connect_db
from app.db.settings_store import get_setting


def get_db(
    settings: Settings = Depends(get_settings),
) -> Generator[sqlite3.Connection, None, None]:
    """Satu koneksi SQLite per request; commit jika sukses, rollback jika error."""
    connection = connect_db(settings.database_path_abs)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def require_consent(
    current_user: CurrentUser = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
) -> None:
    """Dipasang di endpoint profil dan dokumen: menolak peserta yang belum
    menyetujui pemberitahuan privasi versi aktif."""
    policy_version = get_setting(db, "privacy_policy_version")
    row = db.execute(
        "SELECT 1 FROM consents WHERE user_id = ? AND policy_version = ? AND withdrawn_at IS NULL",
        (current_user.id, policy_version),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            {
                "code": "consent_required",
                "message": "Setujui pemberitahuan privasi dulu",
            },
        )


async def read_upload(
    request: Request, filename: str, allowed: dict[str, str], max_mb: int
) -> tuple[bytes, str, str]:
    """Baca body upload, cek ekstensi dan ukurannya. Kembalikan (isi, ekstensi, content_type)."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in allowed:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            f"Tipe file harus: {', '.join(allowed)}",
        )

    data = await request.body()
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File kosong")
    if len(data) > max_mb * 1024 * 1024:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"Ukuran file maksimal {max_mb} MB",
        )
    return data, ext, allowed[ext]
