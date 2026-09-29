# Modul Praktikum Grafika Komputer --- Pertemuan 2

## WebGL Fundamental --- WebGL Primitive Playground

**Mata Kuliah:** EF234504 --- Grafika Komputer\
**Pertemuan:** 2\
**Topik:** WebGL Fundamental\
**Departemen:** Teknik Informatika

------------------------------------------------------------------------

## 1. Deskripsi Praktikum

Pada praktikum ini mahasiswa mulai berpindah dari pendekatan **HTML
Canvas 2D** yang relatif high-level menuju **WebGL2** yang lebih dekat
dengan graphics pipeline dan GPU.

Target utama praktikum bukan sekadar menghasilkan gambar di browser.
Mahasiswa harus memahami bagaimana sebuah primitive dapat muncul pada
Canvas melalui alur:

``` text
JavaScript
    ↓
Vertex Data
    ↓
Float32Array
    ↓
WebGL Buffer
    ↓
Attribute
    ↓
Vertex Shader
    ↓
Primitive Assembly
    ↓
Rasterization
    ↓
Fragment Shader
    ↓
Framebuffer
    ↓
Canvas
```

Aplikasi akhir yang dibuat bernama **WebGL Primitive Playground**.

Aplikasi minimal menampilkan:

-   minimal 3 primitive,
-   minimal 2 draw mode,
-   vertex color,
-   minimal 3 warna,
-   satu primitive bergerak,
-   satu interaksi mouse atau keyboard,
-   rendering loop,
-   source code yang terstruktur,
-   minimal dua challenge tambahan.

Praktikum sengaja menggunakan WebGL secara langsung tanpa Three.js agar
mahasiswa memahami komponen low-level yang nantinya tetap bekerja di
balik library atau engine grafika.

------------------------------------------------------------------------

## 2. Capaian Praktikum

Setelah menyelesaikan praktikum, mahasiswa diharapkan mampu:

1.  membuat elemen HTML Canvas;
2.  memperoleh WebGL2 Context;
3.  mengatur viewport dan membersihkan framebuffer;
4.  menggunakan koordinat **Normalized Device Coordinate (NDC)**;
5.  mendefinisikan vertex menggunakan `Float32Array`;
6.  membentuk point, line, dan triangle dari vertex;
7.  membuat dan mengisi GPU buffer;
8.  menulis vertex shader dan fragment shader sederhana;
9.  melakukan compile shader dan link shader program;
10. menghubungkan buffer dengan attribute pada vertex shader;
11. menggunakan `gl.drawArrays()` untuk melakukan draw call;
12. mengirim position dan color sebagai vertex attribute;
13. menggunakan lebih dari satu draw mode;
14. membuat rendering loop dengan `requestAnimationFrame()`;
15. membuat animasi sederhana dengan mengubah data vertex;
16. menambahkan interaksi keyboard atau mouse;
17. melakukan debugging terhadap masalah WebGL dasar.

------------------------------------------------------------------------

## 3. Konsep yang Harus Dipahami

### 3.1 WebGL sebagai API Low-Level

WebGL bukan scene framework. WebGL tidak langsung menyediakan konsep
seperti:

-   scene,
-   camera,
-   mesh,
-   light,
-   material.

Programmer harus menyiapkan sendiri data vertex, buffer, shader,
attribute, state rendering, dan draw call.

Pada praktikum ini, hubungan yang paling penting adalah:

``` text
Buffer → Attribute → Vertex Shader
```

dan:

``` text
Draw Call
   ↓
Vertex Shader
   ↓
Primitive
   ↓
Rasterization
   ↓
Fragment Shader
   ↓
Image
```

### 3.2 Normalized Device Coordinate

Pada Canvas 2D, koordinat biasanya dinyatakan dalam pixel. Pada contoh
WebGL fundamental ini, posisi vertex langsung diberikan dalam ruang NDC:

``` text
X : -1 sampai +1
Y : -1 sampai +1
```

Posisi penting:

``` text
(-1,  1)          (1,  1)
     ┌────────────┐
     │            │
     │   (0,0)    │
     │            │
     └────────────┘
(-1, -1)          (1, -1)
```

Contoh triangle:

``` text
V0 = (-0.5, -0.5)
V1 = ( 0.5, -0.5)
V2 = ( 0.0,  0.5)
```

Semua titik tersebut berada di dalam rentang NDC sehingga dapat terlihat
pada viewport.

### 3.3 Vertex dan Primitive

**Vertex** adalah titik data yang diproses graphics pipeline. Vertex
dapat membawa beberapa attribute, misalnya:

``` text
Position
Color
Normal
Texture Coordinate
```

Pada praktikum ini digunakan:

``` text
Position + Color
```

Vertex kemudian dirakit menjadi primitive. Draw mode yang digunakan
antara lain:

``` javascript
gl.POINTS
gl.LINES
gl.LINE_STRIP
gl.LINE_LOOP
gl.TRIANGLES
```

### 3.4 Buffer

Data JavaScript tidak langsung digunakan oleh GPU. Data numerik terlebih
dahulu disusun menggunakan typed array, kemudian di-upload ke buffer.

``` text
JavaScript
    ↓
Float32Array
    ↓
gl.bufferData()
    ↓
GPU Buffer
```

### 3.5 Attribute

Attribute adalah data **per vertex** yang dibaca oleh vertex shader.

Contoh:

``` glsl
in vec2 a_position;
in vec3 a_color;
```

Jika terdapat tiga vertex, maka setiap vertex memiliki position dan
color masing-masing.

### 3.6 Vertex Shader

Vertex shader berjalan satu kali untuk setiap vertex. Tugas utama pada
praktikum ini adalah:

-   membaca position;
-   membaca color;
-   menghasilkan `gl_Position`;
-   meneruskan color menuju tahap berikutnya.

### 3.7 Fragment Shader

Setelah primitive mengalami rasterization, fragment shader menentukan
warna fragment.

Untuk vertex color, warna yang diterima fragment shader merupakan hasil
interpolasi dari warna vertex.

### 3.8 Draw Call

Draw call memicu graphics pipeline.

Contoh:

``` javascript
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

Artinya:

-   mode = `TRIANGLES`,
-   mulai dari vertex indeks 0,
-   gunakan 3 vertex.

------------------------------------------------------------------------

## 4. Perangkat dan Persiapan

### 4.1 Perangkat Lunak

Gunakan:

-   browser modern yang mendukung WebGL2;
-   text editor atau IDE, misalnya Visual Studio Code;
-   Developer Tools browser;
-   local development server.

Disarankan menjalankan project melalui local server, bukan hanya membuka
file dengan `file://`.

### 4.2 Struktur Folder

Buat folder:

``` text
praktikum-webgl-p2/
├── index.html
├── main.js
└── README.md
```

`README.md` digunakan untuk mencatat identitas, fitur yang berhasil
dibuat, challenge yang dipilih, dan catatan pengujian.

------------------------------------------------------------------------

# BAGIAN A --- MEMBANGUN PROGRAM WEBGL PERTAMA

## 5. Langkah 1 --- Membuat HTML Canvas

Buat `index.html`:

``` html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebGL Primitive Playground</title>

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #111827;
      color: white;
      font-family: Arial, sans-serif;
    }

    canvas {
      border: 1px solid #64748b;
      background: black;
    }

    p {
      margin-bottom: 8px;
    }
  </style>
</head>

<body>
  <h1>WebGL Primitive Playground</h1>
  <p id="info">Pertemuan 2 — WebGL Fundamental</p>

  <canvas
    id="glCanvas"
    width="800"
    height="600">
  </canvas>

  <script src="main.js"></script>
</body>
</html>
```

### Penjelasan

Canvas berukuran:

``` text
800 × 600 pixel
```

Namun vertex WebGL yang digunakan nanti tidak langsung ditulis dalam
pixel. Kita menggunakan NDC.

------------------------------------------------------------------------

## 6. Langkah 2 --- Membuat WebGL2 Context

Buat `main.js`:

``` javascript
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  alert("WebGL2 tidak tersedia pada browser/perangkat ini.");
  throw new Error("WebGL2 tidak tersedia.");
}
```

### Penjelasan

Variabel:

``` javascript
gl
```

adalah interface utama untuk memanggil operasi WebGL.

Jika:

``` javascript
canvas.getContext("webgl2")
```

gagal, nilai yang diperoleh adalah `null`.

------------------------------------------------------------------------

## 7. Langkah 3 --- Mengatur Viewport

Tambahkan:

``` javascript
gl.viewport(
  0,
  0,
  canvas.width,
  canvas.height
);
```

Viewport menentukan area framebuffer yang dipetakan ke Canvas.

Untuk praktikum ini seluruh Canvas digunakan sebagai viewport.

