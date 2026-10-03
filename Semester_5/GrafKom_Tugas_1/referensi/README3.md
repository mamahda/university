# Modul Praktikum Grafika Komputer — Pertemuan 3

## Interactive Transformation & Coordinate System dengan WebGL

**Mata Kuliah:** EF234504 — Grafika Komputer
**Pertemuan:** 3
**Topik:** Transformation & Coordinate System
**Dosen:** Dr. Darlis Herumurti
**Departemen:** Teknik Informatika

---

# 1. Deskripsi Praktikum

Pada Pertemuan 2, mahasiswa telah mempelajari alur fundamental WebGL:

```text
Vertex Data
    ↓
Buffer
    ↓
Attribute
    ↓
Vertex Shader
    ↓
Primitive
    ↓
Rasterization
    ↓
Fragment Shader
```

Pada Pertemuan 3, pipeline tersebut dikembangkan dengan menambahkan **transformation**.

Target utama praktikum ini adalah memahami bahwa geometry sebaiknya tetap berada pada **local coordinate**, sedangkan perubahan posisi, orientasi, dan ukuran object dilakukan menggunakan **transformation matrix** yang dikirim ke GPU sebagai **uniform**.

Benang merah praktikum:

```text
Local Vertex
    ↓
GPU Buffer
    ↓
Model Matrix
    ↓
Uniform
    ↓
Vertex Shader
    ↓
World/Transformed Position
    ↓
Rasterization
    ↓
Fragment Shader
    ↓
Canvas
```

Mahasiswa membangun aplikasi:

# Interactive Transformation Playground

yang memiliki minimal:

```text
2 Object
+
Translation
+
Rotation
+
Uniform Scaling
+
Non-Uniform Scaling
+
Matrix Composition
+
Keyboard Control
+
Automatic Animation
+
Transform Order Comparison
+
HUD Transform
```

---

# 2. Capaian Praktikum

Setelah menyelesaikan praktikum, mahasiswa diharapkan mampu:

1. menjelaskan local coordinate dan world coordinate;
2. menjelaskan secara konseptual view, clip, NDC, dan screen coordinate;
3. menjelaskan fungsi object origin/pivot;
4. membuat translation matrix 3×3;
5. membuat rotation matrix 3×3;
6. membuat scaling matrix 3×3;
7. menjelaskan homogeneous coordinate;
8. melakukan matrix multiplication;
9. membuat Model Matrix dari translation, rotation, dan scaling;
10. mengirim matrix sebagai uniform ke vertex shader;
11. memindahkan object tanpa mengubah vertex buffer;
12. mengontrol translation, rotation, dan scaling dengan keyboard;
13. menggunakan state-based keyboard input untuk kontrol kontinu;
14. menggunakan `deltaTime` untuk movement yang konsisten;
15. membuat animasi rotation dan scaling otomatis;
16. membandingkan dua urutan transformasi;
17. mengamati pengaruh pivot terhadap rotation;
18. melakukan debugging matrix transformation.

---

# 3. Ringkasan Coordinate Space

Materi menjelaskan urutan coordinate space:

```text
LOCAL
Geometry object
   ↓ Model Matrix

WORLD
Object dalam scene
   ↓ View Matrix

VIEW
Relatif terhadap camera
   ↓ Projection Matrix

CLIP
Homogeneous projected coordinate
   ↓ Perspective Divide

NDC
Normalized coordinate
   ↓ Viewport

SCREEN
Pixel coordinate
```

Pada praktikum ini implementasi utama difokuskan pada:

```text
Local Coordinate
      ↓
Model Matrix
      ↓
World / Transformed Position
```

View Matrix dan Projection Matrix belum menjadi fokus implementasi utama karena dibahas lebih detail pada Pertemuan 4.

---

# 4. Konsep Dasar Sebelum Implementasi

## 4.1 Local Coordinate

Local coordinate adalah posisi vertex relatif terhadap origin object.

Contoh triangle:

```text
       (0, 0.22)
           ●
          / \
         /   \
        ●─────●
(-0.18,-0.15) (0.18,-0.15)

Origin = (0,0)
```

Geometry ini mendeskripsikan bentuk object.

---

## 4.2 World Coordinate

World coordinate adalah coordinate space global tempat object ditempatkan.

Contoh:

```text
Object A → posisi kiri
Object B → posisi kanan
```

Keduanya dapat menggunakan geometry lokal yang sama, tetapi Model Matrix berbeda.

---

## 4.3 Pivot / Origin

Rotation dan scaling terjadi relatif terhadap pivot.

Jika pivot berada di tengah:

```text
object berputar di tengah
```

Jika pivot berada di sisi:

```text
object berputar seperti pintu pada engsel
```

---

## 4.4 Translation

Translation:

```text
x' = x + tx
y' = y + ty
```

Dalam matrix 3×3:

```text
T =
[1  0  tx]
[0  1  ty]
[0  0   1]
```

---

## 4.5 Scaling

```text
x' = sx × x
y' = sy × y
```

Matrix:

```text
S =
[sx  0   0]
[ 0 sy   0]
[ 0  0   1]
```

Jika:

```text
sx = sy
```

maka scaling disebut **uniform scaling**.

Jika:

```text
sx ≠ sy
```

maka disebut **non-uniform scaling**.

---

## 4.6 Rotation

Rotation 2D:

```text
x' = x cosθ - y sinθ
y' = x sinθ + y cosθ
```

Matrix:

```text
R =
[ cosθ  -sinθ  0]
[ sinθ   cosθ  0]
[  0       0   1]
```

