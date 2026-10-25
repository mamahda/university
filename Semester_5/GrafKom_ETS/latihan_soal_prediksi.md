# Soal Prediksi Grafika Komputer (WebGL)

Soal tambahan yang disusun dari materi P1–P5 dan Hierarchical Modeling, untuk melengkapi `latihan_soal.md`. Fokusnya pada topik yang belum banyak muncul di soal sebelumnya: hitungan (FPS, NDC, rotasi, kamera, perspective divide, lighting), draw mode, buffer, debugging shader, texture filtering/wrapping, dan traversal tree. Ini latihan prediksi, bukan bocoran soal.

---

## Soal 66

Sebuah game ditargetkan berjalan pada 60 FPS. Berapa batas waktu maksimal untuk merender satu frame?

- **a.** 6,00 ms
- **b.** 16,67 ms
- **c.** 33,33 ms
- **d.** 60,00 ms

**✅ Jawaban: b. 16,67 ms**

$$
\text{Frame Time} = \frac{1000 \text{ ms}}{\text{FPS}} = \frac{1000}{60} \approx 16{,}67 \text{ ms}
$$

Kalau satu frame butuh lebih dari 16,67 ms, FPS turun di bawah 60. Sebagai pembanding, 30 FPS = 33,33 ms per frame.

---

## Soal 67

Hasil profiling menunjukkan frame time rata-rata sebuah aplikasi WebGL adalah 20 ms. Berapa FPS-nya?

- **a.** 20 FPS
- **b.** 40 FPS
- **c.** 50 FPS
- **d.** 200 FPS

**✅ Jawaban: c. 50 FPS**

$$
\text{FPS} = \frac{1000}{\text{Frame Time}} = \frac{1000}{20} = 50
$$

Frame time dan FPS berbanding terbalik: frame time makin kecil → FPS makin tinggi → gerakan makin halus.

---

## Soal 68

Sebuah sistem menerima foto jalan raya lalu menghasilkan informasi berupa lokasi dan jumlah mobil di foto tersebut. Sistem ini termasuk bidang …

- **a.** Computer graphics
- **b.** Image processing
- **c.** Computer vision
- **d.** Rendering

**✅ Jawaban: c. Computer vision**

| Bidang | Input → Output |
|---|---|
| Computer graphics | data/model → image (**membuat** gambar) |
| Image processing | image → image yang dimodifikasi (**mengubah** gambar) |
| Computer vision | image → informasi (**memahami** gambar) |

Input berupa gambar dan output berupa informasi (deteksi objek), jadi termasuk computer vision.

---

## Soal 69

Sebuah logo harus dicetak di kartu nama sekaligus di baliho besar tanpa terlihat pecah. Representasi grafis yang paling tepat adalah …

- **a.** Raster graphics, karena menyimpan warna setiap pixel
- **b.** Vector graphics, karena resolution independent
- **c.** Raster graphics, karena ukuran filenya kecil
- **d.** Vector graphics, karena tersusun dari grid pixel

**✅ Jawaban: b. Vector graphics, karena resolution independent**

Vector menyimpan "resep" matematis (garis, kurva, path), bukan pixel. Saat ditampilkan, bentuknya dihitung ulang sesuai ukuran, sehingga tetap tajam di ukuran apa pun. Raster tersusun dari grid pixel sehingga bergantung resolusi dan menjadi *pixelated* jika diperbesar terlalu jauh.

---

## Soal 70

Canvas berukuran 1280 × 720 pixel menyimpan warna dalam format RGBA 8-bit per channel. Berapa ukuran color buffer-nya?

- **a.** 921.600 byte
- **b.** 2.764.800 byte
- **c.** 3.686.400 byte
- **d.** 7.372.800 byte

**✅ Jawaban: c. 3.686.400 byte**

- Jumlah pixel: 1280 × 720 = 921.600 pixel
- RGBA 8-bit per channel = 4 channel × 1 byte = 4 byte per pixel
- Ukuran: 921.600 × 4 = **3.686.400 byte** (≈ 3,7 MB)

Opsi b (2.764.800) adalah jawaban jika formatnya RGB saja (3 byte per pixel).

---

## Soal 71

Pada sistem koordinat right-handed yang dipakai OpenGL/WebGL, ke mana arah sumbu +Z?

- **a.** Masuk ke dalam layar, menjauhi pengamat
- **b.** Ke atas layar
- **c.** Keluar dari layar, ke arah pengamat
- **d.** Ke kanan layar

**✅ Jawaban: c. Keluar dari layar, ke arah pengamat**

Di WebGL: +X ke kanan, +Y ke atas, +Z keluar layar menuju pengamat. Karena itu kamera di view space menghadap **−Z**. Engine lain bisa berbeda, misalnya Unity memakai left-handed (Z masuk layar).

---

## Soal 72

Mengapa segitiga (triangle) menjadi primitive utama untuk membentuk mesh 3D?

- **a.** Karena segitiga tidak perlu diproses rasterizer
- **b.** Karena hanya segitiga yang bisa diberi warna
- **c.** Karena segitiga selalu planar (berada pada satu bidang datar) dan efisien diproses GPU
- **d.** Karena segitiga tidak membutuhkan vertex

**✅ Jawaban: c. Karena segitiga selalu planar (berada pada satu bidang datar) dan efisien diproses GPU**

Tiga titik selalu berada pada satu bidang, sehingga normal dan interpolasinya jelas. Segitiga sederhana (3 vertex, 3 edge), cepat dihitung, dan kombinasinya bisa membentuk permukaan apa pun. Polygon dengan 4 titik atau lebih bisa saja tidak planar.

---

## Soal 73

Sebuah studio film merender satu frame animasi dengan kualitas sangat tinggi, dan satu frame boleh memakan waktu berjam-jam. Jenis rendering ini disebut …

- **a.** Real-time rendering
- **b.** Rasterization
- **c.** Double buffering
- **d.** Offline rendering

**✅ Jawaban: d. Offline rendering**

- **Offline rendering**: tidak ada batas waktu ketat per frame, kualitas sangat tinggi, umum di film/VFX.
- **Real-time rendering**: satu frame harus selesai dalam hitungan milidetik (30–60+ FPS) karena pengguna berinteraksi langsung, misalnya game dan simulator.

---

## Soal 74

Mengapa proses rendering lebih cocok dijalankan di GPU daripada di CPU?

- **a.** Karena GPU memiliki sedikit core yang sangat kuat untuk logika bercabang
- **b.** Karena perhitungan tiap vertex/pixel saling independen sehingga bisa dikerjakan paralel oleh banyak core GPU
- **c.** Karena GPU yang menjalankan logika aplikasi dan input pengguna
- **d.** Karena CPU tidak bisa melakukan perkalian matriks

**✅ Jawaban: b. Karena perhitungan tiap vertex/pixel saling independen sehingga bisa dikerjakan paralel oleh banyak core GPU**

Layar Full HD memiliki lebih dari 2 juta pixel, dan perhitungan satu pixel tidak bergantung pada pixel lain. GPU punya ribuan core kecil yang mengerjakan operasi serupa secara bersamaan (*massively parallel*). CPU punya sedikit core kuat yang cocok untuk logika aplikasi, branching, dan mengirim perintah (draw call) ke GPU.

---

## Soal 75

Urutan komunikasi yang benar dari program JavaScript sampai gambar tampil di canvas adalah …

- **a.** Application → GPU → WebGL API → Graphics Driver → Canvas
- **b.** Application → WebGL API → Graphics Driver → GPU → Framebuffer → Canvas
- **c.** Application → Framebuffer → GPU → WebGL API → Canvas
- **d.** Application → Graphics Driver → Canvas → GPU → WebGL API

**✅ Jawaban: b. Application → WebGL API → Graphics Driver → GPU → Framebuffer → Canvas**

Aplikasi **tidak berkomunikasi langsung dengan GPU**. Perintah dikirim lewat Graphics API (WebGL, OpenGL, Direct3D, Vulkan, Metal), diteruskan driver ke GPU, hasil render ditulis ke framebuffer, lalu ditampilkan di canvas.

