# API Backend — Schematics NIC

Path dan method mengikuti PRD PDF halaman 37–39. Semua route memakai prefix `/api`; health check tersedia di `GET /health`. Dokumentasi interaktif: `/docs`.

## Konvensi

- Sesi: JWT 8 jam di cookie HttpOnly `access_token`. Frontend mengirim `X-CSRF-Token` dari cookie `csrf_access_token` untuk perubahan data setelah login.
- Error: `{"error": {"code": "...", "message": "...", "details": {...}}}`. Validasi 400, autentikasi 401, akses/CSRF/consent 403, tidak ditemukan 404, konflik 409, terlalu besar 413, tipe ditolak 415, rate limit 429.
- Upload: body mentah `application/octet-stream`, nama file melalui `X-Filename: encodeURIComponent(filename)`. Respons JSON metadata, bukan 204.
- `ItemMeta = {item_id, field, content_type, size_bytes, original_filename, uploaded_at}`.
- Pagination: query `page` (mulai 1), `page_size` (1–100); respons `{items, page, page_size, total}`.
- Penyimpanan menggunakan ciphertext melalui `crypto_services` dan migration `migrations/`. Upload masih memeriksa ekstensi dan ukuran; streaming enkripsi belum tersedia.

## Akun dan privasi

| Method | Path | Request / respons |
| --- | --- | --- |
| POST | `/api/auth/register` | `{email, password}` → 201 `{user: Me}` dan sesi |
| POST | `/api/auth/login` | `{email, password}` → `{user: Me}` |
| POST | `/api/auth/logout` | 204, hapus cookie |
| PUT | `/api/auth/password` | `{current_password, new_password}` → 204 |
| GET | `/api/me` | `Me` |
| GET | `/api/settings` | Publik; tenggat, batas anggota, batas file |
| GET | `/api/policy` | Publik; `{version, text_markdown}` |
| POST | `/api/consent` | Peserta; `{policy_version}` → 201 `{policy_version, agreed_at}` |
| DELETE | `/api/consent` | Peserta; 204, nonaktifkan akun dan hapus item/file pribadi |
| GET | `/api/me/items` | Peserta; `{items: metadata[]}` |
| GET | `/api/me/access-log` | Peserta; riwayat akses data sendiri, pagination |
| GET | `/api/me/export` | Peserta; ZIP profil dan dokumen pribadi |

`Me` memuat `id, email, role, full_name, verification_status, verification_note, must_change_password, consent, current_policy_version, team`. Tim adalah ringkasan atau null; status verifikasi akun selain peserta adalah null.

Penarikan persetujuan memakai penghapusan sederhana untuk tugas. Anggota keluar dari tim draft; ketua digantikan anggota tersisa atau tim draft kosong dihapus. Tim final dan karya bersama tetap ada. Salinan backup tidak ikut dihapus.

## Profil dan dokumen

| Method | Path | Request / respons |
| --- | --- | --- |
| GET | `/api/profile` | Peserta; profil, umur, kelengkapan, status dan catatan verifikasi |
| PUT | `/api/profile` | Peserta + consent; field profil → profil terbaru |
| GET | `/api/documents` | Peserta; `{ktp, ktm, twibbon, documents_complete}` |
| POST | `/api/documents/{type}` | Peserta + consent; raw file → 201 ItemMeta + verification_status |

Field profil: `full_name, nim, study_program, institution, birth_date, domicile, phone`. Identitas yang diubah setelah terverifikasi memicu verifikasi ulang. Dokumen: `ktp, ktm, twibbon`, JPG/JPEG/PNG/PDF maksimal 5 MiB; memakai tenggat pendaftaran.

## Tim dan submission