JavaScript `Math.sin()` dan `Math.cos()` menggunakan radian.

Konversi:

```javascript
const rad =
  degree * Math.PI / 180;
```

---

## 4.7 Homogeneous Coordinate

Titik 2D:

```text
(x, y)
```

ditulis sebagai:

```text
(x, y, 1)
```

Komponen ketiga memungkinkan translation, rotation, dan scaling menggunakan bentuk matrix yang konsisten.

Secara umum:

```text
Point     → (x, y, 1)
Direction → (x, y, 0)
```

---

## 4.8 Transform Composition

Beberapa transformasi digabungkan menjadi satu matrix.

Dengan column-vector convention:

```text
P' = T × R × S × P
```

Transform yang paling dekat dengan `P` diterapkan lebih dahulu:

```text
Scale
 ↓
Rotate
 ↓
Translate
```

Karena matrix multiplication tidak komutatif:

```text
T × R ≠ R × T
```

urutan transformasi sangat penting.

---

# 5. Persiapan Project

Gunakan struktur:

```text
praktikum-transform-03/
├── index.html
├── style.css
├── main.js
├── matrix3.js
└── README.md
```

Disarankan menjalankan project melalui local development server.

---

# 6. Membuat `index.html`

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Interactive Transformation Playground
  </title>

  <link
    rel="stylesheet"
    href="style.css"
  />
</head>

<body>

  <main class="app">
    <header>
      <h1>
        Interactive Transformation Playground
      </h1>

      <p>
        WebGL — Pertemuan 3
      </p>
    </header>

    <canvas
      id="glCanvas"
      width="900"
      height="600">
    </canvas>

    <section id="hud">
      <div>
        Position:
        <span id="positionInfo"></span>
      </div>

      <div>
        Rotation:
        <span id="rotationInfo"></span>
      </div>

      <div>
        Scale:
        <span id="scaleInfo"></span>
      </div>

      <div>
        Order:
        <span id="orderInfo">
          Scale → Rotate → Translate
        </span>
      </div>
    </section>

    <section class="controls">
      <strong>Kontrol:</strong>

      <span>
        Arrow Keys = Move
      </span>

      <span>
        Q/E = Rotate
      </span>

      <span>
        +/- = Uniform Scale
      </span>

      <span>
        Z/X = Scale X
      </span>

      <span>
        C/V = Scale Y
      </span>

      <span>
        R = Reset
      </span>
    </section>
  </main>

  <script
    type="module"
    src="./main.js">
  </script>

</body>
</html>
```

---

# 7. Membuat `style.css`

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;

  display: grid;
  place-items: center;

  background: #07111f;
  color: #e5eefb;

  font-family:
    Arial,
    sans-serif;
}

.app {
  width: min(
    94vw,
    960px
  );

  display: grid;
  gap: 12px;
}

header h1 {
  margin-bottom: 4px;
}

header p {
  margin-top: 0;
  color: #9fb3c8;
}

canvas {
  width: 100%;
  height: auto;

  border:
    1px solid #38bdf8;

  background: #030712;
}

#hud {
  display: flex;
  flex-wrap: wrap;

  gap: 12px 24px;

  padding: 12px;

  background: #0f172a;

  border:
    1px solid #1e3a5f;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;

  color: #bfdbfe;
}
```

---

# 8. Membuat WebGL2 Context

Pada `main.js`:

```javascript
const canvas =
  document.getElementById(
    "glCanvas"
  );

const gl =
  canvas.getContext(
    "webgl2"
  );

if (!gl) {
  throw new Error(
    "WebGL2 tidak tersedia."
  );
}

gl.viewport(
  0,
  0,
  canvas.width,
  canvas.height
);
```

---

# 9. Geometry Tetap pada Local Space

Gunakan triangle:

```javascript
const vertices =
  new Float32Array([
    -0.18, -0.15,
     0.18, -0.15,
     0.00,  0.22
  ]);
```

Geometry ini tetap berada di sekitar:

```text
local origin = (0,0)
```

Hal penting:

> pada Pertemuan 3, geometry tidak dipindahkan dengan mengubah vertex buffer setiap frame.

Yang berubah adalah:

```text
Model Matrix
```

---

# 10. Vertex Shader dengan Matrix Uniform

Gunakan:

```javascript
const vertexShaderSource = `#version 300 es

in vec2 a_position;

uniform mat3 u_matrix;

void main() {
  vec3 p =
    u_matrix *
    vec3(
      a_position,
      1.0
    );

  gl_Position =
    vec4(
      p.xy,
      0.0,
      1.0
    );
}
`;
```

Penjelasan:

```glsl
vec3(a_position, 1.0)
```

mengubah vertex 2D menjadi homogeneous coordinate.

Kemudian:

```glsl
u_matrix * position
```

menerapkan transformasi pada GPU.

---

# 11. Fragment Shader

```javascript
const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor =
    u_color;
}
`;
```

Warna dibuat sebagai uniform karena satu object menggunakan warna yang sama untuk satu draw call.

---

# 12. Helper Compile Shader

```javascript
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

  gl.compileShader(
    shader
  );

  const success =
    gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    );

  if (!success) {
    const info =
      gl.getShaderInfoLog(
        shader
      );

    gl.deleteShader(
      shader
    );

    throw new Error(
      "Shader compile error:\n" +
      info
    );
  }

  return shader;
}
```

---

# 13. Helper Link Program

```javascript
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

  gl.linkProgram(
    program
  );

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

    gl.deleteProgram(
      program
    );

    throw new Error(
      "Program link error:\n" +
      info
    );
  }

  return program;
}
```

---

# 14. Compile dan Link Shader

```javascript
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

