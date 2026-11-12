"""Seeder akun dummy: 1 superadmin, 1 juri, 3 peserta (dengan profil lengkap).

Jalankan dari folder backend/ (venv aktif, .env sudah terisi ROOT_KEY/JWT_SECRET_KEY):
    python -m app.db.seed

Akun yang emailnya sudah ada tidak dibuat ulang, dan profil peserta hanya diisi
kalau masih kosong, jadi aman dijalankan berulang.
"""

from contextlib import closing
from uuid import uuid4

from app.core.config import get_settings
from app.core.security import password_hasher
from app.db.database import connect_db, migrate_db
from app.db.items import get_active_item, write_item
from app.db.settings_store import get_setting
from app.db.users import create_user, email_index

PASSWORD = "Password123!"
ACCOUNTS = [
    ("admin.dummy@schematics-dummy.com", "superadmin", "terverifikasi"),
    ("juri.dummy@schematics-dummy.com", "juri", "terverifikasi"),
    ("peserta1.dummy@schematics-dummy.com", "peserta", None),
    ("peserta2.dummy@schematics-dummy.com", "peserta", None),
    ("peserta3.dummy@schematics-dummy.com", "peserta", None),
]
PROFILES = {
    "peserta1.dummy@schematics-dummy.com": {
        "full_name": "Andi Pratama",
        "nim": "5025221001",
        "study_program": "Teknik Informatika",
        "institution": "Institut Teknologi Sepuluh Nopember",
        "birth_date": "2004-03-12",
        "domicile": "Surabaya",
        "phone": "081234567801",
    },
    "peserta2.dummy@schematics-dummy.com": {
        "full_name": "Budi Santoso",
        "nim": "5025221002",
        "study_program": "Sistem Informasi",
        "institution": "Institut Teknologi Sepuluh Nopember",
        "birth_date": "2004-07-25",
        "domicile": "Sidoarjo",
        "phone": "081234567802",
    },
    "peserta3.dummy@schematics-dummy.com": {
        "full_name": "Citra Lestari",
        "nim": "5025221003",
        "study_program": "Teknologi Informasi",
        "institution": "Institut Teknologi Sepuluh Nopember",
        "birth_date": "2005-01-08",
        "domicile": "Gresik",
        "phone": "081234567803",
    },
}


def fill_profile(db, user_id: str, profile: dict[str, str]) -> bool:
    """Setujui kebijakan privasi terbaru lalu isi profil, kalau belum diisi."""
    if get_active_item(db, owner_user_id=user_id, field="full_name") is not None:
        return False
    db.execute(
        "INSERT OR IGNORE INTO consents (id, user_id, policy_version) VALUES (?, ?, ?)",
        (str(uuid4()), user_id, get_setting(db, "privacy_policy_version")),
    )
    for field, value in profile.items():
        write_item(db, owner_user_id=user_id, field=field, value=value)
    return True


def seed() -> None:
    settings = get_settings()
    migrate_db(settings.database_path_abs)

    with closing(connect_db(settings.database_path_abs)) as db:
        for email, role, verification_status in ACCOUNTS:
            row = db.execute(
                "SELECT id FROM users WHERE email_index = ?", (email_index(email),)
            ).fetchone()
            if row is None:
                user_id = create_user(
                    db,
                    email=email,
                    password_hash=password_hasher.hash(PASSWORD),
                    role=role,
                    verification_status=verification_status,
                )
                status = "dibuat"
            else:
                user_id, status = row["id"], "sudah ada"
            if email in PROFILES and fill_profile(db, user_id, PROFILES[email]):
                status += ", profil diisi"
            print(f"  {role:<10} {email} ({status})")
        db.commit()

    print(f"Password semua akun: {PASSWORD}")


if __name__ == "__main__":
    seed()
