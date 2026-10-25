# Pembahasan Soal ETS Grafika Komputer

Sumber: `Untitled document.pdf` (50 soal). Sebagian besar soal bertipe *pilih semua jawaban yang benar*, jadi satu soal bisa punya lebih dari satu jawaban.

---

## Soal 1

Karakteristik Normalized Device Coordinates (NDC) adalah ...

- a. Koordinat menggunakan satuan piksel
- b. Rentang koordinat y antara -1 dan 1
- c. Rentang koordinat selalu mengikuti ukuran canvas
- d. Rentang koordinat x antara -1 dan 1

**Jawaban: b, d**

**Penjelasan:** NDC adalah ruang koordinat ternormalisasi dengan rentang x, y, dan z dari -1 sampai 1, tidak bergantung pada ukuran canvas. Konversi ke piksel baru terjadi pada tahap viewport transform, sehingga a dan c salah.

---

## Soal 2

Berikut merupakan ruang koordinat yang dilalui vertex dalam pipeline WebGL ...

- a. View Space
- b. World Space
- c. Clip Space
- d. NDC (Normalized Device Coordinates)
- e. Object Space

**Jawaban: a, b, c, d, e**

**Penjelasan:** Urutan ruang koordinat vertex: Object (Local) Space → *Model Matrix* → World Space → *View Matrix* → View Space → *Projection Matrix* → Clip Space → *perspective divide* → NDC → *viewport transform* → Screen Space. Kelima ruang di pilihan semuanya dilalui.

---

## Soal 3

Pada praktikum Graphics Playground, perintah `ctx.fillRect(50, 50, 200, 100);` dijalankan pada canvas 2D dengan sistem koordinat bawaan. Manakah deskripsi hasil yang tepat?

- a. Sudut kiri bawah berada di (50, 50) karena sumbu y canvas mengarah ke atas.
- b. Persegi panjang berpusat di titik (50, 50) dengan lebar 200 dan tinggi 100 pixel.
- c. Persegi panjang dibentuk dari titik (50, 50) hingga titik (200, 100) pada canvas.
- d. Sudut kiri atas berada di (50, 50) dengan lebar 200 dan tinggi 100 pixel.

**Jawaban: d**

**Penjelasan:** Signature-nya `fillRect(x, y, width, height)`. Pada canvas 2D, origin ada di kiri atas dan sumbu y mengarah ke **bawah**, jadi (50, 50) adalah sudut kiri atas. Persegi panjang terbentang sampai (250, 150), bukan (200, 100). Titik (50, 50) juga bukan pusatnya.

---

## Soal 4

Dalam urutan transformasi MVP, sebuah model lokal akan ditampilkan pada layar. Dengan asumsi matriks tersusun dengan benar, pernyataan mana yang benar?

- a. Projection Matrix bertugas membentuk proyeksi perspektif atau ortografik
- b. Projection Matrix diterapkan sebelum Model Matrix
- c. Model Matrix memindahkan objek dari Local Space ke World Space
- d. View Matrix menghasilkan koordinat layar secara langsung

**Jawaban: a, c**

**Penjelasan:** `gl_Position = P · V · M · v`. Karena perkalian diterapkan dari kanan, Model Matrix diterapkan **pertama** dan Projection **terakhir**, jadi b salah. View Matrix hanya membawa ke View Space; koordinat layar baru didapat setelah projection, perspective divide, dan viewport transform, jadi d salah.

---

## Soal 5

Sebuah game 3D dijalankan pada layar 1920 × 1080. Berdasarkan pembagian peran CPU dan GPU, tugas manakah yang paling sesuai dikerjakan oleh GPU?

- a. Menghitung warna jutaan fragment pada setiap frame secara paralel.
- b. Menyiapkan scene lalu menyusun perintah render yang akan dikirim.
- c. Membaca input keyboard pemain lalu memperbarui status permainan.
- d. Menjalankan logika percabangan AI musuh berdasarkan kondisi permainan.

**Jawaban: a**

**Penjelasan:** GPU unggul untuk pekerjaan masif yang seragam dan paralel, seperti shading ±2 juta piksel per frame. Menyiapkan scene/draw call, input, dan logika AI yang penuh percabangan dikerjakan CPU.

---

## Soal 6

Dua posisi kamera berada pada sinar yang sama dari sebuah titik permukaan tetap; kamera kedua berada lebih jauh. N, cahaya, dan parameter material tetap. Model Phong sederhana menggunakan arah pandang ternormalisasi dan tidak menerapkan pelemahan berdasarkan jarak. Manakah kesimpulan yang benar?

- a. Eksponen shininess harus dinaikkan untuk mempertahankan highlight.
- b. Faktor diffuse tetap.
- c. Faktor specular menurun karena kamera berada lebih jauh.
- d. Arah pandang ternormalisasi tetap.

**Jawaban: b, d**

**Penjelasan:** Diffuse = `max(N·L, 0)` tidak bergantung pada kamera, jadi tetap. Karena kedua kamera ada di sinar yang sama, vektor `V = normalize(cam - P)` identik. Specular bergantung pada `R·V`, dan R serta V tidak berubah, jadi specular juga tetap. Tanpa atenuasi, jarak tidak berpengaruh, sehingga a dan c salah.

---

## Soal 7

Pernyataan yang benar mengenai kamera virtual adalah ...

- a. Kamera direpresentasikan oleh View Matrix
- b. Kamera tidak berpengaruh pada rendering
- c. Pergerakan kamera dapat disimulasikan dengan transformasi kebalikan
- d. Kamera harus berupa objek fisik

**Jawaban: a, c**

**Penjelasan:** Kamera virtual tidak berbentuk objek fisik. Ia diwujudkan sebagai View Matrix, yaitu invers dari transformasi kamera. Menggeser kamera ke kanan setara dengan menggeser seluruh dunia ke kiri (transformasi kebalikan).