gl.useProgram(
  program
);
```

---

# 15. Membuat Vertex Buffer

```javascript
const positionBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  vertices,
  gl.STATIC_DRAW
);
```

Karena geometry tidak berubah, `STATIC_DRAW` sesuai untuk baseline praktikum ini.

---

# 16. Menghubungkan Attribute Position

```javascript
const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer
);

gl.enableVertexAttribArray(
  positionLocation
);

gl.vertexAttribPointer(
  positionLocation,
  2,
  gl.FLOAT,
  false,
  0,
  0
);
```

Alur:

```text
Local Vertex
    ↓
GPU Buffer
    ↓
a_position
    ↓
Vertex Shader
```

---

# 17. Mendapatkan Uniform Location

```javascript
const matrixLocation =
  gl.getUniformLocation(
    program,
    "u_matrix"
  );

const colorLocation =
  gl.getUniformLocation(
    program,
    "u_color"
  );
```

Perbedaan penting:

```text
Attribute
→ berbeda per vertex

Uniform
→ sama untuk satu draw call
```

---

# 18. Membuat `matrix3.js`

Buat file:

```javascript
export const Mat3 = {
  identity() {
    return new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
  },

  translation(
    tx,
    ty
  ) {
    return new Float32Array([
      1,  0,  0,
      0,  1,  0,
      tx, ty, 1
    ]);
  },

  rotation(rad) {
    const c =
      Math.cos(rad);

    const s =
      Math.sin(rad);

    return new Float32Array([
       c, s, 0,
      -s, c, 0,
       0, 0, 1
    ]);
  },

  scaling(
    sx,
    sy
  ) {
    return new Float32Array([
      sx, 0,  0,
      0,  sy, 0,
      0,  0,  1
    ]);
  },

  multiply(
    a,
    b
  ) {
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];

    const a10 = a[3];
    const a11 = a[4];
    const a12 = a[5];

    const a20 = a[6];
    const a21 = a[7];
    const a22 = a[8];

    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];

    const b10 = b[3];
    const b11 = b[4];
    const b12 = b[5];

    const b20 = b[6];
    const b21 = b[7];
    const b22 = b[8];

    return new Float32Array([
      b00 * a00 +
      b01 * a10 +
      b02 * a20,

      b00 * a01 +
      b01 * a11 +
      b02 * a21,

      b00 * a02 +
      b01 * a12 +
      b02 * a22,

      b10 * a00 +
      b11 * a10 +
      b12 * a20,

      b10 * a01 +
      b11 * a11 +
      b12 * a21,

      b10 * a02 +
      b11 * a12 +
      b12 * a22,

      b20 * a00 +
      b21 * a10 +
      b22 * a20,

      b20 * a01 +
      b21 * a11 +
      b22 * a21,

      b20 * a02 +
      b21 * a12 +
      b22 * a22
    ]);
  }
};
```

---

# 19. Catatan Penting tentang Matrix Convention

Materi menggunakan:

```text
column-vector convention
```

dengan konsep:

```text
P' = T × R × S × P
```

Pada implementasi, yang terpenting adalah:

> gunakan satu convention secara konsisten pada seluruh helper, urutan multiplication, dan vertex shader.

Jangan mencampur:

- row-vector convention,
- column-vector convention,
- cara storage matrix dari library berbeda.

---

# 20. Import Matrix Helper

Di awal `main.js`:

```javascript
import {
  Mat3
} from "./matrix3.js";
```

---

# 21. Helper Degree ke Radian

```javascript
function degToRad(
  degree
) {
  return (
    degree *
    Math.PI /
    180
  );
}
```

---

# 22. State Object A

Buat transform state:

```javascript
const objectA = {
  x: -0.35,
  y: 0.0,

  rotation: 0.0,

  scaleX: 1.0,
  scaleY: 1.0
};
```

Warna:

```javascript
const colorA =
  new Float32Array([
    0.10,
    0.75,
    1.00,
    1.00
  ]);
```

---

# 23. Membuat Translation Matrix

```javascript
const t =
  Mat3.translation(
    objectA.x,
    objectA.y
  );
```

Coba:

```text
x = -0.5
y = 0.0
```

kemudian:

```text
x = 0.5
y = 0.4
```

Amati bahwa bentuk object tidak berubah.

---

# 24. Membuat Rotation Matrix

```javascript
const r =
  Mat3.rotation(
    degToRad(
      objectA.rotation
    )
  );
```

Eksperimen:

```text
0°
45°
90°
180°
270°
```

Pertanyaan:

- ke arah mana object berputar?
- terhadap titik mana object berputar?
- apakah local geometry berubah?

---

# 25. Membuat Scaling Matrix

```javascript
const s =
  Mat3.scaling(
    objectA.scaleX,
    objectA.scaleY
  );
```

Eksperimen uniform scaling:

```text
scaleX = 1.5
scaleY = 1.5
```

Eksperimen non-uniform:

```text
scaleX = 2.0
scaleY = 0.5
```

---

# 26. Matrix Composition

Buat helper:

```javascript
function createTRSMatrix(
  transform
) {
  const t =
    Mat3.translation(
      transform.x,
      transform.y
    );

  const r =
    Mat3.rotation(
      degToRad(
        transform.rotation
      )
    );

  const s =
    Mat3.scaling(
      transform.scaleX,
      transform.scaleY
    );

  let matrix =
    Mat3.identity();

  matrix =
    Mat3.multiply(
      matrix,
      s
    );

  matrix =
    Mat3.multiply(
      matrix,
      r
    );

  matrix =
    Mat3.multiply(
      matrix,
      t
    );

  return matrix;
}
```

Tujuan visual:

```text
Local Vertex
   ↓ Scale
   ↓ Rotate
   ↓ Translate
