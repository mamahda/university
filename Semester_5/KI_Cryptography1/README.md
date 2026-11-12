# PRD Platform Pendaftaran Schematics NIC

## Ringkasan

Platform web pendaftaran Schematics NIC (hackathon khusus mahasiswa) untuk Assignment 1. Setiap data peserta disimpan sebagai tiga ciphertext (AES-CTR, DES-CTR, RC4) yang hanya dibuka untuk pengguna berhak, lalu biaya tiap cipher diukur dengan benchmark.

| Item | Isi |
| --- | --- |
| Pengguna | Peserta (ketua dan anggota tim), juri, superadmin |
| Data yang disimpan | Data diri, scan KTP, scan KTM/KRSM, bukti twibbon, proposal (PDF), video demo (MP4), link GitHub |
| Tech stack | React, Python FastAPI, SQLite, PyCryptodome; sesi memakai JWT di cookie |
| Kontrak API | [Dokumentasi API](backend/API.md) |
| Di luar cakupan | Penilaian juri, pembayaran, verifikasi email, masa retensi, deployment produksi |

## Skenario dan data

Panitia wajib memastikan peserta adalah mahasiswa aktif dan bukan joki, sehingga scan KTP dan KTM/KRSM tidak bisa dihindari. Bocornya KTP membuka risiko penyalahgunaan identitas, dan proposal atau video yang bocor sebelum penjurian bisa dicuri tim lain. Sebagai pengendali data, panitia wajib menjaga keamanan data pribadi (UU PDP Pasal 35, GDPR Art. 32).

| Data | Kategori (UU PDP / GDPR) | Untuk apa |
| --- | --- | --- |
| Email, nama, NIM, program studi, institusi, nomor HP, domisili (kota) | Data pribadi umum (Pasal 4 ayat 3) | Login, identitas, kontak, logistik |
| Tanggal lahir | Umum; jika peserta di bawah 18 tahun, datanya tergolong data anak (Pasal 4 ayat 2) | Usia ditandai untuk keputusan manual superadmin |
| Scan KTP | NIK, agama, status perkawinan, foto wajah; agama termasuk kategori khusus GDPR Art. 9 | Verifikasi identitas |
| Scan KTM/KRSM, bukti twibbon | Data pribadi umum | Verifikasi mahasiswa aktif, syarat lomba |
| Proposal, video demo, link GitHub | Karya belum dipublikasikan; video memuat wajah dan suara | Bahan penjurian |
| Nama tim | Bukan data pribadi | Tetap dienkripsi agar aturannya seragam |
| Password | Tidak disimpan, hanya hash Argon2id | Login |

- Semua data isian dienkripsi tiga cipher. Yang disimpan plaintext hanya metadata sistem: ID, peran, status, waktu, dan ukuran file.
- NIK tidak diminta sebagai field karena sudah ada di KTP (pengumpulan terbatas, Pasal 16).
- Peserta menyetujui pemberitahuan privasi sebelum mengisi data (persetujuan eksplisit, Pasal 20).

## Peran dan hak akses

Server memeriksa matriks ini di setiap request, dan setiap akses juri atau superadmin ke data milik orang lain dicatat di audit log.

| Aksi | Peserta | Juri | Superadmin |
| --- | --- | --- | --- |
| Melihat dan mengubah data diri serta dokumen sendiri | Ya | — | — |
| Melihat data diri peserta lain | Nama rekan setim saja | Nama dan institusi anggota tim final yang ditugaskan | Semua, tercatat |
| Membuka scan KTP, KTM/KRSM, twibbon milik orang lain | Tidak | Tidak | Ya, tercatat |
| Membuat tim, bergabung, keluar dari tim | Ya, sebelum final | — | — |
| Mengunggah karya, submit final, mengeluarkan anggota | Ketua saja | — | — |
| Membuka proposal, video, link GitHub | Tim sendiri | Tim final yang ditugaskan, tercatat | Semua tim |
| Verifikasi peserta, akun juri, tenggat, audit log, benchmark | — | — | Ya |

