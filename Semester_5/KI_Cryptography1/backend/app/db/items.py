"""Baca/tulis tabel `items`: satu baris = satu field data diri, dokumen, atau karya tim.

Isinya tidak pernah disimpan sebagai plaintext. Tabel `items` hanya memuat metadata
(pemilik, field, tipe, ukuran); isi teks/file terenkripsi ada di tabel `ciphertexts`
(lihat `app/db/ciphertexts.py` dan modul `app/crypto_services`). File upload ditulis
terenkripsi ke folder storage/ sebagai `<uuid>.enc`.

Nama file asli upload juga data pribadi, jadi disimpan sebagai item anak
(`field = 'original_filename'`, `parent_item_id` = item file-nya), ikut terenkripsi.

Menulis field yang sudah ada akan men-shred item lama dulu (ciphertext dan file lamanya
dihapus), jadi selalu ada paling banyak satu item aktif per (pemilik, field).
"""

import sqlite3
from pathlib import Path
from uuid import uuid4

from app.db.ciphertexts import delete_ciphertexts, load_plaintext, store_ciphertexts

FILENAME_FIELD = "original_filename"


def _owner(owner_user_id: str | None, owner_team_id: str | None) -> tuple[str, str]:
    if owner_user_id is not None:
        return "owner_user_id", owner_user_id
    return "owner_team_id", owner_team_id


def _shred_item(
    db: sqlite3.Connection, item_id: str, storage_dir: Path | None
) -> None:
    """Hapus ciphertext/file item (dan anak-anaknya), lalu tandai shredded_at."""
    children = [
        row["id"]
        for row in db.execute(
            "SELECT id FROM items WHERE parent_item_id = ? AND shredded_at IS NULL",
            (item_id,),
        )
    ]
    ids = [item_id, *children]
    delete_ciphertexts(db, ids, storage_dir=storage_dir)
    db.executemany(
        "UPDATE items SET shredded_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
        [(value,) for value in ids],
    )


def _shred(
    db: sqlite3.Connection,
    column: str,
    owner: str,
    field: str,
    storage_dir: Path | None = None,
) -> None:
    rows = db.execute(
        f"SELECT id FROM items WHERE {column} = ? AND field = ? "
        f"AND shredded_at IS NULL AND parent_item_id IS NULL",
        (owner, field),
    ).fetchall()
    for row in rows:
        _shred_item(db, row["id"], storage_dir)


def shred_field(
    db: sqlite3.Connection,
    *,
    field: str,
    owner_user_id: str | None = None,
    owner_team_id: str | None = None,
    storage_dir: Path | None = None,
) -> None:
    """Hapus isi field tanpa menggantinya (mis. catatan verifikasi yang dikosongkan)."""
    column, owner = _owner(owner_user_id, owner_team_id)
    _shred(db, column, owner, field, storage_dir)


def get_active_item(
    db: sqlite3.Connection,
    *,
    field: str,
    owner_user_id: str | None = None,
    owner_team_id: str | None = None,
) -> sqlite3.Row | None:
    column, owner = _owner(owner_user_id, owner_team_id)
    return db.execute(
        f"SELECT * FROM items WHERE {column} = ? AND field = ? "
        f"AND shredded_at IS NULL AND parent_item_id IS NULL",
        (owner, field),
    ).fetchone()


def get_item(db: sqlite3.Connection, item_id: str) -> sqlite3.Row | None:
    return db.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()


def read_item(
    db: sqlite3.Connection,
    *,
    field: str,
    owner_user_id: str | None = None,
    owner_team_id: str | None = None,
) -> str | None:
    """Teks field yang sudah didekripsi, atau None kalau belum diisi."""
    item = get_active_item(
        db, field=field, owner_user_id=owner_user_id, owner_team_id=owner_team_id
    )
    return read_text(db, item["id"]) if item is not None else None


def read_text(db: sqlite3.Connection, item_id: str) -> str:
    return load_plaintext(db, item_id).decode("utf-8")


def read_file(db: sqlite3.Connection, item_id: str, storage_dir: Path) -> bytes:
    """Isi file yang sudah didekripsi (disimpan terenkripsi di storage/)."""
    return load_plaintext(db, item_id, storage_dir=storage_dir)


def read_original_filename(db: sqlite3.Connection, item_id: str) -> str | None:
    child = db.execute(
        "SELECT id FROM items WHERE parent_item_id = ? AND field = ? AND shredded_at IS NULL",
        (item_id, FILENAME_FIELD),
    ).fetchone()
    return read_text(db, child["id"]) if child is not None else None


def _insert_text_item(
    db: sqlite3.Connection,
    column: str,
    owner: str,
    field: str,
    value: str,
    parent_item_id: str | None = None,
) -> str:
    item_id = str(uuid4())
    data = value.encode("utf-8")
    db.execute(
        f"INSERT INTO items (id, {column}, field, storage, content_type, size_bytes, parent_item_id) "
        f"VALUES (?, ?, ?, 'db', 'text/plain', ?, ?)",
        (item_id, owner, field, len(data), parent_item_id),
    )
    store_ciphertexts(db, item_id=item_id, plaintext=data, storage="db")
    return item_id


def write_item(
    db: sqlite3.Connection,
    *,
    field: str,
    value: str,
    owner_user_id: str | None = None,
    owner_team_id: str | None = None,
) -> str:
    """Simpan field teks terenkripsi. Kembalikan id item barunya."""
    column, owner = _owner(owner_user_id, owner_team_id)
    _shred(db, column, owner, field)
    return _insert_text_item(db, column, owner, field, value)


def save_file(
    db: sqlite3.Connection,
    *,
    field: str,
    data: bytes,
    ext: str,
    content_type: str,
    storage_dir: Path,
    original_filename: str | None = None,
    owner_user_id: str | None = None,
    owner_team_id: str | None = None,
) -> None:
    """Enkripsi dan simpan file upload ke storage/, ganti file lama untuk field yang sama.

    `ext` tidak dipakai untuk nama file di disk (nama file di storage/ acak dan tanpa
    ekstensi asli); parameter dipertahankan agar pemanggil tidak berubah.
    """
    column, owner = _owner(owner_user_id, owner_team_id)
    _shred(db, column, owner, field, storage_dir)

    item_id = str(uuid4())
    db.execute(
        f"INSERT INTO items (id, {column}, field, storage, content_type, size_bytes) "
        f"VALUES (?, ?, ?, 'fs', ?, ?)",
        (item_id, owner, field, content_type, len(data)),
    )
    store_ciphertexts(
        db, item_id=item_id, plaintext=data, storage="fs", storage_dir=storage_dir
    )
    if original_filename:
        _insert_text_item(
            db, column, owner, FILENAME_FIELD, original_filename, parent_item_id=item_id
        )