World/Final Position
```

---

# 27. Mengirim Matrix ke GPU

```javascript
const matrix =
  createTRSMatrix(
    objectA
  );

gl.uniformMatrix3fv(
  matrixLocation,
  false,
  matrix
);
```

`false` digunakan karena WebGL tidak melakukan transpose matrix melalui parameter tersebut.

---

# 28. Draw Object

Buat:

```javascript
function drawObject(
  matrix,
  color
) {
  gl.uniformMatrix3fv(
    matrixLocation,
    false,
    matrix
  );

  gl.uniform4fv(
    colorLocation,
    color
  );

  gl.drawArrays(
    gl.TRIANGLES,
    0,
    3
  );
}
```

---

# 29. Rendering Satu Object

```javascript
function drawScene() {
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    0.03,
    0.05,
    0.10,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT
  );

  gl.useProgram(
    program
  );

  const matrixA =
    createTRSMatrix(
      objectA
    );

  drawObject(
    matrixA,
    colorA
  );
}
```

---

# 30. State-Based Keyboard Input

Untuk kontrol kontinu, gunakan state-based input.

```javascript
const keys = {};

window.addEventListener(
  "keydown",
  (event) => {
    keys[
      event.key.toLowerCase()
    ] = true;

    if (
      event.key.startsWith(
        "Arrow"
      )
    ) {
      event.preventDefault();
    }
  }
);

window.addEventListener(
  "keyup",
  (event) => {
    keys[
      event.key.toLowerCase()
    ] = false;
  }
);
```

State-based lebih sesuai untuk:

```text
Translation kontinu
Rotation kontinu
Scaling kontinu
```

karena input diperiksa setiap frame.

---

# 31. Event-Based untuk Aksi Diskrit

Untuk reset:

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key.toLowerCase()
        === "r"
      &&
      !event.repeat
    ) {
      resetObjectA();
    }
  }
);
```

Gunakan pola:

```text
Continuous Action → State-Based
Discrete Action   → Event-Based
```

---

# 32. Delta Time

```javascript
let lastTime = 0;

function render(
  time
) {
  let dt =
    (time - lastTime) *
    0.001;

  lastTime =
    time;

  dt =
    Math.min(
      dt,
      0.05
    );

  update(dt);
  drawScene();

  requestAnimationFrame(
    render
  );
}
```

Delta time membuat kecepatan gerak lebih konsisten terhadap perubahan FPS.

---

# 33. Translation dengan Keyboard

```javascript
const moveSpeed =
  0.65;

function updateTranslation(
  dt
) {
  if (
    keys["arrowleft"]
  ) {
    objectA.x -=
      moveSpeed * dt;
  }

  if (
    keys["arrowright"]
  ) {
    objectA.x +=
      moveSpeed * dt;
  }

  if (
    keys["arrowup"]
  ) {
    objectA.y +=
      moveSpeed * dt;
  }

  if (
    keys["arrowdown"]
  ) {
    objectA.y -=
      moveSpeed * dt;
  }
}
```

---

# 34. Rotation dengan Keyboard

```javascript
const rotationSpeed =
  100.0;

function updateRotation(
  dt
) {
  if (
    keys["q"]
  ) {
    objectA.rotation -=
      rotationSpeed * dt;
  }

  if (
    keys["e"]
  ) {
    objectA.rotation +=
      rotationSpeed * dt;
  }
}
```

Satuan:

```text
degree per second
```

---

# 35. Uniform Scaling dengan Keyboard

```javascript
const scaleSpeed =
  0.8;

function updateUniformScale(
  dt
) {
  if (
    keys["+"] ||
    keys["="]
  ) {
    objectA.scaleX +=
      scaleSpeed * dt;

    objectA.scaleY +=
      scaleSpeed * dt;
  }

  if (
    keys["-"] ||
    keys["_"]
  ) {
    objectA.scaleX -=
      scaleSpeed * dt;

    objectA.scaleY -=
      scaleSpeed * dt;
  }
}
```

---

# 36. Non-Uniform Scaling dengan Keyboard

Gunakan:

```text
Z / X → scale X
C / V → scale Y
```

```javascript
function updateNonUniformScale(
  dt
) {
  if (keys["z"]) {
    objectA.scaleX -=
      scaleSpeed * dt;
  }

  if (keys["x"]) {
    objectA.scaleX +=
      scaleSpeed * dt;
  }

  if (keys["c"]) {
    objectA.scaleY -=
      scaleSpeed * dt;
  }

  if (keys["v"]) {
    objectA.scaleY +=
      scaleSpeed * dt;
  }
}
```

---

# 37. Clamp Transform

```javascript
function clampObjectA() {
  objectA.x =
    Math.max(
      -0.8,
      Math.min(
        0.8,
        objectA.x
      )
    );

  objectA.y =
    Math.max(
      -0.75,
      Math.min(
        0.75,
        objectA.y
      )
    );

  objectA.scaleX =
    Math.max(
      0.2,
      Math.min(
        2.5,
        objectA.scaleX
      )
    );

  objectA.scaleY =
    Math.max(
      0.2,
      Math.min(
        2.5,
        objectA.scaleY
      )
    );
}
```

Untuk praktikum dasar, scale negatif belum digunakan agar tidak masuk ke topik reflection.