Item yang tidak boleh dibuka dijawab 404, sama seperti item yang tidak ada, agar ID item tidak bisa diuji keberadaannya.

## Alur dan status

Status verifikasi peserta dan status tim berjalan terpisah: tim boleh submit final sebelum superadmin selesai memverifikasi anggotanya.

1. **Peserta:** daftar, login, setujui privasi, isi data diri, unggah tiga dokumen (status menjadi "menunggu verifikasi"), buat atau gabung tim. Ketua lalu mengunggah karya dan submit final. Kapan saja peserta bisa membuka datanya sendiri.
2. **Superadmin:** memeriksa peserta, menerima atau menolak dengan alasan (termasuk memutuskan peserta di bawah 18 tahun), membuat akun juri, mengatur tenggat, memantau audit log dan benchmark.
3. **Juri:** melihat tim final yang ditugaskan, membuka proposal, video, dan link GitHub, lalu menilai di luar platform.

### Aturan transisi

- Peserta yang ditolak bisa memperbaiki dokumen dan kembali ke "menunggu verifikasi" selama tenggat pendaftaran belum lewat.
- Mengubah nama, NIM, atau institusi setelah terverifikasi mengembalikan status ke "menunggu verifikasi".
- Submit final butuh proposal, video, dan link GitHub, tim berisi 2–4 orang, dan semua anggota sudah lengkap data diri serta dokumennya.
- Setelah tenggat pengumpulan, server menolak unggahan dan submit.

## Fitur dan aturan bisnis

Setiap modul di bawah punya endpoint di Dokumentasi API; aturan di kolom kanan ditegakkan server, bukan hanya frontend.

| Modul | Fitur | Aturan penting |
| --- | --- | --- |
| Auth | Registrasi, login, logout, profil singkat | Password di-hash Argon2id; email unik lewat blind index; JWT di cookie HttpOnly berlaku 8 jam; rate limit login; tanpa verifikasi email |
| Privasi | Pemberitahuan privasi berversi dan persetujuan | Endpoint profil dan dokumen menolak peserta yang belum setuju |
| Profil | Mengisi dan mengubah data diri | Tiap field menjadi satu item tiga ciphertext; setiap edit membuat kunci baru; usia di bawah 18 tahun hanya ditandai untuk superadmin |
| Dokumen | Mengunggah dan mengganti KTP, KTM/KRSM, twibbon | JPG/PNG/PDF maksimal 5 MB; tipe dicek dari magic bytes; dienkripsi per chunk 1 MB tanpa file plaintext sementara |
| Tim | Buat tim, kode tim, gabung, keluar, keluarkan anggota | Kode 8 karakter acak dibuat sekali; 2–4 orang termasuk ketua; satu peserta satu tim; rate limit gabung; terkunci setelah final |
| Submission | Proposal PDF (maks 10 MB), video MP4 (maks 100 MB), link GitHub, submit final | Hanya ketua; unggah ulang menggantikan versi lama; submit final dengan konfirmasi dua langkah |
| File | Membuka file milik sendiri, tim, atau sesuai peran | HMAC ketiga ciphertext diverifikasi, ketiganya didekripsi penuh dan dicocokkan, baru dikirim; video diputar setelah file utuh diterima |
| Juri | Daftar tim final yang ditugaskan, detail tiap tim | Tidak ada form nilai |
| Superadmin | Peserta, verifikasi, akun juri, tenggat dan batas anggota, daftar tim, audit log, benchmark | Penolakan wajib beralasan; superadmin tidak bisa mengubah isi data peserta |
| Audit | Pencatatan otomatis | Akses ke data orang lain, keputusan verifikasi, akun juri, perubahan pengaturan, kegagalan HMAC; log tanpa isi data pribadi |

