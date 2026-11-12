# Flow Enkripsi dan Dekripsi

Dokumen ini menjelaskan bagaimana setiap data peserta dienkripsi, disimpan, dan dibuka kembali, sesuai kode di `backend/app/crypto_services/` dan `backend/app/db/`.

Contoh yang dipakai di seluruh dokumen: field `full_name` = `"Andi Pratama"`, cipher AES. DES dan RC4 melalui langkah yang sama, hanya panjang kunci dan nonce yang berbeda.

## Daftar isi

1. [Istilah](#1-istilah)
2. [Hierarki kunci](#2-hierarki-kunci)
3. [AAD](#3-aad-additional-authenticated-data)
4. [Tiga cipher](#4-tiga-cipher)
5. [Tempat penyimpanan](#5-tempat-penyimpanan)
6. [Flow enkripsi](#6-flow-enkripsi)
7. [Flow dekripsi](#7-flow-dekripsi)
8. [Skenario serangan dan hasilnya](#8-skenario-serangan-dan-hasilnya)
9. [Di luar data item: email dan password](#9-di-luar-data-item-email-dan-password)
10. [Peta kode](#10-peta-kode)
11. [Batasan yang diketahui](#11-batasan-yang-diketahui)

---

## 1. Istilah

| Istilah | Arti singkat |
| --- | --- |
| **Plaintext** | Data asli, misalnya `"Andi Pratama"` atau isi file KTP |
| **Ciphertext** | Hasil enkripsi plaintext |
| **ROOT_KEY** | Rahasia induk di `backend/.env`; satu-satunya rahasia yang harus dijaga |
| **KEK** (Key Encryption Key) | Kunci yang mengenkripsi kunci lain, bukan data |
| **Kunci data** | Kunci acak per ciphertext: `enc_key` (enkripsi) + `mac_key` (HMAC) |
| **Nonce** | Angka acak sekali pakai agar keystream tidak berulang |
| **AAD** (Additional Authenticated Data) | Data konteks yang ikut diautentikasi tetapi tidak dienkripsi |
| **HMAC** | Segel/tanda tangan untuk mendeteksi perubahan data; bukan enkripsi |
| **Envelope encryption** | Pola "data dienkripsi kunci data, kunci data dienkripsi KEK" |

---

## 2. Hierarki kunci

```
ROOT_KEY  (backend/.env, teks ≥ 32 karakter, tidak masuk repo)
   │
   │  HKDF-SHA256, salt = "schematics-nic/crypto_services/v1"
   ├──────────── label "kek/v1" ────────────▶ KEK (32 B)
   │                                            │  AES-256-GCM (membungkus)
   │                                            ▼
   │                                        kunci data (baru untuk SETIAP ciphertext)
   │                                            ├─ enc_key → mengenkripsi isi data
   │                                            └─ mac_key → menghitung HMAC
   │
   └──────────── label "email-index/v1" ────▶ index_key (32 B) → blind index email
```

| Kunci | Asal | Dipakai untuk | Disimpan di mana |
| --- | --- | --- | --- |
| **ROOT_KEY** | Dibuat manual, ditaruh di `.env` | Bahan HKDF saja, tidak pernah mengenkripsi langsung | `.env` |
| **KEK** | HKDF(ROOT_KEY, `kek/v1`) | Membungkus kunci data | Tidak disimpan; dihitung ulang setiap server start |
| **index_key** | HKDF(ROOT_KEY, `email-index/v1`) | HMAC email untuk login | Tidak disimpan |
| **enc_key** | `secrets.token_bytes`, per ciphertext | Mengenkripsi isi data | Hanya dalam bentuk terbungkus (`wrapped_keys`) |
| **mac_key** | `secrets.token_bytes`, per ciphertext | Menghitung `hmac_tag` | Hanya dalam bentuk terbungkus (`wrapped_keys`) |

Mengapa bertingkat:

- **Database bocor tetap aman.** Database hanya berisi kunci data yang terbungkus; tanpa ROOT_KEY, kunci itu tidak bisa dipakai.
- **Satu kunci data bocor hanya membuka satu ciphertext**, bukan seluruh data.
- **Kunci tidak pernah dipakai ulang.** Setiap penulisan (isi profil, unggah ulang) membuat kunci baru, sehingga keystream CTR/RC4 tidak pernah berulang. Ini penting terutama untuk RC4 yang tidak punya nonce.
- **Label HKDF berbeda** (domain separation) membuat KEK dan index_key independen walau berasal dari ROOT_KEY yang sama.
- **Rotasi lebih murah.** Mengganti ROOT_KEY cukup membungkus ulang kunci data, tanpa mengenkripsi ulang file besar. Kolom `key_version` sudah disiapkan, tetapi rotasinya belum diimplementasikan.

---

## 3. AAD (Additional Authenticated Data)

```
aad = f"{item_id}|{cipher}|{key_version}"
contoh: "d11bfc3b-a1db-4673-b0d3-3de3181ccad2|aes|1"
```

- AAD **tidak dienkripsi dan tidak disimpan**. Saat dekripsi, AAD disusun ulang dari `item_id` yang diminta di request, serta `cipher` dan `key_version` dari baris database.
- AAD dipakai di **dua tempat**:

| Tempat | Mengikat apa | Mencegah apa |
| --- | --- | --- |
| Input **HMAC** | Isi ciphertext ↔ item dan cipher ini | Ciphertext disalin ke item lain atau ke baris cipher lain |
| AAD **AES-GCM** saat membungkus kunci | Kunci data ↔ item dan cipher ini | Kunci terbungkus disalin ke item lain |

Analogi: amplop (ciphertext) dengan stempel resmi yang mencakup alamat penerima (AAD). Alamatnya bisa dibaca siapa saja, tetapi jika amplop dipindah ke alamat lain, stempelnya tidak lagi cocok.

---

## 4. Tiga cipher

Setiap item dienkripsi **tiga kali, secara independen**, dengan kunci dan nonce masing-masing.

| Cipher | Pemanggilan PyCryptodome | enc_key | mac_key | Nonce | Counter / catatan |
| --- | --- | --- | --- | --- | --- |
| AES-256-CTR | `AES.new(k, AES.MODE_CTR, nonce=n)` | 32 B | 32 B | 8 B acak | 64 bit (sisa blok 16 B) |
| DES-CTR | `DES.new(k, DES.MODE_CTR, nonce=n)` | 8 B (56 bit efektif) | 32 B | 4 B acak | 32 bit (sisa blok 8 B); maks 2³² × 8 B = 32 GiB per pesan |
| RC4-drop3072 | `ARC4.new(k, drop=3072)` | 16 B | 32 B | tidak ada | 3072 byte awal keystream dibuang (bias awal RC4) |

Mengapa CTR: ketiga cipher menjadi sama-sama "keystream ⊕ plaintext", sehingga:

- perbandingan benchmark adil,
- tidak perlu padding (ukuran ciphertext = ukuran plaintext),
- tidak membocorkan pola seperti ECB.

Konsekuensinya, CTR dan RC4 **tidak bisa mendeteksi perubahan** sendiri. Itu sebabnya setiap ciphertext diberi HMAC-SHA256 (pola *encrypt-then-MAC*).

---

## 5. Tempat penyimpanan

| | Data teks (nama, NIM, email, dll.) | File (KTP, KTM, twibbon, proposal, video) |
| --- | --- | --- |
| `items.storage` | `'db'` | `'fs'` |
| Isi terenkripsi | kolom `ciphertexts.blob` | file `backend/storage/<uuid>.enc` |
| `ciphertexts.path` | `NULL` | nama file `.enc` |
| Nonce, kunci terbungkus, tag | baris `ciphertexts` | baris `ciphertexts` |

Contoh satu video yang diunggah:

```
items
└─ id=V, field='video', storage='fs', size_bytes=20 MB         ← metadata saja, tanpa isi

ciphertexts (3 baris, blob = NULL)
├─ aes: nonce, wrap_nonce, wrapped_keys, wrap_tag, hmac_tag, path='a1b2….enc' → storage/a1b2….enc (20 MB)
├─ des: nonce, wrap_nonce, wrapped_keys, wrap_tag, hmac_tag, path='c3d4….enc' → storage/c3d4….enc (20 MB)
└─ rc4: nonce=NULL, wrap_nonce, wrapped_keys, …,     path='e5f6….enc' → storage/e5f6….enc (20 MB)

items (anak)
└─ field='original_filename', parent_item_id=V, storage='db'   ← nama file asli ikut dienkripsi 3×
```

- Nama file `.enc` acak (UUID) tanpa ekstensi asli, sehingga tidak terlihat milik siapa atau jenisnya apa.
- Constraint tabel memastikan tepat satu dari `blob`/`path` terisi, `UNIQUE(item_id, cipher)`, RC4 `nonce IS NULL`, AES/DES `nonce IS NOT NULL`.
- Satu field hanya punya satu item aktif (unique index). Menulis ulang akan men-*shred* item lama: ciphertext dan file `.enc` lama dihapus, item ditandai `shredded_at`.

### Ukuran metadata per item

| Kolom | AES | DES | RC4 |
| --- | --- | --- | --- |
| `nonce` | 8 | 4 | 0 |
| `wrap_nonce` | 12 | 12 | 12 |
| `wrapped_keys` | 64 | 40 | 48 |
| `wrap_tag` | 16 | 16 | 16 |
| `hmac_tag` | 32 | 32 | 32 |
| **Total** | **132** | **104** | **108** |

Total **344 byte metadata per item**, sehingga ruang yang dipakai = 3 × ukuran data + 344 byte.

---

## 6. Flow enkripsi

### Alur pemanggilan

```
PUT /api/profile  atau  POST /api/documents/{type}  (routers/)
  └─ write_item() / save_file()                          db/items.py
       ├─ shred item lama untuk field ini
       ├─ INSERT items (metadata)
       └─ store_ciphertexts()                              db/ciphertexts.py
            └─ untuk aes, des, rc4:
                 crypto.seal(plaintext, cipher, context=item_id)   crypto_services/service.py
                   └─ envelope.seal()                              crypto_services/envelope.py
                        ├─ suite.encrypt()   (enkripsi + HMAC)     aes256_ctr_hmac.py / des_ctr_hmac.py / rc4.py
                        └─ wrap_keys()       (AES-256-GCM)
                 INSERT ciphertexts (+ tulis storage/<uuid>.enc untuk file)
                 record_live()  → benchmark_runs
  └─ get_db(): COMMIT jika sukses, ROLLBACK jika error (file .enc yang sempat ditulis dihapus)
```

### Langkah per cipher

| # | Langkah | Yang diproses (input) | Kunci yang dipakai | Peran AAD | Hasil (output) | Disimpan? |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Turunkan KEK (sekali saat start) | `ROOT_KEY` | — (HKDF-SHA256, `kek/v1`) | — | **KEK** 32 B | ❌ memori saja |
| 1 | Susun AAD | `item_id`, nama cipher, `key_version` | — | dibuat di sini | **AAD** | ❌ disusun ulang saat dekripsi |
| 2 | Bangkitkan kunci data | — (`secrets.token_bytes(64)`) | — | — | **enc_key** 32 B + **mac_key** 32 B | ❌ polosnya tidak pernah disimpan |
| 3 | **Enkripsi data** | **plaintext** `"Andi Pratama"` (12 B) + **nonce** acak 8 B | **enc_key** | tidak dipakai | **ciphertext** (12 B) | ✅ `blob` / file `.enc`, + `nonce` |
| 4 | **Hitung HMAC** | `len(AAD)` (8 B big-endian) ‖ **AAD** ‖ **nonce** ‖ **ciphertext** | **mac_key** | **ikut disegel** | **hmac_tag** 32 B | ✅ `hmac_tag` |
| 5 | **Enkripsi kunci data** (wrap) | **enc_key ‖ mac_key** (64 B) + **wrap_nonce** acak 12 B | **KEK** (AES-256-GCM) | **ikut diautentikasi GCM** | **wrapped_keys** 64 B + **wrap_tag** 16 B | ✅ `wrapped_keys`, `wrap_nonce`, `wrap_tag`, `key_version` |

Yang **dienkripsi** hanya dua hal:

1. **Data**, dengan `enc_key` (langkah 3).
2. **Kunci data**, dengan KEK (langkah 5).

AAD dan nonce tidak dienkripsi, hanya ikut diautentikasi. HMAC bukan enkripsi; ia segel yang membuktikan data tidak diubah.

Panjang AAD ikut dimasukkan ke HMAC agar batas antara AAD dan nonce tidak ambigu. Untuk RC4, nonce di input HMAC berupa string kosong.

### Contoh nilai sungguhan

```
KEK = HKDF(ROOT_KEY, 'kek/v1')     : 07b84a8e86ca77035db34d0500864a5b... (32 B)

1. AAD                             : d11bfc3b-a1db-4673-b0d3-3de3181ccad2|aes|1
2. kunci data acak (64 B)          : enc_key 97db11cc1445df02... | mac_key 1d6d295906d5ba0c...
3. AES-CTR nonce abd54b9154d83ecd  : ct 08eb4ca06247e2954cada29d
4. HMAC input (70 B)               : hmac_tag 8b72c30707a8b90175bfc4b81deb403c...
5. GCM(KEK, wrap_nonce d062ed36d0eb1c39eba3aadf, AAD)
                                   : wrapped_keys d1a8f49ec72b3b5b... (64 B), wrap_tag 39c5f78151bf1a7d4934f2cab2c1eda1

DISIMPAN      : nonce, wrap_nonce, wrapped_keys, wrap_tag, key_version, hmac_tag, ciphertext
TIDAK DISIMPAN: KEK, enc_key, mac_key, AAD
```

---

## 7. Flow dekripsi

### Alur pemanggilan

```
GET /api/items/{id}                                     routers/items.py → open_item()
  ├─ autentikasi JWT dari cookie HttpOnly (tanpa/kedaluwarsa → 401)
  ├─ cek hak akses (tidak berhak atau tidak ada → 404)
  ├─ catat audit_logs "open_item:<field>" jika bukan pemilik
  └─ read_text() / read_file()                          db/items.py
       └─ load_plaintext()                              db/ciphertexts.py
            ├─ SELECT 3 baris ciphertexts
            ├─ untuk tiap baris: _open_row()
            │    └─ crypto.open() → envelope.open_sealed()
            │         ├─ unwrap_keys()   (AES-256-GCM)
            │         └─ suite.decrypt() (cek HMAC → dekripsi)
            │    record_live() → benchmark_runs
            └─ bandingkan ketiga plaintext
  └─ Response (Cache-Control: no-store, X-Content-Type-Options: nosniff)
```

Data profil yang dibaca lewat `GET /api/profile` memakai `read_item()` → `load_plaintext()`, dengan langkah yang sama. Membuka profil berarti 7 field × 3 cipher = 21 kali dekripsi.

### Hak akses sebelum dekripsi

| Peran | Boleh membuka |
| --- | --- |
| Pemilik | Item pribadinya, atau item tim tempat ia menjadi anggota |
| Superadmin | Semua item (tercatat di audit) |
| Juri | Hanya `proposal`, `video`, `repo_url` dari tim yang sudah **final** dan **ditugaskan** kepadanya (tercatat) |
| Lainnya | Dijawab **404**, sama seperti item yang tidak ada, agar ID tidak bisa diuji keberadaannya |

### Langkah per cipher

| # | Langkah | Yang diproses (input) | Kunci yang dipakai | Peran AAD | Hasil (output) | Kalau gagal |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | Turunkan KEK | `ROOT_KEY` | — (HKDF) | — | **KEK** | — |
| 1 | Susun ulang AAD | `item_id` **dari request** + `cipher`, `key_version` dari DB | — | harus sama persis dengan saat enkripsi | **AAD** | — |
| 2 | **Dekripsi kunci data** (unwrap) | **wrapped_keys**, **wrap_nonce**, **wrap_tag** dari DB | **KEK** (AES-256-GCM) | GCM mengecek AAD + wrap_tag | **enc_key** + **mac_key** (di memori) | "tag pembungkus tidak cocok" |
| 3 | **Cek HMAC** | `len(AAD)` ‖ **AAD** ‖ **nonce** ‖ **ciphertext** dari DB/file | **mac_key** | dihitung ulang, harus sama dengan **hmac_tag** | lolos / ditolak | "HMAC tidak cocok" |
| 4 | **Dekripsi data** | **ciphertext** + **nonce** | **enc_key** | tidak dipakai | **plaintext** `"Andi Pratama"` | — |

Setelah ketiga cipher dibuka:

| # | Langkah | Yang diproses | Hasil | Kalau gagal |
| --- | --- | --- | --- | --- |
| 5 | Bandingkan | plaintext AES, DES, RC4 | dikirim jika identik | "Hasil dekripsi antar-cipher berbeda" |

Urutan ini penting: **kunci dibuka → HMAC dicek → baru dekripsi**. Ciphertext yang diubah tidak pernah sampai ke tahap dekripsi. Perbandingan tag memakai `hmac.compare_digest` (constant-time) agar tidak bocor lewat perbedaan waktu.

### Pengiriman ke browser

| Jenis | Respons |
| --- | --- |
| Teks (`storage='db'`) | `text/plain` |
| File (`storage='fs'`) | `content_type` asli; `Content-Disposition: inline` atau `attachment` (`?download=1`) dengan nama file asli (hasil dekripsi item anak); mendukung `Range` (206) |

Di frontend (`ItemBlobViewer.tsx`), respons diunduh utuh sebagai `Blob`, dijadikan `URL.createObjectURL(blob)`, lalu ditampilkan di `<img>`, `<iframe>`, atau `<video>`. URL dicabut (`revokeObjectURL`) saat komponen ditutup.

---

## 8. Skenario serangan dan hasilnya

Hasil run sungguhan memakai modul kripto project:

| Skenario | Gagal di langkah | Hasil |
| --- | --- | --- |
| Dibuka normal | — | `b'Andi Pratama'` |
| Ciphertext dipindah ke item lain | 2 (unwrap GCM), karena AAD berisi `item_id` lain | Ditolak |
| 1 bit ciphertext diubah | 3 (HMAC) | Ditolak |
| 1 bit diubah, **seandainya tanpa HMAC** | — | Lolos menjadi `b'@ndi Pratama'` tanpa terdeteksi |
| ROOT_KEY salah / diganti | 2 (unwrap GCM), karena KEK berbeda | Ditolak |
| `wrapped_keys` atau `wrap_tag` diubah | 2 (unwrap GCM) | Ditolak |
| `hmac_tag` atau `nonce` diubah | 3 (HMAC) | Ditolak |
| Hanya satu dari tiga ciphertext rusak | 3 pada cipher itu | Seluruh permintaan ditolak |

Baris keempat menunjukkan mengapa HMAC wajib: CTR dan RC4 hanya meng-XOR keystream, sehingga mengubah 1 bit ciphertext mengubah tepat 1 bit plaintext (`A` → `@`). Penyerang bisa memanipulasi isi tanpa mengetahui kunci.

Penolakan saat ini dijawab HTTP 500 `internal_error` (lihat [batasan](#11-batasan-yang-diketahui)).

---

## 9. Di luar data item: email dan password

| Data | Perlakuan |
| --- | --- |
| **Email** | Disimpan sebagai item terenkripsi tiga cipher seperti data lain. Untuk login, `users.email_index` = HMAC-SHA256(index_key, email yang di-strip dan diubah ke huruf kecil). Login mencari user lewat nilai ini tanpa perlu mendekripsi email. |
| **Password** | Tidak dienkripsi, melainkan di-hash **Argon2id** (`memory_cost` 19 MiB, `time_cost` 2, `parallelism` 1, sesuai OWASP). Hash satu arah: tidak bisa dikembalikan ke password asli. |
| **Nama file asli** | Item anak `original_filename`, dienkripsi tiga cipher. |

---

## 10. Peta kode

| File | Isi |
| --- | --- |
| `backend/app/crypto_services/keyring.py` | ROOT_KEY → HKDF → KEK dan index_key |
| `backend/app/crypto_services/envelope.py` | `build_aad`, `seal`, `open_sealed`, `wrap_keys`, `unwrap_keys` |
| `backend/app/crypto_services/_mac.py` | `compute_tag`, `verify_tag` (HMAC-SHA256) |
| `backend/app/crypto_services/aes256_ctr_hmac.py` | AES-256-CTR + HMAC |
| `backend/app/crypto_services/des_ctr_hmac.py` | DES-CTR + HMAC |
| `backend/app/crypto_services/rc4.py` | RC4-drop3072 + HMAC (dan jalur baca RC4 format lama) |
| `backend/app/crypto_services/service.py` | `CryptoService`: fasad `seal`, `open`, `email_index` |
| `backend/app/crypto_services/registry.py` | Daftar cipher `aes`, `des`, `rc4` |
| `backend/app/core/crypto.py` | Menghubungkan `.env` ke `CryptoService` (di-cache) |
| `backend/app/db/ciphertexts.py` | `store_ciphertexts`, `load_plaintext`, `delete_ciphertexts` |
| `backend/app/db/items.py` | `write_item`, `save_file`, `read_text`, `read_file`, shred item lama |
| `backend/app/routers/items.py` | `open_item`: hak akses, audit, respons |
| `backend/app/db/migrations/001_initial.sql` | Skema dan constraint `items` / `ciphertexts` |

---

## 11. Batasan yang diketahui

| Batasan | Dampak |
| --- | --- |
| Kerahasiaan keseluruhan setara cipher terlemah (DES), karena ketiga salinan berisi plaintext yang sama | Konsekuensi syarat tugas; dibahas di laporan |
| Tidak melindungi dari penyerang yang menguasai server | ROOT_KEY dan KEK ada di memori proses |
| Kegagalan integritas tidak tercatat di audit log | `IntegrityError` hanya menjadi 500; `get_db()` melakukan rollback sehingga catatan `open_item` dan timing request itu ikut hilang |
| Upload dan dekripsi dilakukan utuh di memori | File dibaca dengan `request.body()` dan didekripsi 3× sekaligus; video 100 MB butuh ±300 MB memori per request |
| Request `Range` mendekripsi ulang seluruh file | Setiap seek video memverifikasi dan mendekripsi penuh ketiga cipher |
| Rotasi kunci belum ada | Kolom `key_version` sudah disiapkan; hanya versi aktif yang bisa dibuka |
| Jalur baca RC4 format lama (tanpa HMAC, `drop=0`) masih ada | Hanya untuk data lama; data baru tidak bisa diturunkan ke format ini karena panjang kunci terbungkus diautentikasi GCM |