---

## Soal 8

Sebuah baris horizontal texture berisi dua texel dengan nilai skalar 0 dan 1. Pusatnya berada pada U=0.25 dan U=0.75. Gunakan filtering LINEAR, CLAMP_TO_EDGE, dan tanpa mipmap; V tetap pada pusat baris. Manakah pernyataan yang benar?

- a. Sampling pada U=0.5 menghasilkan 0.5.
- b. Sampling pada U=0.375 menghasilkan 0.25.
- c. Sampling pada U=0.375 menghasilkan 0 karena LINEAR memilih texel terdekat.
- d. Sampling pada U=0 menghasilkan 0 karena koordinat dibatasi pada tepi texture.

**Jawaban: a, b, d**

**Penjelasan:** Interpolasi linear antara pusat texel: `t = (U − 0.25) / 0.5`.
- U = 0.5 → t = 0.5 → 0.5 ✔
- U = 0.375 → t = 0.25 → 0.25 ✔. Yang memilih texel terdekat adalah NEAREST, bukan LINEAR, jadi c salah.
- U = 0 → CLAMP_TO_EDGE membatasi koordinat ke rentang [0.25, 0.75] (pusat texel tepi), sehingga hasilnya nilai texel pertama = 0 ✔

---

## Soal 9

Asumsikan dua objek berada pada arah pandang yang sama dan saling menutupi. Depth Test dan Depth Buffer digunakan secara normal. Pernyataan mana yang benar?

- a. Objek yang digambar terakhir selalu tampil paling depan
- b. Nilai kedalaman digunakan untuk menentukan fragment yang terlihat
- c. Projection Matrix menentukan objek mana yang berada di depan
- d. Depth Buffer membantu menyimpan informasi kedalaman fragment

**Jawaban: b, d**

**Penjelasan:** Dengan depth test aktif, urutan gambar tidak menentukan visibilitas (a salah). Fragment baru dibandingkan dengan nilai di depth buffer, dan yang lebih dekat yang disimpan. Projection Matrix memang menghasilkan nilai z, tetapi yang **memutuskan** objek mana di depan adalah depth test (c salah).

---

## Soal 10

Pernyataan yang benar mengenai translasi adalah ...

- a. Mengubah jumlah vertex
- b. Mengubah warna objek
- c. Mengubah posisi objek
- d. Tidak mengubah ukuran objek

**Jawaban: c, d**

**Penjelasan:** Translasi menggeser semua vertex dengan vektor yang sama. Posisi berubah, sedangkan bentuk, ukuran, warna, dan jumlah vertex tetap.

---

## Soal 11

Manakah pernyataan yang tepat tentang fungsi tahapan dalam graphics pipeline?

- a. Vertex processing melakukan transformasi posisi dan normal pada setiap vertex.
- b. Framebuffer menyimpan hasil rendering sebelum ditampilkan ke layar.
- c. Primitive assembly mengubah triangle menjadi kandidat pixel atau fragment.
- d. Rasterization menggabungkan vertex menjadi primitive seperti point, line, dan triangle.

**Jawaban: a, b**

**Penjelasan:** Pilihan c dan d tertukar. Primitive assembly-lah yang **menggabungkan vertex menjadi primitive**, sedangkan rasterization yang **mengubah primitive menjadi fragment**.

---

## Soal 12

Manakah pernyataan yang tepat tentang peran komponen dasar sebuah scene?

- a. Camera menentukan intensitas, warna, dan arah cahaya yang mengenai objek.
- b. Texture menentukan bagian scene yang terlihat melalui parameter FOV dan projection.
- c. Light berupa gambar yang dipetakan ke permukaan untuk menambah detail visual.
- d. Material menentukan bagaimana permukaan objek berinteraksi dengan cahaya.

**Jawaban: d**

**Penjelasan:** Deskripsi a, b, dan c tertukar: a adalah peran **Light**, b peran **Camera**, dan c peran **Texture**. Hanya d yang benar.

---

## Soal 13

Manakah pernyataan yang tepat tentang representasi objek 3D menggunakan vertex, edge, face, triangle, dan mesh?

- a. Edge adalah permukaan bidang yang terbentuk ketika tiga vertex saling terhubung.
- b. Vertex dapat menyimpan atribut tambahan seperti color, normal, dan texture coordinate.
- c. Semakin tinggi triangle count, biasanya semakin ringan biaya pemrosesan geometri.
- d. Triangle selalu planar sehingga menjadi primitive dasar yang efisien untuk GPU.

**Jawaban: b, d**

**Penjelasan:** Edge adalah garis penghubung dua vertex. Permukaan yang dibentuk tiga vertex adalah face/triangle (a salah). Makin banyak triangle, biaya pemrosesan makin **berat** (c salah). Tiga titik selalu terletak pada satu bidang, sehingga triangle mudah dan efisien diproses GPU.

---

## Soal 14

Manakah pasangan bidang aplikasi grafika komputer dan contoh penggunaannya yang tepat?

- a. Augmented reality: menciptakan lingkungan digital imersif yang menggantikan dunia nyata.
- b. Scientific visualization: merancang produk mesin dan konstruksi beserta gambar teknisnya.
- c. GIS/pemetaan: memvisualisasikan data geospasial untuk pemetaan dan analisis wilayah.
- d. Digital twin: mengubah hasil CT scan menjadi model anatomi 3D untuk simulasi bedah.

**Jawaban: c**

**Penjelasan:**
- a adalah definisi **Virtual Reality**. AR justru menambahkan objek digital ke dunia nyata.
- b adalah **CAD**.
- d adalah **medical imaging/visualization**. Digital twin adalah replika virtual dari sistem fisik yang disinkronkan dengan data nyata.

