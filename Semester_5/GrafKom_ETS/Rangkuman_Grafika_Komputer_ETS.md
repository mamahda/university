# Rangkuman Materi Grafika Komputer (Persiapan ETS)

EF234504 · Grafika Komputer

Dari **pixel** sampai **hierarchical model**: penjelasan P1–P5 + Hierarchical Modeling, dilengkapi contoh soal yang sering muncul.

> Sumber: slide Pertemuan 1–5, Hierarchical Modelling I & II, modul praktikum 1–5, latihan soal.

**Cara baca:** ikuti urutan bab. Teks **tebal** = kata kunci wajib hafal. Tanda ⚠️ = jebakan / sering salah. Bagian akhir berisi **contoh soal + kunci** dan **cheat sheet** rumus.

---

## Daftar Isi

0. [Peta Materi](#0-peta-materi)
1. [Pengenalan Grafika Komputer (P1)](#1-pengenalan-grafika-komputer-p1)
2. [WebGL Fundamental & GLSL Basics (P2)](#2-webgl-fundamental--glsl-basics-p2)
3. [Transformation & Coordinate System (P3)](#3-transformation--coordinate-system-p3)
4. [Camera, Projection & 3D (P4)](#4-camera-projection--3d-p4)
5. [Lighting, Shading & Texture (P5)](#5-lighting-shading--texture-p5)
6. [Hierarchical Modeling](#6-hierarchical-modeling)
7. [Contoh Soal & Pembahasan](#7-contoh-soal--pembahasan)
8. [Cheat Sheet](#8-cheat-sheet)

---

## 0. Peta Materi

Semua materi adalah satu cerita: **graphics pipeline**.

```
Vertex Data ──► Vertex Shader ──► Primitive Assembly ──► Rasterization ──► Fragment Shader ──► Framebuffer
(buffer,        (transformasi      (+ clipping)           (→ fragment)      (lighting,          (depth test)
 attribute)      MVP)                                                         texture)
```

| Pertemuan | Topik utama | Bagian pipeline |
|---|---|---|
| P1 Pengenalan | pixel, raster/vector, mesh, scene, CPU/GPU, pipeline | gambaran keseluruhan |
| P2 WebGL & GLSL | context, NDC, buffer, attribute, uniform, shader, draw call | vertex data → shader |
| P3 Transformasi | translate, rotate, scale, homogeneous, urutan, model matrix | vertex shader (Model) |
| P4 Camera & Proyeksi | view, lookAt, ortho vs perspective, MVP, depth buffer | vertex shader (View, Projection) + depth test |
| P5 Lighting & Texture | normal, Phong, flat/smooth, UV, filtering, wrapping | fragment shader |
| Hierarchical | tree, DAG, matrix stack, traversal | cara menyusun banyak model matrix |

---

## 1. Pengenalan Grafika Komputer (P1)

### 1.1 Apa itu Grafika Komputer?

Computer Graphics adalah bidang ilmu yang mempelajari bagaimana komputer:

- **merepresentasikan** objek visual
- membentuk gambar & memanipulasi objek dan gambar
- melakukan **rendering**
- menghasilkan animasi & menyediakan interaksi visual

> **Intinya:** grafika komputer mempelajari bagaimana **data numerik diubah menjadi sesuatu yang dapat dilihat manusia**.

Komputer tidak paham "mobil" atau "pohon". Yang dipahami hanya data: posisi, koordinat, ukuran, bentuk, warna, texture, arah cahaya, material.

```
DATA ──► GEOMETRY & ATTRIBUTES ──► RENDERING ──► IMAGE
(angka)  (posisi, warna, material,  (hitung cahaya,  (gambar yang
          texture, dll.)             warna tiap pixel) dilihat manusia)
```

### 1.2 Graphics vs Image Processing vs Computer Vision

| Bidang | Input → Output | Tujuan | Contoh |
|---|---|---|---|
| **Computer Graphics** | Data / Model → **Image** | **membuat** gambar dari data | render model 3D mobil |
| **Image Processing** | Image → **Modified Image** | **memodifikasi** gambar | blur, sharpening, noise reduction |
| **Computer Vision** | Image → **Information** | **memahami** informasi dari gambar | object detection, face recognition |

> Jembatan keledai: Graphics = **membuat** visual · Processing = **mengubah** visual · Vision = **memahami** visual.

**Aplikasi grafika:** game, film & visual effects, CAD (desain produk, mesin, arsitektur), scientific visualization (cuaca, fluida), medical visualization (CT scan, MRI), AR (objek virtual ditempel ke dunia nyata), VR (dunia virtual imersif), digital twin, GIS, UI, web graphics (WebGL/Canvas).

### 1.3 Frame, FPS, dan Frame Time

- **Frame** = satu gambar lengkap yang dirender pada satu waktu.
- **FPS** (Frames Per Second) = jumlah frame yang ditampilkan setiap detik. Semakin tinggi FPS → gerakan makin halus.
- **Frame time** = waktu untuk merender satu frame (milidetik).

$$\text{Frame Time (ms)} = \frac{1000}{\text{FPS}}$$

| FPS | Frame time | Kesan |
|---|---|---|
| 20 | 50.00 ms | sangat patah-patah |
| 30 | 33.33 ms | mulai terasa patah |
| **60** | **16.67 ms** | halus, target umum game |
| 90 | 11.11 ms | sangat halus (kompetitif/VR) |
| 120 | 8.33 ms | sangat responsif |

> Frame time **kecil** → FPS **tinggi** → halus. Frame time besar → FPS rendah → ⚠️ **stuttering** (patah-patah) & input delay naik.

### 1.4 Representasi visual (1/4): Raster Graphics

Grafika komputer dapat direpresentasikan dalam tiga bentuk utama: **Raster**, **Vector**, dan **3D**. Kita bahas satu per satu.

**Raster graphics = gambar yang disusun dari grid pixel.** Bayangkan kertas kotak-kotak: setiap kotak kecil (**pixel**, *picture element*) diisi satu warna. Kalau kotaknya sangat banyak dan kecil, mata melihatnya sebagai gambar utuh.

- Setiap pixel memiliki **warna dan intensitas** sendiri.
- Tersusun dari pixel → **bergantung pada resolusi**.
- Diperbesar terlalu jauh → kotak-kotaknya terlihat: ⚠️ **pixelated**.
- Cocok untuk **foto, texture, dan dunia nyata** (gradasi warna kompleks).

**Cara raster image dibentuk:**

```
1. Adegan nyata ──► 2. Sampling jadi grid pixel ──► 3. Tiap pixel simpan nilai warna (R, G, B)
```

Sampling = mengambil nilai warna di titik-titik grid. Makin rapat grid (resolusi tinggi) → makin mirip aslinya.

> Insight slide: raster sangat efisien untuk menyimpan foto dan texture, tetapi tidak ideal untuk objek seperti logo karena akan pixelated saat diperbesar.

### 1.5 Pixel, RGB/RGBA, dan Resolusi

Satu pixel menyimpan nilai warna, misalnya R = 120, G = 160, B = 190. Dengan 8-bit per channel, rentangnya 0–255. **WebGL memakai rentang 0.0 – 1.0.**

| Kedalaman | Jumlah warna |
|---|---|
| 8-bit / channel | 256 nilai per channel |
| 24-bit (RGB) | ± 16,7 juta warna |
| 32-bit (RGBA) | 16,7 juta warna + **Alpha** |

> **Alpha:** A = 1 → **opaque** (tidak tembus) · A = 0 → **transparan penuh**. Framebuffer menyimpan warna sebagai 4 komponen **RGBA**.

**Resolusi** = jumlah pixel horizontal × vertikal.

| Resolusi | Jumlah pixel |
|---|---|
| 640 × 360 (SD) | 230.400 |
| 1280 × 720 (HD) | 921.600 |
| 1920 × 1080 (Full HD) | **2.073.600** |
| 2560 × 1440 (2K) | 3.686.400 |
| 3840 × 2160 (4K) | 8.294.400 |

- Resolusi rendah → gambar kasar (pixelated), tapi **FPS naik**.
- Resolusi tinggi → tajam & detail, tapi **beban render berat** (FPS turun).

### 1.6 Representasi visual (2/4): Vector Graphics

Vector **tidak menyimpan pixel**. Yang disimpan adalah **resep matematisnya**, misalnya "lingkaran dengan pusat (50, 50) dan jari-jari 20, isi merah". Saat ditampilkan, komputer **menghitung ulang** bentuknya sesuai ukuran layar.

| Unsur | Arti |
|---|---|
| **Point, Line, Curve, Circle, Polygon** | bentuk dasar matematis |
| **Path** | kumpulan garis & kurva yang membentuk objek |
| **Bezier curve** | kurva yang dibentuk oleh **anchor point** dan **handle** |
| **Fill & Stroke** | warna isi (fill) dan garis tepi (stroke) dapat diatur |

- Sifat utama: **Resolution Independent**. Karena tidak bergantung susunan pixel tetap, vector **tetap tajam pada semua ukuran**, ukuran file relatif kecil, mudah diubah bentuk/warnanya.
- Cocok untuk: logo, ikon, diagram, ilustrasi, UI, tipografi. Format: .svg, .ai, .eps, .pdf.

### 1.7 Representasi visual (3/4): Raster vs Vector

Setelah memahami keduanya, perbedaannya terletak pada **cara objek direpresentasikan dan digambar**:

| Aspek | RASTER (Bitmap) | VECTOR (Bentuk Matematis) |
|---|---|---|
| Dasar representasi | berbasis **pixel** | berbasis bentuk matematis (garis, kurva, bentuk) |
| Skalabilitas | resolusi tetap | **resolution independent** |
| Kualitas saat diperbesar | ⚠️ pixelated / pecah | tetap tajam dan halus |
| Detail | sangat baik untuk gradasi warna & detail kompleks | lebih terstruktur, berbasis bentuk & garis |
| Cocok untuk | foto, gambar kompleks, texture | logo, ikon, diagram, ilustrasi |
| Contoh file | .jpg .png .bmp .gif | .svg .ai .eps .pdf |

> Tidak ada representasi yang selalu lebih baik. Contoh: foto liburan → raster; logo yang dicetak di kartu nama dan baliho → vector.

### 1.8 Representasi visual (4/4): 3D Graphics

3D graphics merepresentasikan objek dalam **tiga dimensi**. Bedanya dengan 2D: ada sumbu ketiga, **Z**, untuk kedalaman.

| Sumbu | Dimensi | Arah |
|---|---|---|
| **X** | Width (lebar) | kiri – kanan |
| **Y** | Height (tinggi) | bawah – atas |
| **Z** | Depth (kedalaman) | depan – belakang |

- 2D: **P = (x, y)** · 3D: **P = (x, y, z)**
- Sistem koordinat dipakai untuk menentukan **posisi dan orientasi** objek di ruang virtual.
- Objek 3D tersusun dari **vertex, edge, face, mesh**; dapat diberi **material, texture, dan pencahayaan**; dipakai untuk game 3D, animasi, simulasi.

**Ringkasan tiga representasi:**

| | Raster | Vector | 3D |
|---|---|---|---|
| Tersusun dari | grid pixel | kurva, garis, objek matematis | vertex, edge, face, mesh |
| Ciri utama | bergantung resolusi; diperbesar → pecah | bisa diperbesar tanpa pecah; file kecil | punya koordinat X, Y, Z |
| Cocok untuk | foto, texture, game | logo, ilustrasi, UI/UX | game 3D, animasi, simulasi |

### 1.9 Koordinat 2D, 3D, dan arah sumbu

Sistem koordinat (Cartesian) dipakai untuk menentukan **posisi, arah, rotasi, dan transformasi** objek.

```
 Right-handed (OpenGL/WebGL)        Left-handed (Unity)
        +Y                                +Y
         │                                 │   +Z (masuk layar)
         │                                 │  /
         └──── +X                          └──── +X
        /
      +Z (keluar layar, ke arah kita)
```

> ⚠️ Orientasi sumbu **bisa berbeda** antar software & API. OpenGL/WebGL memakai **right-handed**: X kanan, Y atas, **Z keluar layar**. Unity left-handed (Z masuk layar), Blender memakai Z sebagai atas.

### 1.10 Vertex, Edge, Face → Mesh

**Bahan dasar objek 3D:**

- **VERTEX** = titik dalam ruang, satu posisi (x, y, z). Contoh: V0 = (0,0,0), V1 = (1,0,0), V2 = (0,1,0). Selain posisi, vertex **juga dapat memiliki** color, normal, dan texture coordinate (dipakai di P2 dan P5).
- **EDGE** = garis penghubung dua vertex. Contoh: edge V0–V1, V1–V2, V2–V0.
- **FACE** = permukaan yang dibentuk beberapa vertex. Tiga edge di atas menutup sebuah bidang: face segitiga V0-V1-V2.

```
VERTEX ──► EDGE ──► FACE ──► TRIANGLE ──► MESH
titik      penghubung  bidang dari   primitive    kumpulan triangle
(x,y,z)    2 vertex    beberapa      dasar        → permukaan objek
                       vertex
```

**Kenapa harus triangle?**
- Selalu **planar** (satu bidang datar)
- Sederhana: 3 vertex, 3 edge
- Mudah & cepat dihitung, **efisien untuk GPU**
- Kombinasinya bisa membentuk objek apa pun

**Polygon count:** cube = sedikit triangle, prop = ratusan/ribuan, karakter = puluhan ribu. Makin banyak triangle → ⚠️ biaya proses geometry makin besar.

### 1.11 Komponen Scene

**Object, Transform, dan Scene**

$$\text{Object} = \text{Mesh} + \text{Transform}$$

Mesh menjawab "bentuknya seperti apa". Transform menjawab "di mana, menghadap ke mana, dan seberapa besar". Mesh kursi yang sama bisa dipakai untuk 10 kursi dengan transform berbeda.

| Transform | Menentukan | Contoh |
|---|---|---|
| **Position** (x, y, z) | letak objek | kursi di (2, 0, −3) |
| **Rotation** (x, y, z) | arah hadap | diputar 90° di sumbu Y |
| **Scale** (x, y, z) | ukuran | dua kali lebih besar |

**Scene** = kumpulan komponen yang membentuk **dunia virtual** (camera, light, character, ground, building, tree). Alur: Scene → Camera view → Geometri → Rasterization → Fragment processing → **Gambar akhir (framebuffer)**.

**Camera** menentukan **bagian scene yang terlihat**, seperti kamera foto.

| Parameter | Arti |
|---|---|
| Position | di mana kamera berada |
| Orientation | ke mana kamera menghadap |
| **FOV** (Field of View) | seberapa lebar sudut pandang |
| **Projection** | perspective (jauh = kecil) atau orthographic (ukuran tetap) |

**Light** menentukan **bagaimana objek terlihat**. Parameter: position, direction, intensity, color.
- **Point light**: dari satu titik, memancar ke segala arah (bohlam).
- **Directional light**: sangat jauh, semua sinar sejajar (matahari).
- **Spot light**: dari satu titik, dibatasi bentuk kerucut (senter).

**Material** = bagaimana **permukaan berinteraksi dengan cahaya**: color, roughness (kasar → menyebarkan cahaya halus), metallic (memantulkan lingkungan), transparency (meloloskan sebagian cahaya), emission (memancarkan cahaya sendiri).

**Texture** = **gambar yang dipetakan** ke permukaan objek. Texture **menambah detail visual tanpa menambah banyak geometry**: kubus tetap 12 segitiga, tapi terlihat seperti tumpukan bata.

### 1.12 Rendering, CPU & GPU

**Rendering** adalah proses **menghasilkan gambar dari data scene** (geometry, transform, camera, material, texture, lighting → final image).

- **Offline rendering:** gambar dihitung tanpa batas waktu ketat (satu frame boleh berjam-jam); kualitas sangat tinggi; umum pada **film**.
- **Real-time rendering:** gambar harus selesai dalam hitungan milidetik (30–60+ FPS) karena pengguna berinteraksi langsung; **optimasi performa sangat penting**; umum pada **game dan simulator**.

**CPU vs GPU:**

| CPU (Central Processing Unit) | GPU (Graphics Processing Unit) |
|---|---|
| sedikit core, tiap core kuat | banyak core kecil, kerja paralel |
| general purpose: pekerjaan beragam & penuh keputusan | operasi serupa pada data yang sangat banyak secara bersamaan |
| logic & branching, application logic, menyiapkan scene, **mengirim perintah** ke GPU | vertex processing, pixel/fragment processing, operasi matrix, **seluruh proses rendering** |

> Analogi: CPU seperti beberapa ahli yang bisa mengerjakan soal apa saja. GPU seperti ribuan pekerja yang masing-masing mengerjakan soal sederhana yang sama, tapi semuanya bersamaan.

**Kenapa rendering cocok di GPU?** Layar 1920×1080 punya **lebih dari 2 juta pixel**, dan perhitungan satu pixel/vertex **tidak bergantung** pada pixel/vertex lain → cocok untuk **massively parallel processing**.

**Kerja sama CPU, GPU, VRAM:** CPU *prepare scene* → CPU *send commands* (draw call) → GPU *render* (pakai data di VRAM) → framebuffer → *display*.

VRAM (memori GPU) menyimpan: **vertex buffer** (posisi, normal, atribut), **index buffer** (indeks pembentuk primitive), **texture**, **framebuffer** (warna per pixel), **shader data**.

### 1.13 Framebuffer, Double Buffering, Graphics API

**Framebuffer** = area memori yang **menampung pixel hasil rendering** sebelum ditampilkan. Isinya:
- **Color buffer** – warna RGBA tiap pixel
- **Depth buffer (Z-buffer)** – kedalaman tiap pixel
- **Stencil buffer** – masking/efek khusus

**Double buffering:**
```
[ Front buffer ]  ⇄ swap ⇄  [ Back buffer ]
 sedang tampil               sedang digambar
```
Setelah back buffer selesai, keduanya ditukar → yang tampil **selalu gambar lengkap**, tidak ada render parsial / flicker.

**Graphics API:** aplikasi ⚠️ **tidak berkomunikasi langsung** dengan GPU, tetapi lewat Graphics API: OpenGL, Direct3D, Vulkan, Metal, WebGL.

```
Application (JavaScript) → WebGL API → Graphics Driver → GPU → Framebuffer → Canvas
```

**Perangkat I/O** (sering ditanya): output = CRT/monitor, printer; input = mouse, keyboard, joystick, data tablet; **touchscreen** = input & output, bisa berinteraksi langsung dengan pixel di layar.

### 1.14 Graphics Pipeline

Graphics pipeline = rangkaian proses yang mengubah data geometry menjadi image di layar.

```
Vertex Data → Vertex Processing → Primitive Assembly → Rasterization → Fragment Processing → Framebuffer → Screen
```

**Tahap geometry (belum ada pixel):**
1. **Vertex Data** – geometry direpresentasikan sebagai **kumpulan vertex** (titik-titik lepas, belum ada bentuk).
2. **Vertex Processing** – setiap vertex diproses satu per satu: **transformation**, position calculation, normal transformation.
3. **Primitive Assembly** – vertex yang sudah diproses **digabung menjadi primitive**: point, line, atau triangle.

**Tahap pixel:**
4. **Rasterization** – primitive diubah menjadi **kandidat pixel (fragment)**: pixel mana saja yang tertutup segitiga.
5. **Fragment Processing** – menentukan **warna akhir** tiap fragment memakai color, texture, lighting, shadow, transparency.
6. **Framebuffer** – menyimpan hasil rendering sebelum ditampilkan ke layar.

- Pipeline **mengubah model 3D menjadi gambar 2D** dan dilalui **setiap frame**.
- **Fragment** = **kandidat pixel** (belum tentu jadi pixel akhir, bisa ditolak depth test).
- Tools berubah (WebGL, Three.js, Blender, Unity), **konsep pipeline tetap sama**.

### 1.15 Praktikum 1: HTML Canvas 2D

```
(0,0) ─────────► X
  │
  │   • (100,100)
  ▼
  Y   (Y bertambah ke BAWAH)
```

- `fillRect(x, y, width, height)` · `arc(cx, cy, r, 0, Math.PI*2)`
- Triangle tidak punya fungsi khusus → pakai path `moveTo / lineTo / closePath`
- Posisi mouse ke koordinat canvas: `event.clientX - rect.left`

```javascript
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();   // ubah state/posisi
  draw();     // gambar scene
  requestAnimationFrame(animate);
}
animate();
```

Pola: **Update State → Clear → Draw → Next Frame**. Tanpa clear, gambar frame lama tetap ada di canvas (meninggalkan jejak).

Canvas 2D = high-level drawing API · WebGL = GPU-oriented graphics API. Konsep yang tetap: coordinate, primitive, frame, animation loop, color.

---

## 2. WebGL Fundamental & GLSL Basics (P2)

### 2.1 WebGL = API grafika low-level di browser

**WebGL** (Web Graphics Library) memungkinkan **JavaScript menggunakan GPU** untuk grafika 2D/3D, game web, simulasi, visualisasi.

> ⚠️ **WebGL BUKAN scene framework.** WebGL tidak otomatis menyediakan scene, camera, mesh, light, material. Programmer menyiapkan sendiri: data vertex, buffer, shader, attribute, state, dan draw call. (Framework seperti **Three.js** yang membungkus semua ini.)

Mekanisme dasar: **1. Prepare Data → 2. Upload to GPU → 3. Run Shader → 4. Draw**

| # | Langkah | Fungsi kunci |
|---|---|---|
| 1 | Create Canvas | `<canvas>` |
| 2 | Get WebGL2 Context | `getContext("webgl2")` |
| 3 | Prepare Vertex Data | `Float32Array` |
| 4 | Create Buffer | `createBuffer / bufferData` |
| 5 | Create & Compile Shader | `compileShader` |
| 6 | Link Shader Program | `linkProgram` |
| 7 | Connect Attribute | `vertexAttribPointer` |
| 8 | Draw | `drawArrays` |

### 2.2 Canvas, WebGL2 Context, dan membersihkan layar

```javascript
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
if (!gl) { alert("WebGL2 tidak tersedia"); }

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.05, 0.08, 0.15, 1.0); // R,G,B,A
gl.clear(gl.COLOR_BUFFER_BIT);
```

- Canvas hanya **area tampilan**; WebGL belum jalan sampai context diminta.
- `gl` = **interface utama** untuk memanggil operasi WebGL.
- Context bisa gagal (`null`) jika browser tidak mendukung, hardware acceleration mati, atau GPU/driver bermasalah.
- `gl.clearColor(r, g, b, a)` menentukan **warna background**; baru benar-benar diisi saat `gl.clear(gl.COLOR_BUFFER_BIT)`.
- `gl.viewport(x, y, w, h)` menentukan area framebuffer yang dipetakan ke Canvas.

**Warna di WebGL (RGBA 0.0–1.0):** merah (1,0,0) · hijau (0,1,0) · biru (0,0,1) · putih (1,1,1) · hitam (0,0,0). `vec4(0.0, 0.0, 1.0, 1.0)` = **biru solid**.

### 2.3 Canvas Coordinate vs NDC

```
Canvas 2D (pixel)                 WebGL NDC
(0,0)──────► X                (-1, 1)┌─────────┐(1, 1)
  │                                  │    ▲ Y   │
  │                                  │    │     │
  ▼ Y                                │  (0,0)──►X
       (width,height)                │          │
                              (-1,-1)└─────────┘(1,-1)
```

- NDC: **X dan Y dari −1 sampai +1**, titik (0,0) di **tengah**, Y **ke atas**.
- NDC = ruang koordinat ter-normalisasi **setelah transformasi & projection**.
- Vertex di luar rentang [−1, 1] ⚠️ **tidak terlihat** (ter-clip).
- **Mengapa NDC?** Posisi **tidak bergantung pada ukuran pixel** Canvas → render konsisten di berbagai resolusi & aspect ratio. Konversi ke pixel dilakukan oleh **viewport transform**:

$$x_{px} = \frac{x_{ndc} + 1}{2} \times width \qquad y_{px} = \frac{1 - y_{ndc}}{2} \times height \quad (\text{origin kiri atas})$$

### 2.4 Vertex dan Primitive

**Vertex = unit data yang diproses graphics pipeline.** Di P1 vertex = titik; di WebGL vertex lebih tepat dipahami sebagai **paket data** untuk satu titik, berisi beberapa **attribute**:

| Attribute | Contoh nilai | Dipakai untuk |
|---|---|---|
| **Position** | (x, y, z) | letak titik |
| **Color** | (r, g, b, a) | warna titik |
| Normal | (nx, ny, nz) | lighting (P5) |
| UV | (u, v) | texture (P5) |

Pertemuan 2 fokus pada **Position + Color**.

**Primitive = bentuk dasar yang dirakit dari vertex:** **Point** = 1 vertex · **Line** = 2 vertex · **Triangle** = 3 vertex. **Triangle** adalah primitive terpenting untuk grafika 3D modern. Cara merakitnya ditentukan oleh **draw mode**.

Contoh triangle: V0 = (−0.5, −0.5), V1 = (0.5, −0.5), V2 = (0.0, 0.5).

### 2.5 Draw mode: data vertex sama, bentuk bisa berbeda

| Draw mode | Aturan | Untuk n vertex |
|---|---|---|
| `gl.POINTS` | tiap vertex = 1 titik | n titik |
| `gl.LINES` | tiap **pasangan** = 1 garis | n/2 garis |
| `gl.LINE_STRIP` | bersambung, **tidak menutup** | n−1 garis |
| `gl.LINE_LOOP` | seperti strip + **menutup** ke awal | n garis |
| `gl.TRIANGLES` | tiap **tiga** vertex = 1 segitiga | n/3 segitiga |

Di praktikum juga ada `TRIANGLE_FAN` (untuk lingkaran).

### 2.6 Primitive Assembly

Untuk `gl.TRIANGLES`, setiap tiga vertex membentuk satu triangle:

```
v0 v1 v2 | v3 v4 v5 | v6 v7 v8
Triangle0  Triangle1  Triangle2
```

> **Pertanyaan di slide:** *"gambar ini salah? kenapa?"* Gambar di slide memberi label segitiga pertama v1, v2, v3 dan v3 muncul lagi di segitiga kedua.
>
> **Jawaban:** dengan `gl.TRIANGLES`, vertex dibaca **berurutan per 3 dan tidak berbagi**: Triangle 0 = v0,v1,v2; Triangle 1 = v3,v4,v5; Triangle 2 = v6,v7,v8. Jadi ⚠️ v0 tidak boleh hilang dan v3 tidak dipakai dua kali.

### 2.7 Typed Array & Buffer

Data vertex awalnya ada di memori JavaScript (CPU). Agar dapat dibaca GPU, data harus dipindahkan ke **GPU buffer** (area memori GPU untuk data rendering).

```javascript
const vertices = new Float32Array([
  -0.5, -0.5,   // V0
   0.5, -0.5,   // V1
   0.0,  0.5    // V2
]);  // 6 float × 4 byte = 24 byte

const positionBuffer = gl.createBuffer();          // 1. buat
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);    // 2. bind
gl.bufferData(gl.ARRAY_BUFFER, vertices,           // 3. isi (upload ke GPU)
              gl.STATIC_DRAW);
```

- **Kenapa Float32Array?** Format numerik terstruktur, ukuran elemen konsisten (4 byte), cocok untuk data GPU.
- Usage hint: `gl.STATIC_DRAW` = data **jarang diubah, dipakai berkali-kali**. Sering berubah: `DYNAMIC_DRAW`; sekali pakai: `STREAM_DRAW`.
- Mengubah sebagian isi buffer: `gl.bufferSubData()`.

### 2.8 Attribute: Buffer → Attribute → Vertex Shader

**Attribute** = data yang **berbeda untuk setiap vertex** (position, color, normal, texCoord), sumbernya dari GPU buffer.

```javascript
const loc = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(
  loc,        // lokasi attribute
  2,          // size: komponen per vertex
  gl.FLOAT,   // tipe data
  false,      // normalized
  0,          // stride: jarak antar vertex (byte)
  0           // offset: mulai dari byte ke-
);
```

**Menghitung jumlah vertex (sering keluar):** $\text{jumlah vertex} = \dfrac{\text{jumlah elemen}}{\text{size}}$. Data `{-1,-1, 0, 1, 1,-1}` = 6 elemen → size 3 → **2 vertex**; size 2 → **3 vertex**.

**Interleaved buffer** `x,y, r,g,b` per vertex (5 float = 20 byte): position size 2, stride 20, offset 0; color size 3, stride 20, offset 8.

### 2.9 GLSL

**GLSL** = OpenGL Shading Language, bahasa untuk program yang berjalan di GPU. WebGL2 memakai `#version 300 es` (⚠️ harus di **baris paling pertama**).

| Kategori | Tipe | Untuk |
|---|---|---|
| Scalar | `float int bool` | satu nilai |
| Vector | `vec2 vec3 vec4` | posisi, arah, warna, UV |
| Matrix | `mat2 mat3 mat4` | transformasi |
| Sampler | `sampler2D` | membaca texture |

```glsl
vec4 p = vec4(a_position, 0.0, 1.0); // vec2 → vec4
vec3 c = color.rgb;   // ambil 3 komponen (swizzle)
float x = p.x;        // .xyzw = .rgba = .stpq
```

Fungsi bawaan yang muncul di materi: `normalize()` `dot()` `cross()` `max()` `pow()` `reflect()` `radians()` `sin()` `cos()` `texture()`. ⚠️ GLSL ketat soal tipe: `1` adalah int, tulis `1.0` untuk float.

### 2.10 Apa itu Shader?

**Shader** = **program kecil yang berjalan di GPU**, ditulis dengan GLSL. Shader "mengisi" tahap-tahap pipeline yang bisa diprogram. WebGL **wajib** punya dua shader yang dipasangkan menjadi satu **shader program**:

1. **Vertex Shader** – mengurus **posisi**; dijalankan untuk **setiap vertex**.
2. **Fragment Shader** – mengurus **warna**; dijalankan untuk **setiap fragment** (kandidat pixel).

Di antara keduanya ada **rasterization**, tahap otomatis (tidak kita program).

```
3 vertex dari buffer
   ↓
VERTEX SHADER   (programmable, jalan 3×: sekali per vertex)
   ↓
Rasterization   (fixed: segitiga → ratusan fragment)
   ↓
FRAGMENT SHADER (programmable, jalan ratusan×: sekali per fragment)
   ↓
Framebuffer → Canvas
```

### 2.11 Vertex Shader

Vertex shader **berjalan satu kali untuk setiap vertex**. Buffer berisi 3 vertex → dijalankan 3 kali; tiap eksekusi hanya "melihat" satu vertex, dan GPU menjalankannya paralel.

**Tugas dasar:**
1. **Menerima attribute** vertex itu (posisi, warna, normal, UV) dari buffer.
2. **Memproses posisi**, misalnya mengalikan dengan matrix transformasi (P3–P4).
3. **Menghasilkan `gl_Position`**: posisi akhir vertex (clip space). Ini **output wajib**.
4. **Mengirim data lain** (mis. warna) ke tahap berikutnya lewat variabel `out`.

> Analogi: vertex shader seperti petugas yang memeriksa **satu titik** dan menentukan **di mana titik itu akan muncul** di layar.

**Membaca vertex shader sederhana:**

```glsl
#version 300 es
in vec2 a_position;
in vec3 a_color;
out vec3 v_color;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_color = a_color;
}
```

| Baris | Artinya |
|---|---|
| `#version 300 es` | pakai GLSL versi WebGL2; harus baris pertama |
| `in vec2 a_position;` | **input attribute**: posisi 2D vertex ini, dari buffer |
| `in vec3 a_color;` | input attribute: warna (r, g, b) vertex ini |
| `out vec3 v_color;` | **output** ke tahap berikutnya (akan diinterpolasi) |
| `void main()` | fungsi yang dijalankan GPU untuk setiap vertex |
| `gl_Position = vec4(a_position, 0.0, 1.0);` | posisi akhir; vec2 dilengkapi jadi vec4: z = 0.0, **w = 1.0** (titik) |
| `v_color = a_color;` | meneruskan warna apa adanya |

`gl_PointSize = 10.0;` menentukan ukuran titik (pixel) saat menggambar dengan `gl.POINTS` (default 1.0).

### 2.12 Rasterization: jembatan antara vertex shader dan fragment shader

Setelah vertex shader selesai, GPU punya 3 titik, tapi layar terdiri dari pixel. **Rasterization** menjawab: **pixel mana saja yang tertutup segitiga ini?**

- Rasterizer **mengubah primitive menjadi kumpulan fragment** (menghasilkan fragment untuk setiap objek). Satu triangle bisa menghasilkan **banyak** fragment.
- **Fragment** = kandidat pixel; bisa saja ditolak nanti (mis. tertutup objek lain oleh depth test).
- Data `out` dari vertex shader **diinterpolasi**: fragment di tengah segitiga mendapat campuran nilai ketiga vertex, sesuai jaraknya.

> **Interpolasi:** fragment tepat di V0 = biru murni; di tengah V0 dan V1 = setengah biru setengah hijau. Makanya 3 vertex berwarna berbeda menghasilkan **gradasi**, bukan satu warna.

### 2.13 Fragment Shader

Fragment shader **berjalan untuk setiap fragment** hasil rasterization. Segitiga kecil bisa menghasilkan ratusan fragment, segitiga yang memenuhi layar bisa jutaan, jadi fragment shader jalan **jauh lebih sering** daripada vertex shader.

**Tugas dasar:**
1. **Menerima interpolated data** dari vertex shader (warna, normal, UV) yang sudah dicampur rasterizer.
2. **Menentukan warna akhir (RGBA)** fragment tersebut. Ini tugas utamanya.
3. Boleh memakai **texture** (sampling gambar pakai UV) dan **lighting** (hitung cahaya pakai normal) → P5.

> Analogi: fragment shader seperti tukang cat yang mewarnai **satu kotak pixel**.

**Membaca fragment shader sederhana:**

```glsl
#version 300 es
precision highp float;

in vec3 v_color;
out vec4 outColor;

void main() {
  outColor = vec4(v_color, 1.0);
}
// versi warna tetap: outColor = vec4(0.0, 0.7, 1.0, 1.0); → semua pixel biru muda solid
```

| Baris | Artinya |
|---|---|
| `precision highp float;` | presisi angka float; ⚠️ **wajib di fragment shader** |
| `in vec3 v_color;` | input dari vertex shader; **nama & tipe harus sama** dengan `out vec3 v_color` |
| `out vec4 outColor;` | output warna fragment (RGBA); di GLSL lama/WebGL1 namanya `gl_FragColor` |
| `outColor = vec4(v_color, 1.0);` | warna = warna interpolasi, alpha 1.0 |

> ⚠️ Jebakan: vertex shader menulis `out vec3 fColor` tapi fragment shader membaca `in vec3 vColor` → data tidak tersambung (error link).

### 2.14 Vertex Shader vs Fragment Shader

Setelah keduanya dipahami:

| Aspek | Vertex Shader | Fragment Shader |
|---|---|---|
| Dijalankan | **1× per vertex** | **1× per fragment** |
| Fokus | mengolah **posisi** | mengolah **warna** |
| Input | vertex input (attribute dari buffer) | interpolated input (hasil rasterization) |
| Output | `gl_Position` (+ data `out`) | final fragment color (RGBA) |
| Contoh tugas | transformasi model/view/projection | lighting, texture, transparency |
| Posisi di pipeline | sebelum rasterization | sesudah rasterization |

> Vertex shader = **di mana** (posisi) · Fragment shader = **warna apa**.

### 2.15 Uniform

Attribute berbeda tiap vertex. Tapi ada data yang **sama untuk semua vertex**, misalnya "putar seluruh segitiga 30°" atau "waktu sekarang = 2.5 detik". Data seperti ini dikirim sebagai **uniform**.

- Uniform dikirim ke GPU **sekali saja untuk satu draw call**, lalu dibaca oleh **semua** vertex dan fragment.
- Nilainya bisa diubah antar draw call / antar frame (mis. sudut bertambah → animasi).
- Bisa dibaca di vertex shader maupun fragment shader.

```glsl
uniform float u_time;
uniform vec4  u_color;
uniform mat4  u_matrix;
```

```javascript
const loc = gl.getUniformLocation(program, "u_time");
gl.uniform1f(loc, t);                    // float
gl.uniform4fv(colorLoc, [1,0,0,1]);      // vec4
gl.uniformMatrix4fv(mLoc, false, m);     // mat4
gl.uniform1i(texLoc, 0);                 // int / sampler
```

### 2.16 in / out (varying)

Vertex shader dan fragment shader adalah dua program terpisah. Cara vertex shader "mengirim pesan" ke fragment shader adalah lewat `out` → `in` (di GLSL lama disebut **varying**).

```glsl
// vertex shader
out vec3 v_color;   // kirim
// fragment shader
in vec3 v_color;    // terima (sudah diinterpolasi)
```

> ⚠️ **Nama dan tipe harus sama persis** di kedua shader.

```
Vertex Shader (out v_color) → Rasterizer (interpolasi) → Fragment Shader (in v_color)
3 nilai (per vertex)                                     banyak nilai (per fragment)
```

### 2.17 Attribute vs Uniform vs in/out

| Jenis | Frekuensi | Penjelasan | Contoh |
|---|---|---|---|
| **Attribute** | **per vertex** | data berbeda untuk tiap vertex, dari buffer | `in vec3 a_position;` |
| **Uniform** | **per draw call** | sama untuk semua vertex & fragment dalam satu draw call | `uniform mat4 u_model;` |
| **out / in** (varying) | antar-stage shader | output vertex shader → diinterpolasi → input fragment shader | `out vec3 v_color;` ↔ `in vec3 v_color;` |

> ⚠️ **Bug klasik:** nama di `getUniformLocation` / `getAttribLocation` harus sama persis dengan deklarasi di shader. Kalau salah (mis. `"Theta"` padahal `uTheta`), lokasinya `null`/−1 dan nilai tidak terkirim.

### 2.18 Compile, Link, Use

Kode GLSL awalnya hanya **string teks** di JavaScript.

1. **Compile** – setiap shader diterjemahkan menjadi kode GPU; **syntax error** terdeteksi di sini (`getShaderInfoLog`).
2. **Link** – vertex & fragment shader **digabung menjadi satu program**; dicek apakah `out` cocok dengan `in` (`getProgramInfoLog`).
3. **Use** – `gl.useProgram(program)`: "pakai program ini untuk draw call berikutnya".

```javascript
const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, vsSource);
gl.compileShader(vs);          // sama untuk fs
const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);
```

### 2.19 Draw Call

Semua langkah sebelumnya hanyalah **persiapan**. Tidak ada yang tergambar sampai **draw call** dipanggil.

`gl.drawArrays(mode, first, count)` — **mode** = draw mode, **first** = mulai dari vertex indeks ke-, **count** = berapa vertex. Contoh `gl.drawArrays(gl.TRIANGLES, 0, 3)` → rakit segitiga dari vertex 0, 1, 2. Varian index buffer: `gl.drawElements(mode, count, type, offset)`.

```
gl.drawArrays(...) → Vertex Processing → Rasterization → Fragment Processing → Output Merge (depth/blending) → Framebuffer
```

### 2.20 Rendering Loop

Satu draw call = satu gambar diam. Animasi = menggambar ulang **setiap frame** dengan state yang sedikit berubah.

```javascript
function render() {
  update();   // perbarui logic, input, posisi
  draw();     // clear + draw call
  requestAnimationFrame(render);
}
render();
```

Dua cara membuat objek bergerak (praktikum):
1. **Ubah data vertex di CPU**: hitung posisi baru di JavaScript lalu kirim ulang buffer (`bufferSubData`) → transformasi dihitung **di CPU**.
2. **Kirim uniform** (mis. sudut) dan hitung posisi di vertex shader → transformasi dihitung **di GPU** (lebih efisien, P3).

**Ringkasan P2:**

```
JavaScript → Vertex Data → Buffer + Attribute → Vertex Shader → Primitive + Rasterization → Fragment Shader → Framebuffer → Canvas
```

- **Programmable:** vertex shader & fragment shader (GLSL).
- **Fixed (otomatis):** primitive assembly, clipping, rasterization, depth test.

---

## 3. Transformation & Coordinate System (P3)

### 3.1 Mengapa transformation dibutuhkan?

Di P2 posisi segitiga ditulis langsung di buffer. Kalau segitiga ingin bergeser sedikit, menulis ulang semua angkanya tidak praktis (apalagi untuk ribuan vertex). Solusinya: **geometry ditulis sekali**, lalu diterapkan **transformasi**.

| Kebutuhan | Transformasi | Contoh |
|---|---|---|
| dipindahkan | **Translation** | karakter berjalan |
| diputar | **Rotation** | mobil berbelok |
| diperbesar / diperkecil | **Scaling** | objek membesar |
| ditempatkan dalam scene | gabungan ketiganya | pohon di posisi tertentu |

> ⚠️ Kita **tidak mengubah geometry asli di buffer**. Vertex asli tetap; yang berubah adalah **matrix transformasi** yang dikalikan ke vertex di vertex shader.

### 3.2 Coordinate system

Coordinate system = **sistem referensi** untuk menyatakan posisi. "Rumah di (3, 2)" tidak berarti apa-apa sebelum kita tahu (0, 0)-nya di mana dan sumbunya ke mana.

- 2D: P = (x, y) · 3D: P = (x, y, z)
- Nilai koordinat sebuah titik **bergantung pada coordinate space** yang dipakai. Contoh: titik P yang sama bisa bernilai (1, 1) menurut koordinat meja, tetapi (6, 3) menurut koordinat world.

### 3.3 Satu vertex melewati banyak coordinate space

```
Local ──Model──► World ──View──► View ──Projection──► Clip ──÷w──► NDC ──Viewport──► Screen
└──── fokus P3 ────┘   └────────────────── fokus P4 ──────────────────────────────────┘
```

### 3.4 Local coordinate

Posisi **relatif terhadap origin object** (local/object space). Saat memodelkan objek, kita menggambarnya di sekitar titik (0, 0) miliknya sendiri, tanpa peduli nanti diletakkan di mana.

- **Origin** biasanya di **pusat object**.
- Satuan biasanya dinormalisasi (mis. kubus dari −0.5 sampai 0.5).
- **Independen dari posisi di dunia**: kursi yang sama punya koordinat lokal sama di ruangan mana pun.
- Memudahkan transformasi: rotasi/skala terhadap origin lokal = terhadap pusat objek.

Contoh segitiga di local space: (−0.5, −0.5), (0.5, −0.5), (0, 0.5). Local coordinate mendefinisikan **bentuk** object sebelum ditransformasi ke world space.

### 3.5 World coordinate

Coordinate system **global** sebuah scene: satu acuan bersama supaya semua objek bisa saling diposisikan.

- **Semua object berbagi world space** yang sama (car, tree, building, camera).
- Perpindahan dari local ke world dilakukan oleh **Model Transformation** (translation + rotation + scaling).

```
Local Coordinate → Model Transformation → World Coordinate
```

### 3.6 Translation: menggeser posisi objek

Translation memindahkan objek tanpa mengubah **bentuk, orientasi, maupun ukuran**. Setiap vertex ditambah vektor geser **T = (t<sub>x</sub>, t<sub>y</sub>)** yang sama.

$$x' = x + t_x \qquad y' = y + t_y$$

- t<sub>x</sub> menggeser ke kanan (+) / kiri (−); t<sub>y</sub> ke atas (+) / bawah (−); di 3D ada t<sub>z</sub>.
- Contoh: P = (1, 2), T = (3, −1) → P' = **(4, 1)**.

### 3.7 Scaling: mengubah ukuran objek

$$x' = s_x \cdot x \qquad y' = s_y \cdot y$$

- s > 1 → membesar, 0 < s < 1 → mengecil, s = 1 → tetap, s negatif → tercermin (flip).
- ⚠️ Scaling terjadi **relatif terhadap origin/pivot**. Karena semua koordinat dikali, objek yang tidak berada di origin akan **membesar sekaligus bergeser** menjauhi origin.
- Contoh: persegi dengan sudut (1,1) dan (2,2), diskala 2 → sudut (2,2) dan (4,4): ukuran 2× **dan** posisinya menjauh dari origin.

### 3.8 Uniform vs Non-Uniform Scaling

- **Uniform scaling:** faktor skala **sama** di semua sumbu (s<sub>x</sub> = s<sub>y</sub>). Object berubah ukuran **secara proporsional**: persegi tetap persegi, bola tetap bola.
- **Non-uniform scaling:** faktor skala **berbeda** per sumbu (mis. s<sub>x</sub> = 2.0, s<sub>y</sub> = 0.5). **Proporsi object berubah**: persegi jadi persegi panjang, bola jadi lonjong.

Non-uniform scaling penting di P5 karena membuat **arah normal** tidak bisa ditransformasi seperti posisi biasa.

### 3.9 Rotation: mengubah orientasi objek terhadap pivot

Rotation memutar objek mengelilingi satu titik putar (**pivot**). Bentuk dan ukuran tidak berubah.

- **Sudut θ**: seberapa jauh diputar.
- **Pivot**: pusat putaran; rumus dasar memakai **origin (0,0)**.
- **Arah positif**: θ > 0 = **berlawanan arah jarum jam (Counter-Clockwise)**.
- Dalam 2D rotasi terjadi pada **bidang XY**; di 3D terhadap salah satu sumbu X, Y, atau Z.

### 3.10 Degree dan Radian

Sudut dapat dinyatakan dalam **degree** (satu putaran = 360°) atau **radian** (satu putaran = 2π). Fungsi trigonometri di pemrograman (`Math.sin`, GLSL `sin`) **menggunakan radian**.

$$\text{radian} = \text{degree} \times \frac{\pi}{180}$$

| Degree | 30° | 45° | 60° | 90° | 180° | 270° | 360° |
|---|---|---|---|---|---|---|---|
| Radian | π/6 | π/4 | π/3 | **π/2** | **π** | 3π/2 | 2π |

| θ | 0° | 30° | 45° | 60° | 90° | 180° |
|---|---|---|---|---|---|---|
| cos θ | 1 | 0.866 | 0.707 | 0.5 | 0 | −1 |
| sin θ | 0 | 0.5 | 0.707 | 0.866 | 1 | 0 |

> ⚠️ `Math.sin(90)` = sin 90 **radian** (≈ 0.894), bukan sin 90° = 1. Di GLSL: `radians(90.0)`.

### 3.11 Rumus rotation 2D + contoh hitung

$$x' = x\cos\theta - y\sin\theta \qquad y' = x\sin\theta + y\cos\theta$$

> ⚠️ **Hafalkan tanda:** minus ada di −sin θ untuk x'. Rotasi ini terhadap origin, berlawanan jarum jam, dan **mempertahankan jarak & sudut**.

- Contoh slide: P = (1, 0), rotasi 90° → x' = 0, y' = 1 → **P' = (0, 1)**.
- Latihan: P = (2, 1), rotasi 90° → x' = 2·0 − 1·1 = **−1**, y' = 2·1 + 1·0 = **2** → **P' = (−1, 2)**.

### 3.12 Masalah jika tanpa matrix

Transformasi bisa dihitung satu per satu, tapi objek nyata sering butuh **banyak transformasi bertumpuk**:
- ⚠️ rumus menjadi sulit dikelola,
- ⚠️ urutan sulit dilacak,
- ⚠️ sulit dikirim secara efisien ke GPU.

**Solusi: MATRIX.** Banyak matrix bisa digabung menjadi **satu** matrix (dihitung sekali di CPU, dikirim sebagai uniform), lalu cukup satu perkalian per vertex di GPU.

### 3.13 Apa itu matrix, dan bagaimana matrix × vektor dihitung?

**Matrix** = susunan angka dalam **baris dan kolom**, dipakai untuk **mentransformasi vektor** (posisi vertex). Titik ditulis sebagai **vektor kolom** dan dikalikan dari kiri: **P' = M × P**.

**Aturan baris × kolom:** setiap komponen hasil = baris matrix dikali komponen vektor satu per satu, lalu dijumlahkan.

$$\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} a & b \\ c & d \end{bmatrix}\begin{bmatrix} x \\ y \end{bmatrix} \;\Rightarrow\; x' = a x + b y,\quad y' = c x + d y$$

**Contoh:**

$$\begin{bmatrix} 2 & 0 \\ 0 & 3 \end{bmatrix}\begin{bmatrix} 4 \\ 1 \end{bmatrix} = \begin{bmatrix} 2\cdot4 + 0\cdot1 \\ 0\cdot4 + 3\cdot1 \end{bmatrix} = \begin{bmatrix} 8 \\ 3 \end{bmatrix}$$

Matrix ini ternyata **scaling** (s<sub>x</sub> = 2, s<sub>y</sub> = 3). Untuk 3×3 dan 4×4 aturannya sama.

### 3.14 Scaling dan Rotation sebagai matrix 2×2

$$S = \begin{bmatrix} s_x & 0 \\ 0 & s_y \end{bmatrix} \qquad R(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}$$

Cek dengan baris × kolom: S memberi x' = s<sub>x</sub>x, y' = s<sub>y</sub>y ✔; R memberi rumus rotasi ✔.

Scaling dan rotation adalah transformasi **linear** (hasilnya hanya perkalian & penjumlahan dari x dan y), jadi **bisa langsung** dinyatakan dengan matrix 2×2.

### 3.15 Mengapa translation berbeda?

Translation memakai **penjumlahan konstanta** (x + t<sub>x</sub>). Matrix 2×2 hanya bisa menghasilkan a·x + b·y: tidak ada tempat untuk "+ t<sub>x</sub>".

> **Bukti cepat:** matrix 2×2 apa pun × (0, 0) = (0, 0). Origin **tidak pernah bisa bergeser**, padahal translation harus memindahkan semua titik.

| Matrix linear 2×2 dapat | Tidak dapat |
|---|---|
| rotasi, skalasi, shearing | ⚠️ menambah offset (t<sub>x</sub>, t<sub>y</sub>) → tidak bisa translasi |

**Solusi:** tambah satu komponen → **Homogeneous Coordinate**. (x, y) ditulis (x, y, **1**) dengan matrix **3×3**; (x, y, z) ditulis (x, y, z, **1**) dengan matrix **4×4**.

### 3.16 Homogeneous Coordinate

Titik 2D Kartesius (x, y) ditulis menjadi **(x, y, w)**, dengan w faktor skala non-nol. Dengan komponen w, translasi, rotasi, skala (bahkan proyeksi) bisa digabung dalam **satu perkalian matrix** (affine transformation).

$$\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} = \begin{bmatrix} 1 & 0 & t_x \\ 0 & 1 & t_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} = \begin{bmatrix} x + t_x \\ y + t_y \\ 1 \end{bmatrix}$$

$$S = \begin{bmatrix} s_x & 0 & 0 \\ 0 & s_y & 0 \\ 0 & 0 & 1 \end{bmatrix} \qquad R = \begin{bmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

**Nilai w: titik atau vektor? (sering keluar)**

| w | Artinya | Kena translasi? |
|---|---|---|
| **w = 1** | **titik (point)**, posisi | Ya |
| **w = 0** | **vektor arah** | Tidak |

- `vec4(3, 2, 4, 1)` → **titik** (3, 2, 4).
- Cahaya: w = 1 → **point/positional light**; w = 0 → **directional light** (jauh tak hingga, sinar sejajar).
- Kenapa w = 0 kebal translasi? Kolom terakhir (t<sub>x</sub>, t<sub>y</sub>, t<sub>z</sub>) dikalikan dengan w; jika w = 0 hasilnya 0.

### 3.17 Komposisi: matrix paling kanan dikerjakan duluan

$$P' = M_3 \times M_2 \times M_1 \times P$$

P dikenai **M<sub>1</sub> dulu**, lalu M<sub>2</sub>, terakhir M<sub>3</sub> (convention column-vector).

$$\text{Model Matrix } M = T \cdot R \cdot S \;\Rightarrow\; \text{Scale dulu} \to \text{Rotate} \to \text{Translate}$$

Perkalian matrix **tidak komutatif**: $A \times B \neq B \times A$.

**Contoh** (P = (1, 0), S = skala 2, R = rotasi 90°, T = translasi (3, 1)):
- **T·R·S·P**: S → (2,0) → R → (0,2) → T → **(3, 3)**
- **S·R·T·P**: T → (4,1) → R → (−1,4) → S → **(−2, 8)**

### 3.18 Kenapa objek bisa mengorbit?

| Case A: rotate dulu, baru translate (M = T·R) | Case B: translate dulu, baru rotate (M = R·T) |
|---|---|
| objek **berputar pada pusatnya sendiri**, lalu dipindah | objek sudah jauh dari origin, lalu dirotasi → **translasinya ikut terrotasi**, objek **mengorbit origin** |

> **Pivot:** memutar terhadap titik p (mis. engsel pintu): **T(p) · R(θ) · T(−p)**.

### 3.19 Transformasi 3D: matrix 4×4

$$T = \begin{bmatrix} 1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z \\ 0 & 0 & 0 & 1 \end{bmatrix} \qquad S = \begin{bmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & s_z & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

- t<sub>x</sub>, t<sub>y</sub>, t<sub>z</sub> di **kolom terakhir**; s<sub>x</sub>, s<sub>y</sub>, s<sub>z</sub> di **diagonal**.
- Contoh: T(2, 1, −1.5) × (1, 1, 1, 1): x' = 1 + 2 = 3, y' = 1 + 1 = 2, z' = 1 − 1.5 = −0.5 → **(3, 2, −0.5, 1)**. t ikut menambah karena dikali w = 1.

**Rotation 3D** selalu terhadap satu sumbu. Koordinat **di sumbu putar tidak berubah**; dua lainnya berubah seperti rotasi 2D.

$$R_x = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & c & -s & 0 \\ 0 & s & c & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix} \quad R_y = \begin{bmatrix} c & 0 & s & 0 \\ 0 & 1 & 0 & 0 \\ -s & 0 & c & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix} \quad R_z = \begin{bmatrix} c & -s & 0 & 0 \\ s & c & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

(c = cos θ, s = sin θ)

> **Sering keluar:** rotasi terhadap Z → **komponen z tetap sama** (R<sub>x</sub> tidak mengubah x, R<sub>y</sub> tidak mengubah y). ⚠️ Tanda −s pada R<sub>y</sub> ada di baris bawah. Praktikum: Rotation Z untuk 2D, Rotation Y untuk objek 3D sederhana.

### 3.20 Model Matrix: Local Space → World Space

$$\text{worldPosition} = \text{ModelMatrix} \times \text{localPosition}$$

> **Pertanyaan di slide:** *"Apa yang salah dari gambar ilustrasi ini?"* (slide Local ke World, M = T·R·S)
> - Gambar memperlihatkan objek **dipindah dulu**, baru diputar, lalu **membesar di akhir**. Padahal M = T·R·S berarti **Scale dikerjakan pertama, Translate terakhir**.
> - Sumbu "world coordinate" digambar menempel pada objek akhir; seharusnya **world adalah satu frame global tetap**, yang ikut berpindah adalah **sumbu lokal** objek.
>
> *Catatan: kunci jawaban resmi tidak tersedia; ini analisis berdasarkan konsep di slide.*

### 3.21 Mengirim matrix ke shader lewat uniform

```glsl
in vec3 a_position;
uniform mat4 u_model;
void main() {
  gl_Position = u_model * vec4(a_position, 1.0);
}
```

```javascript
angle += speed * dt;
const m = Mat4.multiply(T, Mat4.multiply(R, S));
gl.uniformMatrix4fv(uModelLoc, false, m);
gl.drawArrays(gl.TRIANGLES, 0, n);
```

- Uniform matrix **sama untuk semua vertex** dalam satu draw call; view & projection boleh identity di tahap ini.
- **Geometry tetap, transform berubah**: buffer disimpan sekali, yang berubah tiap frame hanya model matrix.
- Alur animasi: **Time → Update angle → Build matrix → Send uniform → Draw**.
- Transformasi bisa dihitung **di aplikasi (CPU)** atau **di vertex shader (GPU)**; ⚠️ **bukan di fragment shader**.

### 3.22 Inverse transform & ringkasan P3

Transformasi inverse = **membatalkan / mengembalikan ke posisi awal**.

| Transformasi | Inverse |
|---|---|
| T(t<sub>x</sub>, t<sub>y</sub>, t<sub>z</sub>) | T(−t<sub>x</sub>, −t<sub>y</sub>, −t<sub>z</sub>) |
| R(θ) | R(−θ) = R<sup>T</sup> |
| S(s<sub>x</sub>, s<sub>y</sub>, s<sub>z</sub>) | S(1/s<sub>x</sub>, 1/s<sub>y</sub>, 1/s<sub>z</sub>) |
| (A·B) | B<sup>−1</sup>·A<sup>−1</sup> (urutan dibalik) |

Dipakai pada View Matrix, normal matrix, dan hierarchical model. Materi memakai **column-vector convention** (P' = T×R×S×P); gunakan satu convention secara konsisten.

---

## 4. Camera, Projection & 3D (P4)

### 4.1 Camera virtual

Scene 3D berisi banyak objek, tapi pengguna hanya melihat **bagian scene dari sudut pandang tertentu**.

| Parameter | Arti | Contoh |
|---|---|---|
| **Position (eye)** | lokasi camera | (0, 2, 5) |
| **Target** | titik yang dilihat | (0, 0, 0) |
| **Up vector** | arah "atas" dunia | (0, 1, 0) |
| Proyeksi | FOV, aspect, near, far | 60°, 4/3, 0.1, 100 |

> Camera memilih **apa** yang dilihat, **dari mana**, dan **bagaimana** cara melihatnya.

### 4.2 Target dan Forward vector

**Target** = titik yang dilihat camera. Arah pandang = tarik panah dari camera ke target, lalu dinormalisasi supaya hanya menyatakan arah:

$$\text{Forward} = \text{normalize}(\text{Target} - \text{Position})$$

Contoh slide: Position (0, 0, 1), Target (0, 0, 0) → Forward = **(0, 0, −1)**: camera melihat ke arah −Z.

### 4.3 Up vector dan Right vector

**Up vector** menetapkan arah **"atas" dunia** (umumnya (0, 1, 0)). Forward saja belum cukup: camera yang menghadap target yang sama masih bisa **berguling** (roll) 0°, 90°, 180°. Up vector membuat **orientasi camera tidak ambigu**.

**Right vector** dihitung dengan **cross product**:

$$\text{Right} = \text{normalize}(\text{Forward} \times \text{Up}) \qquad \text{Corrected Up} = \text{Right} \times \text{Forward}$$

Cross product dua vektor menghasilkan vektor **tegak lurus** terhadap keduanya:

$$a \times b = (a_y b_z - a_z b_y,\; a_z b_x - a_x b_z,\; a_x b_y - a_y b_x)$$

Aturan tangan kanan: telunjuk = Forward, jari tengah = Up → ibu jari = Right. Urutan cross product harus mengikuti convention (a × b ≠ b × a).

### 4.4 Contoh hitung basis camera (sering keluar)

**Contoh 1:** Position (0,0,1), Target (0,0,0), Up (0,1,0)
- F = (0, 0, −1)
- R = F × Up = (0·0 − (−1)·1, (−1)·0 − 0·0, 0·1 − 0·0) = (1, 0, 0)
- U = R × F = (0, 1, 0)
- Right = +X, Up = +Y, Forward = −Z (orientasi standar camera).

**Contoh 2:** Position (0, 2, 5), Target (0, 0, 0)
- Target − Position = (0, −2, −5), panjang = √29 ≈ 5.385
- F ≈ **(0, −0.371, −0.928)** → melihat ke −Z dan sedikit menunduk.

### 4.5 View transformation

View transformation: **World Coordinate → View/Camera Coordinate**. Dalam **view space (eye space)**:
- camera secara konseptual **berada di origin (0, 0, 0)**,
- menghadap **−Z**, dengan +Y atas dan +X kanan,
- world **ditransformasikan relatif terhadap camera**.

> **Analogi:** camera bergerak **ke kanan** secara matematis **setara dengan** world bergerak **ke kiri**, seperti melihat dari jendela kereta.

### 4.6 View Matrix dan Look-At

$$\text{viewPosition} = \text{ViewMatrix} \times \text{worldPosition} \qquad \text{ViewMatrix} = \text{Inverse}(\text{CameraTransform})$$

Camera transform membawa camera dari origin ke posisinya di dunia; view matrix melakukan kebalikannya (ingat P3: inverse = membatalkan transformasi). Bentuk matematis: C = [R t; 0 1] → V = C<sup>−1</sup> = [R<sup>T</sup> −R<sup>T</sup>t; 0 1].

```javascript
view = lookAt(position, target, up);
// di dalamnya: F = normalize(target - position), R = normalize(cross(F, up)), U = cross(R, F)
```

> **Sering keluar:** fungsi LookAt **mengatur posisi dan orientasi camera** (bukan skala, posisi cahaya, atau warna).

### 4.7 Projection: world 3D ke layar 2D

Setelah view transformation, posisi objek masih 3D, sedangkan layar hanya punya x dan y. **Projection** mengubah posisi 3D menjadi bentuk yang dapat **dipetakan ke layar 2D** (analogi: bayangan di dinding, foto kamera). Dua jenis utama, dibedakan dari bentuk **garis proyeksi**.

**Orthographic (parallel) projection** — garis proyeksi **sejajar**:
- **Ukuran objek tidak berubah** karena jarak terhadap camera; proporsi tetap konsisten.
- View volume berbentuk **BOX**: `ortho(left, right, bottom, top, near, far)`.
- Cocok untuk: CAD, engineering drawing, map, visualisasi teknis, editor 3D.

**Perspective projection** — garis proyeksi **bertemu di satu titik** (**center of projection, COP**):
- Meniru mata/kamera nyata: **objek dekat tampak besar, objek jauh tampak kecil**.
- View volume berbentuk **FRUSTUM** (piramida terpancung, dibatasi near & far plane): `perspective(fov, aspect, near, far)`.
- Cocok untuk: game, simulator, VR.

**Perbandingan (setelah keduanya dipahami):**

| Aspek | Orthographic | Perspective |
|---|---|---|
| Garis proyeksi | sejajar | bertemu di COP |
| Pengaruh jarak | ukuran **tetap** | jauh = **kecil** |
| View volume | box | frustum |
| Parameter | left, right, bottom, top, near, far | fov, aspect, near, far |
| Kesan | teknis, terukur | **realistis** |
| Pemakaian | CAD, gambar teknik, peta | game, simulator, VR |

> **Planar vs non-planar:** ortho & perspective sama-sama **planar** (ke **bidang datar**). Non-planar = ke permukaan melengkung (bola, silinder, dome, panorama).
>
> **Clipping:** geometry di luar view volume dipotong agar **hanya objek di dalam view volume yang ditampilkan**; dilakukan sebelum rasterisasi.

### 4.8 FOV, Aspect Ratio, Near & Far

**FOV (Field of View)** = sudut pandang camera; menentukan seberapa banyak dunia masuk ke layar.

| | FOV kecil (35°) | FOV besar (90°) |
|---|---|---|
| Area terlihat | sempit | luas |
| Objek | tampak besar | tampak kecil |
| Kesan | **seperti zoom** | lebih dinamis |
| Distorsi tepi | kecil | ⚠️ lebih terlihat |

**Aspect ratio = width / height** — menjaga proporsi horizontal & vertikal. 1920×1080 ≈ 1.778; canvas 800×600 ≈ 1.333. Jika aspect projection ⚠️ **berbeda dengan viewport**, **lingkaran jadi elips**. WebGL: `aspect = canvas.width / canvas.height`.

**Near plane** = batas terdekat yang dirender (lebih dekat → di-clip). ⚠️ Near jangan terlalu dekat ke 0 (presisi depth buruk). **Far plane** = batas terjauh (lebih jauh → tidak dirender). Scene terlihat **di antara near dan far**. Praktikum: near 0.1, far 100.

### 4.9 Projection Matrix → Clip space

Semua parameter projection dikemas menjadi **Projection Matrix** (4×4): **View coordinate → Clip coordinate (x, y, z, w)**.

- Pada **perspective matrix**, w diisi jarak titik dari camera (−z<sub>view</sub>); pada **orthographic**, w = 1.
- Di clip space GPU melakukan **clipping** (titik di dalam volume memenuhi −w ≤ x, y, z ≤ w).

```javascript
// perspective (praktikum P4)
const f = 1.0 / Math.tan(fovRad / 2);
const rangeInv = 1.0 / (near - far);
[ f/aspect, 0, 0,                       0,
  0,        f, 0,                       0,
  0,        0, (near+far)*rangeInv,    -1,   // -1 → w = -z
  0,        0, 2*near*far*rangeInv,     0 ]
```

### 4.10 Perspective Divide

$$(x/w,\; y/w,\; z/w) = \text{NDC},\quad x, y, z \in [-1, 1]$$

Pada perspective, w ≈ jarak. Titik jauh → w besar → x, y **dibagi angka besar** → dekat ke tengah layar → **tampak kecil**.

| | Clip (x, y, z, w) | NDC (÷ w) |
|---|---|---|
| titik dekat | (1, 1, 0, **2**) | (**0.5**, **0.5**, 0) |
| titik jauh | (1, 1, 0.8, **5**) | (**0.2**, **0.2**, 0.16) |

Orthographic: w = 1 → pembagian tidak mengubah apa-apa → tidak ada efek perspektif.

### 4.11 Viewport Transform

Memetakan NDC [−1, 1] ke **koordinat pixel** sesuai canvas (diatur `gl.viewport`); hasilnya ditulis ke framebuffer.

$$x_{px} = \frac{x_{ndc}+1}{2} \times width \qquad y_{px} = \frac{1-y_{ndc}}{2} \times height$$

(1 − y) karena pixel layar dihitung dari atas. Contoh: canvas 800×600, NDC (0.5, 0.5) → **pixel (600, 150)**.

```
View → Projection Matrix → Clip → ÷w → NDC → Viewport → Pixel
```

### 4.12 MVP: Model, View, Projection

$$\text{clipPos} = P \times V \times M \times \text{localPos}$$

| Matrix | Dari → ke | Tugas |
|---|---|---|
| **M** Model | local → world | menempatkan objek di dunia |
| **V** View | world → view/eye | menempatkan dunia terhadap kamera |
| **P** Projection | view → clip | memproyeksikan ke ruang clip |

Dibaca dari kanan: M dulu, lalu V, lalu P. Gabungan M dan V disebut **model-view matrix**; posisi camera di-set melalui **model-view matrix** (bukan projection matrix).

```glsl
in vec3 a_position;
uniform mat4 u_model, u_view, u_projection;
void main() {
  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
}
```

### 4.13 Cube sebagai objek 3D latihan

| Hal | Jumlah |
|---|---|
| Posisi sudut (geometris) | **8** |
| Faces | **6** |
| Triangles (2 per face) | **12** |
| Vertex dengan `drawArrays(TRIANGLES)` | **36** (12 × 3) |
| Vertex unik per-face (warna/normal per face) | **24** (6 × 4) + index |

- **Vertex duplication:** untuk attribute per-face, satu sudut harus diduplikasi karena satu vertex hanya bisa punya satu nilai attribute.
- **Winding order:** CCW biasanya = front face, CW = back face; dipakai untuk **back-face culling**. ⚠️ Urutan salah → permukaan yang harusnya terlihat malah dibuang.

### 4.14 Depth Buffer & Depth Test

Beberapa fragment bisa jatuh di **pixel yang sama**; yang ditampilkan adalah yang **paling dekat dengan camera**.

```
New depth → Compare dengan depth buffer → Keep / Reject
```

```javascript
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

- Depth buffer menyimpan **kedalaman per pixel**, bekerja bersama color buffer.
- `gl.enable(gl.DEPTH_TEST)` = mengaktifkan **z-buffer untuk hidden-surface removal**.
- ⚠️ Tanpa depth test, yang tampil adalah yang **digambar terakhir**.
- ⚠️ Clear juga `DEPTH_BUFFER_BIT` setiap frame.

**Z-fighting:** dua surface dengan **depth hampir sama** → flickering. Faktor: surface hampir coplanar, near terlalu dekat ke 0, far terlalu jauh, presisi terbatas. Presisi depth **tidak linear**: rapat di dekat near, menurun drastis ke far.

> **Pertanyaan di slide:** segitiga di −0.75, persegi B di −0.5, beririsan. **B digambar dulu**, **tanpa depth buffer**. Hasilnya: pada area irisan **segitiga tampil di atas persegi** (karena digambar terakhir), apa pun nilai z-nya. Kalau urutan dibalik, B yang di atas. Tanpa depth test, hasil 3D ⚠️ **bergantung urutan draw**.

### 4.15 Ringkasan P4

- Camera = position + target + up (+ parameter proyeksi).
- Forward = normalize(target − position), Right = normalize(F × up), Up = R × F.
- View Matrix = inverse(camera transform); camera di origin menghadap −Z.
- Orthographic: sejajar, box, ukuran tetap. Perspective: COP, frustum, jauh = kecil.
- FOV kecil = zoom; aspect = width/height; near/far membatasi yang dirender.
- View → Projection → Clip → ÷w → NDC → Viewport → pixel.
- MVP = P × V × M di vertex shader.
- Depth test memilih fragment terdekat; aktifkan + clear depth buffer.
- Input **state-based** (tombol ditahan, cek tiap frame) untuk gerak kontinu; **event-based** (sekali tekan) untuk aksi diskrit.

---

## 5. Lighting, Shading & Texture (P5)

### 5.1 Normal: vektor yang tegak lurus permukaan

Normal menentukan **respons permukaan terhadap cahaya**: lighting, refleksi, shading.

| Per vertex (attribute) | Uniform |
|---|---|
| **Position** (x, y, z) | model, view, projection matrix |
| **Normal** → lighting | light position, light color |
| **UV** (u, v) → texture mapping | camera position, sampler texture |

> **Sering keluar:** selain posisi dan warna, objek **wajib punya vektor normal** untuk dihitung pencahayaannya. Tapi untuk **menempel texture** yang dibutuhkan **koordinat UV**, ⚠️ **bukan normal**.

### 5.2 Face Normal

Setiap face (segitiga) adalah bidang datar dengan satu arah "menghadap". Normal yang mewakili seluruh face = **face normal**. Dihitung dengan **cross product** dua sisi segitiga:

$$v_1 = P_2 - P_1,\quad v_2 = P_3 - P_1,\quad N = \text{normalize}(v_1 \times v_2)$$

Contoh: P₁(0,0,0), P₂(1,0,0), P₃(0,1,0) → v₁ = (1,0,0), v₂ = (0,1,0) → N = **(0, 0, 1)** (menghadap +Z). Face normal menghasilkan tampilan permukaan yang **tegas**.

### 5.3 Vertex Normal

Mesh juga bisa menyimpan normal **di setiap vertex**. Pada permukaan lengkung, normal vertex biasanya diambil dari **rata-rata face normal** di sekitarnya, menunjuk ke arah "permukaan asli".

1. Normal tiap vertex dikirim sebagai attribute.
2. Saat rasterization, normal **diinterpolasi** untuk setiap fragment.
3. Setiap fragment mendapat normal sedikit berbeda → pencahayaan berubah **bertahap**.

Hasilnya permukaan terlihat **halus** walaupun geometrinya tetap kotak-kotak.

### 5.4 Flat Shading vs Smooth Shading

| Flat shading (face normal) | Smooth shading (vertex normal) |
|---|---|
| satu normal per face → satu warna per face | vertex normal → interpolasi → normal per fragment |
| sisi terlihat jelas, perubahan lighting antar-face **tegas** | **transisi pencahayaan lebih halus** |
| cocok untuk gaya **low-poly** | objek polygonal tampak **smooth** |

> Bedanya bukan jumlah segitiga, tapi **normal mana yang dipakai**.

### 5.5 Normal harus dinormalisasi dan ikut transformasi

- **Normalisasi |N| = 1:** lighting membutuhkan **unit vector**; jika panjang ≠ 1, dot product salah. Normal hasil interpolasi panjangnya bisa < 1, jadi dinormalisasi lagi di fragment shader: `vec3 N = normalize(v_normal);`.
- **Normal ikut transformasi:** saat objek di-rotate/scale, arah normal ikut berubah, tetapi ⚠️ **tidak selalu bisa ditransformasi sama seperti position**, terutama pada **non-uniform scaling**.

$$N' = \left(M_{3\times3}^{-1}\right)^{T} \cdot N$$

**Normal Matrix** = **inverse transpose** dari bagian linear (3×3, tanpa translasi) Model Matrix. Jika hanya rotasi + uniform scale, cukup bagian 3×3 model matrix (lalu dinormalisasi).

### 5.6 Mengapa lighting dibutuhkan?

Tanpa lighting, objek sering terlihat **flat** (satu warna rata): kita tidak tahu itu bola atau piring. Lighting memberi petunjuk visual: **bentuk**, **arah permukaan**, **kedalaman**, **posisi sumber cahaya**, **karakter material** (kusam vs mengilap).

> **Sering keluar:** lighting dan shading diperlukan agar objek **terlihat lebih realistis**.

Untuk menghitung lighting dibutuhkan **N** (normal), **L** (arah cahaya), dan untuk kilau juga **V** (arah pandang).

### 5.7 Model lighting sederhana: tiga komponen

1. **Ambient** – cahaya lingkungan yang **konstan**, rata ke semua permukaan; tidak bergantung arah apa pun.
2. **Diffuse** – cahaya yang **tersebar ke segala arah**; makin menghadap cahaya makin terang; bergantung sudut **N dan L**.
3. **Specular** – **pantulan mengilap** (highlight) seperti titik putih di bola biliar; bergantung sudut **R dan V**.

Gabungan ketiganya dikenal sebagai **Phong Reflection Model** (model refleksi klasik sederhana).

### 5.8 Arah cahaya L

Untuk **point light**, arah cahaya dihitung per titik permukaan:

$$L = \text{normalize}(\text{LightPosition} - \text{SurfacePosition})$$

- L adalah arah **dari surface menuju sumber cahaya**.
- Untuk **directional light**, L sama untuk semua titik (sinar sejajar).
- Contoh: light (0, 5, 0), titik (0, 0, 0) → L = **(0, 1, 0)** (cahaya dari atas).

### 5.9 Ambient

$$\text{ambient} = k_a \times I_a \qquad (\text{praktikum: } \texttt{ambientStrength * texColor})$$

- Mewakili cahaya dari **banyak sumber/pantulan yang tersebar** di lingkungan.
- **Tidak bergantung normal** dan **tidak bergantung arah cahaya**.
- Fungsinya: mencegah bagian yang tidak terkena cahaya langsung menjadi hitam pekat.
- Keterbatasan: bukan simulasi **global illumination**, tidak memperhitungkan pantulan dunia nyata; hanya **pendekatan sederhana**.

### 5.10 Diffuse

**Konsep:** seperti menyinari kertas dengan senter. Kertas tegak menghadap senter = terang maksimal; dimiringkan = cahaya tersebar ke area lebih luas → redup; membelakangi = gelap. Diffuse bergantung pada **sudut antara Surface Normal (N) dan Light Direction (L)**.

- Diffuse surface **memantulkan cahaya ke semua arah secara merata** (hukum Lambert), sehingga **tidak bergantung posisi camera**. Contoh: kertas, dinding matte, kain.

**Dot product mengubah sudut menjadi angka:**

$$N \cdot L = |N||L|\cos\theta = \cos\theta \;\;(\text{unit vector}) \qquad N \cdot L = N_xL_x + N_yL_y + N_zL_z$$

| Posisi N dan L | θ | N · L | Artinya |
|---|---|---|---|
| searah | 0° | **1** | terang maksimal |
| miring | 30° | 0.87 | terang |
| miring | 60° | 0.5 | setengah |
| tegak lurus | 90° | **0** | tidak kena |
| berlawanan | 180° | **−1** | membelakangi |

Contoh: N = (0,1,0), L = normalize(1,1,0) = (0.707, 0.707, 0) → N·L = **0.707**.

**Rumus diffuse:**

$$\text{diff} = \max(\text{dot}(N, L), 0.0) \qquad \text{Diffuse} = \text{diff} \times \text{LightColor} \times \text{BaseColor}$$

`max(…, 0)` **mencegah cahaya negatif**. Bentuk buku/latihan soal: $I_{diffuse} = k_d \cdot I_l \cdot \max(N \cdot L, 0)$.

Contoh: N = (0,0,1), L = normalize(0,1,1) = (0, 0.707, 0.707), k<sub>d</sub> = 0.8, I<sub>l</sub> = 1 → N·L = 0.707 → I<sub>diffuse</sub> = **0.566**.

### 5.11 Specular

**Konsep:** pada benda mengilap ada **titik terang kecil**, yaitu pantulan langsung sumber cahaya. Berbeda dari diffuse, specular **bergantung posisi camera**: kalau kita bergeser, highlight ikut bergeser. Dipengaruhi oleh **normal (N)**, **arah cahaya (L)**, **arah camera (V)**, dan **shininess**.

**View direction V** (arah dari surface menuju camera):

$$V = \text{normalize}(\text{CameraPosition} - \text{SurfacePosition})$$

**Reflection direction R** (arah pantulan cahaya):

$$R = \text{reflect}(-L, N) = 2(N \cdot L)N - L$$

Cahaya datang dengan arah −L, memantul terhadap N seperti cermin (sudut datang = sudut pantul). Lalu **R dibandingkan dengan V**: jika arah pantulan tepat ke mata, highlight kuat.

**Specular strength:**

$$\text{spec} = \text{pow}(\max(\text{dot}(R, V), 0), \text{shininess})$$

| Bagian | Artinya |
|---|---|
| `dot(R, V)` | seberapa dekat arah pantulan dengan arah pandang (1 = tepat ke mata) |
| `max(…, 0)` | buang nilai negatif |
| `pow(…, shininess)` | mengontrol **ukuran & ketajaman highlight** |

Bentuk buku/latihan soal: $I_{specular} = k_s \cdot I_l \cdot \max(R \cdot V, 0)^n$.

**Kenapa dipangkatkan?** R·V di antara 0–1; angka < 1 dipangkatkan besar cepat mengecil, kecuali yang sangat dekat 1. R·V = 0.9: n = 10 → ≈ **0.35**; n = 100 → ≈ **0.00003**.

### 5.12 Shininess

| Shininess kecil (mis. 4) | Shininess besar (mis. 256) |
|---|---|
| highlight **lebar dan lembut** | highlight **kecil, sempit, tajam** |
| permukaan kusam / matte | mengilap (logam, plastik halus) |

> Shininess bukan roughness fisik, melainkan parameter model klasik. Shininess ⚠️ **tidak** mengubah warna atau arah cahaya.

### 5.13 Blinn-Phong: halfway vector

Menghitung R untuk setiap fragment cukup mahal. **Blinn-Phong** menggantinya dengan vektor "setengah jalan" antara L dan V:

$$H = \text{normalize}(L + V) \qquad \text{spec} = \text{pow}(\max(\text{dot}(N, H), 0), \text{shininess})$$

- Jika H searah N, berarti pantulan mengarah ke mata.
- **Mempermudah / mempercepat perhitungan term specular**, hasil visual mirip.
- Phong: (R·V)<sup>n</sup>, perlu hitung R · Blinn-Phong: (N·H)<sup>n</sup>, lebih efisien.

### 5.14 Phong Reflection Model (gabungan)

$$I = k_a I_a + k_d I_l \max(N \cdot L, 0) + k_s I_l \max(R \cdot V, 0)^n$$

| Simbol | Arti | Simbol | Arti |
|---|---|---|---|
| I | intensitas akhir | N | normal permukaan |
| I<sub>a</sub>, I<sub>l</sub> | intensitas ambient & sumber cahaya | L | arah ke cahaya |
| k<sub>a</sub>, k<sub>d</sub>, k<sub>s</sub> | koefisien refleksi material | R, V | arah pantul, arah ke camera |
| n | shininess coefficient | | model ini **bukan PBR** |

> **Sering keluar:** "rendering equation" pada model Phong = persamaan untuk menghitung **interaksi cahaya yang diserap dan dipantulkan**; komponennya **diffuse, specular, ambient**.

### 5.15 Per-vertex vs per-fragment lighting

**Per-vertex (Gouraud):** lighting dihitung di **vertex shader** hanya di titik sudut; warna di antaranya hasil interpolasi. ✔ **lebih sedikit perhitungan**; ✘ hasil **lebih kasar**, highlight kecil bisa hilang jika jatuh di tengah segitiga.

**Per-fragment (Phong shading):** normal & posisi diinterpolasi, lighting dihitung di **fragment shader** untuk setiap fragment. ✔ **hasil lebih halus**, specular lebih baik; ✘ **komputasi lebih banyak**.

Praktikum memakai **per-fragment**: vertex shader mengirim transformed normal, surface (world) position, dan UV.

```glsl
// 1. vektor (dinormalisasi)
vec3 N = normalize(v_normal);
vec3 L = normalize(u_lightPosition - v_worldPosition);
vec3 V = normalize(u_cameraPosition - v_worldPosition);
// 2. diffuse
float diff = max(dot(N, L), 0.0);
// 3. specular (hanya jika menghadap cahaya)
vec3  R    = reflect(-L, N);
float spec = 0.0;
if (diff > 0.0) spec = pow(max(dot(R, V), 0.0), u_shininess);
// 4. warna dasar dari texture
vec3 tex = texture(u_texture, v_texCoord).rgb;
// 5. gabungkan
vec3 ambient  = u_ambientStrength * tex;
vec3 diffuse  = diff * u_lightColor * tex;
vec3 specular = spec * u_lightColor;  // tidak dikali tex
outColor = vec4(ambient + diffuse + specular, 1.0);
```

Ambient & diffuse dikali warna permukaan; specular memakai warna **cahaya** (kilau putih).

### 5.16 Apa itu Texture?

**Texture** adalah **image yang dipetakan ke permukaan object**. Seperti membungkus kotak kado dengan kertas bermotif: kotaknya tetap sederhana, tampilannya penuh detail.

- Texture **memberi detail visual tanpa menambah banyak geometry**.
- **Satu image, banyak permukaan**: texture yang sama bisa dipakai berulang.
- Fungsi utama texture mapping: **menambahkan detail visual pada permukaan objek**.

### 5.17 UV Coordinate dan UV Space

**Texture coordinate** = **UV coordinate**: koordinat 2D **pada gambar texture** yang dipetakan ke permukaan.

- **U**: horizontal (kiri → kanan) · **V**: vertikal (bawah → atas)
- Rentang umum **0 – 1** berapa pun ukuran pixel gambarnya; (0,0) = kiri bawah, (1,1) = kanan atas, (0.5, 0.5) = tengah.
- Kenapa 0–1? Supaya texture 256×256 atau 1024×1024 bisa ditukar tanpa mengubah data vertex.

> ⚠️ UV **bukan** koordinat world, bukan koordinat layar, dan bukan normal. UV adalah posisi di ruang gambar texture itu sendiri.

### 5.18 UV pada triangle (interpolasi)

Setiap vertex diberi satu pasangan UV, misalnya V0 (0,0), V1 (1,0), V2 (0.5,1). Untuk titik **di dalam** segitiga, UV **diinterpolasi untuk setiap fragment** (seperti warna di P2), lalu setiap fragment mengambil warna gambar di UV itu. Hasilnya potongan segitiga dari gambar "ditempel" mulus ke segitiga 3D.

### 5.19 UV sebagai vertex attribute

UV diperlakukan seperti position dan color di P2:

```glsl
// vertex shader
in  vec2 a_texCoord;   // dari buffer
out vec2 v_texCoord;   // ke fragment
void main() { ...  v_texCoord = a_texCoord; }
// fragment shader
in vec2 v_texCoord;    // sudah diinterpolasi
```

```
Buffer UV → ATTRIBUTE a_texCoord → INTERPOLATION → FRAGMENT v_texCoord → texture sampling → FINAL IMAGE
```

### 5.20 Texture Sampler dan texture unit

Fragment shader mengakses gambar lewat uniform bertipe **sampler2D**:

```glsl
uniform sampler2D u_texture;
```

- **Sampler** merepresentasikan texture yang sedang digunakan shader ("pintu" untuk membaca gambar).
- GPU punya beberapa **texture unit** (TEXTURE0, TEXTURE1, ...). Texture di-**bind** ke salah satu slot; sampler diberi tahu slot mana yang dibaca.

```javascript
gl.activeTexture(gl.TEXTURE0);           // pilih slot 0
gl.bindTexture(gl.TEXTURE_2D, texture);  // pasang texture
gl.uniform1i(uTextureLocation, 0);       // sampler baca slot 0
```

### 5.21 Texture Sampling dan Texel

```glsl
vec4 texColor = texture(u_texture, v_texCoord);   // GLSL lama: texture2D(...)
```

Proses mengambil warna texture pada UV tertentu = **texture sampling**.

| Istilah | Arti |
|---|---|
| **Pixel** | elemen image di layar / framebuffer |
| **Texel** | **elemen data pada texture image** (texture element) |

Satu fragment mengambil satu texel, atau menginterpolasi beberapa texel di sekitarnya; caranya ditentukan oleh **filtering**.

### 5.22 Texture Filtering

Ukuran texture jarang sama persis dengan objek di layar: **magnification** (texture kecil diperbesar) atau **minification** (texture besar diperkecil). GPU menentukan bagaimana texel digunakan = **filtering**.

- **NEAREST:** ambil **satu texel terdekat**. Tajam, tapi bisa **bergerigi / pixelated** (aliasing).
- **LINEAR:** ambil **beberapa texel sekitar** lalu **interpolasi**. Lebih halus, mengurangi aliasing, sedikit **blur**.

| Aspek | NEAREST | LINEAR |
|---|---|---|
| Cara kerja | texel terdekat | interpolation texel sekitar |
| Hasil | tajam | transisi halus |
| Kelemahan | ⚠️ pixelated | ⚠️ blur |
| Cocok untuk | gaya pixel-art | gaya realistis |

```javascript
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
// mipmap: gl.generateMipmap(gl.TEXTURE_2D)
```

### 5.23 Texture Wrapping

UV boleh di luar 0–1 (mis. (0,0)–(3,3) untuk lantai keramik). **Wrapping mode** menentukan apa yang ditampilkan:

- **REPEAT:** mengulang texture secara **periodik** (UV 1.5 ≈ 0.5); UV 0..3 → terulang 3×3.
- **CLAMP_TO_EDGE:** UV dikunci ke 0–1; di luar batas memakai **warna texel tepi terdekat** (tepi "ditarik").
- **MIRRORED_REPEAT:** mengulang dengan **pola cermin bergantian**.

```javascript
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);  // arah U
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);  // arah V
```

### 5.24 Lighting × Texture

- **Texture** memberikan **base color**; **Lighting** memberikan **light contribution**.

$$\text{Color} = \text{Texture} \times \text{Lighting}$$

Setiap fragment mengalikan warna texture dengan kontribusi cahaya; bagian yang membelakangi cahaya tetap memperlihatkan motif texture, hanya lebih redup. Pola soal: `gl_FragColor = LightColor * vColor * texture2D(Texture, TexCoord);`.

### 5.25 Mendefinisikan texture dari file gambar

```javascript
const texture = gl.createTexture();
const image = new Image();       // objek Image JS
image.onload = () => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
};
image.src = "gambar.gif";
```

- Texture dari file dimuat dengan **objek `Image` di JavaScript**.
- `texImage2D` = **mendefinisikan texture sebagai array texel**.
- **Two-part mapping:** texture dipetakan dulu ke **permukaan perantara sederhana** (bidang, silinder, bola), lalu ke objek sebenarnya.

### 5.26 Ringkasan P5

- **Normal** tegak lurus permukaan; wajib untuk lighting; harus dinormalisasi.
- **Face normal** → flat shading; **vertex normal** diinterpolasi → smooth shading.
- Normal ditransformasi dengan **normal matrix = inverse transpose**.
- **Ambient** = k<sub>a</sub>I<sub>a</sub>; **Diffuse** = max(N·L, 0); **Specular** = max(R·V, 0)<sup>n</sup>; **Blinn-Phong** pakai H = normalize(L+V).
- **UV** = koordinat di gambar texture, 0–1, diinterpolasi per fragment; **sampler2D** + `texture()`; texel = elemen texture.
- **NEAREST** tajam/pixelated, **LINEAR** halus/blur; **REPEAT / CLAMP_TO_EDGE / MIRRORED_REPEAT**.
- Warna akhir: **Texture × Lighting** (+ specular). Per-fragment lebih halus daripada per-vertex.
- Light w = 1 → point light, w = 0 → directional light.

---

## 6. Hierarchical Modeling

### 6.1 Masalah: bagaimana merepresentasikan objek kompleks?

**Cara 1: tiap objek terpisah (Symbol-Instance Table).** Setiap objek punya **symbol** unik dan transformasi masing-masing (instance transformation M = T·R·S).

| Symbol | Scale | Rotate | Translate |
|---|---|---|---|
| 1 (silinder) | s<sub>x</sub>, s<sub>y</sub>, s<sub>z</sub> | θ<sub>x</sub>, θ<sub>y</sub>, θ<sub>z</sub> | d<sub>x</sub>, d<sub>y</sub>, d<sub>z</sub> |
| 2 (kubus) | … | … | … |
| 1 (silinder) | … | … | … |

> ⚠️ **Kelemahan:** tabel ini **tidak mampu menampilkan hubungan antar bagian** di dalam model.

**Contoh model mobil:**
- Kerangka (chassis) + **4 roda identik** → cukup **2 symbol**.
- Kecepatan mobil melaju dipengaruhi **kecepatan putar roda** → ada hubungan antar bagian.
- Kode biasa (panggil chassis(), wheel() berurutan) ⚠️ **tidak menggambarkan hubungan** ini → gunakan **graph**.

### 6.2 Graph, Tree, dan DAG

| Struktur | Penjelasan |
|---|---|
| **Graph** | kumpulan **node** dan **edge** (link). Edge menghubungkan sepasang node, berarah maupun tidak. **Cycle**: graph berarah yang path-nya membentuk loop. |
| **Tree** | bentuk khusus graph: tiap node (kecuali **root**) punya **tepat satu parent**; node tanpa child = **leaf**. Tidak ada cycle. |
| **DAG** (Directed Acyclic Graph) | karena 4 roda **identik**, cukup satu node Wheel yang ditunjuk 4 edge (masing-masing dengan transformasinya). |

```
Tree mobil:                          DAG mobil:
          Chassis                       Chassis
     ┌───┬───┴───┬───┐                  ││││  (4 edge)
    RF   LF     RR   LR                  ▼▼▼▼
  (wheel × 4 node terpisah)             Wheel (1 node)
```

- **Node:** apa yang digambar + pointer ke anak-anaknya.
- **Edge:** informasi **perubahan matrix transformasi** (relatif parent → child).

### 6.3 Robot Arm: artikulasi lewat sudut pada joint

- Bagian-bagian **terkoneksi pada joint**; state model dijelaskan dengan memberi **sudut pada setiap joint**.
- **Base** berotasi independen (satu sudut, θ pada sumbu y).
- **Lower arm** menempel pada base: posisinya bergantung rotasi base; translasi relatif terhadap base, rotasi terhadap joint dengan base (φ, sumbu z).
- **Upper arm** menempel pada lower arm: bergantung pada base *dan* lower arm (ψ, sumbu z).

**Matrix yang dibutuhkan:**

| Part | Matrix |
|---|---|
| Base | M = R<sub>b</sub> |
| Lower arm | M = R<sub>b</sub> T<sub>lu</sub> R<sub>lu</sub> |
| Upper arm | M = R<sub>b</sub> T<sub>lu</sub> R<sub>lu</sub> T<sub>uu</sub> R<sub>uu</sub> |

Matrix anak = matrix parent × transformasi lokalnya → **transformasi parent otomatis memengaruhi child**.

```javascript
var render = function() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  modelViewMatrix = rotate(theta[Base], 0, 1, 0);
  base();

  modelViewMatrix = mult(modelViewMatrix,
        translate(0.0, BASE_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix,
        rotate(theta[LowerArm], 0, 0, 1));
  lowerArm();

  modelViewMatrix = mult(modelViewMatrix,
        translate(0.0, LOWER_ARM_HEIGHT, 0.0));
  modelViewMatrix = mult(modelViewMatrix,
        rotate(theta[UpperArm], 0, 0, 1));
  upperArm();

  requestAnimFrame(render);
}
```

Model tree: **Base → Lower arm → Upper arm** (edge: T<sub>lu</sub>·R<sub>lu</sub>, lalu T<sub>uu</sub>·R<sub>uu</sub>).

- Kode menunjukkan **hubungan antar part**: modelViewMatrix terus dikalikan (akumulasi).
- Kita bisa mengubah tampilan suatu part dengan mudah (cukup ubah `theta[...]`).
- **Struktur node model tree** (jika semua info di node): pointer ke **fungsi menggambar** part, **matrix** yang menghubungkan node ke parent, pointer ke **children**. Bisa ditambah warna, texture, dll.

### 6.4 Humanoid figure

```
                              Torso (M)
       ┌──────────┬───────────┼───────────┬───────────┐
     Mh│      Mlua│       Mrua│       Mlul│       Mrul│
      Head   L-upper arm  R-upper arm  L-upper leg  R-upper leg
                Mlla│       Mrla│       Mlll│       Mrll│
             L-lower arm  R-lower arm  L-lower leg  R-lower leg
```

- Dibangun dari quadrics sederhana: **ellipsoid & cylinder**; diakses lewat fungsi `torso()`, `leftUpperArm()`, dst.
- Posisi figure ditentukan oleh **11 sudut joint** (2 untuk head, 1 untuk masing-masing 9 part lain) → `theta[11]`.

**10 matrix yang relevan:**
- **M:** posisi & orientasi seluruh figure lewat torso (root)
- **M<sub>h</sub>:** head terhadap torso
- **M<sub>lua</sub>, M<sub>rua</sub>, M<sub>lul</sub>, M<sub>rul</sub>:** arm & leg terhadap torso
- **M<sub>lla</sub>, M<sub>rla</sub>, M<sub>lll</sub>, M<sub>rll</sub>:** lower part terhadap upper part

Menampilkan tree butuh **graph traversal**: kunjungi tiap node **1 kali**, gambar part-nya dengan matrix yang menentukan posisi & arah.

### 6.5 Stack-based traversal: push sebelum turun, pop saat kembali

Left-upper arm butuh **M·M<sub>lua</sub>**. Daripada menghitung dari awal, **matrix stack menyimpan M** (dan matrix lain) selama kunjungan node.

```javascript
function figure() {
  mvStack.push(modelViewMatrix);      // simpan M
  torso();
  modelViewMatrix = mult(modelViewMatrix, Mh);
  head();
  modelViewMatrix = mvStack.pop();     // kembali ke M
  mvStack.push(modelViewMatrix);       // simpan lagi
  modelViewMatrix = mult(modelViewMatrix, Mlua);
  leftUpperArm();
  modelViewMatrix = mult(modelViewMatrix, Mlla);
  leftLowerArm();
  modelViewMatrix = mvStack.pop();     // kembali ke M
  mvStack.push(modelViewMatrix);
  // ... right upper arm, dst.
}
```

| Langkah | Isi stack | Current model-view | Digambar |
|---|---|---|---|
| push M | [M] | M | torso |
| × M<sub>h</sub> | [M] | M·M<sub>h</sub> | head |
| pop | [] | M | – |
| push, × M<sub>lua</sub> | [M] | M·M<sub>lua</sub> | left-upper arm |

> **Fungsi stack:** menyimpan **model-view matrix sementara** agar setelah menggambar satu cabang (mis. lengan kiri), kita bisa kembali ke matrix parent (torso) tanpa menghitung ulang.

### 6.6 "Ada yang salahkah dari code tersebut?" (fungsi torso)

```javascript
function torso() {
  instanceMatrix = mult(modelViewMatrix,
      translate(0.0, 0.5*torsoHeight, 0.0));
  instanceMatrix = mult(instanceMatrix,
      scale4(torsoWidth, torsoHeight, torsoWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false,
      flatten(instance));          // ← SALAH
  for (var i = 0; i < 6; ++i)
    gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}
```

**Jawaban:** variabel yang dikirim ke shader adalah `instance`, padahal yang dibuat adalah `instanceMatrix` → error ⚠️ *"instance is not defined"*.

```javascript
gl.uniformMatrix4fv(modelViewMatrixLoc, false,
    flatten(instanceMatrix));
```

**Kenapa ada instanceMatrix?** `instanceMatrix` = modelViewMatrix × **translate** × **scale**: mengubah kubus satuan menjadi bentuk torso **tanpa mengubah modelViewMatrix** yang akan diwariskan ke child (scale torso tidak ikut ke lengan/kepala). Kubus digambar sebagai 6 face, tiap face 4 vertex dengan `TRIANGLE_FAN` (mulai indeks 4·i).

### 6.7 Left-Child Right-Sibling tree

**Kelemahan cara eksplisit push/pop:** kode bergantung pada push/pop manual, sulit dikembangkan/dipakai dinamis, dan ⚠️ **tidak memisahkan proses membangun model dan merender**. Solusinya: struktur data tree yang umum + algoritma traversal.

```
Torso
  │ child
  ▼
Head ──sibling──► L-up arm ──► R-up arm ──► L-up leg ──► R-up leg
                     │ child      │            │            │
                     ▼            ▼            ▼            ▼
                 L-low arm    R-low arm    L-low leg    R-low leg
```

- Menggunakan **linked list**; tiap node punya **2 pointer**: **child** & **sibling**.
- Semua elemen pada level yang sama di-link sebagai sibling.
- Children suatu node direpresentasikan sebagai list kedua, dari anak paling kiri ke kanan.

**Isi tiap node:** pointer ke **sibling**, pointer ke **child**, pointer ke **fungsi render** node, **matrix homogeneous** yang dikalikan ke current model-view (perubahan dari parent ke node).

```javascript
function createNode(transform, render, sibling, child) {
  return { transform, render, sibling, child };
}
```

### 6.8 Inisialisasi node & preorder traversal

```javascript
function initNodes(Id) {
  var m = mat4();
  switch (Id) {
  case torsoId:
    m = rotate(theta[torsoId], 0, 1, 0);
    figure[torsoId] = createNode(m, torso, null, headId);
    break;
  case headId: ...
    m = translate(0, torsoHeight + 0.5*headHeight, 0);
    m = mult(m, rotate(theta[head1Id], 1, 0, 0));
    m = mult(m, rotate(theta[head2Id], 0, 1, 0));
    m = mult(m, translate(0, -0.5*headHeight, 0));
    figure[headId] = createNode(m, head, leftUpperArmId, null);
    break;
  }
}
// torso: sibling null, child head
// head : sibling leftUpperArm, child null
```

```javascript
function traverse(Id) {
  if (Id == null) return;
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix,
                         figure[Id].transform);
  figure[Id].render();
  if (figure[Id].child != null)
    traverse(figure[Id].child);
  modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null)
    traverse(figure[Id].sibling);
}
// render(): clear; traverse(torsoId); requestAnimFrame(render);
```

> **Kunci:** push model-view **sebelum** dikalikan matrix node. Matrix yang sudah di-update **diaplikasikan ke children, bukan ke sibling** (sibling punya matrix sendiri, makanya pop dulu sebelum ke sibling).

Animasi: ubah sudut di `theta[]`, panggil ulang `initNodes(Id)`, lalu tampilkan lagi. Urutan traversal memengaruhi perubahan state.

### 6.9 Ringkasan Hierarchical Modeling

- Tujuan: **merepresentasikan hubungan antar bagian objek** (robot, manusia, kendaraan).
- Keuntungan: transformasi parent otomatis memengaruhi child → **mempermudah rendering/animasi dinamis**.
- Symbol-instance table tidak bisa menyatakan hubungan → pakai graph/tree.
- Roda identik → DAG (satu node, banyak edge).
- Node: fungsi gambar + matrix ke parent + pointer child(/sibling). Edge: perubahan matrix.
- `rotate` & `translate` berfungsi **membentuk matrix transformasi** tiap node.
- Matrix stack: push/pop model-view matrix sementara.
- Left-child right-sibling + preorder traversal rekursif.

**Contoh soal hierarki:** toples menempel di atas meja, bola di dalam toples.

```
Meja (root)        ← transformasi relatif terhadap world
  └── Toples       ← translasi di atas meja (relatif meja)
        └── Bola   ← translasi di dalam toples (relatif toples)
```

Meja digeser → toples & bola ikut. Toples digeser → bola ikut.

---

## 7. Contoh Soal & Pembahasan

Diolah dari latihan soal, pertanyaan di slide dosen, dan modul praktikum.

### 7.1 P1 Konsep Dasar

**Soal 1.** Komponen berikut yang merupakan bagian dari sistem grafika adalah…
a. Mikrofon · b. Ethernet port · c. GPU · d. Optical drive

> **Jawab: c. GPU.** GPU menangani **seluruh proses rendering** (transformasi, shading, rasterisasi) secara paralel. Opsi lain bukan perangkat grafika.

**Soal 2.** Fungsi framebuffer dalam sistem grafika adalah…
a. alokasi memori CPU · b. menampung pixel yang akan ditampilkan · c. memproses perintah grafis · d. menyimpan input keyboard

> **Jawab: b.** Framebuffer berisi color buffer (RGBA), depth buffer, stencil buffer.

**Soal 3.** Keuntungan utama double buffering adalah…
a. objek tampil lebih cepat · b. menghindari tampilan render parsial · c. menambah warna · d. hemat memori GPU

> **Jawab: b.** Gambar dirender di **back buffer**, lalu di-swap dengan front buffer → tidak ada flicker/tearing.

**Soal 4.** (a) Perangkat yang BUKAN output device? (b) Perangkat yang bisa berinteraksi dengan setiap pixel layar? (c) Model pencitraan yang mengikuti cahaya dari sumber hingga interaksinya dengan objek?

> **Jawab:** (a) **Mouse** (input). (b) **Touchscreen**. (c) **Ray tracing**, menelusuri jalur sinar (pantulan, bayangan, bias), realistis tapi berat.

### 7.2 Hitungan Dasar

**Soal 5 (hitungan).** Sebuah game berjalan 60 FPS. Berapa frame time-nya? Jika frame time naik menjadi 25 ms, berapa FPS-nya?

> **Jawab:** 1000/60 = **16.67 ms**. FPS = 1000/25 = **40 FPS**.

**Soal 6 (hitungan).** Layar 1920×1080 memakai RGBA 8-bit per channel. Berapa jumlah pixel dan ukuran color buffer?

> **Jawab:** 1920 × 1080 = **2.073.600 pixel**. RGBA 8-bit = 4 byte/pixel → 2.073.600 × 4 = **8.294.400 byte ≈ 8,3 MB**.

**Soal 7 (hitungan).** Data `{-1, -1, 0, 1, 1, -1}` dibaca dengan `gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0)`. Ada berapa titik?

> **Jawab: 2 titik.** 6 elemen ÷ size 3 = 2 vertex. (Jika size 2 → 3 vertex.)

**Soal 8 (isian).** Gambar berupa garis-garis tersambung berurutan **tanpa menutup** ke titik awal: `gl.drawArrays(____, 0, n)`. Dan jika ada 6 vertex dengan `gl.LINES`, berapa garis?

> **Jawab:** `gl.LINE_STRIP` (LINE_LOOP menutup). 6 vertex dengan LINES → **3 garis**.

### 7.3 Debug Kode WebGL

**Soal 9 (uniform).** Cari baris yang salah:

```javascript
var thetaLoc = gl.getUniformLocation(program, ”Theta");
// shader: uniform vec3 uTheta;
```

> **Perbaikan:** `gl.getUniformLocation(program, "uTheta");`. Nama harus **sama persis** dengan shader (dan tanda kutip biasa). Jika salah → lokasi `null`, nilai tidak terkirim.

**Soal 10 (in/out).**

```glsl
// vertex    out vec3 fColor; ... fColor = aColor;
// fragment  out vec4 fColor; in vec3 vColor;
//           fColor = vec4(vColor, 0.5);
```

> **Jawab:** nama varying ⚠️ **tidak konsisten**. Ubah input fragment menjadi `in vec3 fColor;` dan ganti nama output (mis. `out vec4 fragColor; fragColor = vec4(fColor, 0.5);`) agar tidak bentrok.

**Soal 11 (warna).** Buffer warna per vertex `[0,0,1, 0,1,0, 1,0,0]`, vertex shader meneruskan warna, fragment shader `fColor = vec4(vColor, 0.5)`. Warna objek?

> **Jawab:** segitiga **gradasi biru–hijau–merah** (hasil interpolasi) dan **semi transparan** (alpha 0.5). Jika `fColor = vec4(0.0, 0.0, 1.0, 1.0)` → biru solid.

**Soal 12 (benar/salah).**

```javascript
for (theta = 0; theta < thetaMax; theta += dtheta) {
  vertices[0] = vec2(Math.sin(theta), Math.cos(theta)); ...
  gl.bufferSubData(...); render(); }
```

"Perhitungan transformasi segitiga dilakukan di GPU." Benar/salah?

> **Jawab: Salah.** Posisi dihitung di **JavaScript (CPU)** dengan Math.sin/cos lalu dikirim ulang. Agar di GPU: kirim sudut sebagai uniform, rotasi dihitung di vertex shader.

### 7.4 Pipeline & API

**Soal 13.** Apa yang dilakukan Rasterizer? Dan tahap mana yang menentukan **warna dan kedalaman** pixel?

> **Jawab:** Rasterizer **menghasilkan fragment untuk setiap objek** (primitive → fragment). Warna & kedalaman ditentukan **Fragment Processor**.

**Soal 14.** Di mana proses transformasi dapat dilakukan dalam pipeline?
a. di aplikasi atau vertex shader · b. di canvas · c. CPU saja · d. hanya fragment shader

> **Jawab: a.** Di aplikasi (CPU) atau vertex shader (GPU, paralel). Fragment shader fokus ke warna.

**Soal 15.** Fungsi dari: (a) `gl_PointSize`, (b) `gl.clearColor()`, (c) `gl.getUniformLocation()`, (d) `gl.enable(gl.DEPTH_TEST)`?

> **Jawab:** (a) ukuran titik yang dirender (mode POINTS) · (b) mengatur **warna background** · (c) mengambil lokasi variabel uniform di shader · (d) mengaktifkan **z-buffer untuk hidden-surface removal**.

**Soal 16.**

```javascript
window.addEventListener("keydown", function() { render(); });
```

`render()` dipanggil ketika pengguna ___. Apa fungsi event listener?

> **Jawab:** **menekan tombol keyboard**. Event listener **memproses event yang dipicu user** (click, keydown, mousemove, resize).

### 7.5 Transformasi

**Soal 17 (hitungan).** Titik P(3, 4) dirotasi 90° berlawanan jarum jam terhadap origin. Tentukan P'.

> **Jawab:** x' = 3·0 − 4·1 = −4; y' = 3·1 + 4·0 = 3 → **P' = (−4, 3)**. Rumus: x' = x cos θ − y sin θ, y' = x sin θ + y cos θ.

**Soal 18 (hitungan).** P(1, 2) ditranslasi T(2, 3) **lalu** diskala S(2, 2). Tuliskan matrix komposisinya dan hasilnya. Bandingkan jika urutan dibalik.

> **Jawab:** T dulu lalu S → **M = S·T**: (1,2) → (3,5) → **(6, 10)**. Jika S dulu lalu T (M = T·S): (2,4) → **(4, 7)**. Berbeda karena perkalian matrix **tidak komutatif**.

**Soal 19.** (a) Objek diputar terhadap sumbu z, apa yang terjadi pada elemen z? (b) `vec4(3, 2, 4, 1)` berupa apa? (c) Mengapa urutan matrix penting?

> **Jawab:** (a) **tetap sama** · (b) **titik** (w = 1) di (3,2,4); w = 0 berarti vektor arah · (c) karena **matrix paling kanan dikomputasi terlebih dahulu** dan perkalian tidak komutatif.

**Soal 20 (hitungan 3D).** Titik (1, 0, 0, 1) dikenai M = T(0, 0, −5) · R<sub>y</sub>(90°). Hasilnya?

> **Jawab:** R<sub>y</sub>(90°): x' = x cos θ + z sin θ = 0, z' = −x sin θ + z cos θ = −1 → (0, 0, −1). Lalu T → **(0, 0, −6, 1)**. Inverse transformasi (mis. T(+5) atau R(−90°)) **mengembalikan objek ke posisi awal**.

### 7.6 Camera & Proyeksi

**Soal 21 (hitungan).** Camera di (4, 0, 3) melihat target (0, 0, 0), up = (0, 1, 0). Tentukan forward dan right vector.

> **Jawab:** T − P = (−4, 0, −3), panjang 5 → **F = (−0.8, 0, −0.6)**. R = F × up = (0·0 − (−0.6)·1, (−0.6)·0 − (−0.8)·0, (−0.8)·1 − 0·0) = **(0.6, 0, −0.8)** (sudah unit).

**Soal 22 (hitungan).** Canvas 400×400. Vertex di NDC (−0.5, 0.25). Di pixel berapa (origin kiri atas)?

> **Jawab:** x = (−0.5 + 1)/2 × 400 = **100**; y = (1 − 0.25)/2 × 400 = **150** → **(100, 150)**.

**Soal 23.** (a) Proyeksi yang semua proyektornya bertemu di satu titik? (b) Kenapa lebih realistis? (c) Posisi camera diatur lewat? (d) Fungsi LookAt? (e) Tujuan clipping?

> **Jawab:** (a) **Perspective** · (b) objek jauh tampak lebih kecil · (c) **model-view matrix** · (d) mengatur posisi & orientasi camera · (e) hanya menampilkan objek di dalam view volume.

**Soal 24 (analisis).** Segitiga (−2,−2), (0,2), (2,−2) dengan `ortho(0, 0.5, 0, 0.5, 0, 1)`. Bangun apa yang tampak?

> **Jawab:** semua vertex di luar volume, ⚠️ **tetapi** area x∈[0,0.5], y∈[0,0.5] **seluruhnya berada di dalam segitiga** (di y = 0 segitiga selebar x∈[−1,1]). Hasilnya: **persegi penuh satu canvas** berwarna segitiga.

### 7.7 Lighting

**Soal 25.** (a) Komponen model Phong? (b) Peran shininess? (c) Ambient light? (d) Fungsi halfway vector? (e) Permukaan yang memantulkan ke semua arah merata?

> **Jawab:** (a) **ambient, diffuse, specular** · (b) menentukan **tingkat kilauan** · (c) cahaya dari banyak sumber yang tersebar di lingkungan · (d) **mempermudah perhitungan specular** (Blinn-Phong) · (e) **diffuse surface**.

**Soal 26 (hitungan).** N = (0, 0, 1), L = normalize(0, 1, 1). k<sub>a</sub> = 0.2, I<sub>a</sub> = 1, k<sub>d</sub> = 0.8, I<sub>l</sub> = 1. Hitung ambient + diffuse.

> **Jawab:** L = (0, 0.707, 0.707); N·L = 0.707. Diffuse = 0.8 × 1 × 0.707 = 0.566. Ambient = 0.2. Total = **0.766**.

**Soal 27 (hitungan).** Diketahui R·V = 0.9. Bandingkan nilai specular untuk shininess n = 10 dan n = 100.

> **Jawab:** 0.9<sup>10</sup> ≈ **0.349**; 0.9<sup>100</sup> ≈ **0.00003**. Shininess besar → highlight hanya terang saat R hampir sama dengan V → **highlight kecil & tajam**.

**Soal 28.** (a) Informasi selain posisi & warna agar bisa menghitung cahaya? (b) Normal bidang dihitung dengan? (c) Beda light w = 1.0 dan w = 0.0? (d) Kenapa lighting/shading diperlukan?

> **Jawab:** (a) **vektor normal** · (b) **cross product** dua vektor pada bidang · (c) w = 1 posisi titik (point light), w = 0 cahaya jauh/directional · (d) agar objek **lebih realistis**.

### 7.8 Isian Kode Lighting & Texture

**Soal 29 (isian).**

```glsl
vec3 H = normalize(vL + vE);
vec4 ambient = uAmbientProduct;
float Kd = max(dot(vL, vN), 0.0);
vec4 diffuse = Kd * uDiffuseProduct;
float Ks = pow(max(dot(N, H), 0.0), uShininess);
vec4 specular = Ks * uSpecularProduct;
if (dot(L, N) < 0.0) specular = vec4(0,0,0,1);
fColor = ______________;   fColor.a = 1.0;
```

> **Jawab:** `fColor = ambient + diffuse + specular;`
>
> Variasi: objek berwarna biru `vec3 Warna = vec3(0,0,1)` yang berinteraksi dengan cahaya:
> `fColor = vec4((ambient.rgb + diffuse.rgb) * Warna + specular.rgb, 1.0);`
> Ambient & diffuse dikali warna objek; specular (kilau) tetap warna cahaya.

**Soal 30 (isian).**

```glsl
in vec4 vColor;            // warna dari rasterizer
in vec2 TexCoord;          // texture coordinate
uniform sampler2D Texture; // texture object
void main() {
  gl_FragColor = vColor * texture( ________ );
}
```

> **Jawab:** `texture(Texture, TexCoord)`

**Soal 31 (isian).** Sama seperti di atas, ditambah `in vec4 LightColor;` (hasil Phong dari vertex shader). Agar objek punya tekstur, efek cahaya, dan warna:

> **Jawab:** `gl_FragColor = LightColor * vColor * texture2D(Texture, TexCoord);`

### 7.9 Texture

**Soal 32.** (a) Koordinat tekstur adalah…? (b) Fungsi utama texture mapping? (c) Fungsi `texImage2D`? (d) Cara mendefinisikan texture dari file GIF?

> **Jawab:** (a) **titik-titik pada gambar yang akan dipetakan ke permukaan** · (b) menambahkan detail visual pada permukaan · (c) mendefinisikan texture sebagai **array texel** · (d) memuat gambar dengan **objek Image** di JavaScript.

**Soal 33 (benar/salah).** "Agar bisa mengaplikasikan tekstur ke suatu objek, kita membutuhkan informasi vektor normal."

> **Jawab: Salah.** Yang dibutuhkan **koordinat tekstur (u, v)**. Normal untuk lighting (baru ikut berperan di bump/normal mapping).

**Soal 34.** Sebuah quad memakai UV (0,0) sampai (3,3). Bagaimana tampilan texture dengan wrap REPEAT, CLAMP_TO_EDGE, dan MIRRORED_REPEAT?

> **Jawab:** REPEAT → texture terulang **3×3** · CLAMP → texture asli hanya di 1/9 kiri-bawah, sisanya **warna tepi ditarik** · MIRRORED → 3×3 dengan pola **cermin bergantian**.

**Soal 35.** (a) Metode memetakan texture ke permukaan sederhana sebelum ke objek sebenarnya? (b) Texture kecil diperbesar di layar terlihat kotak-kotak tajam; filter apa yang dipakai & bagaimana agar halus?

> **Jawab:** (a) **Two-part mapping** · (b) **NEAREST** (1 texel terdekat); ganti ke **LINEAR** (interpolasi texel sekitar) agar halus.

### 7.10 Hierarchical

**Soal 36.** (a) Tujuan utama hierarchical modeling? (b) Keuntungan utamanya? (c) Fungsi stack dalam traversal? (d) Kegunaan rotate & translate?

> **Jawab:** (a) **merepresentasikan hubungan antar bagian objek** · (b) **mempermudah rendering dinamis** · (c) **menyimpan model-view matrix sementara** · (d) **membentuk matrix transformasi**.

**Soal 37 (analisis).** Robot arm: base diputar R<sub>b</sub>, lower arm ditranslasi T<sub>lu</sub> dan diputar R<sub>lu</sub>, upper arm T<sub>uu</sub>, R<sub>uu</sub>. Matrix untuk upper arm?

> **Jawab:** **M = R<sub>b</sub> · T<sub>lu</sub> · R<sub>lu</sub> · T<sub>uu</sub> · R<sub>uu</sub>**. Matrix child = matrix parent × transformasi lokal.

**Soal 38 (analisis).** Dengan left-child right-sibling (torso → head, LUA, RUA, LUL, RUL; tiap upper punya lower), urutan node yang digambar oleh preorder `traverse(torsoId)`?

> **Jawab:** Torso → Head → L-upper arm → L-lower arm → R-upper arm → R-lower arm → L-upper leg → L-lower leg → R-upper leg → R-lower leg. (Node dulu, lalu child, lalu sibling.)

**Soal 39 (hitungan).** Pada humanoid: berapa sudut joint yang menentukan posisi figure, dan berapa matrix yang relevan? Mengapa roda mobil bisa dimodelkan dengan DAG?

> **Jawab:** **11 sudut** (head 2, lainnya 1) dan **10 matrix** (M, M<sub>h</sub>, 4 upper, 4 lower). DAG karena 4 roda **identik** → satu node wheel dengan 4 edge.

### 7.11 Soal Uraian (Esai)

**Esai 1.** Jelaskan alur sebuah segitiga dari JavaScript sampai tampil di Canvas WebGL.

> Float32Array → createBuffer/bindBuffer/bufferData (GPU) → getAttribLocation + enableVertexAttribArray + vertexAttribPointer → useProgram → drawArrays → vertex shader (gl_Position) → primitive assembly → rasterization (fragment, interpolasi) → fragment shader (warna) → depth test → framebuffer → canvas.

**Esai 2.** Mengapa grafika komputer memakai homogeneous coordinate?

> Translasi adalah penjumlahan, tidak bisa dinyatakan dengan matrix linear 2×2/3×3. Dengan menambah komponen w (x,y,z,1), translasi, rotasi, skala (dan proyeksi) menjadi **satu perkalian matrix 4×4** sehingga bisa digabung (komposisi) dan dikirim sebagai satu uniform. w juga membedakan titik (1) dan vektor (0).

**Esai 3.** Bandingkan flat shading dan smooth shading.

> Flat: satu normal per face, lighting konstan per face, sisi terlihat tegas (low-poly). Smooth: normal per vertex diinterpolasi menjadi normal per fragment, transisi halus, objek polygonal tampak mulus.

**Esai 4.** Jelaskan perbedaan orthographic dan perspective projection beserta kegunaannya.

> Ortho: sinar sejajar, volume box (left, right, bottom, top, near, far), ukuran tidak berubah terhadap jarak, untuk CAD/teknik/peta. Perspective: sinar bertemu di COP, volume frustum (fov, aspect, near, far), jauh tampak kecil, lebih realistis, untuk game/VR/simulator.

---

## 8. Cheat Sheet

### Real-time & NDC

| Topik | Rumus / fakta |
|---|---|
| Frame time | frame time = 1000 / FPS · 60 FPS = 16.67 ms · 30 FPS = 33.33 ms |
| Resolusi | Full HD = 2.073.600 pixel · RGBA 8-bit = 4 byte/pixel |
| NDC | x, y, z ∈ [−1, 1], (0,0) di tengah |
| Viewport | x<sub>px</sub> = (x+1)/2 · W · y<sub>px</sub> = (1−y)/2 · H (origin kiri atas) |

### WebGL

| Topik | Rumus / fakta |
|---|---|
| Vertex attribute | #vertex = #elemen / size |
| Fungsi | `vertexAttribPointer(loc, size, type, normalized, stride, offset)` · `drawArrays(mode, first, count)` |
| Draw mode (n vertex) | POINTS: n titik · LINES: n/2 garis · LINE_STRIP: n−1 (tidak menutup) · LINE_LOOP: n (menutup) · TRIANGLES: n/3 |
| Data shader | **attribute** (in): per vertex · **uniform**: per draw call · **out → in**: diinterpolasi, nama harus sama |

### Transformasi

| Topik | Rumus / fakta |
|---|---|
| Rotasi 2D (CCW) | x' = x cos θ − y sin θ · y' = x sin θ + y cos θ |
| Radian | rad = deg · π / 180 |
| Homogeneous | 2D → 3×3, 3D → 4×4 · w = 1 → **titik** (kena translasi) · w = 0 → **vektor arah** (tidak kena) |
| Komposisi | P' = M₃ M₂ M₁ P → M₁ dikerjakan **pertama** (paling kanan) · Model = T·R·S (S dulu) |
| Inverse | T(t)⁻¹ = T(−t) · R(θ)⁻¹ = R(−θ) = Rᵀ · S(s)⁻¹ = S(1/s) · (AB)⁻¹ = B⁻¹A⁻¹ |
| Rotasi 3D | R<sub>z</sub> tidak mengubah z (R<sub>x</sub> tidak mengubah x, R<sub>y</sub> tidak mengubah y) |

### Camera & Proyeksi

| Topik | Rumus / fakta |
|---|---|
| Camera | F = normalize(target − eye) · R = normalize(F × up) · U = R × F |
| View | View = inverse(camera transform); camera di origin menghadap −Z |
| Pipeline | clip = P · V · M · local · Local →M→ World →V→ View →P→ Clip →÷w→ NDC →viewport→ Screen |
| Proyeksi | **Ortho:** sejajar, box, ukuran tetap · **Perspective:** COP, frustum, jauh = kecil |
| Parameter | aspect = W/H · FOV kecil = zoom |
| Cube & depth | 8 sudut · 6 face · 12 triangle · 36 vertex (drawArrays) · 24 vertex unik per-face · `enable(DEPTH_TEST)` + clear `DEPTH_BUFFER_BIT` · CCW = front face |

### Lighting & Texture

| Topik | Rumus / fakta |
|---|---|
| Cross product | a×b = (a<sub>y</sub>b<sub>z</sub>−a<sub>z</sub>b<sub>y</sub>, a<sub>z</sub>b<sub>x</sub>−a<sub>x</sub>b<sub>z</sub>, a<sub>x</sub>b<sub>y</sub>−a<sub>y</sub>b<sub>x</sub>) |
| Dot product | a·b = \|a\|\|b\| cos θ |
| Normal bidang | (P₂−P₁) × (P₃−P₁) |
| Phong | I = k<sub>a</sub>I<sub>a</sub> + k<sub>d</sub>I<sub>l</sub>max(N·L,0) + k<sub>s</sub>I<sub>l</sub>max(R·V,0)<sup>n</sup> |
| Vektor lighting | L = norm(lightPos − P) · V = norm(camPos − P) · R = reflect(−L, N) · H = norm(L+V) |
| Normal matrix | (M₃ₓ₃⁻¹)ᵀ |
| Shininess | n besar = highlight kecil & tajam |
| Texture | UV ∈ [0,1] · texel = elemen texture · `texture(sampler, uv)` · texImage2D = array texel |
| Filtering & wrap | NEAREST tajam · LINEAR halus · REPEAT / CLAMP_TO_EDGE / MIRRORED_REPEAT |

### Hierarchical

| Topik | Rumus / fakta |
|---|---|
| Matrix child | child = parent × lokal (R<sub>b</sub>T<sub>lu</sub>R<sub>lu</sub>T<sub>uu</sub>R<sub>uu</sub>) |
| Traversal | push → mult → render → child → pop → sibling |
| Humanoid | 11 sudut, 10 matrix |

---

## Penutup: satu benang merah untuk diingat

```
Data → Vertex → Transform (MVP) → Primitive → Rasterization → Fragment (light + texture) → Framebuffer
```

Kalau bingung saat ujian, tanyakan: **"soal ini membahas tahap pipeline yang mana?"** Hampir semua soal (transformasi, kamera, lighting, texture, hierarki) adalah detail dari salah satu kotak di atas.

Semoga lancar ETS-nya.
