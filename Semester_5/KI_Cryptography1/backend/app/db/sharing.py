"""Aturan akses berbagi data antarpeserta (Assignment 2).

Dipakai router permintaan akses (`routers/sharing_requests.py`) dan router transfer
anggota 3 (`routers/sharing_transfer.py`). Semua penolakan akses dijawab 404, agar
request milik orang lain tidak bisa dibedakan dari request yang tidak ada.
Helper di sini tidak pernah commit; `get_db` yang commit/rollback.
"""

import sqlite3

from fastapi import HTTPException

from app.crypto_services import SealedCiphertext
from app.db.settings_store import get_setting

# Field profil/dokumen milik peserta yang boleh dibagikan. Email, nama file asli
# (item anak), item tim, dan catatan internal tidak termasuk.
SHAREABLE_FIELDS = (
    "full_name",
    "nim",
    "study_program",
    "institution",
    "birth_date",
    "domicile",
    "phone",
    "ktp",
    "ktm",
    "twibbon",
)
MAX_APPROVE_ITEMS = 20

_FIELD_PLACEHOLDERS = ",".join("?" for _ in SHAREABLE_FIELDS)


def not_found() -> HTTPException:
    return HTTPException(404, {"code": "not_found", "message": "Data tidak ditemukan"})


def is_active_peserta(db: sqlite3.Connection, user_id: str) -> bool:
    """Peserta yang akunnya aktif dan masih menyetujui kebijakan privasi versi aktif."""
    row = db.execute(
        "SELECT 1 FROM users JOIN consents ON consents.user_id = users.id "
        "WHERE users.id = ? AND users.role = 'peserta' AND users.disabled = 0 "
        "AND consents.policy_version = ? AND consents.withdrawn_at IS NULL",
        (user_id, get_setting(db, "privacy_policy_version")),
    ).fetchone()
    return row is not None


def public_key_of(db: sqlite3.Connection, user_id: str) -> sqlite3.Row | None:
    return db.execute(
        "SELECT * FROM sharing_public_keys WHERE user_id = ?", (user_id,)
    ).fetchone()


def get_request(
    db: sqlite3.Connection,
    request_id: str,
    user_id: str,
    *,
    party: str,
    status: str,
) -> sqlite3.Row:
    """Request `request_id` berstatus `status` dengan `user_id` sebagai `party`
    ('owner' atau 'requester'), atau 404. Kedua pihak harus masih peserta aktif
    dengan consent berlaku.

    Contoh: keputusan owner -> party='owner', status='pending'; mengambil data
    penerima -> party='requester', status='approved' lalu `active_grants()`.
    """
    row = db.execute(
        "SELECT * FROM sharing_requests WHERE id = ?", (request_id,)
    ).fetchone()
    if row is None:
        raise not_found()
    if row[f"{party}_id"] != user_id or row["status"] != status:
        raise not_found()
    if not (
        is_active_peserta(db, row["owner_id"])
        and is_active_peserta(db, row["requester_id"])
    ):
        raise not_found()
    return row


def request_data(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "owner_id": row["owner_id"],
        "requester_id": row["requester_id"],
        "status": row["status"],
        "created_at": row["created_at"],
        "decided_at": row["decided_at"],
    }


def shareable_items(db: sqlite3.Connection, owner_id: str) -> list[sqlite3.Row]:
    """Item induk aktif milik owner yang boleh dipilih, plus id ciphertext AES-nya (bisa NULL)."""
    return db.execute(
        "SELECT items.*, ciphertexts.id AS aes_ciphertext_id FROM items "
        "LEFT JOIN ciphertexts ON ciphertexts.item_id = items.id AND ciphertexts.cipher = 'aes' "
        "WHERE items.owner_user_id = ? AND items.parent_item_id IS NULL "
        f"AND items.shredded_at IS NULL AND items.field IN ({_FIELD_PLACEHOLDERS}) "
        "ORDER BY items.field",
        (owner_id, *SHAREABLE_FIELDS),
    ).fetchall()


def aes_sealed(db: sqlite3.Connection, ciphertext_id: str) -> SealedCiphertext:
    """Kunci terbungkus satu baris ciphertext AES untuk dibungkus ulang dengan RSA.

    `ciphertext` dikosongkan: rewrap hanya membuka kunci data, isi file tidak dibaca.
    """
    row = db.execute(
        "SELECT * FROM ciphertexts WHERE id = ? AND cipher = 'aes'", (ciphertext_id,)
    ).fetchone()
    return SealedCiphertext(
        cipher=row["cipher"],
        nonce=row["nonce"],
        wrap_nonce=row["wrap_nonce"],
        wrapped_keys=row["wrapped_keys"],
        wrap_tag=row["wrap_tag"],
        key_version=row["key_version"],
        hmac_tag=row["hmac_tag"],
        ciphertext=b"",
    )


def active_grants(db: sqlite3.Connection, request_id: str) -> list[sqlite3.Row]:
    """Grant yang masih sah untuk mengambil data: item induk aktif milik owner,
    field yang boleh dibagikan, dan masih menunjuk baris ciphertext AES item itu.

    Pemanggil wajib sudah memeriksa request lewat `get_request(..., status='approved')`.
    Grant untuk item yang sudah diganti otomatis hilang (cascade dari ciphertexts).
    """
    return db.execute(
        "SELECT sharing_grants.*, items.field, items.content_type, items.size_bytes, "
        "items.storage, ciphertexts.nonce, ciphertexts.hmac_tag, ciphertexts.key_version, "
        "ciphertexts.blob, ciphertexts.path "
        "FROM sharing_grants "
        "JOIN sharing_requests ON sharing_requests.id = sharing_grants.request_id "
        "JOIN items ON items.id = sharing_grants.item_id "
        "JOIN ciphertexts ON ciphertexts.id = sharing_grants.ciphertext_id "
        "AND ciphertexts.item_id = items.id AND ciphertexts.cipher = 'aes' "
        "JOIN sharing_public_keys ON sharing_public_keys.id = sharing_grants.recipient_key_id "
        "AND sharing_public_keys.user_id = sharing_requests.requester_id "
        "WHERE sharing_grants.request_id = ? "
        "AND items.owner_user_id = sharing_requests.owner_id "
        "AND items.parent_item_id IS NULL AND items.shredded_at IS NULL "
        f"AND items.field IN ({_FIELD_PLACEHOLDERS}) "
        "ORDER BY items.field, items.id",
        (request_id, *SHAREABLE_FIELDS),
    ).fetchall()