---

## Soal 76

Urutan tahap graphics pipeline yang benar adalah …

- **a.** Vertex Processing → Primitive Assembly → Rasterization → Fragment Processing → Framebuffer
- **b.** Vertex Processing → Rasterization → Primitive Assembly → Fragment Processing → Framebuffer
- **c.** Primitive Assembly → Vertex Processing → Fragment Processing → Rasterization → Framebuffer
- **d.** Rasterization → Vertex Processing → Primitive Assembly → Fragment Processing → Framebuffer

**✅ Jawaban: a. Vertex Processing → Primitive Assembly → Rasterization → Fragment Processing → Framebuffer**

1. **Vertex processing**: tiap vertex ditransformasi (vertex shader).
2. **Primitive assembly**: vertex dirakit menjadi point/line/triangle.
3. **Rasterization**: primitive diubah menjadi fragment (kandidat pixel).
4. **Fragment processing**: warna tiap fragment ditentukan (fragment shader).
5. **Framebuffer**: hasil disimpan sebelum tampil.

Tahap geometri (1–2) belum mengenal pixel; tahap pixel dimulai dari rasterization.

---

## Soal 77

Apa perbedaan fragment dengan pixel?

- **a.** Fragment adalah kandidat pixel hasil rasterization yang masih bisa ditolak, misalnya oleh depth test
- **b.** Fragment adalah nama lain vertex
- **c.** Fragment adalah pixel yang sudah pasti tampil di layar
- **d.** Tidak ada perbedaan, keduanya istilah yang sama

**✅ Jawaban: a. Fragment adalah kandidat pixel hasil rasterization yang masih bisa ditolak, misalnya oleh depth test**

Satu pixel layar bisa dilewati beberapa fragment dari objek berbeda. Fragment shader menghitung warna tiap fragment, lalu depth test memilih fragment terdekat. Hanya fragment yang lolos yang ditulis ke framebuffer sebagai pixel akhir.

---

## Soal 78

Pada HTML Canvas 2D (Praktikum 1), di mana letak titik (0, 0) dan ke mana arah sumbu Y positif?

- **a.** Di tengah canvas, Y ke atas
- **b.** Di kiri bawah, Y ke atas
- **c.** Di kiri atas, Y ke bawah
- **d.** Di tengah canvas, Y ke bawah

**✅ Jawaban: c. Di kiri atas, Y ke bawah**

Canvas 2D memakai koordinat pixel: (0, 0) di pojok kiri atas, X bertambah ke kanan, Y bertambah **ke bawah**. Ini berbeda dengan NDC WebGL, yang (0, 0)-nya di tengah dan Y ke atas.

---

## Soal 79

Perhatikan animation loop berikut:

```js
function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}
```

Objek yang bergerak meninggalkan "jejak" di canvas. Apa penyebabnya?

- **a.** `requestAnimationFrame` dipanggil terlalu cepat
- **b.** Canvas tidak dibersihkan di awal setiap frame (`ctx.clearRect(...)` tidak dipanggil)
- **c.** Fungsi `update()` harus dipanggil setelah `draw()`
- **d.** FPS terlalu tinggi

**✅ Jawaban: b. Canvas tidak dibersihkan di awal setiap frame (`ctx.clearRect(...)` tidak dipanggil)**

Pola animation loop yang benar: **update → clear → draw → next frame**. Tanpa clear, gambar frame sebelumnya tetap ada sehingga posisi lama objek terlihat sebagai jejak. Di WebGL padanannya adalah `gl.clear(gl.COLOR_BUFFER_BIT)`.

---

## Soal 80

Pernyataan yang benar tentang WebGL adalah …

- **a.** WebGL otomatis menyediakan camera, light, dan material untuk setiap scene
- **b.** WebGL adalah scene framework seperti Three.js
- **c.** WebGL hanya bisa menggambar grafis 2D
- **d.** WebGL adalah API low-level; programmer sendiri yang menyiapkan data vertex, buffer, shader, attribute, dan draw call

**✅ Jawaban: d. WebGL adalah API low-level; programmer sendiri yang menyiapkan data vertex, buffer, shader, attribute, dan draw call**

WebGL **bukan scene framework**. Ia hanya memberi akses ke GPU dari JavaScript. Konsep seperti camera, light, mesh, dan material harus dibangun sendiri (misalnya lewat matrix dan shader) atau memakai framework seperti Three.js yang membungkus WebGL.

---

## Soal 81

Canvas berukuran 800 × 600. Sebuah vertex berada di NDC (−0.5, 0.5). Di koordinat pixel berapa vertex tersebut tampil (origin di kiri atas)?

- **a.** (200, 150)
- **b.** (200, 450)
- **c.** (600, 150)
- **d.** (400, 300)

**✅ Jawaban: a. (200, 150)**

$$
x_{px} = \frac{x_{ndc} + 1}{2} \times width = \frac{-0.5 + 1}{2} \times 800 = 200
$$

$$
y_{px} = \frac{1 - y_{ndc}}{2} \times height = \frac{1 - 0.5}{2} \times 600 = 150
$$

Rumus y memakai (1 − y) karena pixel layar dihitung dari atas, sedangkan Y di NDC mengarah ke atas.

---

## Soal 82

Sebuah vertex dikirim ke `gl_Position` dengan nilai `vec4(1.4, 0.2, 0.0, 1.0)`. Apa yang terjadi pada vertex tersebut?

- **a.** Vertex tampil di tepi kanan canvas
- **b.** Vertex otomatis diskalakan agar masuk ke canvas
- **c.** Vertex berada di luar rentang NDC [−1, 1] sehingga ter-clip dan tidak terlihat
- **d.** Terjadi error saat compile shader

**✅ Jawaban: c. Vertex berada di luar rentang NDC [−1, 1] sehingga ter-clip dan tidak terlihat**

Dengan w = 1, x = 1.4 berada di luar rentang −1 sampai 1. Bagian geometri di luar view volume dipotong (*clipping*) sebelum rasterisasi. Jika vertex itu bagian dari segitiga, hanya bagian segitiga di dalam rentang yang tetap tergambar.

---

## Soal 83

Terdapat 8 vertex yang digambar dengan `gl.drawArrays(gl.LINE_STRIP, 0, 8)`. Berapa garis yang terbentuk?

- **a.** 4
- **b.** 7
- **c.** 8
- **d.** 6

**✅ Jawaban: b. 7**

| Draw mode | Jumlah garis untuk n vertex | n = 8 |
|---|---|---|
| `gl.LINES` | n / 2 | 4 |
| `gl.LINE_STRIP` | n − 1 | **7** |
| `gl.LINE_LOOP` | n (menutup ke awal) | 8 |

---

## Soal 84

Buffer berisi 7 vertex lalu digambar dengan `gl.drawArrays(gl.TRIANGLES, 0, 7)`. Apa hasilnya?

- **a.** 2 segitiga; vertex ke-7 diabaikan karena tidak lengkap membentuk segitiga
- **b.** 3 segitiga; vertex ke-7 dipakai bersama
- **c.** 5 segitiga seperti triangle strip
- **d.** Error, jumlah vertex harus kelipatan 3

**✅ Jawaban: a. 2 segitiga; vertex ke-7 diabaikan karena tidak lengkap membentuk segitiga**

Dengan `gl.TRIANGLES`, vertex dibaca per tiga dan tidak berbagi: (v0, v1, v2) dan (v3, v4, v5). Vertex v6 tidak punya pasangan sehingga diabaikan, tanpa error.

---

## Soal 85

Posisi vertex sebuah partikel dihitung ulang dan dikirim ke buffer **setiap frame**. Usage hint yang paling tepat untuk `gl.bufferData` adalah …

- **a.** `gl.STATIC_DRAW`
- **b.** `gl.DYNAMIC_DRAW`
- **c.** `gl.ARRAY_BUFFER`
- **d.** `gl.COLOR_BUFFER_BIT`

