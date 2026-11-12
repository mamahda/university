# Kamera, Kontrol, dan Animasi

## Kamera

- Kamera perspektif orbit: seret untuk memutar, Ctrl/⌘ + gulir (atau cubit di trackpad) untuk zoom, "Atur ulang kamera" kembali ke sudut awal. Gulir biasa di atas kanvas tetap menggulir halaman; di layar sentuh, usap vertikal menggulir halaman dan usap horizontal memutar model.
- Mode "Jalan (WASD)" (`src/camera/walkCamera.js`): kamera setinggi mata orang (1,6 m). W A S D atau panah untuk berjalan, Shift untuk berlari; klik kanvas untuk mengunci pointer lalu gerakkan mouse untuk melihat (Esc melepas), atau seret tanpa mengunci. Gedung CCWS bisa dimasuki lewat pintu utama dan pintu samping (pintu membuka sendiri saat kamera mendekat); dinding luar, dinding portal, tiang kanopi, mockup kereta, panggung robot dan motor, konter kafe, dan gedung sekitar tidak bisa ditembus; lantai aula, teras portal, tangga, ramp, dan teras pintu samping menaikkan tinggi mata (`src/world/walkArea.js`). Meja, kursi, pohon, pagar parkir, dan orang masih bisa ditembus.
- Tombol "Sudut kamera" berpindah halus ke sudut yang mendekati foto referensi (`src/world/cameraPresets.js`), termasuk FOV lebar yang meniru lensa ultra-wide ponsel.

## Kontrol di bawah kanvas

| Kontrol | Fungsi |
|---|---|
| Waktu (slider) | Jam 0–24; awalnya 16:24, sesuai waktu pengambilan foto |
| Siklus siang–malam | Jam berjalan otomatis (satu hari ±96 detik) |
| Animasi objek | Menjeda atau melanjutkan animasi objek |
| Bayangan | Menyalakan atau mematikan shadow map |
| Tekstur | Menyalakan atau mematikan tekstur (bahan memakai warna rata-ratanya) |
| Urai hierarki | Memisahkan atap, fasad, portal, sisi co-working, dan kanopi dari induknya |
| Buka atap (potongan) | Menyembunyikan atap dan plafon untuk melihat isi ruangan dari atas |
| Layar penuh | Kanvas memenuhi layar (Fullscreen API; jika ditolak browser, kanvas menutupi halaman). Panel kontrol tersembunyi dan bisa dimunculkan dengan "Tampilkan kontrol"; Esc atau "Keluar layar penuh" untuk kembali |

Tombol kamera interior: Interior lorong, ruang kerja, kafe, Pameran, Lengan robot, Motor listrik, dan Potongan (atap dibuka). Titik pandangnya adalah perkiraan.

## Pameran

| Objek | Kontrol | Perilaku |
|---|---|---|
| Lengan robot | Lima slider: putar dasar −170…170°, bahu −30…110°, siku −10…145°, pergelangan −100…100°, gripper 0–100% | Sudut dibatasi; lengan bergerak halus menuju target. Bahu, siku, dan pergelangan diukur sebagai kemiringan ke depan (0° = tegak) |
| | Pose siap, Pose ambil, Reset pose | Pose ambil menaruh gripper di atas kotak. Reset pose hanya mengembalikan sendi, tidak memindahkan kotak |
| | Ambil kotak / Lepas kotak | Ambil hanya berhasil bila titik genggam ≤ 0,16 m dari pusat kotak (kotak menyala bila terjangkau); kotak menjadi anak `GripperRoot`. Lepas mengembalikan kotak ke `RobotArmRoot` dengan posisi dan orientasi dunia yang sama; tidak ada fisika, jadi kotak tetap melayang bila dilepas di udara |
| | Kembalikan kotak | Menaruh kotak kembali di platform |
| Motor listrik | Daya menyala | Kedua roda berputar pada poros masing-masing dengan percepatan tetap; rangka diam; lampu depan, belakang, dan dasbor menyala. "Animasi objek" yang dimatikan membekukan roda |
| Mockup kereta | Pintu terbuka | Panel pintu bergeser sepanjang sisi kereta dan memperlihatkan ceruk gelap |
| | Layar tujuan dan lampu jendela | Layar "HST 01 JAKARTA" dan kaca jendela menyala |

Kontrol waktu dan kamera ada di panel samping. Kontrol pameran muncul sebagai popup saat objeknya diklik di kanvas (klik, bukan seret), atau saat memilih sudut kamera "Lengan robot", "Motor listrik", atau "Pameran". Picking memakai sinar dari kamera terhadap kotak batas tiap mesh (`src/webgl/picking.js`) dan hanya aktif dari dalam gedung atau saat atap dibuka.

Parameter URL membuka halaman dalam keadaan tertentu: `jam`, `kamera` (nama preset), `siklus`, `animasi`, `bayangan`, `tekstur`, `urai` (nilai `1` atau `0`), serta `atap=0` (potongan), `motor=1`, `pintuKereta=1`, `layarKereta=1`, `mode=jalan`, dan `penuh=1` (layar penuh). Contoh: `?jam=20&kamera=sisiCoworking`.

## Animasi (`src/world/animator.js`, `src/world/peopleMotion.js`)

- Tiga pengunjung berjalan keluar-masuk: dua lewat ramp ke pintu utama, satu ke pintu co-working. Kaki dan lengan berayun lewat pivot pinggul, lutut, bahu, dan siku. Di dalam gedung mereka disembunyikan karena tidak ada interior.
- Pintu ganda membuka ke luar hanya saat ada pengunjung mendekat, masuk, atau keluar, lalu menutup lagi.
- Petugas kebersihan membungkuk mengayun sapu lidi sambil bergeser pelan menyusuri halaman depan.
- Tajuk pohon dan pelepah palem bergoyang tertiup angin.
- Jendela atas dan tutup tempat sampah statis (tertutup), walau pivot engselnya tetap ada di hierarki.

Semua gerakan adalah interpretasi untuk demonstrasi, bukan rekaman perilaku nyata di lokasi. Simulasi fisika tidak termasuk target; mode jalan (WASD) hanya memakai tabrakan kotak sederhana.