| Method | Path | Request / respons |
| --- | --- | --- |
| POST | `/api/teams` | Peserta; `{name}` → 201 `{team}` |
| POST | `/api/teams/join` | Peserta; `{code}` → `{team}` |
| GET | `/api/teams/me` | Login; `{team}`, null jika belum punya tim |
| POST | `/api/teams/me/leave` | Peserta; 204 |
| DELETE | `/api/teams/me/members/{user_id}` | Ketua; 204 |
| POST | `/api/teams/me/proposal` | Ketua; PDF maks 10 MiB → 201 ItemMeta |
| POST | `/api/teams/me/video` | Ketua; MP4 maks 100 MiB → 201 ItemMeta |
| PUT | `/api/teams/me/repo` | Ketua; `{repo_url}` → `{repo_url}` |
| POST | `/api/teams/me/finalize` | Ketua; `{confirm: true}` → `{team}` final |
| GET | `/api/items/{item_id}` | Sesuai hak akses; isi item; `?download=1` untuk attachment |

`Team`: `id, name, code, status, leader_id, created_at, finalized_at, members, submission, finalize_missing`. Anggota memuat nama, status ketua, kelengkapan profil dan dokumen. Submission memuat metadata proposal/video dan URL repo.

Tim final terkunci. Finalisasi membutuhkan profil, dokumen, dan karya lengkap; verifikasi terverifikasi tidak disyaratkan. Buat/gabung tim memakai tenggat pendaftaran, karya/finalisasi memakai tenggat pengumpulan. Respons file memakai `Cache-Control: no-store` dan `X-Content-Type-Options: nosniff`.

## Juri

| Method | Path | Respons |
| --- | --- | --- |
| GET | `/api/juri/teams` | `{teams: [{id, name, finalized_at, member_count}]}` |
| GET | `/api/juri/teams/{team_id}` | `{team: {id, name, finalized_at, members, proposal, video, repo_url}}` |

Hanya tim final yang ditugaskan. Pembukaan item juga memeriksa penugasan. Juri tidak dapat membuka KTP/KTM/twibbon; akses yang ditolak dijawab 404.

## Superadmin

| Method | Path | Request / respons |
| --- | --- | --- |
| GET | `/api/admin/participants` | Pagination dan filter `status` |
| GET | `/api/admin/participants/{user_id}` | Profil, dokumen, status, catatan dan tim |
| PATCH | `/api/admin/participants/{user_id}` | `{verification_status, note?}`; note wajib jika ditolak |
| GET | `/api/admin/teams` | Daftar tim berpaginasi |
| GET | `/api/admin/juri` | `{juri: [{user_id, email, created_at}]}` |
| POST | `/api/admin/juri` | `{email, password}` → 201 `{user_id, email, role}` |
| PUT | `/api/admin/juri/{juri_id}/assignments` | `{team_ids: [...]}`; mengganti seluruh penugasan |
| GET | `/api/admin/settings` | Pengaturan publik, versi dan teks kebijakan |
| PUT | `/api/admin/settings` | Subset pengaturan → pengaturan publik terbaru |
| GET | `/api/admin/audit-logs` | Pagination; filter `actor_id, action, from, to` |
| GET | `/api/admin/benchmarks` | Filter `source, operation, run_id`; `{run_id, source, env, rows, runs}` |

Pengaturan: `registration_deadline, submission_deadline, min_team_size, max_team_size, privacy_policy_version, privacy_policy_text`. Tenggat boleh null; ukuran tim default 2–4. Setting lama `deadline_at` dan `max_team_members` tetap dibaca sebagai fallback. ID audit berupa string UUID.

Benchmark merangkum satu run pada satu source; default source `controlled` dan run terbaru. Tanpa data, `run_id` dan `env` null, `rows` dan `runs` kosong. Durasi memakai ns; throughput memakai MB/s desimal dan menyediakan median/Q1/Q3 tersendiri. Throughput `wrap` null. Pencatatan live otomatis, sedangkan controlled dihasilkan melalui CLI. Kontrak lengkap untuk frontend dan cara menjalankan ada di [BENCHMARK_FRONTEND.md](BENCHMARK_FRONTEND.md).

Pengaturan publik, daftar dokumen, daftar tim admin, dan daftar juri adalah endpoint tambahan untuk frontend. Kontrak TypeScript lengkap ada di `frontend/src/api/types.ts`.
