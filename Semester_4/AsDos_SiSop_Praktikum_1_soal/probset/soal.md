# GAME ASSET MANAGER

Studio game **Gamelove** sedang mengembangkan beberapa game baru. Seiring berkembangnya proyek, jumlah aset game seperti gambar, suara, dan model 3D di folder `assets/` meningkat hingga ratusan file.

Masalah mulai muncul.

Beberapa file ada di folder tetapi tidak tercatat di database, sementara sebagian metadata masih tersimpan meskipun file fisiknya sudah hilang. Akibatnya tim developer kesulitan melacak aset yang sebenarnya digunakan dalam proyek.

Untuk mengatasi masalah ini, kamu ditunjuk sebagai Tools Engineer untuk membuat sebuah Command Line Interface (CLI) bernama:

```
script.sh
```

Tool ini akan berfungsi sebagai Game Asset Manager, yang menjaga sinkronisasi antara folder aset fisik dan database metadata `metadata.csv`.

---

## A. Sinkronisasi (SYNC)

Perintah `sync` bertugas memastikan folder aset dan database metadata selalu konsisten.

### 1. Detect New Files

Jika terdapat file baru di folder `assets/` yang belum tercatat di `metadata.csv`, maka sistem harus otomatis menambahkan metadata baru dengan format:

```
filename,size,extension,created_at
```

contoh:

```
vector.svg,482,svg,2026-03-01_04:28:40
```

### 2. Clean Up

Jika terdapat entri pada `metadata.csv` tetapi file fisiknya sudah tidak ada di folder `assets/`, maka entri tersebut harus dihapus dari database.

### 3. Automation

Jalankan perintah `sync` setiap 5 menit menggunakan `crontab`. Tuliskan konfigurasi cronjob kalian pada file `crontabs`.

---

## B. List

Perintah `list` menampilkan isi database dalam bentuk tabel.

Fitur tambahan:

- `--sort=name` → mengurutkan berdasarkan nama file
- `--sort=size` → mengurutkan berdasarkan ukuran file
- `--ext=<extension>` → menampilkan hanya file dengan ekstensi tertentu

Contoh:

```
./script.sh list --sort=size
./script.sh list --ext=png
./script.sh list --ext=png --sort=size
```

---

## C. Statistics

Perintah `stats` menampilkan ringkasan statistik aset yang tersimpan di database, meliputi:

- Total jumlah aset
- Total ukuran seluruh aset (bytes)
- Rata-rata ukuran aset
- Aset terbesar
- Aset terkecil
- Jumlah file berdasarkan ekstensi

---

## D. Manajemen Aset (CREATE & DELETE)

Selain monitoring, tool ini juga memungkinkan pengelolaan aset secara langsung dari CLI.

### 1. Mock Asset Creation

Perintah:

```
./script.sh create <filename> <size>
```

Fungsi:

- Membuat file dummy pada folder `assets/`
- Ukuran file mengikuti parameter `<size>` dalam bytes
- Secara otomatis menambahkan metadata ke `metadata.csv`

### 2. Asset Removal

Perintah:

```
./script.sh delete <filename>
```

Fungsi:

- Menghapus file fisik dari folder `assets/`
- Menghapus metadata file tersebut dari database

---

## E. Sistem Logging (LOG)

Seluruh aktivitas sistem harus dicatat dalam file:

```
activity.log
```

---

### Format Log

```
[YYYY-MM-DD HH:MM:SS] [LEVEL] [COMMAND] message
```

---

#### 1. SYSTEM

Jika komponen penting tidak ditemukan:

```
assets/
metadata.csv
activity.log
```

Log yang dicatat:

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [SYSTEM] Missing components (assets/, metadata.csv, or activity.log)
```

---

#### 2. SYNC

File baru ditemukan

```
[YYYY-MM-DD HH:MM:SS] [INFO] [SYNC] Added new file <filename>
```

File hilang dibersihkan dari database

```
[YYYY-MM-DD HH:MM:SS] [INFO] [SYNC] Removed missing file <filename> from database
```

---

#### 3. LIST

Berhasil menampilkan database

```
[YYYY-MM-DD HH:MM:SS] [INFO] [LIST] Displayed database content
```

Hasil filter kosong

```
[YYYY-MM-DD HH:MM:SS] [INFO] [LIST] Query returned empty result
```

---

#### 4. STATS

Statistik berhasil dibuat

```
[YYYY-MM-DD HH:MM:SS] [INFO] [STATS] Generated statistics
```

Database kosong

```
[YYYY-MM-DD HH:MM:SS] [INFO] [STATS] Accessed empty database
```

---

#### 5. CREATE

Argumen kurang

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [CREATE] Missing arguments
```

Size tidak valid

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [CREATE] Invalid size: <size>
```

File sudah ada

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [CREATE] File <filename> already exists
```

File berhasil dibuat

```
[YYYY-MM-DD HH:MM:SS] [INFO] [CREATE] Created file <filename> (<size> bytes)
```

---

#### 6. DELETE

Tidak ada filename

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [DELETE] No filename provided
```

File tidak ditemukan

```
[YYYY-MM-DD HH:MM:SS] [ERROR] [DELETE] <filename> not found
```

File berhasil dihapus

```
[YYYY-MM-DD HH:MM:SS] [INFO] [DELETE] Deleted <filename>
```

<br>
<br>
Good Luck All 😆