------------------------------------------------------------------------

## 8. Langkah 4 --- Membersihkan Canvas

Tambahkan:

``` javascript
gl.clearColor(
  0.05,
  0.08,
  0.15,
  1.0
);

gl.clear(gl.COLOR_BUFFER_BIT);
```

WebGL menggunakan komponen warna dalam rentang:

``` text
0.0 sampai 1.0
```

Urutan parameter:

``` text
R, G, B, A
```

Contoh:

``` text
(1, 0, 0, 1) = merah
(0, 1, 0, 1) = hijau
(0, 0, 1, 1) = biru
(1, 1, 1, 1) = putih
```

Jalankan halaman. Jika Canvas terlihat dengan background gelap, berarti
WebGL Context dan proses clear telah bekerja.

------------------------------------------------------------------------

# BAGIAN B --- TRIANGLE PERTAMA

## 9. Langkah 5 --- Menentukan Vertex Data

Tambahkan:

``` javascript
const trianglePositions = new Float32Array([
  -0.5, -0.5,
   0.5, -0.5,
   0.0,  0.5
]);
```

Interpretasi data:

``` text
Vertex 0 → (-0.5, -0.5)
Vertex 1 → ( 0.5, -0.5)
Vertex 2 → ( 0.0,  0.5)
```

Setiap vertex memiliki dua komponen:

``` text
X, Y
```

Total nilai:

``` text
3 vertex × 2 float = 6 float
```

### Eksperimen

Ubah vertex ketiga menjadi:

``` javascript
0.0, 0.8
```

Perhatikan bahwa puncak triangle menjadi lebih tinggi.

Kembalikan nilainya setelah memahami perubahan tersebut.

------------------------------------------------------------------------

## 10. Langkah 6 --- Membuat Position Buffer

Tambahkan:

``` javascript
const positionBuffer = gl.createBuffer();
```

`createBuffer()` membuat objek buffer, tetapi buffer belum berisi data.

Aktifkan buffer:

``` javascript
gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer
);
```

Upload data:

``` javascript
gl.bufferData(
  gl.ARRAY_BUFFER,
  trianglePositions,
  gl.STATIC_DRAW
);
```

### Arti `STATIC_DRAW`

`gl.STATIC_DRAW` merupakan usage hint bahwa data relatif jarang berubah
dan akan digunakan untuk rendering.

Alur yang baru dilakukan:

``` text
trianglePositions
       ↓
Float32Array
       ↓
positionBuffer
       ↓
GPU
```

------------------------------------------------------------------------

# BAGIAN C --- SHADER

## 11. Langkah 7 --- Menulis Vertex Shader

Tambahkan source vertex shader:

``` javascript
const vertexShaderSource = `#version 300 es

in vec2 a_position;

void main() {
  gl_Position = vec4(
    a_position,
    0.0,
    1.0
  );
}
`;
```

### Penjelasan

Baris:

``` glsl
in vec2 a_position;
```

menyatakan bahwa shader menerima attribute position yang terdiri dari:

``` text
X dan Y
```

Baris:

``` glsl
gl_Position = vec4(a_position, 0.0, 1.0);
```

mengubah `vec2` menjadi `vec4`:

``` text
x = position.x
y = position.y
z = 0
w = 1
```

Pada praktikum fundamental ini, position langsung digunakan sebagai
posisi output.

------------------------------------------------------------------------

## 12. Langkah 8 --- Menulis Fragment Shader

Tambahkan:

``` javascript
const fragmentShaderSource = `#version 300 es

precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(
    0.0,
    0.7,
    1.0,
    1.0
  );
}
`;
```

Untuk tahap awal seluruh triangle akan memiliki satu warna.

------------------------------------------------------------------------

## 13. Langkah 9 --- Membuat Fungsi Compile Shader

Daripada mengulang kode, buat helper:

``` javascript
function createShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(
    shader,
    gl.COMPILE_STATUS
  );

  if (!success) {
    const info = gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error(
      "Shader gagal dikompilasi:\n" + info
    );
  }

  return shader;
}
```

Compile kedua shader:

``` javascript
const vertexShader = createShader(
  gl,
  gl.VERTEX_SHADER,
  vertexShaderSource
);

const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource
);
```

### Mengapa Shader Info Log Penting?

Jika GLSL memiliki typo atau syntax error, browser tidak selalu
menunjukkan hasil visual yang membantu. Info log merupakan sumber utama
untuk mengetahui kesalahan compile.

Coba sementara ubah:

``` glsl
gl_Position
```

menjadi nama yang salah, jalankan program, dan amati error pada Console.
Setelah itu kembalikan kode.

------------------------------------------------------------------------

## 14. Langkah 10 --- Link Shader Program

Buat helper:

``` javascript
function createProgram(
  gl,
  vertexShader,
  fragmentShader
) {
  const program = gl.createProgram();

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(
    program,
    gl.LINK_STATUS
  );

  if (!success) {
    const info = gl.getProgramInfoLog(program);

    gl.deleteProgram(program);

    throw new Error(
      "Program gagal di-link:\n" + info
    );
  }

  return program;
}
```

Buat program:

``` javascript
const program = createProgram(
  gl,
  vertexShader,
  fragmentShader
);
```

Gunakan program:

``` javascript
gl.useProgram(program);
```

Alurnya:

``` text
Vertex Shader ───┐
                 ├→ Link → Shader Program
Fragment Shader ─┘
```

------------------------------------------------------------------------

# BAGIAN D --- MENGHUBUNGKAN BUFFER KE SHADER

## 15. Langkah 11 --- Mendapatkan Attribute Location

Tambahkan:

``` javascript
const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );
```

Nama:

``` text
a_position
```

harus sama dengan nama input pada vertex shader:

``` glsl
in vec2 a_position;
```

------------------------------------------------------------------------

## 16. Langkah 12 --- Mengaktifkan Attribute

Tambahkan:

``` javascript
gl.enableVertexAttribArray(
  positionLocation
);
```

Kemudian pastikan position buffer aktif:

``` javascript
gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer
);
```

------------------------------------------------------------------------

## 17. Langkah 13 --- Mengatur `vertexAttribPointer()`

Tambahkan:

``` javascript
gl.vertexAttribPointer(
  positionLocation,
  2,
  gl.FLOAT,
  false,
  0,
  0
);
```

Parameter tersebut berarti:

  Parameter                   Nilai Arti
  ------------ -------------------- ------------------------------
  location       `positionLocation` attribute tujuan
  size                          `2` X dan Y
  type                   `gl.FLOAT` setiap komponen berupa float
  normalized                `false` tidak dinormalisasi ulang
  stride                        `0` data tersusun berurutan
  offset                        `0` mulai dari awal buffer

Hubungan yang terbentuk:

``` text
trianglePositions
      ↓
positionBuffer
      ↓
vertexAttribPointer()
      ↓
a_position
      ↓
Vertex Shader
```

Ini merupakan salah satu hubungan paling penting yang harus dipahami
dalam praktikum.

------------------------------------------------------------------------

# BAGIAN E --- DRAW CALL

## 18. Langkah 14 --- Menggambar Triangle

Tambahkan:

``` javascript
gl.clear(gl.COLOR_BUFFER_BIT);

gl.drawArrays(
  gl.TRIANGLES,
  0,
  3
);
```

Jika seluruh tahap benar, sebuah triangle berwarna cyan akan terlihat.

### Membaca Draw Call

``` javascript
gl.drawArrays(mode, first, count);
```

Pada kode:

``` javascript
gl.drawArrays(gl.TRIANGLES, 0, 3);
```

artinya:

``` text
mode  = TRIANGLES
first = 0
count = 3
```

WebGL menggunakan tiga vertex mulai dari vertex pertama.

------------------------------------------------------------------------

## 19. Checkpoint 1

Sebelum melanjutkan, pastikan:

-   Canvas tampil.
-   WebGL2 Context berhasil.
-   Background dapat dibersihkan.
-   Shader berhasil di-compile.
-   Program berhasil di-link.
-   Buffer berisi tiga vertex.
-   `a_position` membaca dua float per vertex.
-   Triangle terlihat.
-   Console tidak menunjukkan error WebGL/JavaScript.

Jika triangle belum muncul, jangan langsung melanjutkan ke vertex color.

------------------------------------------------------------------------

# BAGIAN F --- MENAMBAHKAN VERTEX COLOR

## 20. Mengapa Vertex Color?

Pada tahap awal fragment shader menggunakan warna konstan.

Sekarang setiap vertex akan memiliki warna sendiri:

``` text
V0 → merah
V1 → hijau
V2 → biru
```

Warna kemudian diteruskan dari vertex shader menuju fragment shader.