---

# 38. Reset Object

```javascript
function resetObjectA() {
  objectA.x =
    -0.35;

  objectA.y =
    0.0;

  objectA.rotation =
    0.0;

  objectA.scaleX =
    1.0;

  objectA.scaleY =
    1.0;
}
```

---

# 39. Fungsi Update

```javascript
function update(
  dt
) {
  updateTranslation(
    dt
  );

  updateRotation(
    dt
  );

  updateUniformScale(
    dt
  );

  updateNonUniformScale(
    dt
  );

  clampObjectA();
}
```

---

# 40. Menambahkan HUD

```javascript
const positionInfo =
  document.getElementById(
    "positionInfo"
  );

const rotationInfo =
  document.getElementById(
    "rotationInfo"
  );

const scaleInfo =
  document.getElementById(
    "scaleInfo"
  );
```

Update:

```javascript
function updateHUD() {
  positionInfo.textContent =
    `(${objectA.x.toFixed(2)}, ` +
    `${objectA.y.toFixed(2)})`;

  rotationInfo.textContent =
    `${objectA.rotation.toFixed(1)}°`;

  scaleInfo.textContent =
    `(${objectA.scaleX.toFixed(2)}, ` +
    `${objectA.scaleY.toFixed(2)})`;
}
```

Panggil di `render()`.

---

# 41. Membuat Object B

Gunakan geometry yang sama.

```javascript
const colorB =
  new Float32Array([
    1.00,
    0.55,
    0.10,
    1.00
  ]);
```

Object B akan menggunakan automatic animation.

---

# 42. Automatic Rotation

```javascript
function createObjectBMatrix(
  seconds
) {
  const rotation =
    seconds * 70.0;

  const scale =
    1.0 +
    Math.sin(
      seconds * 2.0
    ) * 0.25;

  const transformB = {
    x: 0.42,
    y: 0.0,

    rotation,

    scaleX: scale,
    scaleY: scale
  };

  return createTRSMatrix(
    transformB
  );
}
```

Object B:

```text
Rotation otomatis
+
Animated scaling
+
Position tetap
```

---

# 43. Menggambar Dua Object

```javascript
function drawScene(
  seconds
) {
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    0.03,
    0.05,
    0.10,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT
  );

  gl.useProgram(
    program
  );

  const matrixA =
    createTRSMatrix(
      objectA
    );

  const matrixB =
    createObjectBMatrix(
      seconds
    );

  drawObject(
    matrixA,
    colorA
  );

  drawObject(
    matrixB,
    colorB
  );
}
```

Satu geometry buffer:

```text
Triangle Geometry
    ↓
Matrix A + Color A
    ↓
Object A

Triangle Geometry
    ↓
Matrix B + Color B
    ↓
Object B
```

---

# 44. Rendering Loop Lengkap

```javascript
let lastTime = 0;

function render(
  time
) {
  const seconds =
    time * 0.001;

  let dt =
    (time - lastTime) *
    0.001;

  lastTime =
    time;

  dt =
    Math.min(
      dt,
      0.05
    );

  update(
    dt
  );

  updateHUD();

  drawScene(
    seconds
  );

  requestAnimationFrame(
    render
  );
}

requestAnimationFrame(
  render
);
```

---

# 45. Eksperimen Wajib 1 — Local vs World

Gunakan geometry yang sama untuk dua object.

Object A:

```text
Position = (-0.4, 0)
```

Object B:

```text
Position = (0.4, 0)
```

Jawab:

1. apakah vertex buffer keduanya berbeda?
2. apa yang membedakan posisi visual keduanya?
3. coordinate mana yang mendefinisikan bentuk?
4. coordinate mana yang menggambarkan penempatan object?

---

# 46. Eksperimen Wajib 2 — Rotation

Coba:

```text
0°
45°
90°
180°
270°
```

Catat:

- arah rotasi;
- lokasi pivot;
- apakah translation berubah;
- apakah geometry asli berubah.

---

# 47. Eksperimen Wajib 3 — Uniform vs Non-Uniform Scaling

Bandingkan:

```text
(1.5, 1.5)
```

dengan:

```text
(2.0, 0.5)
```

Jelaskan perbedaan visual.

---

# 48. Eksperimen Wajib 4 — Transform Order

Buat dua object identik.

Case A:

```text
Scale
→ Rotate
→ Translate
```

Case B:

```text
Translate
→ Rotate
```

Parameter harus sama.

Tujuan:

> menunjukkan bahwa urutan matrix memengaruhi hasil.

---

# 49. Implementasi Transform Order A

Gunakan fungsi `createTRSMatrix()`.

Konsep:

```text
P' =
T × R × S × P
```

---

# 50. Implementasi Transform Order B

Buat helper lain:

```javascript
function createRTMatrix(
  transform
) {
  const t =
    Mat3.translation(
      transform.x,
      transform.y
    );

  const r =
    Mat3.rotation(
      degToRad(
        transform.rotation
      )
    );

  let matrix =
    Mat3.identity();

  matrix =
    Mat3.multiply(
      matrix,
      t
    );

  matrix =
    Mat3.multiply(
      matrix,
      r
    );

  return matrix;
}
```

Gunakan helper ini sebagai pembanding.

Catatan:

> fokus eksperimen bukan menghafal urutan pemanggilan helper, melainkan memahami bahwa hasil berubah ketika composition berbeda.

---

# 51. Mengapa Object Bisa Mengorbit?

Jika object sudah ditranslasi dari origin lalu rotation diterapkan pada posisi tersebut, translation dapat ikut terrotasi.