**✅ Jawaban: b. `gl.DYNAMIC_DRAW`**

- `STATIC_DRAW`: data jarang diubah, dipakai berkali-kali (misalnya model statis).
- `DYNAMIC_DRAW`: data sering diubah dan dipakai berkali-kali.
- `STREAM_DRAW`: data diisi sekali dan dipakai sedikit.

`gl.ARRAY_BUFFER` adalah target buffer, bukan usage hint; `gl.COLOR_BUFFER_BIT` dipakai untuk `gl.clear`.

---

## Soal 86

Sebuah interleaved buffer `Float32Array` menyimpan data per vertex dengan urutan `x, y, z, r, g, b, a`. Berapa nilai **stride** dan **offset** untuk attribute warna pada `gl.vertexAttribPointer`?

- **a.** stride 7, offset 3
- **b.** stride 28, offset 12
- **c.** stride 28, offset 16
- **d.** stride 12, offset 28

**✅ Jawaban: b. stride 28, offset 12**

Stride dan offset dihitung dalam **byte**, dan satu float = 4 byte.

- Stride = jumlah float per vertex × 4 = 7 × 4 = **28 byte**
- Offset warna = jumlah float sebelum `r` × 4 = 3 × 4 = **12 byte**

```js
gl.vertexAttribPointer(posLoc,   3, gl.FLOAT, false, 28, 0);
gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 28, 12);
```

---

## Soal 87

Kode shader WebGL2 ditulis dalam template literal seperti berikut dan gagal di-compile:

```js
const vsSource = `
#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
```

Apa penyebabnya?

- **a.** `a_position` harus bertipe `vec4`
- **b.** `gl_Position` harus ditulis `gl_position`
- **c.** Template literal tidak boleh dipakai untuk shader
- **d.** Ada baris kosong sebelum `#version 300 es`, padahal directive ini harus berada di baris paling pertama

**✅ Jawaban: d. Ada baris kosong sebelum `#version 300 es`, padahal directive ini harus berada di baris paling pertama**

Backtick langsung diikuti newline, sehingga `#version 300 es` jatuh di baris kedua. Compiler lalu menganggap shader sebagai GLSL ES 1.00, dan `in` serta `out` tidak dikenali. Perbaikannya: tulis `#version 300 es` tepat setelah backtick.

```js
const vsSource = `#version 300 es
in vec2 a_position;
...`;
```

---

## Soal 88

Fragment shader berikut gagal di-compile:

```glsl
#version 300 es
in vec3 v_color;
out vec4 outColor;
void main() {
  outColor = vec4(v_color, 1.0);
}
```

Baris apa yang perlu ditambahkan?

- **a.** `uniform float u_time;`
- **b.** `precision mediump float;` (atau `highp`)
- **c.** `gl_Position = vec4(0.0);`
- **d.** `#include <precision>`

**✅ Jawaban: b. `precision mediump float;` (atau `highp`)**

Fragment shader di GLSL ES tidak punya presisi float bawaan, sehingga presisi **wajib** dideklarasikan sebelum memakai tipe float. Vertex shader punya default `highp`, jadi tidak wajib.

---

## Soal 89

Data mana yang paling tepat dikirim sebagai **uniform**, bukan attribute?

- **a.** Posisi setiap vertex
- **b.** Warna setiap vertex
- **c.** Koordinat UV setiap vertex
- **d.** Sudut rotasi yang berlaku untuk seluruh objek dalam satu draw call

**✅ Jawaban: d. Sudut rotasi yang berlaku untuk seluruh objek dalam satu draw call**

| Jenis | Frekuensi | Contoh |
|---|---|---|
| Attribute | berbeda per vertex | posisi, warna, normal, UV |
| Uniform | sama untuk semua vertex/fragment dalam satu draw call | matrix model/view/projection, sudut, waktu, posisi cahaya, sampler |
| out → in | dari vertex shader ke fragment shader (diinterpolasi) | `v_color`, `v_texCoord` |

---

## Soal 90

Di dalam shader GLSL ES 3.00 terdapat baris `float s = 2;`. Apa yang terjadi?

- **a.** Compile error karena GLSL ketat soal tipe; `2` adalah int, seharusnya ditulis `2.0`
- **b.** Berjalan normal, nilai otomatis dikonversi menjadi 2.0
- **c.** Nilai `s` menjadi 0
- **d.** Shader berjalan tetapi warna menjadi hitam

**✅ Jawaban: a. Compile error karena GLSL ketat soal tipe; `2` adalah int, seharusnya ditulis `2.0`**

GLSL ES tidak melakukan konversi implisit dari int ke float pada assignment seperti di JavaScript. Literal float harus ditulis dengan titik desimal: `float s = 2.0;`.

---

## Soal 91

Sebuah kubus digambar dengan `gl.drawArrays(gl.TRIANGLES, 0, n)`; setiap face terdiri dari 2 segitiga. Berapa nilai `n` dan berapa kali vertex shader dijalankan?

- **a.** n = 8, vertex shader 8 kali
- **b.** n = 12, vertex shader 12 kali
- **c.** n = 36, vertex shader 36 kali
- **d.** n = 36, vertex shader dijalankan sekali per pixel

**✅ Jawaban: c. n = 36, vertex shader 36 kali**

- Kubus: 6 face × 2 segitiga = 12 segitiga.
- `gl.TRIANGLES` tidak berbagi vertex: 12 × 3 = **36 vertex**.
- Vertex shader berjalan **sekali per vertex** → 36 kali.

Kubus hanya punya 8 sudut geometris, tetapi tanpa index buffer setiap sudut diduplikasi. Fragment shader berjalan jauh lebih sering, yaitu sekali per fragment.

---

## Soal 92

Vertex shader mendeklarasikan `out vec3 v_color;`, sedangkan fragment shader mendeklarasikan `in vec3 vColor;`. Kesalahan ini terdeteksi pada tahap …

- **a.** `gl.compileShader` vertex shader
- **b.** `gl.drawArrays`
- **c.** `gl.linkProgram`, dan pesan errornya dibaca lewat `gl.getProgramInfoLog`
- **d.** `gl.bufferData`

**✅ Jawaban: c. `gl.linkProgram`, dan pesan errornya dibaca lewat `gl.getProgramInfoLog`**

Setiap shader di-compile terpisah, sehingga masing-masing valid sendiri-sendiri. Saat **link**, kedua shader digabung menjadi satu program dan dicek apakah setiap `in` di fragment shader punya `out` yang cocok (nama dan tipe) di vertex shader. Syntax error di dalam satu shader dibaca lewat `getShaderInfoLog` saat compile.

---

## Soal 93

Apa yang digambar oleh `gl.drawArrays(gl.TRIANGLES, 3, 6)`?

- **a.** 1 segitiga dari vertex 3, 4, 5
- **b.** 6 segitiga
- **c.** 3 segitiga mulai dari vertex 0
- **d.** 2 segitiga dari vertex 3 sampai 8

**✅ Jawaban: d. 2 segitiga dari vertex 3 sampai 8**

`gl.drawArrays(mode, first, count)`: mulai dari vertex indeks `first = 3`, ambil `count = 6` vertex (indeks 3–8). Dengan `TRIANGLES`, 6 vertex membentuk 2 segitiga: (3, 4, 5) dan (6, 7, 8).

---

## Soal 94

Seorang mahasiswa ingin memutar objek 90° dan menulis:

```js
const c = Math.cos(90);
const s = Math.sin(90);
```

Hasil rotasinya tidak sesuai harapan. Apa penyebabnya?

- **a.** `Math.cos` hanya menerima bilangan negatif
- **b.** `Math.sin` dan `Math.cos` memakai radian, jadi 90° harus dikonversi menjadi π/2
- **c.** Rotasi 90° tidak bisa dihitung dengan trigonometri
- **d.** Seharusnya memakai `Math.tan`

**✅ Jawaban: b. `Math.sin` dan `Math.cos` memakai radian, jadi 90° harus dikonversi menjadi π/2**