------------------------------------------------------------------------

## 21. Langkah 15 --- Membuat Color Data

Tambahkan:

``` javascript
const triangleColors = new Float32Array([
  1.0, 0.0, 0.0,
  0.0, 1.0, 0.0,
  0.0, 0.0, 1.0
]);
```

Interpretasinya:

``` text
Vertex 0 = RGB(1,0,0)
Vertex 1 = RGB(0,1,0)
Vertex 2 = RGB(0,0,1)
```

Setiap vertex memiliki:

``` text
3 komponen warna
```

------------------------------------------------------------------------

## 22. Langkah 16 --- Membuat Color Buffer

Tambahkan:

``` javascript
const colorBuffer = gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  colorBuffer
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  triangleColors,
  gl.STATIC_DRAW
);
```

Sekarang terdapat dua buffer:

``` text
positionBuffer
colorBuffer
```

------------------------------------------------------------------------

## 23. Langkah 17 --- Mengubah Vertex Shader

Ganti vertex shader menjadi:

``` javascript
const vertexShaderSource = `#version 300 es

in vec2 a_position;
in vec3 a_color;

out vec3 v_color;

void main() {
  gl_Position = vec4(
    a_position,
    0.0,
    1.0
  );

  v_color = a_color;
}
`;
```

### Penjelasan

`a_color` adalah attribute per vertex.

``` glsl
out vec3 v_color;
```

mengirim data warna dari vertex shader menuju tahap berikutnya.

------------------------------------------------------------------------

## 24. Langkah 18 --- Mengubah Fragment Shader

Ganti fragment shader menjadi:

``` javascript
const fragmentShaderSource = `#version 300 es

precision highp float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor = vec4(
    v_color,
    1.0
  );
}
`;
```

Warna fragment sekarang berasal dari `v_color`.

Pada permukaan triangle akan terlihat transisi warna di antara warna
vertex karena nilai yang diterima fragment diinterpolasi selama
rasterization.

------------------------------------------------------------------------

## 25. Langkah 19 --- Menghubungkan Color Attribute

Setelah program dibuat, dapatkan location:

``` javascript
const colorLocation =
  gl.getAttribLocation(
    program,
    "a_color"
  );
```

Aktifkan:

``` javascript
gl.enableVertexAttribArray(
  colorLocation
);
```

Bind color buffer:

``` javascript
gl.bindBuffer(
  gl.ARRAY_BUFFER,
  colorBuffer
);
```

Atur pointer:

``` javascript
gl.vertexAttribPointer(
  colorLocation,
  3,
  gl.FLOAT,
  false,
  0,
  0
);
```

Perhatikan perbedaannya:

``` text
Position → 2 komponen
Color    → 3 komponen
```

------------------------------------------------------------------------

## 26. Checkpoint 2

Triangle sekarang harus memiliki minimal tiga warna.

Pastikan mahasiswa dapat menjelaskan:

``` text
positionBuffer → a_position
colorBuffer    → a_color
```

dan bukan hanya menyalin kode.

------------------------------------------------------------------------

# BAGIAN G --- MEMBUAT WEBGL PRIMITIVE PLAYGROUND

## 27. Strategi Implementasi

Aplikasi akhir memerlukan minimal tiga primitive dan dua draw mode.

Agar kode tetap mudah dipahami, kita akan menggunakan satu shader
program yang sama dan menggambar beberapa kelompok vertex menggunakan
`gl.drawArrays()`.

Untuk praktikum ini kita akan membuat:

1.  triangle dengan `gl.TRIANGLES`;
2.  line dengan `gl.LINES`;
3.  point dengan `gl.POINTS`.

Ini memenuhi:

``` text
3 jenis primitive
3 draw mode
```

Walaupun tugas minimum hanya meminta minimal dua draw mode.

------------------------------------------------------------------------

## 28. Langkah 20 --- Menyatukan Position Data

Gunakan data berikut:

``` javascript
const positions = new Float32Array([
  // Triangle: vertex 0-2
  -0.75, -0.35,
  -0.15, -0.35,
  -0.45,  0.35,

  // Line: vertex 3-4
   0.05, -0.25,
   0.75,  0.35,

  // Points: vertex 5-7
   0.15,  0.55,
   0.45,  0.65,
   0.75,  0.55
]);
```

Jumlah vertex:

``` text
3 + 2 + 3 = 8 vertex
```

------------------------------------------------------------------------

## 29. Langkah 21 --- Menyatukan Color Data

``` javascript
const colors = new Float32Array([
  // Triangle
  1.0, 0.2, 0.2,
  0.2, 1.0, 0.3,
  0.2, 0.5, 1.0,

  // Line
  1.0, 0.8, 0.1,
  1.0, 0.3, 0.8,

  // Points
  0.2, 1.0, 1.0,
  1.0, 0.5, 0.1,
  0.8, 0.4, 1.0
]);
```

Jumlah color harus sama dengan jumlah vertex:

``` text
8 vertex × 3 komponen = 24 nilai
```

------------------------------------------------------------------------

## 30. Langkah 22 --- Menggambar Beberapa Primitive

Setelah attribute disiapkan, gunakan:

``` javascript
gl.drawArrays(
  gl.TRIANGLES,
  0,
  3
);

gl.drawArrays(
  gl.LINES,
  3,
  2
);

gl.drawArrays(
  gl.POINTS,
  5,
  3
);
```

### Membaca Parameter

Triangle:

``` text
first = 0
count = 3
```

Line:

``` text
first = 3
count = 2
```

Points:

``` text
first = 5
count = 3
```

Satu buffer dapat digunakan untuk beberapa draw call dengan memilih
bagian vertex stream yang berbeda.

------------------------------------------------------------------------

## 31. Langkah 23 --- Memperbesar Point

Pada vertex shader tambahkan:

``` glsl
gl_PointSize = 12.0;
```

Contoh:

``` glsl
void main() {
  gl_Position = vec4(
    a_position,
    0.0,
    1.0
  );

  gl_PointSize = 12.0;
  v_color = a_color;
}
```

Sekarang point lebih mudah terlihat.

------------------------------------------------------------------------

# BAGIAN H --- MERAPIKAN SOURCE CODE

## 32. Membuat Fungsi `setupAttribute()`

Agar hubungan buffer dan attribute tidak berulang, buat helper:

``` javascript
function setupAttribute(
  gl,
  buffer,
  location,
  size
) {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.enableVertexAttribArray(
    location
  );

  gl.vertexAttribPointer(
    location,
    size,
    gl.FLOAT,
    false,
    0,
    0
  );
}
```

Penggunaan:

``` javascript
setupAttribute(
  gl,
  positionBuffer,
  positionLocation,
  2
);

setupAttribute(
  gl,
  colorBuffer,
  colorLocation,
  3
);
```

------------------------------------------------------------------------

## 33. Membuat Fungsi `createBuffer()`

Buat helper:

``` javascript
function createBuffer(
  gl,
  data,
  usage = gl.STATIC_DRAW
) {
  const buffer = gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    data,
    usage
  );

  return buffer;
}
```

Kemudian:

``` javascript
const positionBuffer =
  createBuffer(gl, positions);

const colorBuffer =
  createBuffer(gl, colors);
```

Dengan cara ini, source code lebih mudah dibaca tanpa menyembunyikan
konsep WebGL yang sedang dipelajari.

------------------------------------------------------------------------

# BAGIAN I --- RENDERING LOOP DAN ANIMASI

## 34. Konsep Rendering Loop

Untuk gambar statis:

``` text
Initialize → Draw → Selesai
```

Untuk animasi:

``` text
Update
  ↓
Draw
  ↓
Next Frame
  ↓
Update
  ↓
...
```

Browser menyediakan:

``` javascript
requestAnimationFrame()
```

untuk meminta render pada frame berikutnya.

------------------------------------------------------------------------

## 35. Strategi Animasi Pertemuan 2

Transformation matrix baru menjadi materi pertemuan berikutnya. Karena
itu animasi praktikum ini dibuat dengan cara yang masih sesuai materi
WebGL Fundamental:

> mengubah nilai position pada vertex data, lalu meng-upload data
> position terbaru ke buffer.

Dengan demikian mahasiswa melihat bahwa data pada buffer dapat berubah
dan hasil draw call berikutnya menggunakan data terbaru.

------------------------------------------------------------------------

## 36. Langkah 24 --- Menyimpan Posisi Dasar

Gunakan:

``` javascript
const basePositions = new Float32Array([
  -0.75, -0.35,
  -0.15, -0.35,
  -0.45,  0.35,

   0.05, -0.25,
   0.75,  0.35,

   0.15,  0.55,
   0.45,  0.65,
   0.75,  0.55
]);

const positions =
  new Float32Array(basePositions);
```

