# Naskah Demo ke Asisten Dosen

Tiga bagian: **tech stack**, **flow database**, **flow enkripsi**. Masing-masing ±3–5 menit.

> Pembukaan singkat: "Kami membuat platform pendaftaran hackathon Schematics NIC. Peserta mengunggah data diri, KTP, KTM, twibbon, lalu tim mengumpulkan proposal dan video. Setiap data disimpan terenkripsi tiga kali: AES-CTR, DES-CTR, dan RC4."

---

## 1. Tech stack

| Lapisan | Dipakai | Alasan |
| --- | --- | --- |
| Frontend | React 19 + TypeScript, Vite, Tailwind, TanStack Query, Zustand, React Router | Terpisah dari backend, jadi semua aturan akses ditegakkan di server |
| Backend | Python FastAPI (satu router per modul: auth, profil, dokumen, tim, items, juri, admin) | Python, sehingga library kripto langsung dipakai |
| Database | SQLite (mode WAL, foreign key aktif) + folder `storage/` untuk file | Satu file tanpa server terpisah, cukup untuk satu lomba |
| Kriptografi | PyCryptodome (AES, DES, ARC4, AES-GCM, HKDF) + `hmac`/`hashlib` bawaan Python | Satu library menyediakan semua cipher yang dibutuhkan |
| Password | argon2-cffi (Argon2id, 19 MiB, 2 iterasi) | Sesuai rekomendasi OWASP |
| Sesi | PyJWT di cookie HttpOnly + token CSRF | Token tidak bisa dibaca JavaScript |
| Rate limit | slowapi | Membatasi percobaan login |

> "Saat development, Vite mem-proxy `/api` ke FastAPI di port 8000, jadi frontend dan backend satu origin dan cookie jalan tanpa CORS."

Tampilkan sekilas struktur folder: `frontend/`, `backend/app/routers/`, `backend/app/db/`, `backend/app/crypto_services/`.

---

## 2. Flow database

### Tabel

| Tabel | Isi |
| --- | --- |
| `users` | id, **email_index** (bukan email), password_hash, role, status verifikasi |
| `teams`, `team_members` | Kode tim, ketua, status draft/final, anggota |
| `items` | **Metadata saja**: pemilik, field (`full_name`, `ktp`, `video`, ...), tipe, ukuran. Tanpa isi |
| `ciphertexts` | **3 baris per item** (aes, des, rc4): nonce, kunci terbungkus, HMAC tag, isi (`blob`) atau nama file (`path`) |
| `audit_logs` | Siapa mengakses data siapa, tanpa isi data pribadi |
| `benchmark_runs` | Waktu enkripsi/dekripsi tiap cipher |
| `consents`, `juri_assignments`, `settings`, `verification_events` | Persetujuan privasi, penugasan juri, tenggat, riwayat verifikasi |

> "Kuncinya: tabel `items` hanya tahu *ada data apa*, isinya hanya ada di `ciphertexts` dalam bentuk terenkripsi."

### Alur menyimpan (contoh: peserta mengisi nama)

```
Browser  ──PUT /api/profile──▶  router profile.py
                                   │ cek login, CSRF, consent
                                   ▼
                              db/items.py  write_item()
                                   │ 1. item lama untuk field ini di-shred (ciphertext dihapus)
                                   │ 2. INSERT baris baru di `items` (metadata)
                                   ▼
                              db/ciphertexts.py  store_ciphertexts()
                                   │ untuk aes, des, rc4: enkripsi lalu INSERT ke `ciphertexts`
                                   │ teks → kolom blob | file → storage/<uuid>.enc
                                   ▼
                              commit dalam satu transaksi
```

- Field teks (nama, NIM, HP, dll.) → ciphertext di kolom `blob`.
- File (KTP, proposal, video) → ciphertext di `storage/<uuid>.enc`; nama file asli juga dienkripsi sebagai item anak.
- Edit atau unggah ulang selalu membuat item baru dengan kunci baru; yang lama dihapus.

### Alur membaca (contoh: juri membuka video)

```
GET /api/items/{id} → cek hak akses (bukan haknya → 404) → ambil 3 baris ciphertexts
→ dekripsi ketiganya → hasilnya harus identik → kirim ke browser → catat di audit_logs
```

### Tunjukkan langsung (terminal di `backend/`)

```sh
sqlite3 data/schematics.db "SELECT i.field, c.cipher, hex(substr(c.nonce,1,8)), hex(substr(coalesce(c.blob,''),1,16)), c.path FROM ciphertexts c JOIN items i ON i.id=c.item_id ORDER BY i.created_at DESC LIMIT 9;"
ls storage/ | head
```

> "Satu field = tiga baris aes/des/rc4, nonce dan isinya berbeda semua, dan tidak ada nama atau email yang terbaca."

---

## 3. Flow enkripsi

### Hierarki kunci

