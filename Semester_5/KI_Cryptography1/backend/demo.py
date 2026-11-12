"""Skenario demo dari README, dijalankan otomatis lewat API.

Jalankan dari folder backend/ (venv aktif):
    python demo.py

Memakai database dan storage sementara, jadi data aplikasi asli tidak tersentuh.
"""

import hashlib
import os
import sqlite3
import sys
import tempfile
from pathlib import Path

PASSWORD = "Password123!"
MARKER = "RahasiaDemo"  # penanda unik untuk membuktikan tidak ada plaintext di disk
VIDEO = b"\x00\x00\x00\x18ftypmp42" + b"isi video demo " * 1000

workdir = Path(tempfile.mkdtemp(prefix="schematics-demo-"))
os.environ.update(
    JWT_SECRET_KEY="demo-only-secret-key-at-least-32-bytes",
    ROOT_KEY="demo-only-root-key-at-least-32-characters",
    DATABASE_PATH=str(workdir / "demo.db"),
    STORAGE_DIR=str(workdir / "storage"),
    SUPERADMIN_EMAIL="admin@demo.com",
    SUPERADMIN_PASSWORD=PASSWORD,
)
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi.testclient import TestClient  # noqa: E402

from app import main  # noqa: E402

main.limiter.enabled = False
client = TestClient(main.app, raise_server_exceptions=False)
step_no = 0


def step(title):
    global step_no
    step_no += 1
    print(f"\n=== {step_no}. {title} ===")


def call(method, path, expect, **kwargs):
    headers = {"X-CSRF-Token": client.cookies.get("csrf_access_token", "")}
    headers.update(kwargs.pop("headers", {}))
    response = client.request(method, path, headers=headers, **kwargs)
    ok = response.status_code == expect
    print(f"  {'OK ' if ok else 'GAGAL'} {method} {path} -> {response.status_code}")
    if not ok:
        sys.exit(f"  Diharapkan {expect}: {response.text}")
    return response


def login(email):
    client.cookies.clear()
    call("POST", "/api/auth/login", 200, json={"email": email, "password": PASSWORD})


def upload(path, filename, data):
    return call("POST", path, 201, content=data, headers={"X-Filename": filename})


def register_participant(email, name):
    client.cookies.clear()
    user = call(
        "POST", "/api/auth/register", 201, json={"email": email, "password": PASSWORD}
    ).json()["user"]
    version = client.get("/api/policy").json()["version"]
    call("POST", "/api/consent", 201, json={"policy_version": version})
    call(
        "PUT",
        "/api/profile",
        200,
        json={
            "full_name": f"{name} {MARKER}",
            "nim": "5025221000",
            "study_program": "Teknik Informatika",
            "institution": "ITS",
            "birth_date": "2004-01-01",
            "domicile": "Surabaya",
            "phone": "081234567890",
        },
    )
    for kind in ("ktp", "ktm", "twibbon"):
        upload(f"/api/documents/{kind}", f"{kind}.pdf", b"%PDF-1.4\n" + MARKER.encode())
    return user


with client:
    step("Tiga peserta mendaftar, setuju privasi, isi profil, unggah dokumen")
    members = [
        ("ketua@demo.com", "Andi"),
        ("anggota1@demo.com", "Budi"),
        ("anggota2@demo.com", "Citra"),
    ]
    users = [register_participant(email, name) for email, name in members]

    step("Ketua membuat tim, dua anggota bergabung dengan kode tim")
    login("ketua@demo.com")
    team = call("POST", "/api/teams", 201, json={"name": "Tim Demo"}).json()["team"]
    print(f"  Kode tim: {team['code']}")
    for email, _ in members[1:]:
        login(email)
        call("POST", "/api/teams/join", 200, json={"code": team["code"]})

    step("Ketua mengunggah proposal, video, link GitHub, lalu submit final")
    login("ketua@demo.com")
    upload("/api/teams/me/proposal", "proposal.pdf", b"%PDF-1.4\nproposal demo")
    upload("/api/teams/me/video", "demo.mp4", VIDEO)
    call(
        "PUT",
        "/api/teams/me/repo",
        200,
        json={"repo_url": "https://github.com/tim-demo/schematics"},
    )
    call("POST", "/api/teams/me/finalize", 200, json={"confirm": True})

    step("Isi database: satu item = tiga ciphertext (AES, DES, RC4)")
    db = sqlite3.connect(workdir / "demo.db")
    db.row_factory = sqlite3.Row
    rows = db.execute(
        "SELECT c.cipher, c.nonce, c.hmac_tag, c.blob FROM ciphertexts c "
        "JOIN items i ON i.id = c.item_id WHERE i.field = 'full_name' "
        "AND i.owner_user_id = ?",
        (users[0]["id"],),
    ).fetchall()
    for row in rows:
        nonce = row["nonce"].hex() if row["nonce"] else "-"
        print(
            f"  {row['cipher']:<4} nonce={nonce:<16} "
            f"hmac={row['hmac_tag'].hex()[:16]}... ct={row['blob'].hex()[:32]}..."
        )

    step(f"Scan database + storage: cari plaintext '{MARKER}'")
    db.execute("PRAGMA wal_checkpoint(FULL)")
    found = [p for p in workdir.rglob("*") if p.is_file() and MARKER.encode() in p.read_bytes()]
    print(f"  {len(list(workdir.rglob('*')))} file dipindai, temuan: {found or 'tidak ada'}")
    if found:
        sys.exit("  GAGAL: plaintext ditemukan di disk")

    step("Superadmin memverifikasi peserta, membuat juri, menugaskan tim")
    login("admin@demo.com")
    for user in users:
        call(
            "PATCH",
            f"/api/admin/participants/{user['id']}",
            200,
            json={"verification_status": "terverifikasi"},
        )
    juri = call(
        "POST", "/api/admin/juri", 201, json={"email": "juri@demo.com", "password": PASSWORD}
    ).json()
    call(
        "PUT",
        f"/api/admin/juri/{juri['user_id']}/assignments",
        200,
        json={"team_ids": [team["id"]]},
    )

    step("Juri membuka video tim (HMAC dicek, 3 cipher didekripsi dan dicocokkan)")
    login("juri@demo.com")
    detail = call("GET", f"/api/juri/teams/{team['id']}", 200).json()["team"]
    video_id = detail["video"]["item_id"]
    video = call("GET", f"/api/items/{video_id}", 200).content
    same = hashlib.sha256(video).digest() == hashlib.sha256(VIDEO).digest()
    print(f"  SHA-256 video asli == hasil buka: {same}")
    if not same:
        sys.exit("  GAGAL: video berubah")
    ktp_id = db.execute(
        "SELECT id FROM items WHERE field = 'ktp' AND owner_user_id = ?",
        (users[0]["id"],),
    ).fetchone()[0]
    print("  Juri mencoba membuka KTP peserta (harus ditolak):")
    call("GET", f"/api/items/{ktp_id}", 404)

    step("Satu byte ciphertext AES video dirusak manual di storage/")
    path = db.execute(
        "SELECT path FROM ciphertexts WHERE item_id = ? AND cipher = 'aes'",
        (video_id,),
    ).fetchone()[0]
    file = workdir / "storage" / path
    data = bytearray(file.read_bytes())
    data[100] ^= 0x01
    file.write_bytes(data)
    print(f"  Byte ke-100 di {path} di-XOR 0x01")
    print("  Juri membuka video lagi (harus ditolak karena HMAC gagal):")
    call("GET", f"/api/items/{video_id}", 500)
    db.close()

print(f"\nDemo selesai, semua langkah sesuai. Data sementara: {workdir}")