`Math.sin(90)` menghitung sin 90 **radian** (≈ 0,894), bukan sin 90° = 1.

$$
\text{radian} = \text{degree} \times \frac{\pi}{180}
$$

```js
const rad = 90 * Math.PI / 180;  // π/2
```

Di GLSL padanannya `radians(90.0)`.

---

## Soal 95

Titik P(2, −1) dirotasi 90° berlawanan arah jarum jam terhadap origin. Koordinat P' adalah …

- **a.** (1, 2)
- **b.** (−1, −2)
- **c.** (2, 1)
- **d.** (−2, 1)

**✅ Jawaban: a. (1, 2)**

Dengan cos 90° = 0 dan sin 90° = 1:

$$
x' = x\cos\theta - y\sin\theta = 2(0) - (-1)(1) = 1
$$

$$
y' = x\sin\theta + y\cos\theta = 2(1) + (-1)(0) = 2
$$

Jadi P' = (1, 2). Opsi d (−2, 1) adalah hasil rotasi 180°.

---

## Soal 96

Sebuah persegi dengan sudut (2, 2) dan (3, 3) diskala dengan S(2, 2) tanpa mengatur pivot. Apa yang terjadi?

- **a.** Persegi membesar 2× tetapi posisinya tetap
- **b.** Persegi mengecil dan mendekati origin
- **c.** Persegi hanya bergeser tanpa berubah ukuran
- **d.** Persegi membesar 2× sekaligus bergeser menjauhi origin, menjadi (4, 4) sampai (6, 6)

**✅ Jawaban: d. Persegi membesar 2× sekaligus bergeser menjauhi origin, menjadi (4, 4) sampai (6, 6)**

Scaling dilakukan relatif terhadap origin: setiap koordinat dikali faktor skala. (2, 2) → (4, 4) dan (3, 3) → (6, 6). Sisi persegi menjadi 2 (dua kali semula), tetapi posisinya juga menjauh dari origin. Agar membesar di tempat, scaling harus dilakukan terhadap pusat objek: T(p)·S·T(−p).

---

## Soal 97

Mengapa translasi tidak bisa dinyatakan dengan matriks 2×2?

- **a.** Karena translasi membutuhkan sudut
- **b.** Karena matriks 2×2 hanya untuk warna
- **c.** Karena perkalian matriks 2×2 dengan titik (0, 0) selalu menghasilkan (0, 0), sehingga origin tidak pernah bisa bergeser
- **d.** Karena translasi tidak mengubah posisi titik

**✅ Jawaban: c. Karena perkalian matriks 2×2 dengan titik (0, 0) selalu menghasilkan (0, 0), sehingga origin tidak pernah bisa bergeser**

Matriks 2×2 hanya menghasilkan bentuk $x' = ax + by$, tanpa tempat untuk konstanta $+t_x$. Rotasi, skala, dan shear bersifat linear sehingga bisa, tetapi translasi tidak. Solusinya adalah **homogeneous coordinate**: (x, y) ditulis (x, y, 1) dan dikalikan dengan matriks 3×3 (atau 4×4 untuk 3D).

---

## Soal 98

Vektor arah `vec4(1.0, 0.0, 0.0, 0.0)` dikalikan dengan matriks translasi T(5, 3, 0). Hasilnya adalah …

- **a.** (6, 3, 0, 0)
- **b.** (1, 0, 0, 0)
- **c.** (5, 3, 0, 1)
- **d.** (6, 3, 0, 1)

**✅ Jawaban: b. (1, 0, 0, 0)**

Kolom translasi $(t_x, t_y, t_z)$ dikalikan dengan komponen w. Karena w = 0, kontribusinya nol:

$$
x' = 1 + 5 \cdot 0 = 1,\quad y' = 0 + 3 \cdot 0 = 0
$$

Ini memang diinginkan: **arah** (normal, arah cahaya directional) tidak boleh berubah karena translasi. Titik (w = 1) akan bergeser, vektor arah (w = 0) tidak.

---

## Soal 99

Titik P = (1, 0) dikenai matriks M = T(2, 0) · R(90°). Hasilnya adalah …

- **a.** (2, 1)
- **b.** (0, 3)
- **c.** (3, 0)
- **d.** (1, 2)

**✅ Jawaban: a. (2, 1)**

Matriks paling kanan dikerjakan duluan, jadi rotasi dulu baru translasi:

1. R(90°): (1, 0) → (0, 1)
2. T(2, 0): (0, 1) → **(2, 1)**

Jika urutannya dibalik, M = R(90°) · T(2, 0): T dulu → (3, 0), lalu R → (0, 3). Hasil berbeda karena perkalian matriks tidak komutatif.

---

## Soal 100

Sebuah planet ingin dibuat **mengorbit** origin (bukan berputar di tempat). Model matrix mana yang tepat jika sudut θ bertambah setiap frame?

- **a.** M = T(d) · R(θ)
- **b.** M = R(θ) · T(d)
- **c.** M = S · T(d)
- **d.** M = T(d) · S

**✅ Jawaban: b. M = R(θ) · T(d)**

- **M = R · T**: objek ditranslasi dulu menjauhi origin, lalu dirotasi. Translasinya ikut terotasi sehingga objek **mengorbit origin**.
- **M = T · R**: objek berputar di pusatnya sendiri, lalu dipindahkan, sehingga terlihat berputar di tempat.

---

## Soal 101

Sebuah pintu harus berputar terhadap engselnya di titik p, bukan terhadap origin. Matriks yang tepat adalah …

- **a.** R(θ) · T(p)
- **b.** T(p) · R(θ)
- **c.** T(p) · R(θ) · T(−p)
- **d.** T(−p) · R(θ) · T(p)

**✅ Jawaban: c. T(p) · R(θ) · T(−p)**

Dibaca dari kanan:

1. T(−p): pindahkan engsel ke origin.
2. R(θ): putar terhadap origin (yang sekarang adalah engsel).
3. T(p): kembalikan engsel ke posisi semula.

Pola yang sama dipakai untuk scaling terhadap titik tertentu.

---

## Soal 102

Invers dari matriks komposisi M = T · R adalah …

- **a.** T⁻¹ · R⁻¹
- **b.** T · R
- **c.** R⁻¹ · T⁻¹
- **d.** R · T

**✅ Jawaban: c. R⁻¹ · T⁻¹**

$$
(A \cdot B)^{-1} = B^{-1} \cdot A^{-1}
$$

Untuk membatalkan "rotasi lalu translasi", translasinya dibatalkan dulu, baru rotasinya. Contohnya: T(2, 0, 0)⁻¹ = T(−2, 0, 0) dan R(θ)⁻¹ = R(−θ) = Rᵀ. Prinsip ini dipakai untuk membentuk **view matrix** (invers dari transform kamera).

---

## Soal 103

Model matrix ditulis sebagai M = T · R · S. Dalam urutan apa transformasi diterapkan pada vertex?

- **a.** Translate → Rotate → Scale
- **b.** Scale → Rotate → Translate
- **c.** Rotate → Scale → Translate
- **d.** Semua diterapkan bersamaan sehingga urutan tidak berpengaruh

**✅ Jawaban: b. Scale → Rotate → Translate**

Dengan konvensi column-vector, $P' = T \cdot R \cdot S \cdot P$, sehingga matriks paling kanan (S) dikenakan pertama. Urutan S → R → T membuat objek diskala dan diputar terhadap pusatnya sendiri, lalu dipindahkan ke posisi di world.

---

## Soal 104

Kamera berada di posisi (3, 0, 4) dan melihat ke target (0, 0, 0). Forward vector kamera adalah …

- **a.** (0.6, 0, 0.8)
- **b.** (−3, 0, −4)
- **c.** (−0.8, 0, −0.6)
- **d.** (−0.6, 0, −0.8)

**✅ Jawaban: d. (−0.6, 0, −0.8)**