---

## Soal 15

Sampling texture asimetris dilakukan pada lokasi yang jauh dari batas filtering. Bandingkan REPEAT dan MIRRORED_REPEAT sepanjang U, dengan V tetap. Manakah pernyataan yang benar?

- a. Pada REPEAT, U=0.2 dan U=1.2 dipetakan ke posisi pola yang sama.
- b. Pada MIRRORED_REPEAT, U=0.2 dan U=1.2 dipetakan ke posisi pola yang sama.
- c. Pada REPEAT, U=0.2 dan U=1.8 dipetakan ke posisi pola yang sama.
- d. Pada MIRRORED_REPEAT, U=0.2 dan U=1.8 dipetakan ke posisi pola yang sama.

**Jawaban: a, d**

**Penjelasan:**
- REPEAT memakai `fract(U)`: 1.2 → 0.2 (sama ✔), 1.8 → 0.8 (beda ✘).
- MIRRORED_REPEAT berperiode 2 dan dicerminkan pada [1, 2], yaitu `U' = 2 − U`: 1.2 → 0.8 (beda ✘), 1.8 → 0.2 (sama ✔).

---

## Soal 16

Manakah pernyataan yang tepat tentang attribute, uniform, dan data out/in pada shader?

- a. Attribute bernilai sama untuk semua vertex dalam satu draw call, misalnya u_time.
- b. Uniform bernilai sama untuk satu draw call dan dapat digunakan oleh vertex maupun fragment.
- c. Data out/in dikirim dari JavaScript langsung ke fragment shader tanpa melalui vertex shader.
- d. Uniform bernilai berbeda untuk setiap vertex dan dibaca langsung dari vertex buffer.

**Jawaban: b**

**Penjelasan:** Pilihan a mendeskripsikan uniform, dan d mendeskripsikan attribute. `out`/`in` (varying) adalah data dari **vertex shader** ke fragment shader yang diinterpolasi rasterizer, bukan dari JavaScript (c salah).

---

## Soal 17

Pada suatu titik permukaan, N adalah (0,0,1) dan arah satuan menuju cahaya L adalah (0,0,-1). Komponen Phong menggunakan `diffuseFactor=max(dot(N,L),0)`, `R=reflect(-L,N)`, dan `specularFactor=pow(max(dot(R,V),0),s)`, dengan s positif. Manakah kesimpulan yang benar?

- a. Rumus tersebut menjamin specular bernilai nol setiap kali diffuse bernilai nol.
- b. Faktor diffuse bernilai nol.
- c. Untuk V=(0,0,-1), rumus specular tersebut menghasilkan satu.
- d. Menonaktifkan specular ketika dot(N,L) tidak positif menghilangkan highlight akibat pencahayaan dari belakang ini.

**Jawaban: b, c, d**

**Penjelasan:**
- `N·L = −1` → diffuse = 0 ✔
- `−L = (0,0,1)`; `reflect(I,N) = I − 2(N·I)N = (0,0,1) − 2(1)(0,0,1) = (0,0,−1)`
- `R·V = (0,0,−1)·(0,0,−1) = 1` → specular = 1ˢ = 1 ✔
- Diffuse 0 tetapi specular 1, jadi a salah. Highlight palsu ini muncul karena cahaya berasal dari belakang permukaan; solusinya memeriksa `N·L > 0` sebelum menghitung specular ✔

---

## Soal 18

Halaman HTML berisi elemen canvas dengan id `'canvas'`. Kode berikut dijalankan, tetapi lingkaran oranye tidak muncul.

```js
const c = document.getElementById('kanvas');
const ctx = c.getContext('2d');
ctx.beginPath();
ctx.arc(400, 200, 80, 0, Math.PI * 2);
ctx.fillStyle = 'orange';
```

Manakah penyebab masalah yang tepat?

- a. Path lingkaran sudah dibuat, tetapi tidak diisi warna karena fill() tidak dipanggil.
- b. Id yang dicari tidak sesuai dengan id elemen sehingga canvas tidak ditemukan.
- c. Sudut akhir Math.PI * 2 hanya menghasilkan setengah lingkaran, bukan lingkaran penuh.
- d. Nilai fillStyle harus ditetapkan sebelum beginPath() agar warnanya dapat diterapkan.

**Jawaban: a, b**

**Penjelasan:** `'kanvas'` ≠ `'canvas'`, sehingga `getElementById` mengembalikan `null`. Selain itu `ctx.fill()` tidak pernah dipanggil. `2π` sudah lingkaran penuh (setengah lingkaran = `π`). `fillStyle` cukup di-set sebelum `fill()`, tidak harus sebelum `beginPath()`.

---

## Soal 19

Seorang mahasiswa akan membuat program WebGL sederhana yang menampilkan satu segitiga. Urutan langkah manakah yang tepat?

- a. Ambil context, compile dan link shader, lakukan draw call, siapkan buffer, lalu hubungkan attribute.
- b. Ambil context, hubungkan attribute, siapkan buffer, lakukan draw call, lalu compile dan link shader.
- c. Siapkan buffer, ambil context, hubungkan attribute, compile dan link shader, lalu draw call.
- d. Ambil context, siapkan buffer, compile dan link shader, hubungkan attribute, lalu draw call.

**Jawaban: d**

**Penjelasan:** Context harus didapat lebih dulu karena buffer dan shader dibuat lewat `gl`. Attribute hanya bisa dihubungkan setelah program ter-link, karena `getAttribLocation` butuh program. Draw call selalu dilakukan terakhir.

---

## Soal 20

Canvas WebGL berukuran 800 × 600 piksel dengan tiga titik: P di sudut kanan atas, Q di tengah, dan R di tengah sisi kiri. Jika posisi ditulis langsung sebagai `gl_Position` tanpa transformasi, manakah pernyataan yang tepat?