`basePositions` menyimpan bentuk asli.

`positions` menjadi data kerja yang dapat berubah setiap frame.

------------------------------------------------------------------------

## 37. Langkah 25 --- Menggunakan Buffer Dinamis

Karena position akan diperbarui, buat position buffer dengan:

``` javascript
const positionBuffer =
  createBuffer(
    gl,
    positions,
    gl.DYNAMIC_DRAW
  );
```

Catatan: slide menjelaskan `STATIC_DRAW` untuk data yang relatif jarang
berubah. Pada bagian animasi ini kita menggunakan data yang memang
diperbarui setiap frame, sehingga penggunaan buffer dibedakan agar
maksud program lebih jelas.

------------------------------------------------------------------------

## 38. Langkah 26 --- Membuat State Animasi

Tambahkan:

``` javascript
let offsetX = 0.0;
let direction = 1.0;

const speed = 0.45;
```

Kita akan menggerakkan triangle ke kiri dan kanan.

------------------------------------------------------------------------

## 39. Langkah 27 --- Memperbarui Vertex Triangle

Buat:

``` javascript
function updateTriangle(deltaTime) {
  offsetX +=
    direction * speed * deltaTime;

  if (offsetX > 0.35) {
    offsetX = 0.35;
    direction = -1.0;
  }

  if (offsetX < -0.15) {
    offsetX = -0.15;
    direction = 1.0;
  }

  // Hanya vertex 0-2 yang merupakan triangle.
  for (let i = 0; i < 3; i++) {
    const xIndex = i * 2;

    positions[xIndex] =
      basePositions[xIndex] + offsetX;

    positions[xIndex + 1] =
      basePositions[xIndex + 1];
  }
}
```

### Penjelasan

Setiap vertex position tersusun:

``` text
X, Y, X, Y, X, Y, ...
```

Karena itu indeks X adalah:

``` text
0, 2, 4, ...
```

Hanya tiga vertex pertama yang diubah sehingga line dan point tetap
diam.

------------------------------------------------------------------------

## 40. Langkah 28 --- Upload Position Terbaru

Buat:

``` javascript
function uploadPositions() {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    positions,
    gl.DYNAMIC_DRAW
  );
}
```

Setiap frame:

``` text
CPU/JavaScript mengubah positions
        ↓
bufferData()
        ↓
GPU buffer diperbarui
        ↓
drawArrays()
```

------------------------------------------------------------------------

## 41. Langkah 29 --- Membuat Fungsi Draw

``` javascript
function drawScene() {
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    0.05,
    0.08,
    0.15,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT
  );

  gl.useProgram(program);

  setupAttribute(
    gl,
    positionBuffer,
    positionLocation,
    2
  );

  setupAttribute(
    gl,
    colorBuffer,
    colorLocation,
    3
  );

  gl.drawArrays(
    gl.TRIANGLES,
    0,
    3
  );

  gl.drawArrays(
    gl.LINES,
    3,
    2
  );

  gl.drawArrays(
    gl.POINTS,
    5,
    3
  );
}
```

------------------------------------------------------------------------

## 42. Langkah 30 --- Membuat Rendering Loop

``` javascript
let previousTime = 0;

function render(currentTime) {
  const timeInSeconds =
    currentTime * 0.001;

  const deltaTime =
    timeInSeconds - previousTime;

  previousTime = timeInSeconds;

  updateTriangle(deltaTime);
  uploadPositions();
  drawScene();

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
```

### Mengapa Menggunakan `deltaTime`?

`deltaTime` menyatakan waktu antara frame saat ini dan frame sebelumnya.

Dengan pendekatan ini, pergerakan lebih berhubungan dengan waktu
daripada sekadar menambah posisi dengan angka tetap pada setiap frame.

------------------------------------------------------------------------

# BAGIAN J --- INTERAKSI KEYBOARD: EVENT-BASED DAN STATE-BASED

## 43. Target Interaksi

Pada aplikasi grafika real-time, input keyboard dapat diproses dengan dua pendekatan utama:

1. **event-based input**, yaitu aksi dijalankan ketika event keyboard terjadi;
2. **state-based input**, yaitu program menyimpan status tombol dan memeriksanya pada setiap frame.

Pada praktikum ini digunakan pendekatan **hybrid**:

```text
Event-Based
├── Space → pause/resume
└── R     → reset

State-Based
├── ArrowLeft  → bergerak terus ke kiri selama tombol ditekan
└── ArrowRight → bergerak terus ke kanan selama tombol ditekan
```

Pendekatan ini penting karena tidak semua jenis input sebaiknya diproses dengan cara yang sama.

------------------------------------------------------------------------

## 44. Event-Based vs State-Based

### 44.1 Event-Based Input

Event-based berarti program memberikan respons ketika browser mengirim event, misalnya:

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    // aksi ketika tombol ditekan
  }
);
```

Contoh penggunaan yang sesuai:

```text
Space → toggle pause
R     → reset
C     → mengganti warna
M     → mengganti mode
```

Karakteristiknya:

```text
Keyboard Event
      ↓
Event Handler
      ↓
Jalankan Aksi
```

Event-based sangat cocok untuk **aksi diskrit**, yaitu aksi yang cukup dijalankan sekali ketika tombol ditekan.

### 44.2 Kelebihan Event-Based

- implementasi sederhana;
- cocok untuk aksi sekali atau toggle;
- tidak perlu memeriksa tombol pada setiap frame;
- mudah digunakan untuk pause, reset, mengganti mode, atau mengganti warna.

### 44.3 Kekurangan Event-Based

Untuk movement kontinu, kode seperti:

```javascript
if (event.code === "ArrowRight") {
  offsetX += 0.05;
}
```

hanya mengubah posisi saat event `keydown` diterima.

Jika tombol ditahan, pergerakan dapat bergantung pada mekanisme **keyboard repeat** dari browser atau sistem operasi. Karena itu pendekatan ini kurang ideal untuk kontrol gerakan kontinu pada aplikasi real-time.

------------------------------------------------------------------------

### 44.4 State-Based Input

State-based tidak langsung menjadikan `keydown` sebagai aksi movement. Event keyboard hanya digunakan untuk menyimpan **status tombol**.

Contoh:

```javascript
const keys = {};

window.addEventListener(
  "keydown",
  (event) => {
    keys[event.code] = true;
  }
);

window.addEventListener(
  "keyup",
  (event) => {
    keys[event.code] = false;
  }
);
```

Ketika `ArrowRight` sedang ditekan:

```text
keys["ArrowRight"] = true
```

Ketika dilepas:

```text
keys["ArrowRight"] = false
```

Status tersebut kemudian diperiksa dalam rendering loop:

```text
Input State
    ↓
Update
    ↓
Draw
    ↓
Next Frame
```

### 44.5 Kelebihan State-Based

- sangat sesuai untuk movement kontinu;
- input diproses konsisten bersama rendering loop;
- dapat menggunakan `deltaTime`;
- mudah mendukung beberapa tombol yang ditekan bersamaan;
- lebih sesuai untuk pola aplikasi grafika real-time dan game.

Contoh:

```javascript
if (keys["ArrowRight"]) {
  offsetX +=
    moveSpeed * deltaTime;
}
```

Selama tombol masih ditekan, posisi diperbarui pada setiap frame.

### 44.6 Kekurangan State-Based

- memerlukan penyimpanan state tombol;
- memerlukan penanganan `keydown` dan `keyup`;
- kode sedikit lebih panjang;
- kurang tepat jika digunakan langsung untuk aksi toggle.

Sebagai contoh, kode berikut **tidak dianjurkan**:

```javascript
if (keys["Space"]) {
  isPaused = !isPaused;
}
```

Jika `Space` ditahan, kondisi dapat dieksekusi berkali-kali pada frame yang berbeda sehingga nilai `isPaused` berubah terus-menerus.

------------------------------------------------------------------------

### 44.7 Ringkasan Perbandingan

| Aspek | Event-Based | State-Based |
|---|---|---|
| Mekanisme | merespons event | menyimpan status tombol |
| Event utama | `keydown` | `keydown` + `keyup` |
| Diproses | saat event terjadi | setiap frame |
| Cocok untuk | aksi diskrit/toggle | aksi kontinu |
| Movement tahan tombol | kurang ideal | sangat sesuai |
| Penggunaan `deltaTime` | biasanya tidak utama | sangat sesuai |
| Multiple simultaneous keys | lebih terbatas | lebih mudah |
| Contoh | pause, reset, ganti mode | move, rotate, camera control |

Prinsip yang digunakan:

```text
Aksi Sekali         → Event-Based
Aksi Berkelanjutan  → State-Based
```

------------------------------------------------------------------------

## 45. Langkah 31 --- Event-Based untuk Pause dan Reset

Tambahkan state aplikasi:

```javascript
let isPaused = false;
```

Gunakan `keydown` untuk aksi yang bersifat diskrit:

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    if (event.code === "Space") {
      event.preventDefault();

      if (!event.repeat) {
        isPaused =
          !isPaused;
      }
    }

    if (
      event.code === "KeyR" &&
      !event.repeat
    ) {
      offsetX = 0.0;
      direction = 1.0;
      isPaused = false;
    }
  }
);
```