$$
\text{Forward} = \text{normalize}(\text{Target} - \text{Position}) = \text{normalize}(-3, 0, -4)
$$

Panjangnya $\sqrt{9 + 0 + 16} = 5$, sehingga Forward = (−3/5, 0, −4/5) = (−0.6, 0, −0.8). Opsi b belum dinormalisasi.

---

## Soal 105

Lanjutan soal sebelumnya: kamera di (3, 0, 4), target (0, 0, 0), up = (0, 1, 0). Hitung **right vector** kamera dengan Right = normalize(Forward × Up).

**✅ Jawaban: Right = (0.8, 0, −0.6)**

Forward F = (−0.6, 0, −0.8), Up U = (0, 1, 0).

$$
F \times U = (F_y U_z - F_z U_y,\; F_z U_x - F_x U_z,\; F_x U_y - F_y U_x)
$$

$$
= (0 \cdot 0 - (-0.8)(1),\; (-0.8)(0) - (-0.6)(0),\; (-0.6)(1) - 0 \cdot 0) = (0.8,\; 0,\; -0.6)
$$

Panjangnya $\sqrt{0.64 + 0.36} = 1$, jadi sudah unit vector. Cek: F · Right = (−0.6)(0.8) + 0 + (−0.8)(−0.6) = 0, berarti tegak lurus.

---

## Soal 106

Setelah view transformation, bagaimana posisi dan arah kamera di view space (eye space)?

- **a.** Kamera berada di origin (0, 0, 0) dan menghadap −Z
- **b.** Kamera berada di posisi aslinya di world dan menghadap +Z
- **c.** Kamera berada di (0, 0, 1) dan menghadap +Y
- **d.** Kamera berada di pojok kiri atas layar

**✅ Jawaban: a. Kamera berada di origin (0, 0, 0) dan menghadap −Z**

View matrix memindahkan seluruh world sehingga kamera secara konseptual berada di origin, menghadap −Z, dengan +Y ke atas dan +X ke kanan. Semua objek kemudian dinyatakan relatif terhadap kamera.

---

## Soal 107

Mengapa view matrix adalah **invers** dari transformasi kamera?

- **a.** Karena kamera harus selalu berada di (0, 0, 1)
- **b.** Karena invers membuat objek lebih kecil
- **c.** Karena view matrix hanya mengatur warna scene
- **d.** Karena menggerakkan kamera ke kanan setara dengan menggerakkan seluruh world ke kiri relatif terhadap kamera

**✅ Jawaban: d. Karena menggerakkan kamera ke kanan setara dengan menggerakkan seluruh world ke kiri relatif terhadap kamera**

Transformasi kamera membawa kamera dari origin ke posisinya di world. View matrix melakukan kebalikannya: membawa world ke koordinat kamera. Analoginya seperti melihat dari jendela kereta: kereta bergerak maju, pemandangan terlihat bergerak mundur.

$$
\text{ViewMatrix} = (\text{CameraTransform})^{-1}
$$

---

## Soal 108

FOV kamera perspektif diubah dari 90° menjadi 35°. Apa efeknya pada tampilan?

- **a.** Area yang terlihat makin luas dan objek tampak lebih kecil
- **b.** Area yang terlihat makin sempit dan objek tampak lebih besar, seperti efek zoom
- **c.** Objek menjadi lebih terang
- **d.** Tidak ada perubahan karena FOV hanya memengaruhi far plane

**✅ Jawaban: b. Area yang terlihat makin sempit dan objek tampak lebih besar, seperti efek zoom**

| | FOV kecil | FOV besar |
|---|---|---|
| Area terlihat | sempit | luas |
| Ukuran objek | tampak besar (zoom in) | tampak kecil |
| Distorsi tepi | kecil | lebih terlihat |

---

## Soal 109

Canvas berukuran 1200 × 600, tetapi projection matrix dibuat dengan `aspect = 1.0`. Apa akibatnya?

- **a.** Tidak ada efek
- **b.** Scene menjadi gelap
- **c.** Proporsi tidak sesuai, misalnya lingkaran tampak menjadi elips (melebar horizontal)
- **d.** Depth test berhenti bekerja

**✅ Jawaban: c. Proporsi tidak sesuai, misalnya lingkaran tampak menjadi elips (melebar horizontal)**

Aspect ratio seharusnya `canvas.width / canvas.height` = 1200 / 600 = 2. Dengan aspect 1, rentang NDC horizontal yang sama dibentangkan ke canvas yang lebarnya dua kali tingginya, sehingga gambar meregang ke samping.

---

## Soal 110

Kamera diatur dengan `perspective(60, aspect, 0.0001, 100000)`. Dua permukaan yang hampir berimpit tampak berkedip saling bertukar. Fenomena dan penyebabnya adalah …

- **a.** Aliasing, karena texture filter memakai NEAREST
- **b.** Z-fighting, karena near terlalu dekat ke 0 dan far terlalu jauh sehingga presisi depth buffer tidak cukup
- **c.** Flickering karena tidak memakai double buffering
- **d.** Back-face culling karena winding order salah

**✅ Jawaban: b. Z-fighting, karena near terlalu dekat ke 0 dan far terlalu jauh sehingga presisi depth buffer tidak cukup**

Presisi depth tidak linear: sangat rapat di dekat near plane dan menurun drastis ke arah far. Rentang near–far yang sangat lebar membuat dua permukaan yang berdekatan mendapat nilai depth hampir sama, sehingga depth test bergantian memenangkan salah satunya. Solusinya: naikkan near (misalnya 0.1) dan kecilkan far sesuai kebutuhan scene.

---

## Soal 111

Sebuah vertex memiliki clip coordinate (2, −1, 1, 4). Berapa koordinat NDC-nya setelah perspective divide?

- **a.** (8, −4, 4)
- **b.** (2, −1, 1)
- **c.** (0.5, −0.25, 0.25)
- **d.** (0.5, 0.25, 0.25)

**✅ Jawaban: c. (0.5, −0.25, 0.25)**

$$
\text{NDC} = \left(\frac{x}{w}, \frac{y}{w}, \frac{z}{w}\right) = \left(\frac{2}{4}, \frac{-1}{4}, \frac{1}{4}\right) = (0.5,\; -0.25,\; 0.25)
$$

Pada proyeksi perspektif, w sebanding dengan jarak ke kamera. Titik yang jauh punya w besar sehingga x dan y dibagi angka besar dan tampak lebih kecil. Pada orthographic, w = 1 sehingga tidak ada efek perspektif.

---

## Soal 112

Lengkapi baris vertex shader berikut agar vertex melewati transformasi Model, View, dan Projection dengan urutan yang benar.

```glsl
in vec3 a_position;
uniform mat4 u_model, u_view, u_projection;

void main() {
  gl_Position = ______________________ * vec4(a_position, 1.0);
}
```

**✅ Jawaban: `u_projection * u_view * u_model`**

```glsl
gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
```

Dibaca dari kanan: Model (local → world), lalu View (world → view), lalu Projection (view → clip). Urutan terbalik (`u_model * u_view * u_projection`) memberi hasil yang salah karena perkalian matriks tidak komutatif.

---

## Soal 113

Depth test **tidak** diaktifkan. Persegi B (z = −0.5) digambar lebih dulu, lalu segitiga A (z = −0.75) digambar sesudahnya, dan keduanya beririsan di layar. Apa yang tampak pada area irisan?

- **a.** Persegi B, karena z-nya lebih dekat ke kamera
- **b.** Segitiga A, karena digambar terakhir
- **c.** Campuran warna keduanya
- **d.** Tidak ada yang tampak

**✅ Jawaban: b. Segitiga A, karena digambar terakhir**

Tanpa depth test, fragment yang datang belakangan selalu menimpa isi framebuffer, apa pun nilai z-nya. Hasil 3D jadi bergantung pada urutan draw. Dengan `gl.enable(gl.DEPTH_TEST)`, fragment dengan depth terdekatlah yang dipertahankan.

---

## Soal 114

