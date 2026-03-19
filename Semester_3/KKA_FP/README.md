# Museum Heist - Escape the Police! 

Game berbasis Python-Pygame di mana pemain berperan sebagai pencuri yang harus mencuri emas dari museum dan melarikan diri dari dua polisi AI yang cerdas.

## Deskripsi

Museum Heist adalah game strategi real-time di mana Anda harus:
1. **Mencuri emas** dari museum
2. **Menghindari dua polisi AI** yang menggunakan algoritma A* untuk mengejar Anda
3. **Melarikan diri** melalui pintu keluar

Game ini menampilkan dua polisi dengan strategi berbeda:
- **Polisi 1 (Chaser)**: Mengejar posisi Anda saat ini secara langsung
- **Polisi 2 (Interceptor)**: Memprediksi gerakan Anda dan mencoba memotong jalur pelarian

## Fitur Utama

- **5 Level Kesulitan** dengan tingkat kompleksitas berbeda
- **AI Polisi Cerdas** menggunakan algoritma pathfinding A*
- **Sistem Prediksi Gerakan** untuk polisi interceptor
- **Grid Dinamis** dengan dinding yang dihasilkan secara acak
- **Sistem Audio** dengan musik latar dan efek suara
- **Timer** untuk mencatat waktu pelarian Anda
- **Sprite Prosedural** yang dihasilkan secara otomatis jika aset tidak tersedia

## Instalasi

### Persyaratan Sistem
- Python 3.7 atau lebih baru
- Pygame

### Langkah Instalasi

1. **Clone atau download repository ini**
```bash
git clone <repository-url>
cd museum-heist
```

2. **Install dependencies**
```bash
pip install pygame
```

3. **Jalankan game**
```bash
python museum_heist.py
```

## Cara Bermain

### Kontrol
- **W / ↑**: Gerak ke atas
- **S / ↓**: Gerak ke bawah
- **A / ←**: Gerak ke kiri
- **D / →**: Gerak ke kanan
- **ENTER**: Mulai game (di menu)
- **R**: Kembali ke menu (saat bermain)
- **N**: Lanjut ke level berikutnya (setelah menang)
- **Q**: Keluar game

### Objektif
1. Navigasikan pencuri (karakter pink/magenta) ke emas (kuning)
2. Setelah mengambil emas, polisi akan mulai mengejar
3. Hindari kedua polisi (biru dan biru muda)
4. Capai pintu keluar (hijau) untuk menang

### Level Kesulitan

| Level | Nama | Dinding | Kecepatan Polisi |
|-------|------|---------|------------------|
| 1 | Easy | 25% | Lambat (300ms) |
| 2 | Normal | 30% | Sedang (200ms) |
| 3 | Hard | 35% | Cepat (180ms) |
| 4 | Expert | 35% | Sangat Cepat (150ms) |
| 5 | Impossible | 40% | Ekstrem (120ms) |

## Struktur Code

### Kelas Utama

#### `AssetLoader`
Mengelola pemuatan dan pembuatan aset game:
- Gambar sprite (pencuri, polisi, uang, dll.)
- File audio (musik latar, efek suara)
- Sprite prosedural sebagai fallback

#### `Node`
Kelas untuk algoritma A* pathfinding:
- Menyimpan posisi, biaya (g, h, f)
- Parent node untuk rekonstruksi jalur

#### `Game`
Kelas utama yang mengelola:
- Game state dan loop
- Input handling
- Logika AI polisi
- Rendering dan HUD
- Sistem audio

### Algoritma Kunci

#### A* Pathfinding
```python
def a_star(self, start, goal):
    # Mencari jalur terpendek dari start ke goal
    # Menggunakan Manhattan distance sebagai heuristik
    # Menghindari dinding dalam grid
```

#### Prediksi Interceptor
```python
def get_intercept_target(self):
    # Memprediksi posisi pencuri 1-5 langkah ke depan
    # Berdasarkan arah gerakan terakhir
    # Untuk memotong jalur pelarian
```

## Aset

Game mendukung aset custom yang dapat ditempatkan di folder `assets/`:
- `thief.png` - Sprite pencuri
- `police1.png` - Sprite polisi 1
- `police2.png` - Sprite polisi 2
- `money.png` - Sprite emas
- `running.mp3` - Musik pengejaran
- `before.mp3` - Musik sebelum pencurian
- `win.mp3` - Efek suara menang
- `lose.mp3` - Efek suara kalah
- `upheavtt.ttf` - Font judul (opsional)

**Catatan**: Jika aset tidak tersedia, game akan otomatis membuat sprite sederhana sebagai pengganti.

## Konfigurasi

Anda dapat menyesuaikan pengaturan game di bagian CONSTANTS:

```python
GRID_SIZE = 17              # Ukuran grid (17x17)
CELL_SIZE = 43              # Ukuran sel dalam pixel
FPS = 60                    # Frame per detik
INTERCEPT_DISTANCE = 5      # Jarak mode intercept/chase
MOVE_DELAY = 150            # Delay gerakan pemain (ms)
POLICE_PATH_VISUALIZATION = 0  # Debug: tampilkan jalur polisi
```

## Troubleshooting

### Audio tidak berfungsi
- Pastikan pygame.mixer terinisialisasi dengan benar
- Periksa apakah file audio ada di folder `assets/`
- Game akan tetap berjalan tanpa audio jika ada masalah

### Frame rate rendah
- Kurangi `GRID_SIZE` untuk grid lebih kecil
- Nonaktifkan `POLICE_PATH_VISUALIZATION`
- Pastikan tidak ada program berat lain yang berjalan

### Polisi terlalu cepat/lambat
- Sesuaikan nilai `police_speed` di `LEVEL_CONFIG`
- Nilai lebih kecil = polisi lebih cepat

---

**Selamat bermain dan semoga berhasil melarikan diri!**
