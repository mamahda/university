# Model 3D Co-working Space ITS

Tugas 2 Grafika Komputer: Animasi, Object 3D, Lighting, Texture

| Anggota | NRP |
|---|---|
| Kemas Muhammad Athariq | 5025241102 |
| Gilbran Mahdavikia Raja | 5025241134 |

## Tentang proyek

Proyek ini membangun ulang **Co-working Space (CCWS) ITS** sebagai scene 3D yang bisa dijelajahi di browser. Objek ini kami pilih karena bentuknya khas dan mudah dikenali: gedung dua lantai beratap genteng oranye dengan pintu masuk OPOP Training Center di fasad depan, sisi co-working dengan tulisan CO-WORKING SPACE, dan kanopi beton berbentuk rumah. Di dalamnya ada ruang kerja bersama, kafe, dan pameran inovasi.

Seluruh scene dibuat dengan **WebGL2 dan shader GLSL ES 3.00**. Tidak ada library 3D: context, shader, buffer, matriks, kamera, pencahayaan, bayangan, dan tekstur semuanya ditulis sendiri. Vite hanya dipakai sebagai server pengembangan.

Bentuk dan tata letak diturunkan dari foto dan video yang kami ambil sendiri di lokasi. Foto dan video itu ditampilkan di halaman yang sama dengan kanvas, sehingga model bisa langsung dibandingkan dengan aslinya.

## Isi scene

- **Gedung CCWS**: fasad dengan jendela teralis dan kusen 3D, kaca lantai atas dengan daun jendela berengsel, talang, pot tanaman, portal pintu masuk dengan pintu kaca ganda dan tangga–ramp–tangga, dinding samping bertulisan CO-WORKING SPACE, serta kanopi beton segilima dengan tempat sampah.
- **Lingkungan**: paving herringbone, tanah dan pohon besar di sisi kanopi, palem, gedung tetangga, dan parkiran motor berpagar.
- **Interior**: ruang kerja dengan meja, kursi, sofa, dan mural; konter kafe; lantai kayu dan plafon berbalok dengan lampu.
- **Pameran inovasi**: mockup kereta (pintu geser, layar tujuan, lampu jendela), motor listrik (roda berputar pada porosnya), dan lengan robot lima sendi yang dapat mengambil dan melepas kotak.
- **Orang**: pengunjung yang berjalan keluar-masuk gedung dan petugas yang menyapu halaman.

## Animasi

Semua animasi berbasis waktu, jadi kecepatannya sama di komputer mana pun.

- Pengunjung berjalan menuju pintu, pintu membuka sendiri saat mereka lewat, lalu menutup kembali. Kaki dan lengan berayun lewat sendi pinggul, lutut, bahu, dan siku.
- Petugas kebersihan membungkuk sambil mengayun sapu lidi.
- Pohon dan pelepah palem bergoyang tertiup angin.
- Siklus siang–malam: matahari dan bulan bergerak, langit berubah warna, dan lampu luar serta dalam menyala sendiri saat senja.
- Pameran: roda motor, pintu kereta, dan sendi lengan robot digerakkan lewat kontrol.
- "Urai hierarki": atap, fasad, portal, dan kanopi bergeser keluar dari induknya untuk memperlihatkan struktur hierarki.

## Teknik grafika

