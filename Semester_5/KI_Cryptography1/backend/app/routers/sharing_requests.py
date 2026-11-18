"""Permintaan dan persetujuan akses data antarpeserta (Assignment 2, anggota 1).

Endpoint key (anggota 2) dan transfer ciphertext/key-file (anggota 3) ada di
router terpisah; aturan aksesnya bersama di `app/db/sharing.py`.
"""

import sqlite3
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, field_validator
from starlette import status

from app.core.crypto import get_crypto_service
from app.core.security import CurrentUser, require_csrf, require_roles
from app.crypto_services import CryptoError
from app.db.sharing import (
    MAX_APPROVE_ITEMS,
    aes_sealed,
    get_request,
    is_active_peserta,
    not_found,
    public_key_of,
    request_data,
    shareable_items,
)
from app.dependencies import get_db, require_consent


def _no_store(response: Response) -> None:
    response.headers["Cache-Control"] = "no-store"


peserta = require_roles("peserta")

# Urutan penting: role dicek sebelum consent, agar juri/admin mendapat 403 biasa.
router = APIRouter(
    prefix="/sharing/requests",
    tags=["sharing"],
    dependencies=[Depends(peserta), Depends(require_consent), Depends(_no_store)],
)


class CreateRequestBody(BaseModel):
    owner_id: UUID


class ApproveBody(BaseModel):
    item_ids: list[UUID]

    @field_validator("item_ids")
    @classmethod
    def _one_to_twenty_unique(cls, value: list[UUID]) -> list[UUID]:
        unique = list(dict.fromkeys(value))
        if not 1 <= len(unique) <= MAX_APPROVE_ITEMS:
            raise ValueError(f"Pilih 1 sampai {MAX_APPROVE_ITEMS} item")
        return unique


def _conflict(code: str, message: str) -> HTTPException:
    return HTTPException(409, {"code": code, "message": message})


def _wrap_service():
    """Fungsi rewrap milik anggota 3 (`wrap_existing_aes_keys`)."""
    # shortcut: diimpor saat dipakai karena modul anggota 3 belum ada di branch ini;
    # pindahkan ke import biasa di atas file setelah branch anggota 3 digabung.
    try:
        from app.crypto_services.sharing import wrap_existing_aes_keys
    except ImportError:
        raise HTTPException(
            503,
            {
                "code": "sharing_unavailable",
                "message": "Layanan enkripsi berbagi belum terpasang",
            },
        ) from None
    return wrap_existing_aes_keys


@router.post("", status_code=status.HTTP_201_CREATED)
def create_request(
    body: CreateRequestBody,
    current_user: CurrentUser = Depends(peserta),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    owner_id = str(body.owner_id)
    if owner_id == current_user.id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Tidak bisa meminta data milik sendiri"
        )
    if public_key_of(db, current_user.id) is None:
        raise _conflict("key_required", "Daftarkan public key dulu sebelum meminta data")
    if not is_active_peserta(db, owner_id):
        raise not_found()

    request_id = str(uuid4())
    db.execute(
        "INSERT INTO sharing_requests (id, owner_id, requester_id) VALUES (?, ?, ?)",
        (request_id, owner_id, current_user.id),
    )
    row = db.execute(
        "SELECT * FROM sharing_requests WHERE id = ?", (request_id,)
    ).fetchone()
    return request_data(row)


def _list(db: sqlite3.Connection, column: str, user_id: str) -> dict:
    rows = db.execute(
        f"SELECT * FROM sharing_requests WHERE {column} = ? ORDER BY created_at DESC",
        (user_id,),
    ).fetchall()
    return {"requests": [request_data(row) for row in rows]}


@router.get("/incoming")
def incoming_requests(
    current_user: CurrentUser = Depends(peserta),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    return _list(db, "owner_id", current_user.id)


@router.get("/outgoing")
def outgoing_requests(
    current_user: CurrentUser = Depends(peserta),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    return _list(db, "requester_id", current_user.id)


@router.get("/{request_id}/available-items")
def available_items(
    request_id: str,
    current_user: CurrentUser = Depends(peserta),
    db: sqlite3.Connection = Depends(get_db),
) -> dict:
    request = get_request(db, request_id, current_user.id, party="owner", status="pending")
    return {
        "items": [
            {
                "item_id": row["id"],
                "field": row["field"],
                "content_type": row["content_type"],
                "size_bytes": row["size_bytes"],
                "aes_available": row["aes_ciphertext_id"] is not None,
            }
            for row in shareable_items(db, request["owner_id"])
        ]
    }


@router.post("/{request_id}/approve")
def approve_request(
    request_id: str,
    body: ApproveBody,
    current_user: CurrentUser = Depends(peserta),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    # Satu transaksi (get_db): kalau satu item gagal, semua grant dan status di-rollback.
    request = get_request(db, request_id, current_user.id, party="owner", status="pending")
    key = public_key_of(db, request["requester_id"])
    if key is None:
        raise _conflict("key_required", "Peminta belum mendaftarkan public key")

    available = {row["id"]: row for row in shareable_items(db, request["owner_id"])}
    chosen = [available.get(str(item_id)) for item_id in body.item_ids]
    if any(row is None for row in chosen):
        raise not_found()
    if any(row["aes_ciphertext_id"] is None for row in chosen):
        raise _conflict("aes_unavailable", "Item tidak punya ciphertext AES untuk dibagikan")

    wrap = _wrap_service()
    crypto = get_crypto_service()
    for row in chosen:
        try:
            encrypted_key = wrap(
                crypto=crypto,
                sealed=aes_sealed(db, row["aes_ciphertext_id"]),
                item_id=row["id"],
                public_key_spki_der=key["public_key_spki"],
            )
        except CryptoError:
            raise _conflict(
                "sharing_wrap_failed", "Kunci item tidak dapat dibungkus untuk peminta"
            ) from None
        db.execute(
            "INSERT INTO sharing_grants (id, request_id, item_id, ciphertext_id, "
            "recipient_key_id, encrypted_key) VALUES (?, ?, ?, ?, ?, ?)",
            (
                str(uuid4()),
                request_id,
                row["id"],
                row["aes_ciphertext_id"],
                key["id"],
                encrypted_key,
            ),
        )
    return _decide(db, request_id, "approved")


@router.post("/{request_id}/reject")
def reject_request(
    request_id: str,
    current_user: CurrentUser = Depends(peserta),
    db: sqlite3.Connection = Depends(get_db),
    _csrf: None = Depends(require_csrf),
) -> dict:
    get_request(db, request_id, current_user.id, party="owner", status="pending")
    return _decide(db, request_id, "rejected")


def _decide(db: sqlite3.Connection, request_id: str, decision: str) -> dict:
    updated = db.execute(
        "UPDATE sharing_requests SET status = ?, "
        "decided_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') "
        "WHERE id = ? AND status = 'pending'",
        (decision, request_id),
    )
    if updated.rowcount != 1:  # keputusan lain masuk lebih dulu
        raise _conflict("already_decided", "Permintaan sudah diputuskan")
    row = db.execute(
        "SELECT * FROM sharing_requests WHERE id = ?", (request_id,)
    ).fetchone()
    return request_data(row)