Secara visual:

```text
Object jauh dari origin
      ↓
Rotate
      ↓
Object mengelilingi origin
```

Ini menjelaskan mengapa urutan transformasi penting.

---

# 52. Coordinate Axes

Tambahkan visual sederhana:

```text
X Axis
Y Axis
Origin
```

Boleh menggunakan:

- WebGL `LINES`, atau
- overlay HTML/CSS.

Tujuan utama:

> mahasiswa dapat melihat world origin `(0,0)`.

---

# 53. Membuat Axis dengan WebGL

Contoh data:

```javascript
const axisVertices =
  new Float32Array([
    -1.0, 0.0,
     1.0, 0.0,

     0.0, -1.0,
     0.0,  1.0
  ]);
```

Gunakan identity matrix agar axis tetap berada pada world reference.

---

# 54. Pivot Observation

Tambahkan marker pivot pada local origin:

```text
(0,0)
```

Marker dapat dibuat menggunakan `gl.POINTS`.

Pivot marker harus menggunakan Model Matrix yang sama dengan object.

Dengan demikian:

```text
Local Pivot
    ↓
Model Matrix
    ↓
World Pivot
```

---

# 55. Eksperimen Pivot: Door Rotation

Buat rectangle yang pivot-nya tidak berada di tengah.

Target:

```text
rotation seperti pintu
```

Konsep:

```text
Translate pivot ke origin
        ↓
Rotate
        ↓
Translate kembali
```

Matrix konseptual:

```text
T(pivot)
×
R
×
T(-pivot)
```

---

# 56. Mengapa Pivot Penting?

Pivot memengaruhi:

- rotation;
- scaling;
- hierarchical transformation.

Contoh:

```text
Door   → hinge
Wheel  → center
Robot Arm → joint
```

---

# 57. Parent dan Child — Konsep Challenge

Konsep:

```text
Parent
└── Child
```

World Matrix child:

```text
ChildWorld
=
ParentWorld
×
ChildLocal
```

Contoh:

```text
Car
└── Wheel
```

Jika car bergerak, wheel ikut bergerak.

Ini merupakan dasar hierarchical transform dan scene graph.

---

# 58. Challenge A — Reset Transform

Gunakan:

```text
R
```

untuk mengembalikan:

```text
Position = kondisi awal
Rotation = 0°
Scale = (1,1)
```

---

# 59. Challenge B — Transform Preset

Gunakan:

```text
1
2
3
```

untuk tiga preset berbeda.

Contoh:

```text
Preset 1:
Position (-0.4, 0.2)
Rotation 0°
Scale (1,1)

Preset 2:
Position (0.0, 0.0)
Rotation 45°
Scale (1.5,1.5)

Preset 3:
Position (0.3,-0.2)
Rotation 90°
Scale (1.8,0.6)
```

---

# 60. Challenge C — Toggle Transform Order

Gunakan:

```text
T
```

untuk mengganti:

```text
T × R × S
```

dan order lain.

Tampilkan order aktif pada HUD.

---

# 61. Challenge D — Mouse Translation

Saat Canvas diklik:

```text
Mouse Pixel
    ↓
NDC
    ↓
transform.x
transform.y
    ↓
Translation Matrix
```

Gunakan konversi pixel ke NDC seperti pada praktikum sebelumnya.

---

# 62. Challenge E — Parent & Child

Buat dua object:

```text
Parent
└── Child
```

Child memiliki local transform sendiri.

Ketika parent bergerak, child ikut bergerak.

---

# 63. Challenge F — Simple Orbit

Gunakan composition matrix agar satu object mengorbit object pusat.

Fokus:

```text
matrix composition
```

bukan physics.

---

# 64. Tugas Utama Praktikum

Bangun:

# Interactive Transformation Playground

Requirement minimum:

- [ ] WebGL2 Context;
- [ ] geometry berada dalam local coordinate;
- [ ] geometry tersimpan dalam GPU buffer;
- [ ] homogeneous coordinate pada vertex shader;
- [ ] translation matrix;
- [ ] rotation matrix;
- [ ] scaling matrix;
- [ ] uniform scaling;
- [ ] non-uniform scaling;
- [ ] matrix multiplication;
- [ ] Model Matrix;
- [ ] matrix dikirim sebagai uniform;
- [ ] minimal dua object;
- [ ] geometry yang sama dapat digunakan ulang;
- [ ] keyboard translation;
- [ ] keyboard rotation;
- [ ] keyboard scaling;
- [ ] state-based input;
- [ ] `deltaTime`;
- [ ] automatic animation;
- [ ] dua transform order berbeda;
- [ ] HUD position, rotation, scale;
- [ ] coordinate axes/origin;
- [ ] minimal dua challenge;
- [ ] source code terstruktur;
- [ ] Console tidak menunjukkan error pada penggunaan normal.

---

# 65. Milestone Implementasi

## Milestone 1

```text
Canvas
+
WebGL2
+
Triangle Local Space
```

## Milestone 2

```text
Identity Matrix
+
u_matrix
```

## Milestone 3

```text
Translation
```

## Milestone 4

```text
Rotation
```

## Milestone 5

```text
Uniform + Non-Uniform Scaling
```

## Milestone 6

```text
Matrix Multiplication
+
TRS Composition
```

## Milestone 7

```text
State-Based Keyboard
+
Delta Time
```

## Milestone 8

```text
Object B
+
Automatic Animation
```

## Milestone 9

```text
Transform Order Comparison
+
HUD
```