## Desain kriptografi

Setiap item disimpan sebagai tiga ciphertext independen dengan kunci, nonce, dan HMAC-SHA256 sendiri, dan semua kunci itu dibungkus satu KEK (root key di `.env`) memakai AES-256-GCM.

| Cipher | Mode | Kunci | Nonce | Pemanggilan PyCryptodome |
| --- | --- | --- | --- | --- |
| AES | CTR | 32 byte | 8 byte acak + counter 8 byte | `AES.new(k, AES.MODE_CTR, nonce=n)` |
| DES | CTR | 8 byte (56 bit efektif) | 4 byte acak + counter 4 byte (maks 32 GiB per kunci) | `DES.new(k, DES.MODE_CTR, nonce=n)` |
| RC4 | Stream | 16 byte | Tidak ada; 3072 byte awal keystream dibuang | `ARC4.new(k, drop=3072)` |

### Aturan

- **Mengapa CTR:** ketiga cipher jadi sama-sama "keystream XOR plaintext" sehingga benchmark adil, tanpa padding, bisa diproses per chunk, dan tidak membocorkan pola seperti ECB.
- **Kunci baru setiap penulisan:** edit profil dan unggah ulang selalu membangkitkan kunci dan nonce baru, agar keystream tidak pernah terpakai dua kali.
- **HMAC per file:** pola encrypt-then-MAC, satu tag untuk setiap ciphertext. Input = ID item ‖ field ‖ cipher ‖ nonce ‖ ciphertext, dengan kunci HMAC 32 byte yang terpisah dari kunci enkripsi.
- **Satu KEK:** root key 32 byte dari `secrets.token_bytes(32)`, disimpan base64 di `.env` dan tidak masuk repo. Kunci enkripsi + kunci HMAC dibungkus AES-256-GCM dengan nonce 12 byte dan AAD = ID item ‖ cipher. Kolom `key_version` disiapkan untuk rotasi.
- **Login:** email dicari lewat blind index = HMAC-SHA256(kunci indeks, email huruf kecil); kunci indeks diturunkan dari root key dengan HKDF.
- **Password:** Argon2id, minimal setara rekomendasi OWASP (memori 19 MiB, 2 iterasi, paralelisme 1).

### Menyimpan file

1. Validasi ukuran dan tipe dari magic bytes.
2. Untuk tiap cipher, bangkitkan kunci, nonce, dan kunci HMAC.
3. Baca upload per chunk 1 MB, enkripsi dengan ketiga cipher, tulis ke tiga file sementara (isinya hanya ciphertext), dan perbarui tiga HMAC.
4. Bungkus kunci, pindahkan file ke nama UUID, lalu simpan satu baris `items` dan tiga baris `ciphertexts` dalam satu transaksi. Jika gagal, semua dibatalkan dan file dihapus.
5. Catat durasi tiap cipher ke `benchmark_runs`.

### Membuka file

1. Periksa hak akses, lalu buka bungkus kunci.
2. Verifikasi HMAC ketiga file; satu gagal berarti permintaan ditolak dan dicatat.
3. Dekripsi ketiganya secara penuh dan bandingkan; data dikirim hanya jika identik. Agar RAM tidak membengkak, perbandingan berjalan per chunk saat mengirim, dan respons dihentikan jika ada chunk yang berbeda.
4. Browser menunggu file utuh, lalu menampilkannya; video diputar dari blob hasil unduhan.

> Karena ketiga salinan berisi plaintext yang sama, kerahasiaan keseluruhan hanya setara cipher terlemah (DES). Batas ini lahir dari syarat tugas dan perlu ditulis di laporan.

## Arsitektur dan keamanan

Enkripsi dilakukan di server: browser hanya menampilkan data, dan setiap data wajib melewati `crypto_service` sebelum menyentuh SQLite atau folder storage.

