# Rencana Demo dan Challenge

## Urutan demo (±7 menit)

1. **Foto dan video asli.** Tunjukkan foto dan video di bawah kanvas, lalu klik "Fasad, sudut kiri", "Sisi co-working", dan "Kanopi, depan" untuk membandingkan model dengan foto dari sudut yang sama. Sebutkan bahwa jam awal 16:24 adalah jam foto diambil.
2. **Hierarki.** Centang "Urai hierarki": atap, fasad depan, portal, sisi co-working, dan kanopi bergeser dari induknya. Tunjukkan pohon objek di halaman, lalu jelaskan matriks dunia = induk × lokal.
3. **Animasi dan pivot.** Matikan "Urai hierarki", dekati pintu masuk. Tunggu pengunjung datang: pintu berputar pada pivot di engsel saat ia lewat. Jelaskan hierarki orang (panggul → pinggul → lutut, badan → bahu → siku) dan bahwa berjalan hanyalah rotasi pivot plus translasi akar.
4. **Lighting.** Geser slider "Waktu" dari pagi ke malam: arah dan warna matahari berubah, bayangan bergeser, lalu malam hari lampu portal dan kanopi menyala dan jendela bercahaya. Matikan dan nyalakan "Bayangan" untuk menunjukkan shadow map.
5. **Tekstur.** Matikan "Tekstur": bahan bertekstur kembali ke warna rata-ratanya. Jelaskan tekstur gambar (paving dari foto), tekstur prosedural, bump, dan alpha test pada huruf.
6. **Interior dan pameran.** Klik "Interior: lorong", "Interior: ruang kerja", dan "Interior: kafe" lalu bandingkan dengan foto interior di halaman. Klik "Potongan (atap dibuka)" untuk melihat tata letak dari atas, lalu centang kembali atap.
7. **Lengan robot.** Klik "Pameran" lalu "Lengan robot". Geser slider satu per satu dan tunjukkan bahwa sendi di bawahnya ikut bergerak (hierarki). Klik "Pose siap", "Pose ambil", "Ambil kotak", ubah putar dasar dan bahu, "Lepas kotak", lalu "Reset pose". Jelaskan pivot dan perkalian induk × lokal.
8. **Motor dan kereta.** Klik "Motor listrik", centang "Daya menyala": kedua roda berputar pada poros, rangka diam. Pada kereta, buka pintu dan nyalakan layar dan lampu jendela. Geser "Waktu" ke malam untuk melihat lampu ruangan dan jendela.
9. **Pembagian tugas.** Tiap anggota menjelaskan bagiannya sesuai tabel di halaman.

Parameter URL mempercepat demo, misalnya `?jam=19.5&kamera=pintuUtama` atau `?urai=1&kamera=hierarki`.

## Challenge yang mungkin diminta

| Challenge | Yang diubah |
|---|---|
| Ubah warna atau intensitas lampu | `LAMP_COLOR` dan `lamps` di `src/models/building/ccwsBuilding.js` |
| Tambah lampu titik | Tambah entri di `lamps` (maksimal 8, lihat `MAX_POINT_LIGHTS` di `renderer.js`) |
| Ubah arah atau warna matahari | `arcDirection` dan `sunColor` di `src/world/dayNight.js` |
| Percepat atau perlambat animasi | Konstanta periode di `animateObjects` (`src/world/animator.js`), atau `HOURS_PER_SECOND` di `createApp.js` |
| Pintu membuka ke arah sebaliknya | Tanda rotasi `doors[name][i].rotation[1]` di `src/world/peopleMotion.js` |
| Ubah jalur atau kecepatan pengunjung | `WALKERS`, `SPEED`, dan `STRIDE` di `src/world/peopleMotion.js` |
| Tambah objek baru sebagai anak objek lain | `boxFrom(...)` lalu `addChildren(induk, objekBaru)`; ikut bergerak bersama induknya |
| Ganti tekstur | Ganti `texture`/`tileSize` pada `MATERIALS` di `ccwsBuilding.js` |
| Ubah ukuran gedung | `CCWS_DIMENSIONS` di `ccwsBuilding.js`; lingkungan mengikuti karena posisinya relatif terhadap ujung gedung |
| Matikan specular atau ambient | Ubah baris `specular` atau `ambient` di `LIT_FS` (`renderer.js`) |
| Ubah FOV atau posisi kamera | `CAMERA_PRESETS` di `src/world/cameraPresets.js` |
| Ubah batas sudut sendi robot | `ROBOT_CONFIG.limits` di `src/models/exhibits/robotArm.js` (slider mengikuti otomatis) |
| Ubah panjang lengan robot atau besar kotak | `upperArm`, `forearm`, `boxSize` di `ROBOT_CONFIG` (pose ambil perlu dihitung ulang) |
| Percepat roda motor | `spinSpeed` dan `acceleration` di `MOTORCYCLE_CONFIG` |
| Ubah ukuran atau letak kereta | `TRAIN_CONFIG` dan `EXHIBITION_LAYOUT` (`src/models/exhibits/exhibition.js`) |
| Tambah meja atau kursi | Tambah entri di `WORKSPACE_LAYOUT.tables` (`src/models/interior/furniture.js`) |
| Ubah warna atau kuat lampu interior | `lightColor`, `lightIntensity`, `lightRange` dan daftar posisi di `INTERIOR_LAYOUT` |

Latihan: masing-masing anggota mencoba setiap baris di tabel ini minimal sekali, menjalankan `npm run dev`, dan menjelaskan efeknya. Gunakan hanya fitur yang sudah diuji; jangan menyatakan fitur yang belum dibuat seolah sudah bekerja.
