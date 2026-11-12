"""Profil sesi, pengaturan publik, serta akses dan ekspor data sendiri."""

import io
import json
import mimetypes
import sqlite3
import zipfile

from fastapi import APIRouter, Depends, Query, Response

from app.core.config import Settings, get_settings
from app.core.security import CurrentUser, get_current_user, require_roles
from app.db.items import read_file, read_original_filename
from app.db.views import item_meta, me_data, profile_data, public_settings
from app.dependencies import get_db

router = APIRouter(tags=["account"])


@router.get("/me")
def me(
    current_user: CurrentUser = Depends(get_current_user),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    return me_data(db, current_user.id)


@router.get("/settings")
def settings(db: sqlite3.Connection = Depends(get_db)) -> dict:
    return public_settings(db)


@router.get("/me/items")
def my_items(
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    # Item pendukung (email, catatan verifikasi, nama file asli) bukan data yang diunggah peserta.
    rows = db.execute(
        "SELECT * FROM items WHERE owner_user_id = ? AND shredded_at IS NULL "
        "AND parent_item_id IS NULL AND field NOT IN ('email', 'verification_note')",
        (current_user.id,),
    ).fetchall()
    return {"items": [item_meta(db, row) for row in rows]}


@router.get("/me/access-log")
def my_access_log(
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> dict:
    rows = db.execute(
        "SELECT * FROM audit_logs WHERE subject_user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (current_user.id, page_size, (page - 1) * page_size),
    ).fetchall()
    total = db.execute(
        "SELECT COUNT(*) FROM audit_logs WHERE subject_user_id = ?", (current_user.id,)
    ).fetchone()[0]
    return {
        "items": [dict(row) for row in rows],
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.get("/me/export")
def export_data(
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> Response:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(
            "profile.json",
            json.dumps(
                {
                    "user": me_data(db, current_user.id),
                    "profile": profile_data(db, current_user.id),
                },
                ensure_ascii=False,
            ),
        )
        for row in db.execute(
            "SELECT * FROM items WHERE owner_user_id = ? AND storage = 'fs' "
            "AND shredded_at IS NULL AND parent_item_id IS NULL",
            (current_user.id,),
        ).fetchall():
            # File di storage/ terenkripsi; ekspor harus berisi file aslinya.
            name = read_original_filename(db, row["id"]) or ""
            ext = (
                name.rsplit(".", 1)[-1].lower()
                if "." in name
                else (mimetypes.guess_extension(row["content_type"] or "") or ".bin").lstrip(".")
            )
            archive.writestr(
                f"{row['field']}/{row['id']}.{ext}",
                read_file(db, row["id"], settings.storage_dir_abs),
            )
    return Response(
        buffer.getvalue(),
        media_type="application/zip",
        headers={
            "Content-Disposition": 'attachment; filename="data-saya.zip"',
            "Cache-Control": "no-store",
        },
    )
