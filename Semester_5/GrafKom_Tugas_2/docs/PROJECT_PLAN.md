# Rencana Proyek — Tugas 2 CCWS ITS

## Target

Buat scene 3D CCWS ITS dengan WebGL2 langsung: tampak luar gedung (sudah ada), interior sederhana, dan pameran inovasi dengan beberapa interaksi. Naskah [tugas](NASKAH_TUGAS_2.md) memberi waktu **tiga minggu** dan maksimal dua anggota.

CCWS adalah pilihan kerja tim, bukan objek yang diwajibkan dosen. Prioritas: bentuk yang dapat dikenali, penempatan yang masuk akal, render stabil, dan demonstrasi konsep kuliah, bukan detail dekoratif kecil.

## Yang dikerjakan

1. Gedung CCWS sedetail mungkin sesuai foto: fasad, jendela, portal, pintu, kanopi, papan nama, talang, pot, dan tempat sampah.
2. WebGL langsung: shader, buffer, transformasi, kamera, lighting lanjut (bayangan, lampu titik, siang–malam), dan tekstur.
3. Hierarki induk–anak dengan pivot dan animasi beberapa objek.
4. Satu halaman berisi nama kelompok, foto dan video asli, canvas dekat foto, pohon hubungan objek, serta pembagian tugas.
5. Penjelasan konsep dan latihan challenge untuk masing-masing anggota (`DEMO_AND_CHALLENGE_PLAN.md`). Satu anggota mengumpulkan.

6. Interior sederhana: lantai, plafon dan balok, dinding dengan bukaan jendela, meja, kursi, sofa, dan konter kafe.
7. Pameran: mockup kereta, motor listrik, dan lengan robot berpivot dengan simulasi ambil–lepas kotak.
8. Interaksi lewat kontrol di halaman: preset kamera interior dan pameran, sendi robot, daya motor, dan pintu atau lampu kereta.

Mode kamera jalan (WASD, sudut pandang orang) dengan tabrakan kotak sederhana ditambahkan atas permintaan tim. Di luar target: simulasi fisika. Picking mouse ditambahkan dengan uji sinar terhadap kotak batas, tanpa mengubah renderer.

## Selesai jika

- Scene berjalan di browser dengan WebGL langsung, menampilkan model CCWS, interior, pameran, animasi beberapa objek, lighting, dan tekstur.
- Transformasi induk–anak dapat ditunjukkan ("Urai hierarki") dan dijelaskan.
- Halaman memuat seluruh bahan yang diminta; foto dan video adalah rekaman asli.
- Kedua anggota memahami bagian masing-masing dan bisa mengerjakan challenge sederhana; build berhasil dan aplikasi diperiksa di browser.

## Kondisi saat ini

Sudah berjalan dan diuji di browser (Chromium headless dengan renderer perangkat lunak): tampak luar, interior (lantai, plafon dan balok, jendela, furnitur, kafe), mockup kereta, motor listrik, lengan robot dengan ambil–lepas, preset kamera interior, lampu interior, potongan atap. Picking mouse untuk membuka kontrol pameran sudah ada. Belum: ukuran nyata dan pencocokan motor serta lengan robot dengan pameran asli. Uji belum dilakukan di GPU sungguhan atau di browser selain Chromium.


Lihat `REQUIREMENTS_TRACEABILITY.md` untuk pemetaan tiap kriteria ke fitur yang sudah dibuat. Yang masih kurang: nama kelompok, ukuran nyata dari lokasi (semua ukuran masih perkiraan dari foto), dan latihan demo.