- a. Titik P ditulis pada koordinat NDC (1.0, 1.0).
- b. Titik R ditulis pada koordinat NDC (-1.0, 0.0).
- c. Titik Q ditulis pada koordinat pixel (400, 300).
- d. Titik R ditulis pada koordinat NDC (0.0, -1.0).

**Jawaban: a, b**

**Penjelasan:** `gl_Position` (dengan w = 1) langsung menjadi NDC: kanan atas = (1, 1), tengah = (0, 0), tengah kiri = (−1, 0). Q memang tampil di piksel (400, 300), tetapi nilai yang **ditulis** ke `gl_Position` adalah (0, 0), bukan koordinat piksel. (0, −1) adalah tengah sisi bawah.

---

## Soal 21

Asumsikan Perspective Projection digunakan. FOV diubah dari 45 derajat menjadi 90 derajat tanpa mengubah posisi kamera maupun objek. Prediksi yang benar terhadap hasil render adalah sebagai berikut.

- a. Efek perspektif di bagian tepi tampilan cenderung lebih kuat
- b. Objek dapat tampak lebih kecil pada layar
- c. Area scene yang terlihat menjadi lebih luas
- d. Jarak objek terhadap kamera pada World Space berubah

**Jawaban: a, b, c**

**Penjelasan:** FOV yang lebih lebar membuat lebih banyak scene masuk ke layar (zoom out), sehingga tiap objek tampak lebih kecil dan distorsi di tepi (efek wide-angle) makin kuat. FOV hanya mengubah Projection Matrix, sedangkan posisi di World Space tidak berubah.

---

## Soal 22

Sebuah objek menggunakan transformasi linear diag(2,1,1). Normal satuan awalnya adalah (1,1,0)/√2, dan salah satu vektor tangen permukaan awalnya adalah (1,−1,0). Lighting dihitung dalam world space. Manakah kesimpulan yang benar?

- a. Vektor tangen hasil transformasi adalah (2,−1,0).
- b. Normal satuan yang ditransformasikan dengan benar adalah (1,2,0)/√5.
- c. Penerapan transformasi linear secara langsung menghasilkan normal yang tegak lurus terhadap tangen hasil transformasi.
- d. Normalisasi normal yang ditransformasikan secara langsung cukup untuk memulihkan ketegaklurusan.

**Jawaban: a, b**

**Penjelasan:**
- Tangen: `M·t = (2·1, −1, 0) = (2, −1, 0)` ✔
- Normal harus memakai **inverse-transpose**: `(M⁻¹)ᵀ = diag(1/2, 1, 1)` → `(0.5, 1, 0)` → dinormalisasi menjadi `(1,2,0)/√5` ✔. Cek: `(2,−1,0)·(1,2,0) = 0`, tegak lurus.
- Transformasi langsung: `M·n ∝ (2,1,0)`, dan `(2,1,0)·(2,−1,0) = 3 ≠ 0`, jadi tidak tegak lurus (c salah). Normalisasi hanya mengubah panjang, bukan arah (d salah).

---

## Soal 23

Sebuah objek berada sebagian di dalam dan sebagian di luar view frustum. Dengan asumsi clipping aktif pada pipeline grafika, apa yang mungkin terjadi?

- a. Seluruh objek selalu dihapus dari proses rendering
- b. View Matrix harus dihitung ulang sebelum objek dapat ditampilkan
- c. Bagian geometri yang masih berada di dalam frustum tetap dapat dirender
- d. Bagian geometri yang berada di luar frustum dapat dipotong

**Jawaban: c, d**

**Penjelasan:** Clipping memotong primitive di batas frustum. Bagian di dalam tetap dirender, bagian di luar dibuang. Objek tidak dihapus seluruhnya, dan View Matrix tidak perlu dihitung ulang.

---

## Soal 24

Manakah pernyataan yang tepat tentang peran WebGL sebagai graphics API berbasis browser?

- a. WebGL otomatis menyediakan scene, camera, mesh, dan light seperti sebuah scene framework.
- b. WebGL relatif low-level sehingga data, shader, dan draw call diatur sendiri oleh programmer.
- c. WebGL berkomunikasi langsung dengan GPU sehingga tidak memerlukan graphics driver.
- d. WebGL memungkinkan JavaScript memanfaatkan GPU untuk melakukan rendering melalui browser.

**Jawaban: b, d**

**Penjelasan:** Scene, camera, dan light adalah fitur library tingkat tinggi seperti Three.js, bukan WebGL (a salah). WebGL tetap berjalan lewat browser → driver grafis → GPU (c salah).

---

## Soal 25

Seorang mahasiswa menggambar urutan graphics pipeline seperti berikut:

```
Vertex Data → Rasterization → Vertex Processing → Primitive Assembly → Fragment Processing → Framebuffer → Screen
```

Manakah analisis yang tepat terhadap diagram tersebut?

- a. Framebuffer seharusnya berada sebelum fragment processing sebagai tempat menyimpan fragment.
- b. Fragment processing seharusnya dipindah sebelum rasterization agar warna dihitung lebih dulu.
- c. Vertex processing seharusnya berada setelah primitive assembly agar triangle terbentuk lebih dulu.
- d. Rasterization ditempatkan terlalu awal; tahap ini seharusnya berada setelah primitive assembly.

**Jawaban: d**

**Penjelasan:** Urutan yang benar:

```
Vertex Data → Vertex Processing → Primitive Assembly → Rasterization → Fragment Processing → Framebuffer → Screen
```

Satu-satunya kesalahan di diagram adalah posisi Rasterization. Fragment baru ada setelah rasterization, framebuffer menyimpan hasil akhir, dan vertex processing memang dilakukan sebelum primitive assembly.

---

## Soal 26

