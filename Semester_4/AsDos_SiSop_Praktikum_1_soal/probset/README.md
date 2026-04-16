# PRAKTIKUM 1 SISTEM OPERASI

## Mini File Database Manager dengan Shell Script

---

# Deskripsi Umum

Praktikan diminta membuat sebuah program shell bernama:

```bash
script.sh
```

Program ini berfungsi sebagai sistem manajemen database file sederhana berbasis CSV yang melakukan sinkronisasi terhadap folder tetap:

```
assets/
```

Program bekerja sebagai CLI (Command Line Interface) dan mengelola metadata file dalam bentuk database CSV.

---

# Struktur Sistem

| Komponen      | Nama           |
| ------------- | -------------- |
| Folder data   | `assets/`      |
| File Script   | `script.sh`    |
| File database | `metadata.csv` |
| File log      | `activity.log` |
| File cron     | `crontabs`     |

Ketentuan penting:

* Seluruh komponen diasumsikan sudah tersedia sebelum program dijalankan.
* Jika salah satu komponen tidak ditemukan:

  * Program menampilkan error
  * Mencatat error ke `activity.log`
  * Menghentikan eksekusi

---

# Format Database

File: `metadata.csv`

Setiap baris memiliki format:

```
filename,size,extension,created_at
```

Keterangan:

* `filename` → nama file
* `size` → ukuran file dalam bytes
* `extension` → huruf kecil (lowercase), jika tidak memiliki ekstensi gunakan `none`
* `created_at` → waktu file dicatat ke database

Format waktu:

```
YYYY-MM-DD_HH:MM:SS
```

Contoh:

```
report.pdf,1200,pdf,2026-02-26_14:30:00
notes.txt,500,txt,2026-02-26_14:32:11
image.png,800,png,2026-02-26_14:35:02
```

Database tidak memiliki header.

---

# Fitur yang Harus Diimplementasikan

---

## 1. SYNC

```
./script.sh sync
```

Fungsi:

* Membaca seluruh file dalam folder `assets/`
* Jika file ada di folder tetapi belum ada di database → tambahkan
* Jika file ada di database tetapi sudah tidak ada di folder → hapus

---

## 2. LIST

```
./script.sh list
./script.sh list --sort=name
./script.sh list --sort=size
./script.sh list --ext=png
./script.sh list --ext=png --sort=name
```

Fungsi:

* Menampilkan isi database
* Mendukung sorting:

  * `--sort=name`
  * `--sort=size`
* Mendukung filtering:

  * `--ext=<extension>`

Ketentuan:

* Sorting dan filtering boleh digabung

---

## 3. STATS

```
./script.sh stats
```

Menampilkan:

1. Total files
2. Total size (bytes)
3. Average size
4. Largest file
5. Smallest file
6. Jumlah file per extension

Contoh output:

```
Total files        : 10
Total size (bytes) : 5023
Average size       : 502

Largest file       : report.pdf (1200 bytes)
Smallest file      : log.txt (12 bytes)

File count by extension:
pdf  : 3
txt  : 4
png  : 3
```

Jika database kosong → tampilkan informasi yang sesuai (tidak crash).

---

## 4. CREATE

```
./script.sh create <filename> <size>
```

Fungsi:

* Membuat file di folder dataset
* Ukuran sesuai parameter (bytes)
* Menambahkan entry ke database
* Mengambil extension otomatis dari filename
* Jika tidak ada ekstensi → `none`

Validasi:

* Argumen kurang → error
* Size bukan angka positif → error
* File sudah ada → error

---

## 5. DELETE

```
./script.sh delete <filename>
```

Fungsi:

* Menghapus file dari folder
* Menghapus entry dari database
* Logging aktivitas

---

## 6. LOGGING SYSTEM

Semua perintah wajib mencatat aktivitas ke:

```
activity.log
```

Format:

```
[YYYY-MM-DD HH:MM:SS] [LEVEL] [COMMAND] message
```

LEVEL:

* INFO
* ERROR

---

### 1. SYSTEM

Jika komponen penting tidak ditemukan:

```
assets/
metadata.csv
activity.log
crontab
```

Log yang dicatat:

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [SYSTEM] Missing components (assets/, metadata.csv, activity.log, or crontabs)
```

---

### 2. SYNC

**File baru ditemukan**

```
[YYYY-MM-DD HH:MM:SS] [INFO] [SYNC] Added new file <filename>
```

**File hilang dibersihkan dari database**

```
[YYYY-MM-DD HH:MM:SS] [INFO] [SYNC] Removed missing file <filename> from database
```

---

### 3. LIST

**Berhasil menampilkan database**

```
[YYYY-MM-DD HH:MM:SS] [INFO] [LIST] Displayed database content
```

**Hasil filter kosong**

```
[YYYY-MM-DD HH:MM:SS] [INFO] [LIST] Query returned empty result
```

---

### 4. STATS

**Statistik berhasil dibuat**

```
[YYYY-MM-DD HH:MM:SS] [INFO] [STATS] Generated statistics
```

**Database kosong**

```
[YYYY-MM-DD HH:MM:SS] [INFO] [STATS] Accessed empty database
```

---

### 5. CREATE

**Argumen kurang**

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [CREATE] Missing arguments
```

**Size tidak valid**

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [CREATE] Invalid size: <size>
```

**File sudah ada**

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [CREATE] File <filename> already exists
```

**File berhasil dibuat**

```
[YYYY-MM-DD HH:MM:SS] [INFO] [CREATE] Created file <filename> (<size> bytes)
```

---

### 6. DELETE

**Tidak ada filename**

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [DELETE] No filename provided
```

**File tidak ditemukan**

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [DELETE] <filename> not found
```

**File berhasil dihapus**

```
[YYYY-MM-DD HH:MM:SS] [INFO] [DELETE] Deleted <filename>
```

Ketentuan:

* Semua error wajib dicatat
* Minimal satu log untuk setiap perintah

---

# Implementasi Wajib Menggunakan

* CLI parsing dengan `case`
* Function modular
* Looping (`for` dan `while`)
* Conditional (`if/else`)
* File I/O
* `awk` (aggregation dan filtering)
* `sort`
* Cron automation
* Structured logging system