```
ROOT_KEY (.env, tidak masuk repo)
   └─ HKDF-SHA256 ─┬─ KEK            → membungkus kunci data tiap ciphertext (AES-256-GCM)
                   └─ kunci indeks   → blind index email: HMAC-SHA256(email huruf kecil)
```

> "ROOT_KEY tidak pernah dipakai langsung. Dari situ diturunkan dua kunci dengan label berbeda. Login mencari user lewat blind index, jadi email tidak perlu disimpan plaintext."

### Tiga cipher

| Cipher | Kunci | Nonce | Catatan |
| --- | --- | --- | --- |
| AES-256-CTR | 32 byte | 8 byte acak + counter | |
| DES-CTR | 8 byte (56 bit efektif) | 4 byte acak + counter | Paling lemah |
| RC4 | 16 byte | Tidak ada | 3072 byte awal keystream dibuang |

Setiap cipher juga punya **kunci HMAC-SHA256 32 byte** sendiri.

> "Kami pakai CTR supaya ketiganya sama-sama 'keystream XOR plaintext': adil untuk benchmark, tanpa padding, dan tidak membocorkan pola seperti ECB."

### Seal (enkripsi), untuk tiap cipher

Kode: `backend/app/crypto_services/envelope.py` → `seal()`

1. Bangkitkan **kunci acak baru** = kunci enkripsi ‖ kunci HMAC (`secrets.token_bytes`).
2. Bangkitkan nonce acak, enkripsi plaintext → ciphertext.
3. **HMAC-SHA256** atas (panjang AAD ‖ AAD ‖ nonce ‖ ciphertext). AAD = `id_item | cipher | versi_kunci`.
4. **Bungkus kunci** dengan KEK memakai AES-256-GCM (nonce 12 byte, AAD sama) → `wrapped_keys` + `wrap_tag`.
5. Simpan: nonce, wrap_nonce, wrapped_keys, wrap_tag, key_version, hmac_tag, ciphertext.

> "Kunci baru setiap penulisan, jadi keystream tidak pernah terpakai dua kali, termasuk RC4 yang tidak punya nonce. AAD berisi ID item, jadi ciphertext tidak bisa dipindah ke item lain."

### Open (dekripsi)

Kode: `envelope.py` → `open_sealed()`, `db/ciphertexts.py` → `load_plaintext()`

1. Buka bungkus kunci dengan KEK (GCM memverifikasi tag; gagal = ditolak).
2. **Verifikasi HMAC dulu** (perbandingan constant-time). Tidak cocok → ditolak, ciphertext tidak didekripsi.
3. Dekripsi.
4. Ulangi untuk ketiga cipher, lalu **bandingkan ketiga hasilnya**: harus identik.

> "CTR dan RC4 tidak bisa mendeteksi perubahan sendiri. Karena itu kami pakai encrypt-then-MAC: data yang diubah sudah ditolak sebelum didekripsi."

### Bukti singkat (opsional, 1 menit)

```sh
python demo.py
```

Script ini menjalankan seluruh alur di database sementara: menyimpan data, menunjukkan tiga ciphertext, memindai disk untuk mencari plaintext (hasilnya tidak ada), lalu merusak 1 byte ciphertext video dan menunjukkan pembukaannya ditolak.

### Penutup

> "Batasan yang kami sadari: karena ketiga salinan berisi plaintext yang sama, kerahasiaan keseluruhan hanya setara cipher terlemah, yaitu DES. Sistem melindungi data jika database atau storage bocor, tetapi tidak melindungi dari penyerang yang menguasai server, karena ROOT_KEY ada di memori proses."

---

## Antisipasi pertanyaan

| Pertanyaan | Jawaban |
| --- | --- |
| Kenapa tidak ECB/CBC? | ECB membocorkan pola; CBC butuh padding. CTR membuat ketiga cipher berbentuk stream sehingga perbandingan adil. |
| RC4 tanpa nonce, aman? | Kuncinya selalu baru per penulisan, dan 3072 byte awal keystream dibuang. |
| Kunci disimpan di mana? | Kunci per ciphertext dibungkus AES-256-GCM dengan KEK; database hanya berisi kunci terbungkus. KEK diturunkan dari ROOT_KEY di `.env`. |
| Kalau `.env` hilang? | Semua data tidak bisa dibuka. Kolom `key_version` disiapkan untuk rotasi kunci. |
| Kenapa kunci HMAC dipisah dari kunci enkripsi? | Satu kunci untuk satu tujuan (pemisahan kunci). |
| Login kalau email terenkripsi? | Blind index HMAC-SHA256 email huruf kecil, dicocokkan dengan `users.email_index`. |
| Kenapa ketiganya didekripsi saat dibuka? | Membuktikan ketiga salinan konsisten; biayanya diukur di benchmark. |
| Overhead penyimpanan? | 3× ukuran data + metadata (nonce, kunci terbungkus, tag) per item. |
