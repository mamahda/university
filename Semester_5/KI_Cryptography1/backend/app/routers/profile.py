"""Modul Profil: mengisi dan mengubah data diri (satu field = satu baris items)."""

import sqlite3

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import CurrentUser, require_csrf, require_roles
from app.db.items import write_item
from app.dependencies import get_db, require_consent
from app.db.views import profile_data

router = APIRouter(prefix="/profile", tags=["profile"])

# Mengubah salah satu ini setelah terverifikasi mengembalikan status ke "menunggu".
IDENTITY_FIELDS = {"full_name", "nim", "institution"}


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    nim: str | None = None
    study_program: str | None = None
    institution: str | None = None
    birth_date: str | None = None
    domicile: str | None = None
    phone: str | None = None


@router.get("")
def get_my_profile(
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    return profile_data(db, current_user.id)


@router.put("")
def update_my_profile(
    body: ProfileUpdate,
    current_user: CurrentUser = Depends(require_roles("peserta")),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
    _consent: None = Depends(require_consent),
) -> dict:
    changes = body.model_dump(exclude_unset=True, exclude_none=True)
    touched_identity = False
    for field, value in changes.items():
        write_item(db, owner_user_id=current_user.id, field=field, value=value)
        if field in IDENTITY_FIELDS:
            touched_identity = True

    if touched_identity:
        db.execute(
            "UPDATE users SET verification_status = 'menunggu', "
            "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') "
            "WHERE id = ? AND verification_status = 'terverifikasi'",
            (current_user.id,),
        )
    return profile_data(db, current_user.id)
