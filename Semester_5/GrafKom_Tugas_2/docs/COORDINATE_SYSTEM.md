# Koordinat dan Transformasi

- **Sumbu dan satuan.** X = panjang gedung (sisi co-working di −X), Y = tinggi (tanah di Y = 0), Z = kedalaman (fasad utama menghadap +Z). Satuan meter. Ukuran yang belum diukur adalah perkiraan dari foto.
- **Matriks.** Disimpan column-major (elemen `[kolom * 4 + baris]`) dan dikalikan dengan vektor kolom: v' = M · v. Matriks lokal = T · Rz · Ry · Rx · S, jadi skala diterapkan dulu, lalu rotasi X, Y, Z, lalu translasi (`compose` di `src/webgl/mat4.js`).
- **Hierarki.** Matriks dunia anak = matriks dunia induk × matriks lokal anak (`traverse` di `src/webgl/sceneNode.js`). Vertex shader menghitung `uProjection * uView * uModel * posisi`.
- **Normal.** Ditransformasi dengan invers-transpose 3×3 dari matriks dunia (`normalMatrix`).
- **Pivot.** Pintu berporos di engsel, daun jendela atas di engsel atasnya, tutup tempat sampah di engsel belakang, dan tajuk pohon di puncak batang. Rotasi positif mengikuti aturan tangan kanan: sumbu X memiringkan +Y ke +Z, sumbu Y memutar +Z ke +X.
- **Bayangan.** Matriks ruang cahaya = ortografis × `lookAt` dari arah matahari ke pusat adegan (`lightSpaceMatrix` di `src/webgl/renderer.js`).
