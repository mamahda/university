# Tugas 1 Grafika Komputer — Replikasi Gambar dengan WebGL

| Nama | NRP |
|---|---|
| Kemas Muhammad Athariq | 5025241102 |
| Gilbran Mahdavikia Raja | 5025241134 |

## Deskripsi aplikasi

Aplikasi WebGL2 yang mereplikasi gambar `referensi/image.png` (pemandangan gunung, matahari, jalan, rumah, pohon, rumput, dan burung) hanya dengan primitive: kotak, segitiga, lingkaran, setengah lingkaran, dan garis. Gambar referensi dan hasil WebGL ditampilkan berdampingan dengan ukuran 600 x 395.25 piksel 
Setiap bentuk dasar disimpan sekali di GPU buffer dalam local coordinate berukuran satuan, lalu ditempatkan di scene menggunakan Model Matrix yang dikirim sebagai uniform `u_matrix`. Segitiga statis dengan titik bebas (gunung, jalan, sisi atap) juga dibuat sekali saat inisialisasi, sehingga tidak ada vertex buffer yang diunggah ulang setiap frame. Warna tiap objek dikirim sebagai uniform `u_color`.

Animasi otomatis:

- 3 burung dalam formasi "V" mengepakkan sayap (sayap berputar dari bentuk "V" ke "_" dengan pivot di ujung bawah "V");
- rumput melambai kiri-kanan dengan pivot di pangkalnya;
- sinar matahari berputar mengelilingi pusat matahari;
- saat malam, bintang berkelap-kelip (ukuran dan kecerahan berubah mengikuti `sin(waktu)`).

## Kontrol keyboard

| Tombol | Fungsi | Jenis input |
|---|---|---|
| ← / → | Menggerakkan burung ke kiri / kanan; burung yang keluar canvas muncul lagi dari sisi seberang | State-based |
| ↑ / ↓ | Memperbesar / memperkecil matahari (bulan saat malam) | State-based |
| W | Mengganti siang / malam (matahari diganti bulan dan bintang) | Event-based |
| E | Pause / melanjutkan animasi (kontrol tetap aktif) | Event-based |
| R | Reset ke kondisi awal (posisi burung, ukuran matahari, siang, animasi) | Event-based |

Gerakan kontinu (panah) memakai state-based input dan `deltaTime`, sedangkan aksi sekali tekan (W, E, R) memakai event-based input dengan pengecekan `event.repeat`.

## Transformasi yang digunakan

- **Translation**: menempatkan setiap objek dan menggeser burung.
- **Rotation**: sayap burung, rumput, sinar matahari, dan garis (arah garis).
- **Uniform scaling**: ukuran lingkaran, matahari, bulan, dan bintang.
- **Non-uniform scaling**: lebar/tinggi kotak, panjang/tebal garis.
- **Projection**: `Mat3.projection(600, 395.25)` mengubah koordinat piksel (origin kiri atas, y ke bawah) menjadi NDC.

## Transform order

Model Matrix disusun dengan urutan **Scale → Rotate → Translate**:

```text
P' = Projection × T × R × S × P
```

Rotasi terhadap pivot (sayap burung, rumput, sinar matahari) memakai `T(pivot) × R(sudut)` sehingga objek berputar di titik pivot, bukan di origin canvas.

## Struktur file

```text
├── index.html   halaman, canvas, dan tips kontrol
├── style.css    tata letak halaman
├── main.js      WebGL2 context, shader, buffer, objek, animasi, input, rendering loop
├── matrix3.js   helper matriks 3x3 (Mat3)
└── README.md
```

## Cara menjalankan

1. Buka folder project di VS Code dan jalankan `index.html` dengan ekstensi Live Server (port diatur di `.vscode/settings.json`).
2. Jangan membuka `index.html` langsung dari file manager (`file://`), karena `main.js` memakai ES module (`import`) yang harus dijalankan lewat local server.
3. Gunakan browser yang mendukung WebGL2.

## Catatan debugging

- Jika canvas kosong, periksa Console browser lebih dahulu. Error compile shader dan link program ditampilkan lengkap dengan info log.
- Error `Failed to load module script` / CORS berarti halaman dibuka lewat `file://`; jalankan lewat local server.
- Sudut rotasi selalu dikonversi ke radian dengan `degToRad` sebelum dipakai `Math.sin` / `Math.cos`.
- Matriks disimpan column-major dan `Mat3.multiply(a, b)` menghitung `a × b`, jadi urutan pemanggilan `translate → rotate → scale` menghasilkan `T × R × S`.