| Komponen | Pilihan | Alasan |
| --- | --- | --- |
| Frontend | React + Vite | Terpisah dari API, sehingga semua aturan akses ada di backend |
| Backend | FastAPI, satu router per modul | Python, sehingga PyCryptodome langsung dipakai; `APIRouter` memetakan modul ke anggota |
| Database | SQLite, mode WAL | Satu file tanpa server terpisah, cukup untuk satu lomba |
| Kriptografi | PyCryptodome + `hmac`/`hashlib` bawaan | Menyediakan AES, DES, ARC4, GCM, dan HKDF dalam satu library |
| Password | argon2-cffi | Hash Argon2id |
| Sesi | PyJWT, JWT di cookie HttpOnly + token CSRF double-submit | Token tidak bisa dibaca JavaScript; request yang mengubah data wajib membawa header CSRF |
| Rate limit | slowapi | Login dan percobaan kode tim |

Saat pengembangan, Vite mem-proxy `/api` ke FastAPI (Uvicorn) agar frontend dan backend satu origin, sehingga cookie bekerja tanpa pengaturan CORS.

### Struktur folder

`frontend/` dan `backend/` masing-masing folder sendiri yang berdiri sendiri (dependency, config, dan cara jalan tidak saling bergantung). Di dalam `backend/`:

```
backend/
  run.py              # entry point: python run.py
  requirements.txt
  .env / .env.example
  app/
    main.py           # bikin FastAPI app, daftarkan router, lifespan (migration otomatis)
    dependencies.py   # dependency bersama antar router (misal koneksi DB)
    core/
      config.py       # Settings dari .env
      security.py     # JWT cookie + CSRF double-submit
      crypto_helpers.py  # blind index email
    db/
      database.py     # koneksi SQLite + migration runner
      migrations/     # file SQL bernomor
    routers/
      auth.py, privacy.py, profile.py, documents.py, teams.py, items.py, judges.py, admin.py
```