### Mengapa Space Menggunakan Event-Based?

`Space` digunakan sebagai toggle:

```text
Running → Pause
Pause   → Running
```

Kita hanya ingin toggle terjadi satu kali ketika tombol ditekan, bukan pada setiap frame selama tombol masih ditahan.

------------------------------------------------------------------------

## 46. Langkah 32 --- State-Based untuk Movement

### 46.1 Membuat Keyboard State

Tambahkan:

```javascript
const keys = {};
```

Saat tombol ditekan:

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    keys[event.code] = true;
  }
);
```

Saat tombol dilepas:

```javascript
window.addEventListener(
  "keyup",
  (event) => {
    keys[event.code] = false;
  }
);
```

### 46.2 Membuat Fungsi `handleInput()`

Tambahkan:

```javascript
const keyboardMoveSpeed = 0.8;

function handleInput(
  deltaTime
) {
  if (keys["ArrowLeft"]) {
    offsetX -=
      keyboardMoveSpeed *
      deltaTime;
  }

  if (keys["ArrowRight"]) {
    offsetX +=
      keyboardMoveSpeed *
      deltaTime;
  }

  clampOffset();
}
```

Sekarang gerakan bukan lagi:

```text
satu event → satu langkah
```

tetapi:

```text
tombol masih ditekan?
       ↓
YA
       ↓
ubah posisi pada frame ini
       ↓
frame berikutnya
       ↓
periksa lagi
```

### 46.3 Menjaga Triangle dalam Area NDC

Gunakan:

```javascript
function clampOffset() {
  offsetX = Math.max(
    -0.20,
    Math.min(
      0.35,
      offsetX
    )
  );
}
```

Fungsi ini membatasi movement agar triangle tidak terlalu jauh keluar dari area tampilan.

### 46.4 Implementasi Hybrid

Gunakan event-based dan state-based secara bersamaan:

```javascript
const keys = {};

window.addEventListener(
  "keydown",
  (event) => {
    // State-based:
    // simpan bahwa tombol sedang ditekan.
    keys[event.code] = true;

    // Event-based:
    // aksi diskrit dijalankan sekali.
    if (event.code === "Space") {
      event.preventDefault();

      if (!event.repeat) {
        isPaused =
          !isPaused;
      }
    }

    if (
      event.code === "KeyR" &&
      !event.repeat
    ) {
      offsetX = 0.0;
      direction = 1.0;
      isPaused = false;
    }
  }
);

window.addEventListener(
  "keyup",
  (event) => {
    keys[event.code] = false;
  }
);
```

Perhatikan penggunaan:

```javascript
event.repeat
```

Browser dapat menghasilkan event `keydown` berulang saat tombol ditahan. Untuk aksi toggle seperti pause dan reset, kita ingin aksi dijalankan hanya pada tekanan awal.

Untuk movement, kita tidak bergantung pada keyboard repeat. Program cukup membaca:

```javascript
keys["ArrowLeft"]
keys["ArrowRight"]
```

pada setiap frame.

### 46.5 Memproses Input dalam Rendering Loop

Ubah rendering loop menjadi:

```javascript
function render(currentTime) {
  const timeInSeconds =
    currentTime * 0.001;

  const deltaTime =
    Math.min(
      timeInSeconds -
      previousTime,
      0.05
    );

  previousTime =
    timeInSeconds;

  handleInput(deltaTime);

  if (!isPaused) {
    updateTriangle(
      deltaTime
    );
  }

  uploadPositions();
  drawScene();

  requestAnimationFrame(
    render
  );
}
```

Alur frame sekarang menjadi:

```text
Keyboard Events
      ↓
Update Key State
      ↓
Rendering Loop
      ↓
handleInput(deltaTime)
      ↓
updateTriangle(deltaTime)
      ↓
uploadPositions()
      ↓
drawScene()
      ↓
Next Frame
```

### 46.6 Hubungan dengan Animasi Otomatis

Pada baseline praktikum, triangle juga memiliki animasi otomatis kiri-kanan. Karena itu state-based ArrowLeft/ArrowRight mengubah `offsetX` yang sama dengan animasi.

Hal ini memperlihatkan bahwa:

```text
automatic update
+
user input update
=
final state sebelum draw
```

Sebagai pengembangan, mahasiswa dapat:

- menonaktifkan animasi otomatis saat tombol movement ditekan;
- membuat mode otomatis/manual;
- memisahkan `autoOffset` dan `userOffset`.

------------------------------------------------------------------------

## 46A. Pola Hybrid yang Direkomendasikan

Untuk program real-time pada praktikum ini:

```text
EVENT-BASED
├── Space → Pause/Resume
├── R     → Reset
├── C     → Change Color
└── M     → Change Draw Mode

STATE-BASED
├── ArrowLeft  → Continuous Move Left
├── ArrowRight → Continuous Move Right
├── ArrowUp    → Continuous Move Up
└── ArrowDown  → Continuous Move Down
```

Aturan sederhananya:

> **Gunakan event-based untuk aksi yang terjadi sekali. Gunakan state-based untuk aksi yang harus berlangsung selama input aktif.**

------------------------------------------------------------------------

# BAGIAN K --- OPSI INTERAKSI MOUSE

## 47. Mouse ke NDC

Sebagai alternatif atau challenge, mahasiswa dapat menggunakan mouse.

Koordinat mouse browser diberikan dalam pixel, sedangkan vertex program
menggunakan NDC.

Konversi:

``` javascript
function mouseToNDC(event) {
  const rect =
    canvas.getBoundingClientRect();

  const mouseX =
    event.clientX - rect.left;

  const mouseY =
    event.clientY - rect.top;

  const x =
    (mouseX / rect.width) * 2.0 - 1.0;

  const y =
    1.0 - (mouseY / rect.height) * 2.0;

  return { x, y };
}
```

### Mengapa Y Dibalik?

Koordinat mouse pada elemen web bertambah ke bawah, sedangkan NDC
memiliki:

``` text
Y +1 di atas
Y -1 di bawah
```

Karena itu konversi Y harus dibalik.

------------------------------------------------------------------------

## 48. Contoh Menampilkan Koordinat Mouse

Tambahkan:

``` javascript
canvas.addEventListener(
  "mousemove",
  (event) => {
    const p = mouseToNDC(event);

    document.getElementById(
      "info"
    ).textContent =
      `Mouse NDC: (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`;
  }
);
```

Fitur ini sangat berguna untuk memahami hubungan:

``` text
Pixel Coordinate → NDC
```

------------------------------------------------------------------------

# BAGIAN L --- KODE FINAL TERSTRUKTUR

## 49. `main.js` Final

Berikut implementasi lengkap yang dapat digunakan sebagai baseline.
Mahasiswa tetap harus memahami setiap bagian dan melakukan pengembangan
tugas/challenge.

``` javascript
const canvas =
  document.getElementById("glCanvas");

const gl =
  canvas.getContext("webgl2");

if (!gl) {
  alert("WebGL2 tidak tersedia.");
  throw new Error(
    "WebGL2 tidak tersedia."
  );
}

// --------------------------------------------------
// Shader source
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 a_position;
in vec3 a_color;

out vec3 v_color;