- **Transformasi dan hierarchical modelling.** Setiap objek adalah simpul scene graph dengan matriks lokal T · Rz · Ry · Rx · S. Matriks dunia sebuah simpul = matriks dunia induknya × matriks lokalnya, sehingga menggerakkan induk ikut menggerakkan semua anaknya. Bagian yang bergerak (daun pintu, roda, sendi robot, anggota tubuh) berputar pada simpul *pivot* yang diletakkan di engsel atau porosnya.
- **Kamera.** Proyeksi perspektif dan matriks view `lookAt`. Ada kamera orbit dengan sudut-sudut yang disamakan dengan foto asli, dan kamera orang (WASD) setinggi mata yang bisa berjalan masuk ke gedung dengan tabrakan sederhana.
- **Lighting.** Ambient hemisfer langit–tanah, cahaya matahari/bulan dengan Lambert dan Blinn-Phong, bayangan *shadow mapping* (peta kedalaman 2048² dengan PCF 3×3), hingga 8 lampu titik, pantulan langit pada kaca (Fresnel), cahaya jendela dan lampu di malam hari, serta kabut.
- **Texture.** Tekstur gambar paving dari foto lokasi, tekstur prosedural yang digambar di canvas (plester, genteng, teralis jendela, beton, lantai kayu, rumput sintetis, kerikil, plafon), *bump mapping* dari kecerahan tekstur, dan huruf papan nama dengan *alpha test*.
- **Shader.** Tiga program GLSL: pass bayangan dari arah matahari, langit layar penuh, dan scene utama.
- **Picking.** Klik pada objek pameran dideteksi dengan sinar dari kamera terhadap kotak pembatas tiap mesh.

## Halaman web

Halaman utama (`index.html`) berisi, berurutan:

1. Judul dan anggota kelompok.
2. Kanvas WebGL dengan panel kontrol di sebelahnya.
3. Foto asli lokasi (8 foto; klik untuk ukuran penuh).
4. Video asli lokasi (2 video).
5. Teknik grafika yang dipakai.
6. Pohon hubungan objek, dibaca langsung dari scene graph yang sedang dirender.
7. Pembagian tugas.

## Menjalankan

Butuh Node.js 20.19 atau lebih baru.

```bash
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://127.0.0.1:5173`). Halaman memakai modul JavaScript, jadi harus dibuka lewat server tersebut, bukan dengan klik ganda `index.html`.

## Kontrol

| Kontrol | Fungsi |
|---|---|
| Seret / gulir | Memutar dan memperbesar kamera orbit |
| Sudut kamera | Pindah ke sudut foto asli, ke dalam gedung, atau ke tampilan potongan (atap dibuka) |
| Jalan (WASD) | Klik kanvas lalu gerakkan mouse untuk melihat; W A S D atau panah untuk berjalan, Shift untuk berlari |
| Waktu dan cahaya | Slider jam, siklus siang–malam, serta tombol bayangan dan tekstur untuk perbandingan |
| Urai hierarki | Memisahkan bagian gedung dari induknya |
| Klik objek pameran | Membuka kontrol lengan robot, motor listrik, atau kereta |
| Layar penuh | Kanvas memenuhi layar; panel kontrol disembunyikan dan bisa dibuka dengan "Tampilkan kontrol". Esc untuk kembali |

## Struktur kode

```text
src/
├── main.js, core/createApp.js   titik masuk, loop render, opsi halaman
├── webgl/                       renderer dan shader, matriks, geometri, scene graph, picking
├── camera/                      kamera orbit dan kamera jalan
├── models/
│   ├── building/                gedung CCWS
│   ├── exterior/                lingkungan dan orang
│   ├── interior/                ruang dalam, furnitur, kafe
│   ├── exhibits/                kereta, motor listrik, lengan robot
│   └── shared/                  pembantu bentuk dan tekstur prosedural
├── world/                       siang–malam, animasi, gerak orang, area jalan, sudut kamera
└── ui/                          kontrol halaman dan pohon objek
public/assets/                   foto dan video asli, tekstur, font
```

## Pembagian tugas

| Anggota | Tugas |
|---|---|
| Kemas Muhammad Athariq | Dasar WebGL (context, shader, buffer, kamera, pencahayaan) dan integrasi; lengan robot (hierarki pivot, batas sudut sendi, ambil–lepas kotak) |
| Gilbran Mahdavikia Raja | Foto dan video referensi, fasad dan lingkungan, tekstur, isi halaman utama; interior (ruangan, furnitur, konter kafe), mockup kereta, dan motor listrik |
| Bersama | Hierarki dan animasi, penggabungan kode, pengujian, dan pengumpulan |

## Catatan

- Ukuran gedung dan tata letak interior adalah perkiraan dari foto dan video, belum diukur langsung di lokasi.
- Agar ukuran berkas pengumpulan kecil, foto asli disimpan dengan lebar 2000 px dan video dalam 720p.