## Milestone 10

```text
Axes
+
Pivot
+
2 Challenges
```

---

# 66. Debugging — Object Hilang

Periksa:

1. apakah shader berhasil compile?
2. apakah program berhasil link?
3. apakah uniform location valid?
4. apakah matrix mengandung `NaN`?
5. apakah scale terlalu kecil?
6. apakah position keluar NDC?
7. apakah angle sudah dalam radian?
8. apakah matrix dikirim sebelum draw call?
9. apakah transform order sesuai?
10. apakah matrix convention konsisten?

---

# 67. Menampilkan Matrix di Console

```javascript
console.table(
  Array.from(
    matrix
  )
);
```

Untuk debugging lebih nyaman, boleh membuat helper yang menampilkan matrix sebagai tiga baris.

---

# 68. Debugging Degree vs Radian

Salah:

```javascript
Math.sin(90);
```

jika maksudnya adalah 90°.

Benar:

```javascript
Math.sin(
  degToRad(90)
);
```

---

# 69. Debugging Transform Order

Jika object:

```text
mengorbit origin
```

padahal seharusnya hanya:

```text
berputar di tempat
```

periksa urutan:

```text
Translation
Rotation
Scaling
```

---

# 70. Debugging Pivot

Jika object berputar terhadap titik yang salah:

- cek posisi local origin;
- cek komposisi translate-to-pivot;
- cek translate-back;
- cek order multiplication.

---

# 71. Test Case

| No. | Pengujian | Hasil yang Diharapkan |
|---:|---|---|
| 1 | Load halaman | Canvas tampil |
| 2 | Identity matrix | Object tampil tanpa transform |
| 3 | Arrow Left/Right | Translation X kontinu |
| 4 | Arrow Up/Down | Translation Y kontinu |
| 5 | Q/E | Rotation berjalan |
| 6 | +/- | Uniform scaling berjalan |
| 7 | Z/X | Scale X berubah |
| 8 | C/V | Scale Y berubah |
| 9 | R | Transform kembali ke awal |
| 10 | Object B | Rotation otomatis |
| 11 | Object B | Animated scaling |
| 12 | Dua object | Menggunakan geometry yang sama |
| 13 | HUD | Nilai transform berubah |
| 14 | Transform order | Hasil visual berbeda |
| 15 | Axis | Origin dan sumbu terlihat |
| 16 | Pivot | Pivot dapat diamati |
| 17 | Console | Tidak ada error normal |

---

# 72. Pertanyaan Pemahaman

Jawab dengan kalimat sendiri.

1. Apa perbedaan local coordinate dan world coordinate?
2. Apa fungsi object origin?
3. Apa fungsi Model Matrix?
4. Mengapa geometry sebaiknya tetap berada di local space?
5. Apa perbedaan translation, rotation, dan scaling?
6. Apa perbedaan uniform dan non-uniform scaling?
7. Mengapa homogeneous coordinate diperlukan?
8. Mengapa titik menggunakan `w = 1`?
9. Mengapa direction vector dapat menggunakan `w = 0`?
10. Mengapa transformation matrix menggunakan 3×3 untuk kasus 2D ini?
11. Mengapa rotation membutuhkan sin dan cos?
12. Mengapa JavaScript perlu konversi degree ke radian?
13. Apa yang dimaksud transform composition?
14. Mengapa `T × R` berbeda dengan `R × T`?
15. Apa fungsi matrix uniform?
16. Apa perbedaan attribute dan uniform?
17. Mengapa matrix uniform lebih baik daripada mengubah seluruh vertex pada CPU untuk transformasi object?
18. Mengapa satu geometry buffer dapat digunakan untuk beberapa object?
19. Apa hubungan pivot dengan rotation?
20. Apa hubungan pivot dengan scaling?
21. Apa hubungan Model Matrix dengan local dan world coordinate?
22. Apa fungsi View Matrix secara konseptual?
23. Apa fungsi Projection Matrix secara konseptual?
24. Apa hubungan clip coordinate dan NDC?
25. Apa yang dilakukan perspective divide?
26. Apa fungsi viewport transform?
27. Mengapa state-based keyboard input cocok untuk kontrol kontinu?
28. Mengapa `deltaTime` diperlukan?
29. Bagaimana parent transform memengaruhi child?
30. Mengapa matrix convention harus konsisten?

---

# 73. Pertanyaan Eksperimen

## A. Translation

Bandingkan:

```text
(-0.5, 0)
```

dan:

```text
(0.5, 0.4)
```

Apa hubungan nilainya dengan posisi object?

## B. Rotation

Bandingkan:

```text
0°
90°
180°
```

Apa yang berubah dan apa yang tidak?

## C. Scaling

Bandingkan:

```text
(2,2)
```

dan:

```text
(2,0.5)
```

Apa perbedaannya?

## D. Transform Order

Bandingkan:

```text
T × R
```

dan:

```text
R × T
```

Apa perbedaan visual?

## E. Pivot

Pindahkan pivot rectangle dari tengah ke sisi.

Apa yang terjadi pada rotation?

---

# 74. README

`README.md` minimal berisi:

```text
Nama
NRP
Deskripsi aplikasi
Kontrol keyboard
Transformasi yang digunakan
Transform order yang dibandingkan
Challenge yang dikerjakan
Cara menjalankan project
Catatan debugging
```

---

## Dokumentasi Aplikasi

**Nama:** Isi nama Anda di sini  
**NRP:** Isi NRP Anda di sini

### Deskripsi aplikasi

