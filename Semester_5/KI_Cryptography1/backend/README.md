# Backend — Schematics NIC

FastAPI + SQLite. Kontrak endpoint ada di [API.md](./API.md); route mengikuti PRD dan pemanggilan frontend.

## Menjalankan

Dari folder backend:

```bash
python -m venv .venv
# Aktifkan .venv sesuai shell
python -m pip install -r requirements.txt
# Salin .env.example ke .env dan isi JWT_SECRET_KEY
python run.py
```

Migration berjalan otomatis saat startup. Migration aktif ada di `app/db/migrations/`; skema plaintext lama disimpan sebagai arsip dan ditolak oleh migration runner. Settings lama tetap dibaca sebagai fallback.

Backend menyimpan ciphertext melalui `crypto_services`. Jalankan `python benchmark.py --csv data/benchmark-samples.csv` dari folder backend untuk mengisi hasil controlled pada database aplikasi. Pengukuran live dicatat otomatis saat item disimpan/dibaca. Panduan CLI, satuan, filter run dan kontrak frontend ada di [BENCHMARK_FRONTEND.md](BENCHMARK_FRONTEND.md).

## Struktur

- `app/main.py`: registrasi router, format error, startup, seed superadmin.
- `app/core/`: konfigurasi, JWT, cookie CSRF, rate limit.
- `app/dependencies.py`: koneksi per request, persetujuan, baca upload.
- `app/db/`: migration, item, audit, settings, representasi JSON bersama.
- `app/routers/`: akun, privasi, profil, dokumen, tim, submission/item, juri, admin.

Login memakai cookie `access_token`; header `X-CSRF-Token` dikirim dari cookie `csrf_access_token`. Upload raw memakai header nama file `X-Filename`.

Juri baru baru bisa melihat tim setelah superadmin menetapkan penugasan melalui `PUT /api/admin/juri/{juri_id}/assignments`.

## Tes kontrak dan integrasi

Dari root repo:

```bash
python -m pip install -r backend/requirements-dev.txt
python -m pytest backend/tests -q
```

Tes mencocokkan path/method PRD dan client TypeScript dengan OpenAPI backend. Tes integrasi mencakup registrasi, consent, profil, upload, submit final, penugasan juri, otorisasi file, pagination, ekspor, penarikan persetujuan, dan ringkasan benchmark. Database tes terpisah dari database aplikasi.