void main() {
  gl_Position = vec4(
    a_position,
    0.0,
    1.0
  );

  gl_PointSize = 12.0;

  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor = vec4(
    v_color,
    1.0
  );
}
`;

// --------------------------------------------------
// Helper: shader
// --------------------------------------------------

function createShader(
  gl,
  type,
  source
) {
  const shader =
    gl.createShader(type);

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(shader);

  const success =
    gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    );

  if (!success) {
    const info =
      gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error(
      "Shader compile error:\n" +
      info
    );
  }

  return shader;
}

// --------------------------------------------------
// Helper: program
// --------------------------------------------------

function createProgram(
  gl,
  vertexShader,
  fragmentShader
) {
  const program =
    gl.createProgram();

  gl.attachShader(
    program,
    vertexShader
  );

  gl.attachShader(
    program,
    fragmentShader
  );

  gl.linkProgram(program);

  const success =
    gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    );

  if (!success) {
    const info =
      gl.getProgramInfoLog(
        program
      );

    gl.deleteProgram(program);

    throw new Error(
      "Program link error:\n" +
      info
    );
  }

  return program;
}

// --------------------------------------------------
// Helper: buffer
// --------------------------------------------------

function createBuffer(
  gl,
  data,
  usage = gl.STATIC_DRAW
) {
  const buffer =
    gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    data,
    usage
  );

  return buffer;
}

// --------------------------------------------------
// Helper: attribute
// --------------------------------------------------

function setupAttribute(
  gl,
  buffer,
  location,
  size
) {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.enableVertexAttribArray(
    location
  );

  gl.vertexAttribPointer(
    location,
    size,
    gl.FLOAT,
    false,
    0,
    0
  );
}

// --------------------------------------------------
// Compile + link
// --------------------------------------------------

const vertexShader =
  createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );

const fragmentShader =
  createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

const program =
  createProgram(
    gl,
    vertexShader,
    fragmentShader
  );

// --------------------------------------------------
// Attribute locations
// --------------------------------------------------

const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );

const colorLocation =
  gl.getAttribLocation(
    program,
    "a_color"
  );

// --------------------------------------------------
// Vertex data
// --------------------------------------------------

const basePositions =
  new Float32Array([
    // Triangle: 0-2
    -0.75, -0.35,
    -0.15, -0.35,
    -0.45,  0.35,

    // Line: 3-4
     0.05, -0.25,
     0.75,  0.35,

    // Points: 5-7
     0.15,  0.55,
     0.45,  0.65,
     0.75,  0.55
  ]);

const positions =
  new Float32Array(
    basePositions
  );

const colors =
  new Float32Array([
    // Triangle
    1.0, 0.2, 0.2,
    0.2, 1.0, 0.3,
    0.2, 0.5, 1.0,

    // Line
    1.0, 0.8, 0.1,
    1.0, 0.3, 0.8,

    // Points
    0.2, 1.0, 1.0,
    1.0, 0.5, 0.1,
    0.8, 0.4, 1.0
  ]);

// --------------------------------------------------
// Buffers
// --------------------------------------------------

const positionBuffer =
  createBuffer(
    gl,
    positions,
    gl.DYNAMIC_DRAW
  );

const colorBuffer =
  createBuffer(
    gl,
    colors,
    gl.STATIC_DRAW
  );

// --------------------------------------------------
// Animation state
// --------------------------------------------------

let offsetX = 0.0;
let direction = 1.0;
let isPaused = false;

const speed = 0.45;
const keyboardMoveSpeed = 0.8;

// Menyimpan status tombol untuk state-based input.
const keys = {};

// --------------------------------------------------
// Update
// --------------------------------------------------

function clampOffset() {
  offsetX = Math.max(
    -0.20,
    Math.min(
      0.35,
      offsetX
    )
  );
}

function handleInput(
  deltaTime
) {
  if (keys["ArrowLeft"]) {
    offsetX -=
      keyboardMoveSpeed *
      deltaTime;
  }

  if (keys["ArrowRight"]) {
    offsetX +=
      keyboardMoveSpeed *
      deltaTime;
  }

  clampOffset();
}

function updateTriangle(
  deltaTime
) {
  offsetX +=
    direction *
    speed *
    deltaTime;

  if (offsetX >= 0.35) {
    offsetX = 0.35;
    direction = -1.0;
  }

  if (offsetX <= -0.20) {
    offsetX = -0.20;
    direction = 1.0;
  }

  for (let i = 0; i < 3; i++) {
    const xIndex = i * 2;

    positions[xIndex] =
      basePositions[xIndex] +
      offsetX;

    positions[xIndex + 1] =
      basePositions[
        xIndex + 1
      ];
  }
}

function uploadPositions() {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    positions,
    gl.DYNAMIC_DRAW
  );
}

// --------------------------------------------------
// Draw
// --------------------------------------------------

function drawScene() {
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    0.05,
    0.08,
    0.15,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT
  );

  gl.useProgram(program);

  setupAttribute(
    gl,
    positionBuffer,
    positionLocation,
    2
  );

  setupAttribute(
    gl,
    colorBuffer,
    colorLocation,
    3
  );

  // Triangle
  gl.drawArrays(
    gl.TRIANGLES,
    0,
    3
  );

  // Line
  gl.drawArrays(
    gl.LINES,
    3,
    2
  );

  // Points
  gl.drawArrays(
    gl.POINTS,
    5,
    3
  );
}

// --------------------------------------------------
// Keyboard: hybrid event-based + state-based
// --------------------------------------------------

window.addEventListener(
  "keydown",
  (event) => {
    // State-based
    keys[event.code] = true;

    // Event-based
    if (event.code === "Space") {
      event.preventDefault();

      if (!event.repeat) {
        isPaused =
          !isPaused;
      }
    }

    if (
      event.code === "KeyR" &&
      !event.repeat
    ) {
      offsetX = 0.0;
      direction = 1.0;
      isPaused = false;
    }
  }
);

window.addEventListener(
  "keyup",
  (event) => {
    keys[event.code] = false;
  }
);

// --------------------------------------------------
// Mouse coordinate display
// --------------------------------------------------

function mouseToNDC(event) {
  const rect =
    canvas.getBoundingClientRect();

  const mouseX =
    event.clientX - rect.left;

  const mouseY =
    event.clientY - rect.top;

  const x =
    (mouseX / rect.width) *
    2.0 - 1.0;

  const y =
    1.0 -
    (mouseY / rect.height) *
    2.0;

  return { x, y };
}

canvas.addEventListener(
  "mousemove",
  (event) => {
    const p =
      mouseToNDC(event);

    const info =
      document.getElementById(
        "info"
      );

    info.textContent =
      `Mouse NDC: (${p.x.toFixed(2)}, ${p.y.toFixed(2)})`;
  }
);

// --------------------------------------------------
// Rendering loop
// --------------------------------------------------

let previousTime = 0;

function render(currentTime) {
  const timeInSeconds =
    currentTime * 0.001;

  const deltaTime =
    Math.min(
      timeInSeconds -
      previousTime,
      0.05
    );

  previousTime =
    timeInSeconds;

  // State-based input dibaca setiap frame.
  handleInput(
    deltaTime
  );

  if (!isPaused) {
    updateTriangle(
      deltaTime
    );
  }

  uploadPositions();
  drawScene();

  requestAnimationFrame(
    render
  );
}

requestAnimationFrame(render);
```

------------------------------------------------------------------------

# BAGIAN M --- MEMAHAMI PROGRAM FINAL

## 50. Tahap Inisialisasi

Bagian ini dilakukan satu kali:

``` text
Get Canvas
    ↓
Get WebGL2 Context
    ↓
Compile Shader
    ↓
Link Program
    ↓
Get Attribute Locations
    ↓
Create Buffers
    ↓
Upload Initial Data
```

------------------------------------------------------------------------

## 51. Tahap Per Frame

Bagian ini berulang:

``` text
Read Time/Input
      ↓
Update Position
      ↓
Upload Position
      ↓
Clear Framebuffer
      ↓
Use Program
      ↓
Connect Attributes
      ↓
Draw Triangle
      ↓
Draw Line
      ↓
Draw Points
      ↓
Next Frame
```

------------------------------------------------------------------------

## 52. Apa yang Terjadi Saat Triangle Digambar?

Saat:

``` javascript
gl.drawArrays(
  gl.TRIANGLES,
  0,
  3
);
```

dipanggil, secara konseptual terjadi:

``` text
3 vertex
   ↓
Vertex Shader dijalankan
untuk setiap vertex
   ↓
Primitive Assembly
   ↓
Triangle
   ↓
Rasterization
   ↓
Banyak fragment
   ↓
Fragment Shader
   ↓
Framebuffer
   ↓
Canvas
```

Ini menjelaskan mengapa tiga vertex saja dapat menghasilkan banyak
pixel/fragment berwarna.

------------------------------------------------------------------------

# BAGIAN N --- EKSPERIMEN WAJIB

## 53. Eksperimen 1 --- NDC

Ubah salah satu position menjadi:

``` text
X = 1.2
```

Amati bagian primitive yang berada di luar area tampilan.

Kemudian coba:

``` text
X = -1.2
```

Catat hasil observasi.

### Pertanyaan

1.  Mengapa sebagian primitive dapat hilang?
2.  Berapa rentang NDC yang sedang digunakan?
3.  Apa posisi pusat layar?

------------------------------------------------------------------------

## 54. Eksperimen 2 --- Layout Attribute

Untuk eksperimen saja, ubah:

``` javascript
gl.vertexAttribPointer(
  positionLocation,
  2,
  ...
);
```

menjadi:

``` javascript
gl.vertexAttribPointer(
  positionLocation,
  3,
  ...
);
```