Pada render loop berikut, depth test sudah diaktifkan, tetapi setelah frame pertama objek yang bergerak tidak tampil dengan benar (sebagian hilang):

```js
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  // ... update matrix & draw ...
  requestAnimationFrame(render);
}
```

Apa perbaikannya?

- **a.** Menghapus `gl.enable(gl.DEPTH_TEST)`
- **b.** Mengganti `requestAnimationFrame` dengan `setInterval`
- **c.** Membersihkan depth buffer juga setiap frame: `gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)`
- **d.** Memanggil `gl.clearColor` dua kali

**✅ Jawaban: c. Membersihkan depth buffer juga setiap frame: `gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)`**

Depth buffer menyimpan kedalaman fragment dari frame sebelumnya. Jika tidak dibersihkan, fragment baru dibandingkan dengan depth lama dan bisa ditolak, sehingga objek yang berpindah posisi tampak hilang sebagian.

---

## Soal 115

Sebuah segitiga memiliki titik P₁(0, 0, 0), P₂(0, 1, 0), dan P₃(0, 0, 1). Face normal segitiga tersebut, dengan $N = (P_2 - P_1) \times (P_3 - P_1)$, adalah …

- **a.** (1, 0, 0)
- **b.** (−1, 0, 0)
- **c.** (0, 1, 0)
- **d.** (0, 0, 1)

**✅ Jawaban: a. (1, 0, 0)**

$v_1 = P_2 - P_1 = (0, 1, 0)$ dan $v_2 = P_3 - P_1 = (0, 0, 1)$.

$$
v_1 \times v_2 = (1 \cdot 1 - 0 \cdot 0,\; 0 \cdot 0 - 0 \cdot 1,\; 0 \cdot 0 - 1 \cdot 0) = (1, 0, 0)
$$

Segitiga berada di bidang x = 0, sehingga normalnya sejajar sumbu X. Jika urutan cross product dibalik ($v_2 \times v_1$), hasilnya (−1, 0, 0): urutan vertex menentukan arah hadap.

---

## Soal 116

Bola low-poly yang sama dirender dua kali. Pada render pertama setiap face terlihat tegas berbeda terang-gelapnya; pada render kedua transisi pencahayaannya halus. Apa yang membedakan keduanya?

- **a.** Jumlah segitiga pada render kedua lebih banyak
- **b.** Render kedua memakai texture
- **c.** Render pertama memakai specular, render kedua tidak
- **d.** Render pertama memakai face normal (flat shading), render kedua memakai vertex normal yang diinterpolasi (smooth shading)

**✅ Jawaban: d. Render pertama memakai face normal (flat shading), render kedua memakai vertex normal yang diinterpolasi (smooth shading)**

- **Flat shading**: satu normal per face → satu hasil lighting per face → sisi terlihat tegas.
- **Smooth shading**: normal per vertex (rata-rata face normal di sekitarnya) diinterpolasi per fragment → pencahayaan berubah bertahap.

Perbedaannya ada pada **normal yang dipakai**, bukan jumlah segitiga.

---

## Soal 117

Sebuah objek diberi non-uniform scaling S(2, 1, 1). Bagaimana cara mentransformasi normalnya agar tetap tegak lurus permukaan?

- **a.** Dikalikan dengan model matrix 4×4 apa adanya
- **b.** Dikalikan dengan normal matrix, yaitu inverse transpose dari bagian 3×3 model matrix
- **c.** Normal tidak perlu ditransformasi
- **d.** Dikalikan dengan projection matrix

**✅ Jawaban: b. Dikalikan dengan normal matrix, yaitu inverse transpose dari bagian 3×3 model matrix**

$$
N' = \left(M_{3 \times 3}^{-1}\right)^{T} N
$$

Pada non-uniform scaling, mengalikan normal dengan model matrix biasa membuatnya tidak lagi tegak lurus permukaan, sehingga lighting salah. Jika hanya ada rotasi dan uniform scaling, bagian 3×3 model matrix sudah cukup, lalu hasilnya dinormalisasi.

---

## Soal 118

Titik permukaan berada di (2, 0, 0) dengan normal N = (0, 1, 0). Point light berada di (2, 4, 3). Jika $k_d = 0.5$ dan $I_l = 1$, berapa intensitas diffuse-nya?

- **a.** 0,3
- **b.** 0,4
- **c.** 0,5
- **d.** 0,8

**✅ Jawaban: b. 0,4**

1. Arah cahaya: $L = \text{normalize}(\text{Light} - \text{Surface}) = \text{normalize}(0, 4, 3)$. Panjang = 5, sehingga $L = (0, 0.8, 0.6)$.
2. $N \cdot L = 0(0) + 1(0.8) + 0(0.6) = 0.8$
3. $I_{diffuse} = k_d \cdot I_l \cdot \max(N \cdot L, 0) = 0.5 \times 1 \times 0.8 = 0.4$

---

## Soal 119

Normal permukaan N = (0, 1, 0) dan arah cahaya L = (0, −1, 0), artinya cahaya datang dari belakang permukaan. Berapa nilai diffuse jika memakai `max(dot(N, L), 0.0)`?

- **a.** −1
- **b.** 1
- **c.** 0
- **d.** 0,5

**✅ Jawaban: c. 0**

$N \cdot L = -1$ (berlawanan arah). Fungsi `max(…, 0.0)` membuang nilai negatif sehingga diffuse = 0. Tanpa `max`, permukaan yang membelakangi cahaya akan mendapat "cahaya negatif" yang mengurangi warna ambient secara tidak wajar.

---

## Soal 120

Posisi lampu dan objek tetap, tetapi kamera digeser ke samping. Komponen model Phong mana yang hasilnya ikut berubah?

- **a.** Specular
- **b.** Ambient
- **c.** Diffuse
- **d.** Tidak ada yang berubah

**✅ Jawaban: a. Specular**

- **Ambient**: konstan, tidak bergantung arah apa pun.
- **Diffuse**: bergantung pada N dan L saja, sehingga tidak berubah ketika kamera bergerak.
- **Specular**: bergantung pada arah pandang V melalui $(R \cdot V)^n$, sehingga highlight ikut bergeser ketika kamera bergerak.

---

## Soal 121

Diketahui $R \cdot V = 0.8$, shininess $n = 2$, $k_s = 1$, dan $I_l = 1$. Berapa intensitas specular-nya?

- **a.** 1,6
- **b.** 0,8
- **c.** 0,4
- **d.** 0,64

**✅ Jawaban: d. 0,64**

$$
I_{specular} = k_s \cdot I_l \cdot \max(R \cdot V, 0)^n = 1 \times 1 \times 0.8^2 = 0.64
$$

Jika shininess dinaikkan menjadi 4, hasilnya $0.8^4 \approx 0.41$. Makin besar shininess, makin cepat nilainya turun saat R menjauh dari V, sehingga highlight makin kecil dan tajam.

---

## Soal 122

Normal N = (0, 1, 0) dan arah ke cahaya L = (0.6, 0.8, 0). Vektor pantulan $R = 2(N \cdot L)N - L$ adalah …

- **a.** (0.6, 0.8, 0)
- **b.** (−0.6, 0.8, 0)
- **c.** (0.6, −0.8, 0)
- **d.** (0, 1.6, 0)

**✅ Jawaban: b. (−0.6, 0.8, 0)**

$N \cdot L = 0.8$, sehingga

$$
R = 2(0.8)(0, 1, 0) - (0.6, 0.8, 0) = (0, 1.6, 0) - (0.6, 0.8, 0) = (-0.6, 0.8, 0)
$$

Komponen yang sejajar normal tetap, komponen yang menyamping dibalik, seperti pantulan cermin. Di GLSL: `reflect(-L, N)`.

---

## Soal 123

Sebuah highlight specular kecil jatuh tepat di tengah sebuah segitiga besar. Pada per-vertex lighting (Gouraud) highlight tersebut hilang, sedangkan pada per-fragment lighting (Phong shading) highlight terlihat. Mengapa?

