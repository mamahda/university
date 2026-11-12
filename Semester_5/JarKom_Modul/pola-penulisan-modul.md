# Pola Penulisan Modul

Panduan ini merangkum pola penulisan README modul praktikum. Gunakan panduan ini saat menulis modul baru, menambah bab, atau memperbarui bab yang sudah ada.

## Daftar Isi

- [1. Struktur](#1-struktur)
- [2. Implementasi](#2-implementasi)
- [3. Bahasa](#3-bahasa)
- [4. Format](#4-format)
- [5. Gambar](#5-gambar)
- [6. Teknis Repo](#6-teknis-repo)

## 1. Struktur

- Seluruh materi sebuah modul ditulis dalam satu README, dengan Daftar Isi di bagian awal.
- Daftar Isi memuat semua judul bernomor dan selalu diperbarui setiap kali judul ditambah, diubah, atau dihapus.
- Bab, subbab, dan sub-subbab diberi nomor bertingkat. Judul di bawah level tersebut tidak diberi nomor.
- Setiap bab disusun dengan urutan konsep, contoh, alat bantu, lalu implementasi.
- Istilah tidak dipakai sebelum dijelaskan.
- Rujukan hanya mengarah ke materi sebelumnya, tidak ke materi yang belum dibahas.
- Materi yang sudah dibahas sebelumnya tidak dijelaskan ulang, cukup dirujuk.
- Tidak ada bagian referensi.

## 2. Implementasi

- Implementasi menjadi subbab terakhir sebuah bab.
- Implementasi diawali dengan gambar topologi dan tabel konfigurasi setiap node.
- Konfigurasi dibagi per node, satu subbab untuk setiap node, dengan nama node sebagai judul.
- Implementasi diakhiri dengan pengujian. Setiap langkah pengujian menyebutkan node tempat perintah dijalankan.
- Langkah dasar penggunaan tools yang sudah dibahas sebelumnya tidak dijelaskan ulang.
- Nama node konsisten di seluruh bab.

Kerangka subbab node:

````markdown
#### <nomor> <Nama Node>

1. <Langkah konfigurasi>:

   ```
   <perintah>
   ```

2. <Langkah pengecekan>:

   ```
   <perintah>
   ```

   ![<Deskripsi output>](images/<nama-file>.png)

   <Penjelasan singkat tentang bagian output yang perlu diperhatikan.>
````

## 3. Bahasa

- Kalimat ditulis langsung ke inti, tanpa basa-basi.
- Paragraf dibuat pendek, maksimal sekitar 3 kalimat.
- Isi yang berbentuk daftar ditulis sebagai poin, bukan paragraf.
- Langkah yang berurutan ditulis sebagai daftar bernomor.
- Setiap istilah dijelaskan di tempat pertama kali muncul, bukan dikumpulkan dalam glosarium.
- Semua istilah konsisten di setiap penyebutan, baik di teks, tabel, gambar, maupun penjelasan detailnya. Jika sebuah istilah memiliki nama lain, nama lain tersebut ditulis dalam kurung saat istilah pertama kali didefinisikan.
- Sapaan untuk pembaca konsisten di seluruh modul.
- Hindari pola berikut:
  - Penguat kosong yang tidak menambah makna.
  - Kalimat yang hanya mengulang kalimat sebelumnya.
  - Pertanyaan retoris yang berderet.
  - Kalimat yang mengumumkan isi, bukan langsung menyampaikannya.
  - Kalimat umum yang tidak memiliki isi konkret.

## 4. Format

### 4.1 Penanda Teks

- **Bold** hanya dipakai untuk:
  - Istilah saat pertama kali didefinisikan.
  - Label yang tampil di layar dan nama kolom tabel yang dirujuk.
  - Jawaban akhir dari contoh perhitungan.
  - Node tempat perintah dijalankan pada langkah pengujian.
- _Italic_ hanya dipakai untuk kepanjangan akronim dan padanan bahasa asing di dalam kurung. Istilah teknis yang sudah umum tidak dimiringkan.
- `Inline code` dipakai untuk alamat, nilai konfigurasi, perintah, nama interface, nilai output, dan path file.
- Satu jenis nilai selalu memakai format yang sama, baik di teks maupun di tabel.
- Daftar definisi ditulis dengan format `**Istilah**: penjelasan`.

### 4.2 Elemen Lain

- Angka ribuan memakai pemisah titik.
- Catatan (`>`) hanya dipakai untuk informasi yang penting.
- Code block dipakai untuk perintah, isi file konfigurasi, dan perhitungan. Setiap langkah memiliki code block sendiri.
- Perhitungan yang berbentuk kolom, seperti bilangan biner, ditulis rata di dalam code block.
- Diagram sederhana, seperti pohon perhitungan dan alur, dibuat dengan Mermaid.
- Data yang memiliki beberapa atribut ditampilkan dalam tabel.
- Setiap gambar memiliki alt text yang mendeskripsikan isinya.

## 5. Gambar

### 5.1 Topologi

- Topologi diambil dari screenshot simulator jaringan yang digunakan.
- Ikon node memakai ikon bawaan.
- Kelompok node diberi kotak beserta keterangannya.
- Label diletakkan dekat objek yang dijelaskan dan tidak tertimpa garis atau node lain.
- Jarak antar-node dibuat rapat agar node tidak terlihat kecil.
- Gambar dipotong dengan padding minimal dan latar putih.

### 5.2 Output Perintah

- Output perintah diambil dari screenshot terminal.
- Lebar screenshot seragam untuk seluruh modul, tanpa tampilan lain selain terminal.
- Potongan dimulai dari baris perintah dan berakhir di baris output terakhir.
- Setiap langkah yang menghasilkan output diberi screenshot tepat di bawah perintahnya.

### 5.3 Ketentuan Umum

- Semua perintah diuji terlebih dahulu sebelum ditulis.
- Nama file gambar mendeskripsikan isinya.

## 6. Teknis Repo

- Line ending file yang diedit tetap dipertahankan sesuai file aslinya.
- Hanya gambar yang dirujuk README yang di-commit.
