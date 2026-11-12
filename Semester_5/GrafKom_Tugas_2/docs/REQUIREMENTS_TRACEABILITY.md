# Pemetaan Tugas 2

Sumber: [naskah tugas](NASKAH_TUGAS_2.md). Naskah memberi waktu tiga minggu; pilihan CCWS adalah keputusan tim.

## Ketentuan dan isi halaman

| Ketentuan | Pemenuhan | Cara memeriksa |
|---|---|---|
| Maksimal dua orang; satu orang mengumpulkan | Kemas Muhammad Athariq dan Gilbran Mahdavikia Raja | Bagian "Pembagian tugas" di halaman |
| Implementasi dengan WebGL | WebGL2 dan GLSL langsung di `src/webgl/`, tanpa library 3D | `src/webgl/renderer.js` memanggil `gl.*` sendiri |
| Animasi beberapa objek di lingkungan ITS | Pengunjung keluar-masuk dengan pintu yang membuka otomatis, petugas menyapu halaman, pohon dan palem, siang–malam, urai hierarki; di dalam: roda motor listrik, pintu kereta, lengan robot | Kanvas, centang "Animasi objek", kontrol pameran |
| a. Nama kelompok | Nama dan NRP anggota di bawah judul halaman; nama kelompok belum dicantumkan | Bagian atas halaman |
| c. Foto objek asli | Bagian "Foto asli lokasi" (10 foto tim: 6 tampak luar dan lingkungan, 4 interior dan pameran) | Halaman utama |
| d. Video objek asli | Bagian "Video asli lokasi" (2 video tim) | Halaman utama |
| e. Canvas dekat gambar | Kanvas di bagian atas; foto tepat di bawahnya; tombol "Sudut kamera" menyamakan sudut pandang dengan tiap foto | Klik "Fasad, sudut kiri", bandingkan dengan foto pertama |
| f. Desain tree hubungan antar objek | Bagian "Pohon hubungan objek", dibaca langsung dari scene graph | Halaman utama; ringkasan di `SCENE_GRAPH.md` |
| Pembagian tugas | Tabel anggota, NRP, dan tugas | Halaman utama; `TASK_DIVISION.md` |

## Kriteria penilaian

| Kriteria | Yang sudah dibuat | Yang ditunjukkan saat demo |
|---|---|---|
| a. Kompleksitas | ±1.875 simpul scene graph, ±1.540 mesh (CCWS 957, interior 590, pameran 119, lingkungan 209). Interior: lantai kayu, plafon dengan balok, bukaan dan kusen jendela, 8 meja, 22 kursi, sofa, konter kafe. Pameran: mockup kereta, motor listrik dengan dua pivot roda, lengan robot dengan 5 sendi dan simulasi ambil–lepas. Detail CCWS: kusen jendela 3D per panel, 42 daun jendela atas berengsel, talang bulat berleher angsa, pot berisi lidah mertua, pintu kaca berbingkai dengan gagang, portal dengan tangga–ramp–tangga, huruf papan nama berketebalan, kanopi segilima dengan rangka "^", tempat sampah beroda dengan tutup berengsel. Tiga program shader (bayangan, langit, scene). | "Urai hierarki", "Dari atas", pohon objek, "Buka atap", kontrol lengan robot |
| b. Kemiripan dengan real | Tata letak fasad, kanopi, sisi co-working, ruang kerja, kafe, dan mockup kereta diturunkan dari foto dan video (lihat `SITE_EVIDENCE_AND_ASSUMPTIONS.md`); motor listrik dan lengan robot belum ada fotonya, jadi bentuknya generik; jam awal 16:24 sama dengan waktu pengambilan foto; preset kamera dengan FOV lebar meniru lensa ultra-wide ponsel | Tombol "Sudut kamera" dan "Interior dan pameran" lalu bandingkan dengan foto di bawah kanvas |
| c. Pembagian | Tabel pembagian tugas dengan nama dan NRP | Tiap anggota menjelaskan bagiannya |
| d. Lighting, texture | Ambient hemisfer, cahaya matahari/bulan (Lambert + Blinn-Phong), bayangan shadow map dengan PCF 3×3, 3 lampu luar dan 5 lampu titik langit-langit interior yang semuanya menyala otomatis menurut jam (meredup saat fajar, menyala saat senja; maksimal 8 lampu titik), jendela dan lampu bercahaya (emisi), cahaya siang pada jendela dari dalam, pantulan langit pada kaca (Fresnel), kabut, langit gradasi dengan matahari dan bintang. Tekstur: paving dari foto, plus tekstur kanvas untuk plester, noda alas, beton, genteng, teralis jendela, rumput sintetis, kerikil, plafon, lantai kayu, dan huruf (papan nama, kutipan mural, layar kereta); bump mapping dari kecerahan tekstur | Slider "Waktu", centang "Bayangan", "Tekstur", "Lampu ruang kerja", "Lampu pameran" |
| e. Kemampuan menjelaskan | Komentar singkat di setiap modul; peta konsep → kode di `COURSE_CONCEPT_MAPPING.md` | Ikuti urutan di `DEMO_AND_CHALLENGE_PLAN.md` |
| f. Kemampuan menyelesaikan challenge | Parameter terpusat (ukuran gedung, waktu, kecepatan animasi, warna lampu) dan daftar challenge yang mungkin beserta lokasi kodenya | Latihan di `DEMO_AND_CHALLENGE_PLAN.md` |

Naskah tidak menjelaskan lebih lanjut arti kriteria "Pembagian"; tim menafsirkannya sebagai pembagian pekerjaan. Daftar isi halaman pada naskah melewati butir b, sehingga tidak ada butir tambahan yang diasumsikan.