Pola `app/main.py` + `app/dependencies.py` + `app/routers/` ini mengikuti struktur resmi dari [dokumentasi FastAPI "Bigger Applications"](https://fastapi.tiangolo.com/tutorial/bigger-applications/); `core/` dan `db/` ditambahkan untuk memisahkan config/sesi dan lapisan database.

### Konfigurasi dan menjalankan backend

Salin `backend/.env.example` menjadi `backend/.env`, lalu isi `ROOT_KEY` dan `JWT_SECRET_KEY`. File `.env` tidak boleh masuk repo; kehilangan atau mengganti `ROOT_KEY` membuat semua data tersimpan tidak bisa dibuka.

```sh
cd backend
cp .env.example .env
python -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"  # ROOT_KEY, isi ke .env
python -c "import secrets; print(secrets.token_urlsafe(32))"                                  # JWT_SECRET_KEY, isi ke .env

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Migration berjalan otomatis saat startup. `data/schematics.db` dan `storage/` dibuat di root repo (sibling dari `backend/` dan `frontend/`), bukan di dalam `backend/`. Server ada di `http://127.0.0.1:8000`, dokumentasi endpoint interaktif di `/docs`.

### Batas model ancaman

- Melindungi data jika file SQLite, folder storage, atau backup bocor, karena isinya hanya ciphertext dan kunci terbungkus.
- Tidak melindungi dari penyerang yang menguasai server, karena root key ada di memori proses.
- Logout menghapus cookie, tetapi JWT yang sudah terbit tetap sah sampai kedaluwarsa (8 jam); ini konsekuensi JWT stateless.

## Model data

SQLite menyimpan tabel akun, tim, data terenkripsi, akses, dan benchmark; inti enkripsinya adalah `items` (satu baris per data atau file) dan `ciphertexts` (tiga baris per item, satu per cipher). Migration ada di `backend/app/db/migrations/`, dan dijalankan otomatis setiap server start (lihat `backend/app/main.py`). Setiap perubahan skema baru dibuat sebagai file SQL bernomor berikutnya; migration yang sudah diterapkan jangan diedit.

| Tabel | Kolom penting | Catatan |
| --- | --- | --- |
| `users` | id (UUID), email_index (unik), password_hash, role, verification_status, created_at | Email, data diri, dan catatan verifikasi disimpan sebagai item terenkripsi |
| `consents` | user_id, policy_version, agreed_at | Bukti persetujuan |
| `teams` | id, team_code (unik), leader_id, status (draft/final), created_at, finalized_at | Nama tim disimpan sebagai item |
| `team_members` | team_id, user_id (unik), joined_at | Satu peserta hanya di satu tim |
| `items` | id (UUID), owner_user_id atau owner_team_id, field, storage (db/fs), content_type, size_bytes, created_at | Satu item aktif per pemilik dan field |
| `ciphertexts` | id, item_id, cipher (aes/des/rc4), nonce, wrap_nonce, wrapped_keys, wrap_tag, key_version, hmac_tag, blob atau path | UNIQUE (item_id, cipher); field teks di blob, file di path |
| `juri_assignments` | juri_id, team_id, assigned_by, assigned_at | Membatasi akses juri ke tim yang ditugaskan |
| `audit_logs` | id, actor_id, action, item_id, subject_user_id, created_at | Tanpa isi data pribadi |
| `benchmark_runs` | id, cipher, operation (enc/dec/hmac), field, size_bytes, duration_ns, source (live/controlled), env, created_at | env mencatat CPU, AES-NI, versi Python dan PyCryptodome |
| `settings` | key, value | Tenggat, batas anggota, versi kebijakan privasi |
| `verification_events` | id, user_id, admin_id, decision, reason_code, note_item_id, created_at | Riwayat keputusan verifikasi |

Nilai `field`: `email`, `full_name`, `nim`, `study_program`, `institution`, `birth_date`, `domicile`, `phone`, `ktp`, `ktm`, `twibbon`, `team_name`, `proposal`, `video`, `repo_url`, `original_filename`, `verification_note`.

Setiap koneksi menyalakan `PRAGMA journal_mode=WAL` dan `PRAGMA foreign_keys=ON`.

## Benchmark

Benchmark menjawab satu pertanyaan: berapa biaya tiap cipher saat ratusan tim mengunggah dan juri membuka karya menjelang deadline, dan apakah selisih kecepatannya sepadan dengan perbedaan keamanannya.

- **Yang diukur:** throughput enkripsi dan dekripsi per cipher (MB/s, tanpa HMAC), waktu HMAC, waktu end-to-end unggah dan buka, memori puncak saat memproses video, dan overhead penyimpanan (data tiga kali lipat + sekitar 344 byte metadata per item).
- **Ukuran data:** 100 byte (field teks), 0,5 MB dan 2 MB (scan), 5 MB (proposal), 100 MB (video).
- **Cara:** `time.perf_counter_ns`, 3 kali warm-up, minimal 30 ulangan, laporkan median dan IQR. Data dibaca ke memori lebih dulu, urutan cipher digilir, dan CPU, AES-NI, serta versi library dicatat.
- **Sumber data:** skrip terkontrol dan waktu nyata setiap unggahan di `benchmark_runs`; keduanya tampil di dashboard superadmin.
- **Eksperimen tambahan:** AES dengan `use_aesni=False` untuk melihat seberapa besar keunggulan AES berasal dari dukungan perangkat keras.

### Hipotesis yang diuji (bukan hasil)

1. AES tercepat bila CPU punya AES-NI.
2. DES paling lambat untuk file besar.
3. RC4 cepat, tetapi tidak layak dipakai karena bias keystream.
4. Untuk field teks 100 byte, biaya tetap per operasi mendominasi sehingga pilihan cipher hampir tidak berpengaruh.

Angka diterjemahkan ke beban skenario, misalnya waktu CPU untuk N tim yang masing-masing mengunggah video berukuran S, dengan v adalah throughput terukur:

$$
T_{\text{CPU}} = N \cdot S \cdot \left( \frac{1}{v_{\text{AES}}} + \frac{1}{v_{\text{DES}}} + \frac{1}{v_{\text{RC4}}} + \frac{3}{v_{\text{HMAC}}} \right)
$$

## Pengujian

Uji di bawah adalah bukti utama untuk laporan, jadi semuanya ditulis sebagai test otomatis (pytest) kecuali skenario demo.

- **Keutuhan:** SHA-256 hasil buka sama dengan file asli untuk ketiga cipher, pada ukuran 0 B, 1 B, 1 MB − 1, tepat 1 MB, 1 MB + 1, dan video.
- **Vektor uji resmi:** AES-CTR dengan NIST SP 800-38A, RC4 dengan RFC 6229 (memakai `drop=0`).
- **Manipulasi:** ubah satu byte, potong file, atau pindahkan ciphertext ke item lain; semuanya harus ditolak.
- **Keacakan:** file yang sama diunggah dua kali menghasilkan ciphertext berbeda.
- **Hak akses:** setiap endpoint dicoba oleh setiap peran sesuai matriks di bagian [Peran dan hak akses](#peran-dan-hak-akses).
- **Sesi:** request tanpa header CSRF ditolak; JWT kedaluwarsa dijawab 401.
- **Tanpa plaintext di disk:** data dummy diberi string penanda unik, lalu SQLite, folder storage, folder temp, dan log dipindai; tidak boleh ada temuan.
- **Skenario demo:** tiga peserta mendaftar, membentuk tim, ketua submit final, superadmin memverifikasi dan membuat juri, juri membuka video, lalu satu ciphertext dirusak manual dan pembukaannya ditolak.

## Pembagian kerja

Modul kripto dikerjakan paling awal, sementara frontend langsung bekerja dengan mock dari Dokumentasi API, sehingga keempat anggota bisa jalan paralel sejak hari pertama.

| Anggota | Fokus |
| --- | --- |
| A | `crypto_service`, pembungkusan kunci, unit test kripto |
| B | Backend FastAPI: auth, profil, dokumen, tim, items, juri, admin |
| C | Frontend React: semua halaman, awalnya memakai mock sesuai Dokumentasi API |
| D | Skrip dan dashboard benchmark, laporan 2 halaman |

| Fase | Isi | Selesai jika |
| --- | --- | --- |
| 0. Setup | Repo, `backend/` dan `frontend/`, `.gitignore`, `.env.example` | Semua anggota bisa menjalankan proyek kosong |
| 1. Kripto | Cipher, HMAC, pembungkusan kunci, blind index | Unit test kripto lulus |
| 2. Auth dan profil | Registrasi, login JWT, persetujuan, data diri | Profil tersimpan terenkripsi |
| 3. Dokumen dan tim | Unggah dokumen, buat dan gabung tim | Uji tanpa plaintext lulus |
| 4. Submission dan file | Unggah karya, submit final, `/api/items` | Video 100 MB bisa diunggah dan diputar |
| 5. Juri dan superadmin | Verifikasi, akun juri, audit log | Uji hak akses lulus |
| 6. Evaluasi | Benchmark, dashboard, laporan | Laporan selesai |

**Aturan commit:** branch per fitur, pull request direview satu anggota lain, pesan berawalan `feat:`, `fix:`, `test:`, atau `docs:`. Setiap anggota meng-commit pekerjaannya sendiri dalam potongan kecil, karena riwayat commit dinilai.

## Keputusan dan justifikasi

Semua keputusan sudah final, dan kolom justifikasi bisa langsung diringkas untuk laporan, karena "paling mudah" tidak diterima sebagai alasan.

| Topik | Keputusan | Justifikasi |
| --- | --- | --- |
| Peserta | Khusus mahasiswa, wajib KTM/KRSM | Status mahasiswa aktif harus dibuktikan, bukan sekadar diakui |
| Cipher | AES-CTR, DES-CTR, RC4 (buang 3072 byte) | CTR membuat ketiganya berpola keystream sama sehingga perbandingan adil, tanpa padding, dan tidak membocorkan pola seperti ECB |
| Cakupan | Tiga ciphertext per item | Tugas mensyaratkan setiap data dilindungi masing-masing cipher, dan perbandingan memakai data yang sama persis |
| Kunci | Kunci acak per item per cipher, dibungkus satu KEK dengan AES-256-GCM | Kunci yang bocor hanya membuka satu item; RC4 yang tanpa nonce tetap aman karena kuncinya selalu baru |
| Integritas | HMAC-SHA256 per file, diverifikasi sebelum dekripsi | CTR dan RC4 tidak mendeteksi perubahan, padahal data harus kembali utuh |
| Pembukaan | Ketiganya didekripsi penuh dan dicocokkan; video diputar setelah file utuh diterima | Membuktikan ketiga salinan konsisten sebelum data sampai ke pengguna |
| Penyimpanan | File di filesystem, metadata dan field teks di SQLite | Video tiga kali lipat akan membengkakkan SQLite |
| Sesi | JWT di cookie HttpOnly + CSRF | Stateless dan token tidak terbaca JavaScript |
| Akses juri | Semua tim final; hanya nama dan institusi anggota, tanpa KTP/KTM | Juri butuh karya, bukan dokumen identitas; pengumpulan data tetap terbatas |
| Tim | 2–4 orang; kode tim dibuat sekali; ketua bisa mengeluarkan anggota sebelum final | Kode tetap memudahkan bergabung; risiko kode tersebar ditekan dengan rate limit dan hak ketua |
| Submission | Hanya ketua yang mengunggah dan submit | Kepemilikan karya jelas |
| Batas file | Dokumen 5 MB, proposal 10 MB, video 100 MB | Storage tiga kali lipat: 200 tim × 100 MB × 3 ≈ 60 GB |
| Peserta di bawah 18 tahun | Tidak ditolak otomatis; superadmin memutuskan manual | Kelayakan sepenuhnya keputusan panitia; platform hanya menandai usia |
| Verifikasi email dan retensi | Tidak ada | Di luar fokus tugas kuliah |
| Penilaian | Di luar platform | Platform tidak perlu menyimpan nilai |
| Tech stack | React, FastAPI, SQLite | FastAPI memakai Python sehingga PyCryptodome langsung dipakai; SQLite cukup tanpa server database |

## Risiko dan sumber

| Risiko | Penanganan |
| --- | --- |
| Middleware ASGI atau proxy menyangga body request ke disk, sehingga plaintext sempat ada di disk | Unggahan dibaca langsung dari `request.stream()` Starlette per chunk, tanpa `UploadFile` bawaan yang menyangga ke `SpooledTemporaryFile` |
| Root key ikut ter-commit | `.env` di `.gitignore`; cek sebelum push |
| Kunci atau nonce terpakai ulang saat edit | Setiap penulisan membangkitkan kunci baru; diuji otomatis |
| SQLite "database is locked" menjelang deadline | Mode WAL, transaksi pendek, retry |
| Membuka video lambat karena verifikasi dan dekripsi tiga file penuh | Diterima sebagai konsekuensi desain; waktunya diukur dan dibahas di laporan |
| Kode buatan AI tidak dipahami pemiliknya | Setiap PR direview dan penulis harus bisa menjelaskannya |

### Sumber

- [UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (Pasal.id)](https://pasal.id/)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Dokumentasi PyCryptodome](https://www.pycryptodome.org/)
- [Dokumentasi FastAPI](https://fastapi.tiangolo.com/)
- [PyJWT](https://pyjwt.readthedocs.io/)
