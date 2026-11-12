"""Simpan dan baca tabel `ciphertexts` (hasil crypto_services).

Satu item punya paling banyak satu baris per cipher. Isi kecil (field teks,
`storage = 'db'`) disimpan di kolom `blob`; file besar (`storage = 'fs'`) ditulis
terenkripsi ke folder storage/ dan namanya disimpan di kolom `path`.
"""

import sqlite3
from pathlib import Path
from uuid import uuid4

from app.core.crypto import get_crypto_service
from app.crypto_services import IntegrityError, SealedCiphertext
from app.benchmarking import record_live


class CiphertextNotFound(LookupError):
    """Item aktif tidak punya ciphertext yang bisa dibaca."""


def store_ciphertexts(
    db: sqlite3.Connection,
    *,
    item_id: str,
    plaintext: bytes,
    storage: str,
    storage_dir: Path | None = None,
) -> None:
    """Enkripsi `plaintext` dengan semua cipher aktif dan simpan tiap hasilnya."""
    crypto = get_crypto_service()
    item = db.execute("SELECT field FROM items WHERE id = ?", (item_id,)).fetchone()
    if item is None:
        raise CiphertextNotFound("Item belum tersimpan")
    written: list[Path] = []
    try:
        for cipher in crypto.ciphers:
            timings = []
            sealed = crypto.seal(
                plaintext, cipher=cipher, context=item_id, timings=timings
            )
            row_id = str(uuid4())
            blob, path = sealed.ciphertext, None
            if storage == "fs":
                path = f"{row_id}.enc"
                target = storage_dir / path
                target.write_bytes(sealed.ciphertext)
                written.append(target)
                blob = None
            db.execute(
                "INSERT INTO ciphertexts (id, item_id, cipher, nonce, wrap_nonce, "
                "wrapped_keys, wrap_tag, key_version, hmac_tag, blob, path) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (
                    row_id,
                    item_id,
                    sealed.cipher,
                    sealed.nonce,
                    sealed.wrap_nonce,
                    sealed.wrapped_keys,
                    sealed.wrap_tag,
                    sealed.key_version,
                    sealed.hmac_tag,
                    blob,
                    path,
                ),
            )
            record_live(
                db,
                timings=timings,
                cipher=cipher,
                field=item["field"],
                size_bytes=len(plaintext),
                nonce_bytes=len(sealed.nonce or b""),
            )
    except Exception:
        for target in written:  # jangan tinggalkan file yatim kalau gagal di tengah
            target.unlink(missing_ok=True)
        raise


def _pick_row(rows: list[sqlite3.Row], cipher: str | None) -> sqlite3.Row:
    crypto = get_crypto_service()
    by_cipher = {row["cipher"]: row for row in rows}
    if cipher is not None:
        if cipher not in by_cipher:
            raise CiphertextNotFound(f"Tidak ada ciphertext '{cipher}'")
        return by_cipher[cipher]
    for name in (*crypto.ciphers, *by_cipher):
        if name in by_cipher:
            return by_cipher[name]
    raise CiphertextNotFound("Item tidak punya ciphertext")


def _open_row(
    db: sqlite3.Connection, row: sqlite3.Row, item_id: str, storage_dir: Path | None
) -> bytes:
    data = (
        row["blob"] if row["path"] is None else (storage_dir / row["path"]).read_bytes()
    )
    sealed = SealedCiphertext(
        cipher=row["cipher"],
        nonce=row["nonce"],
        wrap_nonce=row["wrap_nonce"],
        wrapped_keys=row["wrapped_keys"],
        wrap_tag=row["wrap_tag"],
        key_version=row["key_version"],
        hmac_tag=row["hmac_tag"],
        ciphertext=data,
    )
    timings = []
    plaintext = get_crypto_service().open(sealed, context=item_id, timings=timings)
    record_live(
        db,
        timings=timings,
        cipher=row["cipher"],
        field=row["field"],
        size_bytes=len(plaintext),
        nonce_bytes=len(sealed.nonce or b""),
        legacy_rc4=row["cipher"] == "rc4" and not row["hmac_tag"],
    )
    return plaintext


def load_plaintext(
    db: sqlite3.Connection,
    item_id: str,
    *,
    storage_dir: Path | None = None,
    cipher: str | None = None,
) -> bytes:
    """Baca item. Tanpa `cipher`, semua ciphertext didekripsi dan harus identik."""
    rows = db.execute(
        "SELECT ciphertexts.*, items.field FROM ciphertexts JOIN items ON items.id = ciphertexts.item_id WHERE item_id = ?",
        (item_id,),
    ).fetchall()
    primary = _pick_row(rows, cipher)
    if cipher is not None:
        return _open_row(db, primary, item_id, storage_dir)
    plaintext = _open_row(db, primary, item_id, storage_dir)
    for row in rows:
        if row is not primary and _open_row(db, row, item_id, storage_dir) != plaintext:
            raise IntegrityError("Hasil dekripsi antar-cipher berbeda")
    return plaintext


def delete_ciphertexts(
    db: sqlite3.Connection, item_ids: list[str], *, storage_dir: Path | None = None
) -> None:
    """Hapus ciphertext (beserta file-nya). Tanpa kunci terbungkus, data tak bisa dibuka lagi."""
    for item_id in item_ids:
        paths = [
            row["path"]
            for row in db.execute(
                "SELECT path FROM ciphertexts WHERE item_id = ? AND path IS NOT NULL",
                (item_id,),
            )
        ]
        db.execute("DELETE FROM ciphertexts WHERE item_id = ?", (item_id,))
        if storage_dir is not None:
            for path in paths:
                (storage_dir / path).unlink(missing_ok=True)