Interactive Transformation Playground adalah aplikasi WebGL2 untuk melihat perubahan posisi, rotasi, dan ukuran triangle tanpa mengubah data vertex asli. Triangle biru (Object A) dapat dikontrol dengan keyboard. Triangle oranye (Object B) memakai geometry yang sama dan berputar serta membesar-mengecil otomatis. Garis tipis menunjukkan sumbu X dan Y, sedangkan titik putih menunjukkan pivot tiap object.

### Kontrol keyboard

| Tombol | Fungsi |
|---|---|
| Arrow Keys | Memindahkan Object A |
| Q / E | Rotasi kiri / kanan |
| + / - | Uniform scaling |
| Z / X | Mengurangi / menambah scale X |
| C / V | Mengurangi / menambah scale Y |
| R | Reset transform Object A |
| 1 / 2 / 3 | Memakai preset transform |
| T | Mengganti transform order |

### Transformasi dan transform order

Aplikasi memakai translation, rotation, uniform scaling, dan non-uniform scaling. Order awal adalah **Scale → Rotate → Translate** (`T × R × S`). Tombol `T` menggantinya menjadi **Scale → Translate → Rotate**. Pada order kedua, posisi ikut terkena rotasi sehingga triangle dapat terlihat mengorbit origin.

### Challenge yang dikerjakan

- Challenge A: reset transform dengan tombol `R`.
- Challenge B: tiga preset transform dengan tombol `1`, `2`, dan `3`.
- Challenge C: toggle transform order dengan tombol `T`, serta order aktif ditampilkan di HUD.

### Cara menjalankan project

1. Buka folder project dengan editor yang memiliki local server, misalnya VS Code dengan ekstensi Live Server.
2. Jalankan `src/index.html` melalui local server, jangan membuka file HTML langsung dari file manager.
3. Buka halaman pada browser yang mendukung WebGL2.

### Catatan debugging

Jika canvas kosong, periksa Console browser lebih dahulu. Pastikan browser mendukung WebGL2 dan local server menjalankan folder project ini. Jika object tidak terlihat, periksa nilai scale (minimal 0.2), posisi object, serta apakah `u_matrix` dan `a_position` berhasil ditemukan oleh WebGL.

### Refleksi

Konsep yang paling mudah dipahami adalah translation karena perubahan nilai X dan Y langsung terlihat pada posisi triangle. Bagian yang paling perlu diperhatikan adalah urutan perkalian matrix, sebab object bisa berpindah dengan hasil yang berbeda walaupun nilai transformasinya sama. Saya menemukan bahwa `T × R × S` tidak boleh dianggap sama dengan urutan lain. Marker pivot membantu melihat bahwa rotation dan scaling selalu terjadi terhadap titik local origin. Konsep ini mirip `position`, `rotation`, dan `scale` pada Three.js maupun Unity, hanya saja pada praktikum ini matrix-nya dibuat dan dikirim ke GPU secara langsung.

---

# 75. Output Pengumpulan

Struktur:

```text
praktikum-transform-03/
├── index.html
├── style.css
├── main.js (seluruh JavaScript, termasuk helper Mat3)
├── README.md
└── screenshot.png
```

Jika diminta:

```text
demo.mp4
```

---

# 76. Refleksi

Tuliskan 4–6 kalimat mengenai:

- konsep yang paling mudah;
- konsep yang paling sulit;
- kesalahan matrix yang ditemukan;
- pengaruh transform order;
- pengaruh pivot;
- hubungan konsep ini dengan Three.js atau Unity.

---

# 77. Hubungan dengan Three.js

Three.js menyediakan:

```javascript
object.position
object.rotation
object.scale
```

Walaupun API lebih sederhana, engine tetap menggunakan transformation matrix di belakangnya.

---

# 78. Hubungan dengan Unity

Unity menyediakan:

```text
Transform
├── Position
├── Rotation
└── Scale
```

Konsep dasarnya tetap sama:

```text
Local Transform
+
Parent Transform
+
World Transform
```

---

# 79. Hubungan dengan Pertemuan 4

Pertemuan berikutnya menambahkan:

```text
View Matrix
+
Projection Matrix
```

Pipeline menjadi:

```text
Local
 ↓ Model
World
 ↓ View
View
 ↓ Projection
Clip
 ↓ Perspective Divide
NDC
 ↓ Viewport
Screen
```

---

# 80. Ringkasan Praktikum

Pada praktikum ini mahasiswa mengimplementasikan:

- local coordinate;
- world placement melalui Model Matrix;
- translation;
- rotation;
- uniform scaling;
- non-uniform scaling;
- homogeneous coordinate;
- matrix 3×3;
- matrix multiplication;
- transform composition;
- matrix uniform;
- state-based keyboard control;
- delta-time movement;
- automatic animation;
- transform order comparison;
- pivot observation;
- multiple object dengan geometry yang sama;
- HUD transform.

Benang merah:

```text
GEOMETRY
   ↓
LOCAL SPACE
   ↓
MODEL MATRIX
   ↓
TRANSFORMED / WORLD POSITION
   ↓
VERTEX SHADER
   ↓
RASTERIZATION
   ↓
IMAGE
```

dan secara lebih lengkap:

```text
LOCAL
 ↓ Model
WORLD
 ↓ View
VIEW
 ↓ Projection
CLIP
 ↓ Perspective Divide
NDC
 ↓ Viewport
SCREEN
```

Transformasi menjadi jembatan dari geometry statis menuju scene grafika yang dinamis dan menjadi fondasi untuk pembahasan **Camera, Projection & 3D** pada Pertemuan 4.