Pada suatu titik permukaan, warna dasar RGB hasil sampling adalah (0.8,0.4,0.2). Faktor skalar ambient dan diffuse untuk cahaya putih adalah 0.1 dan 0.5, sedangkan kontribusi specular RGB terpisah adalah (0.2,0.2,0.2). Gunakan `finalColor = (ambientFactor + diffuseFactor) * baseColor + specular`, tanpa pembatasan nilai warna atau konversi gamma. Manakah kesimpulan yang benar?

- a. Menaikkan hanya kontribusi specular mengubah seluruh komponen RGB secara proporsional terhadap baseColor.
- b. Mengalikan kontribusi specular dengan baseColor tidak mengubah warna akhir.
- c. Jika kontribusi specular dikalikan dengan baseColor sebelum dijumlahkan, warna akhir menjadi (0.64,0.32,0.16).
- d. Warna RGB akhir adalah (0.68,0.44,0.32).

**Jawaban: c, d**

**Penjelasan:**
- `(0.1+0.5)·(0.8,0.4,0.2) = (0.48,0.24,0.12)`; ditambah `(0.2,0.2,0.2)` = **(0.68,0.44,0.32)** ✔
- Specular dikali baseColor: `(0.16,0.08,0.04)` → total **(0.64,0.32,0.16)** ✔. Hasilnya berbeda, jadi b salah.
- Specular putih ditambahkan sama rata ke tiap kanal, tidak proporsional terhadap baseColor (a salah).

---

## Soal 27

Seorang mahasiswa menulis fragment shader WebGL2 berikut, tetapi proses compile gagal.

```glsl
#version 300 es
out vec4 outColor;
void main() { outColor = vec4(0.0, 0.7, 1.0, 1.0); }
```

Manakah penyebab kegagalan yang tepat?

- a. Komponen warna harus memakai rentang 0 sampai 255 sehingga nilai 0.7 tidak valid.
- b. Fragment shader belum memiliki deklarasi precision, misalnya precision highp float.
- c. Baris #version 300 es harus dihapus karena WebGL2 tidak memerlukan deklarasi versi GLSL.
- d. Fragment shader harus menuliskan hasilnya ke gl_Position, bukan ke variabel out.

**Jawaban: b**

**Penjelasan:** Di GLSL ES, fragment shader tidak punya default precision untuk `float`, jadi perlu `precision highp float;` (atau mediump). Warna memakai rentang 0.0–1.0. `#version 300 es` **wajib** ada di baris pertama untuk GLSL ES 3.00. `gl_Position` hanya untuk vertex shader.

---

## Soal 28

Dalam WebGL2 dengan GLSL ES 3.00 digunakan perhitungan berikut: `vec3 forward = normalize(target - position);`. Dengan asumsi position dan target berbeda, pernyataan mana yang benar?

- a. Forward vector menunjukkan arah vertikal kamera
- b. Forward vector menunjukkan arah pandang kamera
- c. Forward vector tidak dipengaruhi posisi kamera
- d. Perubahan target dapat mengubah arah forward vector

**Jawaban: b, d**

**Penjelasan:** `target − position` adalah vektor dari kamera ke titik yang dilihat, yaitu arah pandang. Nilainya bergantung pada `position` dan `target`. Arah vertikal kamera adalah up vector, bukan forward.

---

## Soal 29

Buffer posisi berisi enam vertex (v0 sampai v5) yang membentuk dua segitiga terpisah. Setelah kode `gl.drawArrays(gl.TRIANGLES, 0, 3);` dijalankan, hanya satu segitiga yang tampil. Manakah analisis yang tepat?

- a. Buffer hanya menyimpan tiga vertex karena sisa data hilang saat bufferData() dipanggil.
- b. Mode gl.TRIANGLES membatasi satu draw call agar hanya menghasilkan satu segitiga.
- c. Nilai count 3 hanya memproses v0 sampai v2 sehingga hanya satu segitiga yang dirakit.
- d. Mengubah count menjadi 6 membuat v3 sampai v5 dirakit menjadi segitiga kedua.

**Jawaban: c, d**

**Penjelasan:** `drawArrays(mode, first, count)` memproses `count` vertex mulai indeks `first`. Dengan count = 3, hanya v0–v2 yang diproses. Data v3–v5 masih ada di buffer. `TRIANGLES` merakit satu segitiga per 3 vertex, jadi count = 6 menghasilkan 2 segitiga.

---

## Soal 30

Dua face yang bersebelahan berbagi sebuah rusuk geometris. Satu face membutuhkan U=1 pada rusuk tersebut, sedangkan face lainnya membutuhkan U=0. Pada mesh saat ini, kedua face mengacu pada record vertex yang sama, dengan satu pasangan UV per record. Manakah pernyataan yang benar?

- a. Satu record vertex bersama tidak dapat menyimpan kedua pasangan UV yang diperlukan secara bersamaan.
- b. Record hasil duplikasi dapat mempertahankan normal yang sama agar lighting tetap halus melintasi rusuk.
- c. Mengubah filtering dari NEAREST menjadi LINEAR memberikan pasangan UV terpisah pada record bersama.
- d. Duplikasi record vertex pada rusuk dapat mempertahankan posisi yang sama sambil memberikan UV berbeda.

**Jawaban: a, b, d**

**Penjelasan:** Ini masalah **UV seam**. Satu vertex hanya bisa menyimpan satu UV, jadi solusinya menduplikasi vertex: posisi dan normal sama (lighting tetap mulus), UV berbeda. Filtering hanya memengaruhi cara texel diambil, tidak menambah data UV (c salah).

---

## Soal 31

Sebuah aplikasi CAD membutuhkan pengukuran dimensi objek yang konsisten walaupun jaraknya terhadap kamera berubah. Dengan asumsi parameter lain tetap, pilihan yang sesuai adalah sebagai berikut.