- **a.** Per-vertex lighting tidak mendukung specular sama sekali
- **b.** Per-fragment lighting memakai texture
- **c.** Per-vertex lighting hanya menghitung cahaya di sudut-sudut segitiga lalu menginterpolasi warnanya, sehingga highlight di tengah segitiga tidak pernah terhitung
- **d.** Per-fragment lighting dijalankan di CPU

**✅ Jawaban: c. Per-vertex lighting hanya menghitung cahaya di sudut-sudut segitiga lalu menginterpolasi warnanya, sehingga highlight di tengah segitiga tidak pernah terhitung**

| Per-vertex (Gouraud) | Per-fragment (Phong shading) |
|---|---|
| lighting di vertex shader | lighting di fragment shader |
| warna diinterpolasi | normal dan posisi diinterpolasi, lighting dihitung per fragment |
| lebih ringan, hasil lebih kasar | lebih berat, hasil lebih halus |

---

## Soal 124

Sumber cahaya yang memancar dari satu titik tetapi dibatasi dalam bentuk kerucut, seperti senter, disebut …

- **a.** Point light
- **b.** Spot light
- **c.** Directional light
- **d.** Ambient light

**✅ Jawaban: b. Spot light**

- **Point light**: dari satu titik ke segala arah (bohlam).
- **Directional light**: sangat jauh, sinar sejajar (matahari); di koordinat homogen ditulis dengan w = 0.
- **Spot light**: dari satu titik, dibatasi kerucut (senter, lampu panggung).
- **Ambient light**: cahaya lingkungan rata tanpa arah.

---

## Soal 125

Texture berukuran 512 × 256 pixel dipasang pada sebuah quad. Koordinat UV (0.5, 0.5) mengacu pada …

- **a.** Pixel ke-(0, 0) di kiri bawah texture
- **b.** Pixel ke-(256, 128) di world space
- **c.** Titik (0.5, 0.5) di layar
- **d.** Titik tengah gambar texture, berapa pun ukuran pixelnya

**✅ Jawaban: d. Titik tengah gambar texture, berapa pun ukuran pixelnya**

UV dinormalisasi ke rentang 0–1: (0, 0) kiri bawah, (1, 1) kanan atas, (0.5, 0.5) tengah. Karena itu texture bisa diganti ke resolusi lain (misalnya 1024 × 512) tanpa mengubah data UV pada vertex. UV bukan koordinat world maupun layar.

---

## Soal 126

Istilah **texel** dalam texture mapping berarti …

- **a.** Elemen data (titik warna) pada gambar texture
- **b.** Pixel pada framebuffer
- **c.** Vertex yang memiliki UV
- **d.** Fungsi untuk memuat gambar

**✅ Jawaban: a. Elemen data (titik warna) pada gambar texture**

**Texel** (*texture element*) adalah elemen pada gambar texture; **pixel** adalah elemen pada layar/framebuffer. Saat sampling, satu fragment mengambil satu texel atau menginterpolasi beberapa texel di sekitarnya, tergantung filtering.

---

## Soal 127

Perhatikan kode berikut. Objek tampil hitam karena sampler tidak membaca texture yang benar. Lengkapi argumen yang kosong.

```js
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, brickTexture);
gl.uniform1i(uTextureLoc, ___);
```

**✅ Jawaban: `1`**

```js
gl.uniform1i(uTextureLoc, 1);
```

Texture di-bind ke **texture unit 1** (`gl.TEXTURE1`). Uniform `sampler2D` diisi **nomor unit** yang harus dibaca, bukan objek texture-nya. Jika diisi 0, sampler membaca unit 0 yang tidak berisi `brickTexture`.

---

## Soal 128

Sebuah game bergaya pixel-art memakai texture 16 × 16 yang diperbesar di layar. Developer ingin setiap pixel texture tetap terlihat tajam dan kotak-kotak. Filter yang tepat untuk `TEXTURE_MAG_FILTER` adalah …

- **a.** `gl.LINEAR`
- **b.** `gl.REPEAT`
- **c.** `gl.NEAREST`
- **d.** `gl.CLAMP_TO_EDGE`

**✅ Jawaban: c. `gl.NEAREST`**

```js
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
```

- **NEAREST**: ambil satu texel terdekat → tajam, kotak-kotak (cocok untuk pixel-art).
- **LINEAR**: interpolasi beberapa texel → halus tetapi blur (cocok untuk gaya realistis).

`REPEAT` dan `CLAMP_TO_EDGE` adalah wrapping mode, bukan filter.

---

## Soal 129

Sebuah lantai memakai UV dari (0, 0) sampai (4, 4) dengan wrapping mode `gl.REPEAT` pada arah S dan T. Bagaimana tampilan texture-nya?

- **a.** Texture hanya tampil sekali di pojok kiri bawah
- **b.** Texture diregangkan memenuhi lantai satu kali
- **c.** Texture terulang dengan pola cermin
- **d.** Texture terulang 4 × 4 = 16 kali

**✅ Jawaban: d. Texture terulang 4 × 4 = 16 kali**

- **REPEAT**: bagian pecahan UV yang dipakai (UV 1,5 ≈ 0,5), sehingga texture berulang periodik.
- **CLAMP_TO_EDGE**: UV dikunci ke 0–1; di luar itu memakai warna tepi texture.
- **MIRRORED_REPEAT**: berulang dengan pola cermin bergantian.

---

## Soal 130

Apa kelemahan utama representasi objek kompleks dengan **symbol-instance table**?

- **a.** Tidak bisa menyimpan transformasi scale
- **b.** Tidak mampu menyatakan hubungan antarbagian di dalam model
- **c.** Tidak bisa dipakai untuk objek 3D
- **d.** Membutuhkan texture untuk setiap symbol

**✅ Jawaban: b. Tidak mampu menyatakan hubungan antarbagian di dalam model**

Symbol-instance table menyimpan setiap instance (symbol + scale, rotate, translate) secara terpisah. Hubungan seperti "roda menempel pada chassis dan ikut bergerak bersamanya" tidak terwakili. Karena itu hierarchical modeling memakai **graph/tree**, dengan edge yang menyimpan transformasi relatif parent → child.

---

## Soal 131

Pada model mobil, keempat roda identik. Struktur apa yang memungkinkan cukup **satu** node roda yang dipakai empat kali dengan transformasi berbeda?

- **a.** Tree biasa
- **b.** Linked list
- **c.** DAG (Directed Acyclic Graph)
- **d.** Symbol-instance table

**✅ Jawaban: c. DAG (Directed Acyclic Graph)**

Pada tree, setiap node (kecuali root) hanya punya satu parent sehingga dibutuhkan empat node roda. Pada **DAG**, satu node Wheel bisa ditunjuk oleh empat edge dari Chassis, masing-masing membawa matrix transformasinya sendiri (posisi kiri-depan, kanan-depan, dan seterusnya). Tidak ada cycle.

---

## Soal 132

Pada robot arm (Base → Lower arm → Upper arm), nilai `theta[LowerArm]` diubah. Bagian mana yang ikut bergerak?

- **a.** Hanya lower arm
- **b.** Base, lower arm, dan upper arm
- **c.** Hanya upper arm
- **d.** Lower arm dan upper arm

**✅ Jawaban: d. Lower arm dan upper arm**

Matrix upper arm adalah $R_b \cdot T_{lu} \cdot R_{lu} \cdot T_{uu} \cdot R_{uu}$, sehingga memuat $R_{lu}$ (rotasi lower arm). Perubahan pada parent ikut memengaruhi semua child-nya. Base adalah parent dari lower arm, sehingga tidak terpengaruh.

---

## Soal 133

Pada struktur **left-child right-sibling**, setiap node menyimpan dua pointer. Pointer apa saja itu?

- **a.** Pointer ke child (anak paling kiri) dan pointer ke sibling (saudara di level yang sama)
- **b.** Pointer ke parent dan pointer ke root
- **c.** Pointer ke texture dan pointer ke shader
- **d.** Pointer ke vertex pertama dan vertex terakhir