Amati hasil/error yang terjadi, kemudian kembalikan ke `2`.

### Tujuan

Memahami bahwa layout buffer harus sesuai dengan definisi attribute.

Position program tersusun:

``` text
X, Y
```

sehingga ukuran attribute position adalah dua komponen.

------------------------------------------------------------------------

## 55. Eksperimen 3 --- Draw Mode

Ganti draw mode triangle:

``` javascript
gl.TRIANGLES
```

menjadi:

``` javascript
gl.LINE_LOOP
```

Amati perbedaan hasil.

Kemudian kembalikan ke `gl.TRIANGLES`.

### Pertanyaan

Apakah vertex datanya berubah?

Jawaban yang diharapkan secara konsep:

> Tidak harus. Draw mode memengaruhi bagaimana vertex dirakit menjadi
> primitive.

------------------------------------------------------------------------

## 56. Eksperimen 4 --- Fragment Shader Konstan

Ubah sementara fragment shader menjadi:

``` glsl
void main() {
  outColor =
    vec4(
      1.0,
      1.0,
      0.0,
      1.0
    );
}
```

Amati bahwa vertex color tidak lagi menentukan hasil akhir karena
fragment shader menggunakan warna kuning konstan.

Setelah itu kembalikan shader ke:

``` glsl
outColor = vec4(v_color, 1.0);
```

------------------------------------------------------------------------

# BAGIAN O --- CHALLENGE

## 57. Ketentuan Challenge

Mahasiswa wajib mengerjakan minimal **dua** challenge berikut.

Challenge tidak harus menggunakan konsep transformation matrix karena
materi tersebut baru dibahas pada Pertemuan 3.

### Challenge A --- `LINE_STRIP`

Tambahkan minimal empat vertex baru dan gambar menggunakan:

``` javascript
gl.LINE_STRIP
```

Gunakan warna berbeda pada beberapa vertex.

### Challenge B --- `LINE_LOOP`

Buat bentuk outline sederhana menggunakan:

``` javascript
gl.LINE_LOOP
```

Contoh:

-   persegi,
-   diamond,
-   bentuk polygon sederhana.

### Challenge C --- Point Pattern

Tambahkan minimal lima point dengan:

``` javascript
gl.POINTS
```

Gunakan warna berbeda dan atur `gl_PointSize`.

### Challenge D --- Mouse NDC Marker

Saat Canvas diklik:

1.  konversi koordinat mouse ke NDC;
2.  pindahkan salah satu point ke lokasi klik;
3.  upload position buffer;
4.  render hasilnya.

### Challenge E --- Ganti Warna Saat Input

Saat tombol tertentu ditekan, ubah data pada color buffer.

Contoh:

``` text
C → ganti skema warna
```

Setelah color array berubah, upload ulang data menggunakan
`gl.bufferData()`.

### Challenge F --- Pause dan Step

Tambahkan:

``` text
Space → pause/resume
N     → saat pause, lakukan satu langkah update
```

Challenge ini membantu memahami perbedaan antara **update** dan
**draw**.

------------------------------------------------------------------------

# BAGIAN P --- DEBUGGING

## 58. Checklist Jika Canvas Kosong

Periksa secara berurutan:

1.  Apakah elemen Canvas ditemukan?
2.  Apakah `canvas.getContext("webgl2")` berhasil?
3.  Apakah `gl.viewport()` sudah sesuai?
4.  Apakah `gl.clear()` bekerja?
5.  Apakah shader berhasil compile?
6.  Apakah shader program berhasil link?
7.  Apakah program telah diaktifkan dengan `gl.useProgram()`?
8.  Apakah buffer berhasil dibuat?
9.  Apakah buffer yang benar sedang di-bind?
10. Apakah data sudah di-upload?
11. Apakah attribute location benar?
12. Apakah attribute sudah di-enable?
13. Apakah `vertexAttribPointer()` sesuai layout?
14. Apakah vertex berada pada area NDC yang terlihat?
15. Apakah `gl.drawArrays()` benar-benar dipanggil?
16. Apakah nilai `first` dan `count` benar?

------------------------------------------------------------------------

## 59. Debugging Shader Compile

Gunakan:

``` javascript
gl.getShaderInfoLog(shader)
```

Kesalahan umum:

-   lupa `#version 300 es`;
-   typo nama variable;
-   titik koma hilang;
-   tipe data tidak cocok;
-   menggunakan variable yang belum dideklarasikan.

------------------------------------------------------------------------

## 60. Debugging Program Link

Gunakan:

``` javascript
gl.getProgramInfoLog(program)
```

Program dapat gagal link jika interface antar-shader tidak sesuai.

Contoh yang perlu diperhatikan:

Vertex shader:

``` glsl
out vec3 v_color;
```

Fragment shader:

``` glsl
in vec3 v_color;
```

Nama dan tipe harus sesuai untuk data yang dihubungkan.

------------------------------------------------------------------------

## 61. Debugging Attribute

Periksa:

``` javascript
console.log(
  "positionLocation:",
  positionLocation
);

console.log(
  "colorLocation:",
  colorLocation
);
```

Jika nama attribute di JavaScript tidak sesuai dengan shader, koneksi
data tidak terbentuk seperti yang diharapkan.

------------------------------------------------------------------------

## 62. Debugging Jumlah Vertex

Jika array memiliki delapan vertex tetapi draw call mencoba membaca data
yang tidak sesuai, hasil dapat salah.

Biasakan menghitung:

``` text
jumlah vertex =
jumlah komponen total /
komponen per vertex
```

Contoh position:

``` text
16 float / 2 = 8 vertex
```

Color:

``` text
24 float / 3 = 8 vertex
```

Jumlah vertex position dan color harus konsisten untuk vertex yang
digunakan.

------------------------------------------------------------------------

# BAGIAN Q --- TUGAS PRAKTIKUM

## 63. Tugas Utama

Kembangkan **WebGL Primitive Playground** dengan ketentuan minimum:

-   [ ] menggunakan WebGL2;
-   [ ] memiliki Canvas dan viewport yang benar;
-   [ ] minimal 3 primitive;
-   [ ] minimal 2 draw mode;
-   [ ] menggunakan vertex color;
-   [ ] minimal 3 warna;
-   [ ] menggunakan position buffer;
-   [ ] menggunakan color buffer;
-   [ ] menggunakan attribute position dan color;
-   [ ] memiliki vertex shader;
-   [ ] memiliki fragment shader;
-   [ ] shader compile dan program link diperiksa;
-   [ ] menggunakan `gl.drawArrays()`;
-   [ ] memiliki rendering loop;
-   [ ] satu primitive bergerak;
-   [ ] minimal satu interaksi mouse/keyboard;
-   [ ] source code dipisahkan dan terstruktur;
-   [ ] tidak ada error pada Console saat penggunaan normal;
-   [ ] mengerjakan minimal dua challenge.

------------------------------------------------------------------------

## 64. Tugas Pengembangan

Selain baseline, lakukan perubahan sehingga hasil setiap
mahasiswa/kelompok tidak identik.

Lakukan minimal empat dari pengembangan berikut:

1.  ubah komposisi posisi primitive;
2.  tambahkan vertex baru;
3.  tambahkan draw call baru;
4.  gunakan `LINE_STRIP`;
5.  gunakan `LINE_LOOP`;
6.  tambahkan point pattern;
7.  buat skema warna sendiri;
8.  ubah kecepatan animasi;
9.  ubah arah/area gerak;
10. tambahkan kontrol keyboard lain;
11. tambahkan mouse interaction;
12. tampilkan koordinat mouse NDC;
13. buat tombol reset;
14. buat pause/resume;
15. buat primitive lain dari kombinasi triangle/line/point.

------------------------------------------------------------------------

## 65. Struktur Source Code yang Disarankan

Minimal kelompokkan kode berdasarkan tanggung jawab:

``` text
1. Canvas & Context
2. Shader Source
3. Shader/Program Helpers
4. Buffer Helpers
5. Vertex Data
6. Buffer Initialization
7. Attribute Setup
8. State
9. Update
10. Input
11. Draw
12. Rendering Loop
```

Tujuannya agar mahasiswa mulai membedakan:

``` text
INITIALIZATION
```

dengan:

``` text
PER-FRAME UPDATE + DRAW
```

------------------------------------------------------------------------

# BAGIAN R --- PENGUJIAN

## 66. Test Case