- a. Memperbesar FOV agar ukuran objek tetap konstan
- b. Menggunakan Orthographic Projection untuk menjaga skala visual
- c. Mengurangi ketergantungan ukuran tampilan terhadap jarak objek
- d. Menggunakan Perspective Projection agar efek kedalaman lebih kuat

**Jawaban: b, c**

**Penjelasan:** Proyeksi ortografik tidak melakukan pembagian dengan kedalaman, sehingga ukuran tampilan tidak bergantung jarak. Ini cocok untuk CAD/gambar teknik. FOV dan perspective justru membuat ukuran berubah terhadap jarak.

---

## Soal 32

Sebuah scene Perspective Projection menunjukkan artefak z-fighting ketika near plane sangat kecil dan far plane sangat besar. Dengan asumsi tidak ada kesalahan geometri, faktor yang mungkin berkontribusi terhadap masalah tersebut adalah sebagai berikut.

- a. Pemilihan near dan far plane memengaruhi kualitas representasi kedalaman
- b. Aspect ratio viewport secara langsung menyebabkan z-fighting pada kondisi tersebut
- c. Distribusi nilai kedalaman menjadi kurang menguntungkan untuk objek tertentu
- d. Presisi depth buffer menjadi kurang efektif pada rentang kedalaman yang sangat lebar

**Jawaban: a, c, d**

**Penjelasan:** Depth pada perspektif bersifat non-linear (∝ 1/z). Sebagian besar presisi terkumpul dekat near plane, jadi near yang sangat kecil dan far yang besar membuat objek jauh berbagi nilai depth yang hampir sama, dan terjadilah z-fighting. Aspect ratio tidak memengaruhi nilai depth.

---

## Soal 33

Perhatikan kode JavaScript berikut.

```js
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
```

Manakah pernyataan yang tepat tentang kode tersebut?

- a. Context WebGL2 hanya mendukung gambar 2D sehingga tidak dapat digunakan untuk objek 3D.
- b. Nilai gl tidak perlu diperiksa karena context tersedia selama canvas ada di halaman.
- c. Objek gl menjadi interface utama untuk memanggil operasi WebGL pada canvas tersebut.
- d. Canvas sudah menjalankan WebGL sebelum baris ini, kode hanya mengambil referensinya.

**Jawaban: c**

**Penjelasan:** `getContext('webgl2')` **membuat** (atau mengembalikan) rendering context. Hasilnya bisa `null` jika browser/GPU tidak mendukung, jadi tetap perlu dicek. WebGL2 mendukung rendering 3D.

---

## Soal 34

Pernyataan yang benar adalah ...

- a. Posisi vertex dikirim ke pipeline grafis
- b. Shader tidak dapat mengubah posisi vertex
- c. gl_Position merupakan variabel bawaan vertex shader
- d. gl_Position hanya digunakan pada fragment shader

**Jawaban: a, c**

**Penjelasan:** Vertex shader justru bertugas mengubah posisi vertex (transformasi MVP) lalu menuliskannya ke `gl_Position`, variabel built-in milik **vertex** shader.

---

## Soal 35

Highlight Phong menggunakan `specularFactor = c^s`, dengan `c = max(dot(R,V),0)`, serta R dan V merupakan vektor satuan. Bandingkan eksponen s dan 2s untuk s positif. Manakah pernyataan yang benar?

- a. Himpunan arah dengan specularFactor minimal 0.5 menjadi lebih sempit.
- b. Untuk 0<c<1, menggandakan eksponen menurunkan faktor specular.
- c. Menggandakan eksponen membuat highlight lebih kuat pada setiap sudut pandang.
- d. Pada c=1, faktor specular tetap.

**Jawaban: a, b, d**

**Penjelasan:** Untuk 0 < c < 1 berlaku c²ˢ < cˢ, jadi faktor turun. Batas `c ≥ 0.5^(1/2s)` lebih ketat daripada `c ≥ 0.5^(1/s)`, sehingga area highlight menyempit (lebih tajam). Pada c = 1, 1ˢ = 1²ˢ = 1. Highlight tidak menjadi lebih kuat di semua sudut (c salah).

---

## Soal 36

Jika titik berada pada koordinat NDC (0,0), maka ...

- a. Titik berada di luar layar
- b. Titik berada di tengah viewport
- c. Titik berada di dalam area tampilan
- d. Titik berada di pojok kanan atas

**Jawaban: b, c**

**Penjelasan:** (0,0) adalah pusat rentang [−1, 1], yaitu tengah viewport, dan berada di dalam area tampilan. Pojok kanan atas adalah (1, 1).

---

## Soal 37

Attribute dalam WebGL digunakan untuk ...

- a. Menyimpan objek JavaScript
- b. Menyimpan data vertex
- c. Mengatur ukuran canvas
- d. Mengirim data per-vertex ke vertex shader

**Jawaban: b, d**

**Penjelasan:** Attribute adalah input vertex shader yang berisi data per-vertex (posisi, warna, normal, UV) yang dibaca dari buffer. Secara teknis data fisiknya ada di buffer, tetapi dalam konteks materi, attribute dipahami sebagai wadah data vertex. Jika dosen memakai definisi yang ketat, jawaban yang paling aman adalah **d**.

---

## Soal 38

Dalam View Space diasumsikan kamera berada di origin dan menghadap arah pandang standarnya. Sebuah objek sudah ditransformasikan oleh View Matrix. Pernyataan mana yang benar mengenai koordinat objek tersebut?

- a. Projection Matrix sudah diterapkan sehingga koordinat siap ditampilkan pada layar
- b. Perubahan posisi kamera akan memengaruhi koordinat hasil transformasi
- c. Koordinat objek dinyatakan relatif terhadap kamera
- d. Koordinat objek selalu sama dengan koordinat pada World Space