**✅ Jawaban: a. Pointer ke child (anak paling kiri) dan pointer ke sibling (saudara di level yang sama)**

Selain dua pointer itu, setiap node menyimpan fungsi render bagiannya dan matrix transformasi relatif terhadap parent:

```js
function createNode(transform, render, sibling, child) {
  return { transform, render, sibling, child };
}
```

Dengan struktur ini, node yang punya banyak anak cukup menunjuk anak pertama; anak-anak lain dihubungkan lewat pointer sibling.

---

## Soal 134

Perhatikan fungsi traversal berikut:

```js
function traverse(Id) {
  if (Id == null) return;
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  figure[Id].render();
  if (figure[Id].child != null) traverse(figure[Id].child);
  modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}
```

Mengapa `stack.pop()` dilakukan **sebelum** mengunjungi sibling?

- **a.** Agar sibling digambar dengan warna berbeda
- **b.** Karena sibling tidak boleh mewarisi transformasi node saat ini; sibling harus mulai dari matrix parent yang sama
- **c.** Agar stack tidak penuh
- **d.** Karena sibling harus digambar sebelum child

**✅ Jawaban: b. Karena sibling tidak boleh mewarisi transformasi node saat ini; sibling harus mulai dari matrix parent yang sama**

Contohnya head dan left-upper-arm sama-sama anak torso. Setelah head dan seluruh anaknya selesai, matrix dikembalikan ke matrix torso (pop), lalu left-upper-arm dikalikan dengan transformasinya sendiri. Tanpa pop, lengan akan ikut tergeser dan terputar seperti kepala.

---

## Soal 135

Sebuah tata surya sederhana dimodelkan dengan left-child right-sibling:

- Matahari: child = Bumi, sibling = null
- Bumi: child = Bulan, sibling = Mars
- Bulan: child = null, sibling = null
- Mars: child = null, sibling = null

Tuliskan urutan objek yang digambar oleh `traverse(Matahari)` (preorder), serta matrix model-view yang dipakai saat menggambar Bulan.

**✅ Jawaban: Matahari → Bumi → Bulan → Mars; Bulan digambar dengan M_matahari · M_bumi · M_bulan**

Traversal preorder: gambar node, kunjungi child, lalu kunjungi sibling.

1. Matahari (model-view = $M_{matahari}$)
2. Bumi, child Matahari ($M_{matahari} \cdot M_{bumi}$)
3. Bulan, child Bumi ($M_{matahari} \cdot M_{bumi} \cdot M_{bulan}$)
4. Pop kembali ke matrix Matahari, lalu Mars, sibling Bumi ($M_{matahari} \cdot M_{mars}$)

```
Matahari
├── Bumi
│    └── Bulan
└── Mars
```

Karena matrix Bulan memuat $M_{bumi}$, Bulan ikut mengorbit bersama Bumi. Mars tidak terpengaruh rotasi Bumi.

---

## Soal 136

Pada fungsi `torso()` di model humanoid:

```js
instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
```

Mengapa scaling torso disimpan di `instanceMatrix`, bukan langsung di `modelViewMatrix`?

- **a.** Agar scaling torso tidak diwariskan ke child (kepala, lengan, kaki)
- **b.** Karena `modelViewMatrix` tidak bisa dikalikan dengan scale
- **c.** Agar torso tidak perlu digambar
- **d.** Karena `instanceMatrix` lebih cepat dikirim ke GPU

**✅ Jawaban: a. Agar scaling torso tidak diwariskan ke child (kepala, lengan, kaki)**

`instanceMatrix` mengubah kubus satuan menjadi bentuk torso (translate + scale) hanya untuk menggambar torso. `modelViewMatrix` tetap bersih dan diwariskan ke child. Kalau scale dimasukkan ke `modelViewMatrix`, kepala dan lengan ikut melebar atau memanjang sesuai ukuran torso.

---

## Soal 137

Posisi seluruh humanoid figure ditentukan oleh sudut-sudut joint. Ada berapa sudut joint yang dibutuhkan?

- **a.** 9
- **b.** 10
- **c.** 11
- **d.** 12

**✅ Jawaban: c. 11**

Head memiliki 2 sudut (misalnya angguk dan geleng), sedangkan 9 bagian lain masing-masing 1 sudut: torso, 4 upper (lengan/kaki), dan 4 lower. Totalnya 2 + 9 = **11** sudut, disimpan di `theta[11]`. Matrix yang relevan ada 10: M (torso), M_h, 4 matrix upper, dan 4 matrix lower.

---

## Soal 138

Kode berikut tidak menampilkan apa pun di canvas, padahal tidak ada error di console:

```js
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const loc = gl.getAttribLocation(program, "a_position");
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

Baris apa yang terlupa?

- **a.** `gl.clearColor(0, 0, 0, 1);`
- **b.** `gl.enable(gl.DEPTH_TEST);`
- **c.** `gl.generateMipmap(gl.TEXTURE_2D);`
- **d.** `gl.enableVertexAttribArray(loc);`

**✅ Jawaban: d. `gl.enableVertexAttribArray(loc);`**

Attribute harus diaktifkan agar vertex shader membaca datanya dari buffer. Tanpa `enableVertexAttribArray`, attribute memakai nilai konstan default (0, 0, 0, 1), sehingga ketiga vertex berada di titik yang sama dan segitiganya tidak punya luas.

---

## Soal 139

Lengkapi potongan fragment shader (per-fragment lighting) berikut agar komponen specular model Phong terhitung dengan benar.

```glsl
vec3 N = normalize(v_normal);
vec3 L = normalize(u_lightPosition - v_worldPosition);
vec3 V = normalize(u_cameraPosition - v_worldPosition);

float diff = max(dot(N, L), 0.0);
vec3  R    = reflect(____(1)____, N);
float spec = 0.0;
if (diff > 0.0)
    spec = pow(max(dot(R, V), 0.0), ____(2)____);
```

**✅ Jawaban: (1) `-L`, (2) `u_shininess`**

```glsl
vec3  R    = reflect(-L, N);
...
spec = pow(max(dot(R, V), 0.0), u_shininess);
```

- `reflect(I, N)` membutuhkan arah **datang** cahaya. L menunjuk dari permukaan ke cahaya, sehingga arah datangnya adalah `-L`.
- Pangkat `pow` adalah shininess, yang mengatur ukuran dan ketajaman highlight.
- `if (diff > 0.0)` mencegah highlight muncul pada sisi yang membelakangi cahaya.

---

## Soal 140

Jelaskan secara berurutan perjalanan sebuah segitiga dari data di JavaScript sampai tampil di canvas WebGL.

**✅ Jawaban (poin-poin utama):**

1. **Data vertex** disiapkan di JavaScript sebagai `Float32Array`.
2. **Upload ke GPU**: `createBuffer` → `bindBuffer(gl.ARRAY_BUFFER, …)` → `bufferData`.
3. **Shader program**: vertex dan fragment shader di-compile, di-link, lalu `useProgram`.
4. **Hubungkan attribute**: `getAttribLocation` → `enableVertexAttribArray` → `vertexAttribPointer` (size, type, stride, offset).
5. **Uniform** (matrix, warna, dan lain-lain) dikirim dengan `gl.uniform*`.
6. **Draw call**: `gl.drawArrays(gl.TRIANGLES, 0, 3)`.
7. **Vertex shader** berjalan sekali per vertex dan menghasilkan `gl_Position` (clip space).
8. **Primitive assembly** merakit 3 vertex menjadi segitiga; **clipping** membuang bagian di luar view volume.
9. **Perspective divide** (÷w) → NDC, lalu **viewport transform** → koordinat pixel.
10. **Rasterization** mengubah segitiga menjadi fragment dan menginterpolasi data `out` (warna, UV, normal).
11. **Fragment shader** menentukan warna setiap fragment.
12. **Depth test/blending**, lalu hasilnya ditulis ke **framebuffer** dan tampil di **canvas**.