Gunakan pengujian berikut.

    No. Pengujian        Hasil yang Diharapkan
  ----- ---------------- ----------------------------------------
      1 Buka aplikasi    Canvas tampil tanpa error
      2 WebGL2 Context   Berhasil dibuat
      3 Triangle         Terlihat
      4 Line             Terlihat
      5 Points           Terlihat
      6 Vertex color     Minimal 3 warna terlihat
      7 Rendering loop   Berjalan terus
      8 Animasi          Satu primitive bergerak
      9 Space            Pause/resume bekerja
     10 Arrow key        Interaksi bekerja
     11 Reset            State kembali ke awal
     12 Mouse            Koordinat NDC dapat ditampilkan
     13 Resize/reload    Program tetap dapat diinisialisasi
     14 Console          Tidak ada error pada penggunaan normal

------------------------------------------------------------------------

## 67. Bukti Implementasi

Simpan bukti berikut:

1.  screenshot aplikasi final;
2.  screenshot Console tanpa error;
3.  screenshot minimal dua challenge;
4.  potongan kode shader;
5.  potongan kode draw call;
6.  potongan kode rendering loop;
7.  catatan singkat hasil eksperimen NDC dan draw mode.

------------------------------------------------------------------------

# BAGIAN S --- PERTANYAAN PEMAHAMAN

## 68. Pertanyaan Konsep

Jawab dengan kalimat sendiri.

1.  Apa perbedaan Canvas 2D dan WebGL dalam konteks praktikum Pertemuan
    1 dan 2?
2.  Apa fungsi WebGL Context?
3.  Apa yang dimaksud NDC?
4.  Berapa koordinat pusat layar dalam NDC?
5.  Apa perbedaan vertex dan primitive?
6.  Mengapa data vertex menggunakan `Float32Array`?
7.  Apa fungsi buffer?
8.  Apa fungsi `gl.bindBuffer()`?
9.  Apa fungsi `gl.bufferData()`?
10. Apa fungsi vertex shader?
11. Mengapa vertex shader menghasilkan `gl_Position`?
12. Apa fungsi fragment shader?
13. Apa yang dimaksud attribute?
14. Bagaimana position buffer dapat sampai ke `a_position`?
15. Apa fungsi `vertexAttribPointer()`?
16. Apa perbedaan `size = 2` untuk position dan `size = 3` untuk color?
17. Apa yang dimaksud rasterization?
18. Mengapa satu triangle dapat menghasilkan banyak fragment?
19. Apa yang terjadi ketika `gl.drawArrays()` dipanggil?
20. Mengapa rendering loop diperlukan untuk animasi?
21. Apa perbedaan update dan draw?
22. Mengapa object dengan koordinat jauh di luar NDC dapat tidak
    terlihat?
23. Mengapa shader info log penting saat debugging?
24. Mengapa state WebGL yang aktif perlu diperhatikan sebelum draw call?
25. Apa perbedaan event-based input dan state-based input?
26. Mengapa movement kontinu lebih cocok menggunakan state-based input?
27. Mengapa pause/resume lebih cocok menggunakan event-based input?
28. Apa fungsi event `keyup` pada state-based keyboard input?
29. Mengapa state-based movement sebaiknya menggunakan `deltaTime`?
30. Mengapa `event.repeat` perlu diperhatikan pada aksi toggle?

------------------------------------------------------------------------

# BAGIAN T --- ANALISIS PIPELINE

## 69. Latihan Menelusuri Satu Vertex

Misalkan position buffer berisi:

``` text
(-0.5, -0.5)
```

dan color buffer berisi:

``` text
(1, 0, 0)
```

Telusuri:

``` text
Position Buffer
    ↓
vertexAttribPointer
    ↓
a_position = (-0.5, -0.5)

Color Buffer
    ↓
vertexAttribPointer
    ↓
a_color = (1, 0, 0)
```

Vertex shader kemudian menghasilkan:

``` text
gl_Position = (-0.5, -0.5, 0, 1)
v_color     = (1, 0, 0)
```

Setelah tiga vertex diproses:

``` text
Primitive Assembly
       ↓
Triangle
       ↓
Rasterization
       ↓
Fragments
       ↓
Fragment Shader
       ↓
outColor
```

Latihan ini harus dipahami karena merupakan benang merah seluruh
praktikum.

------------------------------------------------------------------------

# BAGIAN U --- HUBUNGAN DENGAN MATERI BERIKUTNYA

## 70. Dari Position Langsung ke Transformation

Pada praktikum ini animasi dilakukan dengan mengubah nilai vertex
position.

Contoh konsep:

``` text
Original Position
      ↓
JavaScript mengubah X
      ↓
Upload Buffer
      ↓
Vertex Shader
```

Pada Pertemuan 3, pengendalian posisi akan dikembangkan menggunakan:

``` text
coordinate system
translation
rotation
scaling
matrix
homogeneous coordinate
transformation order
transform composition
```

Jadi praktikum ini berfungsi sebagai fondasi:

``` text
DATA
 ↓
BUFFER
 ↓
ATTRIBUTE
 ↓
VERTEX SHADER
 ↓
PRIMITIVE
 ↓
RASTERIZATION
 ↓
FRAGMENT SHADER
 ↓
FRAMEBUFFER
 ↓
IMAGE
```

------------------------------------------------------------------------

# BAGIAN V --- CHECKLIST AKHIR

## 71. Checklist Sebelum Dikumpulkan

### WebGL Fundamental

-   [ ] Saya memahami perbedaan Canvas dan WebGL Context.
-   [ ] Saya memahami NDC.
-   [ ] Saya dapat menjelaskan vertex dan primitive.
-   [ ] Saya dapat menjelaskan buffer.
-   [ ] Saya dapat menjelaskan attribute.
-   [ ] Saya dapat menjelaskan vertex shader.
-   [ ] Saya dapat menjelaskan fragment shader.
-   [ ] Saya dapat menjelaskan shader program.
-   [ ] Saya dapat menjelaskan draw call.
-   [ ] Saya dapat menjelaskan rendering loop.
-   [ ] Saya dapat menjelaskan event-based keyboard input.
-   [ ] Saya dapat menjelaskan state-based keyboard input.
-   [ ] Saya memahami kapan menggunakan event-based dan state-based.
-   [ ] Saya memahami hubungan state-based input dengan rendering loop dan `deltaTime`.

### Implementasi

-   [ ] WebGL2 Context berhasil.
-   [ ] Viewport benar.
-   [ ] Framebuffer dapat dibersihkan.
-   [ ] Shader compile berhasil.
-   [ ] Program link berhasil.
-   [ ] Position buffer berfungsi.
-   [ ] Color buffer berfungsi.
-   [ ] Position attribute terhubung.
-   [ ] Color attribute terhubung.
-   [ ] Minimal 3 primitive tampil.
-   [ ] Minimal 2 draw mode digunakan.
-   [ ] Minimal 3 warna terlihat.
-   [ ] Animasi berjalan.
-   [ ] Interaksi keyboard event-based berjalan.
-   [ ] Interaksi keyboard state-based berjalan.
-   [ ] Movement kontinu menggunakan `deltaTime`.
-   [ ] Minimal 2 challenge selesai.
-   [ ] Console bersih dari error saat penggunaan normal.

------------------------------------------------------------------------

# 72. Ringkasan

Praktikum Pertemuan 2 membangun hubungan langsung antara konsep graphics
pipeline dan implementasi WebGL.

Urutan utama yang harus diingat adalah:

``` text
Canvas
  ↓
WebGL2 Context
  ↓
Vertex Data
  ↓
Float32Array
  ↓
Buffer
  ↓
Attribute
  ↓
Vertex Shader
  ↓
Primitive Assembly
  ↓
Rasterization
  ↓
Fragment Shader
  ↓
Framebuffer
  ↓
Canvas
```

Mahasiswa tidak hanya ditargetkan mampu menampilkan triangle, tetapi
juga memahami **mengapa triangle tersebut dapat muncul**.

Keberhasilan praktikum ditandai ketika mahasiswa mampu menjelaskan
hubungan:

``` text
DATA → GPU → SHADER → PRIMITIVE → FRAGMENT → IMAGE
```

serta mampu mengembangkan program menjadi **WebGL Primitive Playground**
yang memiliki beberapa primitive, beberapa draw mode, vertex color,
animasi, dan interaksi.

------------------------------------------------------------------------

## 73. Output Praktikum

Output akhir:

``` text
WebGL Primitive Playground
```

dengan karakteristik:

``` text
WebGL2
+ NDC
+ Vertex Data
+ Position Buffer
+ Color Buffer
+ Attribute
+ Vertex Shader
+ Fragment Shader
+ Shader Program
+ Multiple Primitive
+ Multiple Draw Mode
+ Vertex Color
+ Rendering Loop
+ Animation
+ Event-Based Keyboard Input
+ State-Based Keyboard Input
+ User Interaction
+ Minimal 2 Challenges
```

Praktikum ini menjadi dasar untuk **Pertemuan 3 --- Transformation &
Coordinate System**.