**Jawaban: b, c**

**Penjelasan:** View Space adalah koordinat relatif terhadap kamera, jadi menggeser kamera mengubah hasilnya. Projection belum diterapkan, dan koordinatnya hanya sama dengan World Space jika View Matrix = identitas.

---

## Soal 39

Texture tampak tercermin secara horizontal pada suatu face, tetapi lighting dan geometrinya sudah benar. Texture bersifat asimetris dan rentang UV yang dimaksud adalah nol sampai satu. Manakah tindakan yang tepat untuk memeriksa atau memperbaiki masalah pemetaan?

- a. Membalik normal permukaan untuk memulihkan orientasi texture sambil mempertahankan lighting.
- b. Mengganti REPEAT menjadi CLAMP_TO_EDGE untuk membalik seluruh koordinat U dalam rentang tersebut.
- c. Mengganti U dengan satu dikurangi U untuk membalik pemetaan horizontal tanpa mengubah geometri.
- d. Membandingkan pasangan vertex dan UV dengan orientasi face yang dimaksud.

**Jawaban: c, d**

**Penjelasan:** Masalahnya ada di pemetaan UV, jadi perbaikannya di UV: `U' = 1 − U`, atau periksa pasangan vertex–UV. Membalik normal merusak lighting dan tidak memengaruhi UV. Wrap mode tidak berpengaruh untuk UV di rentang [0, 1] dan tidak membalik apa pun.

---

## Soal 40

Asumsikan aspect ratio pada Projection Matrix tidak diperbarui setelah viewport berubah dari 16:9 menjadi 1:1. Dampak yang mungkin terlihat pada tampilan adalah sebagai berikut.

- a. Near Plane secara otomatis berpindah posisi
- b. Bentuk objek dapat mengalami distorsi
- c. Proporsi horizontal dan vertikal dapat berubah
- d. Lingkaran dapat terlihat tidak lagi berbentuk lingkaran sempurna

**Jawaban: b, c, d**

**Penjelasan:** Aspect ratio yang tidak cocok membuat skala x dan y tidak seimbang, sehingga gambar tampak gepeng/melar (lingkaran menjadi elips). Near plane adalah parameter terpisah dan tidak berubah sendiri.

---

## Soal 41

Data posisi disimpan sebagai `new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.0, 0.5])` dan vertex shader mendeklarasikan `in vec2 a_position;`. Buffer hanya berisi data posisi tersebut. Pemanggilan vertexAttribPointer manakah yang tepat?

- a. `gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);`
- b. `gl.vertexAttribPointer(positionLocation, 6, gl.FLOAT, false, 0, 0);`
- c. `gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);`
- d. `gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 2);`

**Jawaban: c**

**Penjelasan:** `vec2` berarti size = 2 (6 float = 3 vertex × 2 komponen). Data rapat, jadi stride = 0. Data dimulai dari awal, jadi offset = 0. Offset dihitung dalam **byte**, sehingga offset 2 di pilihan d tidak valid (tidak kelipatan 4 dan melompati data). Size 6 juga melebihi maksimum 4.

---

## Soal 42

Manakah pernyataan yang tepat tentang vertex shader, rasterization, dan fragment shader?

- a. Fragment shader menerima data hasil interpolasi dan menghasilkan warna akhir fragment.
- b. Vertex shader berjalan satu kali untuk setiap fragment yang dihasilkan rasterization.
- c. Satu triangle menghasilkan tiga fragment karena setiap vertex menjadi satu fragment.
- d. Vertex shader menghasilkan gl_Position sebagai output posisi untuk setiap vertex.

**Jawaban: a, d**

**Penjelasan:** Vertex shader berjalan sekali per **vertex**. Fragment shader berjalan sekali per **fragment**. Satu triangle menghasilkan fragment sebanyak piksel yang tercakup, bukan hanya tiga.

---

## Soal 43

Sebuah kamera virtual berada pada posisi (0,2,5) dan mengarah ke titik (0,0,0). Informasi apa yang diperlukan untuk menentukan orientasi kamera secara lengkap?

- a. Posisi kamera dan target
- b. Resolusi layar
- c. Arah pencahayaan
- d. Up Vector

**Jawaban: a, d**

**Penjelasan:** Fungsi `lookAt(eye, target, up)` butuh posisi, target (arah pandang), dan up vector (rotasi/roll kamera terhadap sumbu pandang). Resolusi dan cahaya tidak berhubungan dengan orientasi kamera.

---

## Soal 44

Manakah pernyataan yang sesuai dengan perbedaan computer graphics, image processing, dan computer vision?

- a. Computer graphics memodifikasi gambar yang sudah ada, misalnya melakukan blur dan sharpening.
- b. Computer vision memahami isi gambar, misalnya mengenali wajah atau mendeteksi objek di jalan.
- c. Image processing menghasilkan informasi dari gambar, misalnya mendeteksi mobil dan pejalan kaki.
- d. Computer graphics menghasilkan gambar dari data atau model, misalnya scene 3D yang dirender.

**Jawaban: b, d**

**Penjelasan:**
- Computer graphics: model/data → gambar.
- Image processing: gambar → gambar (blur, sharpen). Pilihan a sebenarnya mendeskripsikan image processing.
- Computer vision: gambar → informasi/pemahaman. Pilihan c sebenarnya mendeskripsikan computer vision.

---

## Soal 45

Manakah yang termasuk data yang sering dikirim ke GPU sebagai uniform?

- a. Projection Matrix
- b. Mouse Event
- c. View Matrix
- d. Model Matrix
- e. HTML Element

**Jawaban: a, c, d**

