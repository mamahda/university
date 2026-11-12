# Daftar Aset

| Aset | Kegunaan | Status |
|---|---|---|
| `photos/eksterior-*` (7 file) | Referensi fasad, sisi gable co-working, dan kanopi | Tersedia; acuan utama pemodelan |
| `photos/lingkungan-pohon-parkir-motor.jpg` | Referensi pohon dan lingkungan | Tersedia; acuan objek lingkungan |
| `photos/interior-*` (4 file) | Referensi interior, kafe, dan mockup kereta | Tersedia; acuan interior dan kereta, juga ditampilkan di halaman utama |
| `videos/20261102_162807.mp4`, `videos/20261102_162834.mp4` | Video asli tampak luar (±5 detik per video) | Ditampilkan di halaman utama (bagian Video) |
| `photos/web/*.jpg` | Salinan foto JPG lebar 1200 px untuk halaman utama (10 foto, termasuk 4 interior) | Dibuat dari foto asli tim; file asli tetap di `photos/` |
| Tekstur prosedural: teralis jendela, genteng, plester, noda alas, beton, rumput sintetis, kerikil, plafon kanopi, lantai kayu interior | Digambar dengan canvas di `src/models/shared/proceduralTextures.js` saat halaman dimuat | Pola dan warna mengikuti foto; dibuat ulang karena potongan foto melengkung akibat lensa ultra-wide atau tidak bisa diulang tanpa sambungan |
| `textures/paving-herringbone.jpg` | Tekstur tanah/paving | Potongan dari `photos/eksterior-coworking-gable-kanopi.jpg` (foto tim); masih sedikit terdistorsi perspektif |

Tidak ada model 3D eksternal; teks kutipan mural, layar kereta, pelat "DEMU 1 0 25 01", dan kategori menu kafe dibaca dari foto tim. Motor listrik dan lengan robot dibuat dari kode tanpa foto acuan.

Catat sumber dan izin untuk aset lain yang digunakan. Pilih foto dan video yang benar-benar menggambarkan objek dalam scene.