**Penjelasan:** Matriks MVP bernilai sama untuk semua vertex dalam satu draw call, sehingga cocok dikirim sebagai uniform. Mouse event dan elemen HTML adalah objek JavaScript/DOM. Datanya mungkin diolah menjadi uniform, tetapi objeknya sendiri tidak dikirim.

---

## Soal 46

Objek bertekstur yang berotasi menampilkan pola texture dengan benar, tetapi bagian terang diffuse tetap pada lokasi yang sama relatif terhadap objek meskipun lampu titik tetap dalam world space. Posisi permukaan dalam world space sudah benar. Manakah tindakan diagnosis yang relevan?

- a. Mengubah texture wrapping agar bagian terang diffuse mengikuti lampu dalam world space.
- b. Menghitung ulang dan menormalisasi normal world space menggunakan transformasi objek saat ini.
- c. Sebagai alternatif, mentransformasikan lampu ke object space dan menghitung seluruh vektor lighting secara konsisten di ruang tersebut.
- d. Memeriksa apakah normal masih ditafsirkan dalam object space ketika lighting dihitung dalam world space.

**Jawaban: b, c, d**

**Penjelasan:** Gejalanya klasik: normal tidak ikut ditransformasi ke world space (masih object space), sehingga hasil `N·L` "menempel" pada objek. Solusinya: transformasikan normal dengan normal matrix (inverse-transpose dari model matrix) lalu normalisasi, **atau** hitung semuanya konsisten di object space. Texture wrapping tidak ada hubungannya dengan lighting.

---

## Soal 47

Pernyataan yang benar mengenai Clip Space adalah ...

- a. Hasil transformasi projection matrix berada pada ruang ini
- b. Vertex di luar rentang tertentu dapat terpotong (clipping)
- c. Clip Space identik dengan World Space
- d. Clip Space merupakan koordinat piksel

**Jawaban: a, b**

**Penjelasan:** Output `P·V·M·v` (yaitu `gl_Position`) berada di Clip Space. Vertex dengan `|x|, |y|, |z| > w` di-clip. Clip Space berbeda dari World Space dan bukan koordinat piksel.

---

## Soal 48

Projection Matrix digunakan untuk ...

- a. Mengubah koordinat view space ke clip space
- b. Mengatur translasi objek
- c. Menghasilkan perspektif tampilan
- d. Mengatur tekstur objek

**Jawaban: a, c**

**Penjelasan:** Projection Matrix memetakan View Space ke Clip Space dan menghasilkan efek perspektif (atau ortografik). Translasi objek adalah tugas Model Matrix, sedangkan tekstur diatur lewat UV/sampler.

---

## Soal 49

Perhatikan mesh 2D berikut. Setiap titik oranye adalah vertex dan setiap garis biru adalah edge.

```
V3 ──── V4 ──── V5
│     ╱ │     ╱ │
│   ╱   │   ╱   │
│ ╱     │ ╱     │
V0 ──── V1 ──── V2
```

Manakah pernyataan yang tepat tentang mesh tersebut?

- a. Mesh tersebut memiliki 6 vertex unik.
- b. Mesh tersebut memiliki 8 vertex unik.
- c. Mesh tersebut memiliki 7 edge unik.
- d. Mesh tersebut tersusun dari 4 triangle.

**Jawaban: a, d**

**Penjelasan:**
- Vertex: V0–V5 = **6**
- Edge: horizontal 4 (V0V1, V1V2, V3V4, V4V5) + vertikal 3 (V0V3, V1V4, V2V5) + diagonal 2 (V0V4, V1V5) = **9**, bukan 7
- Triangle: 2 persegi × 2 = **4** (V0V1V4, V0V4V3, V1V2V5, V1V5V4)

---

## Soal 50

Manakah pernyataan yang tepat tentang proses compile dan link shader di WebGL?

- a. Kesalahan sintaks GLSL dapat diperiksa melalui info log shader atau info log program.
- b. Proses link menggabungkan buffer dan attribute menjadi satu objek sebelum shader dikompilasi.
- c. Program langsung aktif setelah proses link sehingga gl.useProgram() tidak diperlukan.
- d. Vertex shader dan fragment shader dikompilasi lebih dulu sebelum di-link menjadi satu program.

**Jawaban: a, d**

**Penjelasan:** Alurnya `createShader → shaderSource → compileShader` (cek `getShaderInfoLog`), lalu `attachShader → linkProgram` (cek `getProgramInfoLog`), lalu `useProgram`. Link menggabungkan **shader** menjadi program, bukan buffer/attribute. Program harus diaktifkan dengan `gl.useProgram()`.

---

## Ringkasan Kunci Jawaban

| No | Jawaban | No | Jawaban | No | Jawaban | No | Jawaban | No | Jawaban |
|----|---------|----|---------|----|---------|----|---------|----|---------|
| 1 | b, d | 11 | a, b | 21 | a, b, c | 31 | b, c | 41 | c |
| 2 | a, b, c, d, e | 12 | d | 22 | a, b | 32 | a, c, d | 42 | a, d |
| 3 | d | 13 | b, d | 23 | c, d | 33 | c | 43 | a, d |
| 4 | a, c | 14 | c | 24 | b, d | 34 | a, c | 44 | b, d |
| 5 | a | 15 | a, d | 25 | d | 35 | a, b, d | 45 | a, c, d |
| 6 | b, d | 16 | b | 26 | c, d | 36 | b, c | 46 | b, c, d |
| 7 | a, c | 17 | b, c, d | 27 | b | 37 | b, d | 47 | a, b |
| 8 | a, b, d | 18 | a, b | 28 | b, d | 38 | b, c | 48 | a, c |
| 9 | b, d | 19 | d | 29 | c, d | 39 | c, d | 49 | a, d |
| 10 | c, d | 20 | a, b | 30 | a, b, d | 40 | b, c, d | 50 | a, d |
