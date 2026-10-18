# Modul Praktikum Grafika Komputer — Pertemuan 4

## Camera, Projection & 3D dengan WebGL

**Mata Kuliah:** EF234504 — Grafika Komputer
**Pertemuan:** 4
**Topik:** Camera, Projection & 3D
**Dosen:** Dr. Darlis Herumurti
**Departemen:** Teknik Informatika

---

# 1. Deskripsi Praktikum

Pada Pertemuan 3, mahasiswa telah mempelajari transformasi object:

```text
Local Space
    ↓
Model Matrix
    ↓
World Space
```

Pada Pertemuan 4, pipeline dilanjutkan dengan:

```text
World Space
    ↓
View Matrix
    ↓
View Space
    ↓
Projection Matrix
    ↓
Clip Space
    ↓
Perspective Divide
    ↓
NDC
    ↓
Viewport
    ↓
Screen
```

Praktikum ini berfokus pada pembuatan visualisasi 3D menggunakan **cube**, **camera**, **View Matrix**, **Perspective Projection**, **Orthographic Projection**, serta **Depth Test**.

Aplikasi akhir yang dibuat adalah:

# Rotating 3D Cube Camera Playground

Fitur utama:

```text
3D Cube
+
Model Matrix
+
Camera Position
+
Target
+
Up Vector
+
View Matrix
+
Perspective Projection
+
Orthographic Projection
+
Projection Toggle
+
FOV Control
+
Near/Far Preset
+
Depth Test ON/OFF
+
Camera Control
+
Automatic Rotation
+
HUD Camera
```

---

# 2. Capaian Praktikum

Setelah menyelesaikan praktikum, mahasiswa diharapkan mampu:

1. menjelaskan fungsi camera pada scene 3D;
2. menjelaskan camera position, target, dan up vector;
3. menghitung basis camera secara konseptual;
4. membuat View Matrix dengan konsep `lookAt`;
5. membuat Perspective Projection Matrix;
6. membuat Orthographic Projection Matrix;
7. menjelaskan Field of View;
8. menjelaskan Aspect Ratio;
9. menjelaskan Near Plane dan Far Plane;
10. membuat geometry cube dari triangle;
11. menggunakan vertex position `vec3`;
12. menggunakan matrix 4×4 untuk transformasi 3D;
13. menerapkan Model, View, dan Projection Matrix pada vertex shader;
14. mengaktifkan depth buffer dan depth test;
15. membandingkan hasil dengan dan tanpa depth test;
16. membuat animasi rotasi cube;
17. membuat kontrol camera;
18. mengganti perspective dan orthographic projection;
19. mengubah FOV secara interaktif;
20. mengamati efek near/far clipping;
21. melakukan debugging camera, projection, dan depth.

---

# 3. Benang Merah Pipeline

Pipeline utama praktikum:

```text
Local Vertex
     ↓
Model Matrix
     ↓
World Position
     ↓
View Matrix
     ↓
View Position
     ↓
Projection Matrix
     ↓
Clip Position
     ↓
Perspective Divide
     ↓
NDC
     ↓
Viewport
     ↓
Screen
```

Pada shader:

```text
clipPosition
=
Projection
× View
× Model
× localPosition
```

atau:

```text
P × V × M × p
```

---

# 4. Mengapa Sekarang Menggunakan Matrix 4×4?

Pada Pertemuan 3, transformasi 2D menggunakan matrix 3×3.

Pada 3D, vertex memiliki:

```text
X
Y
Z
```

Dengan homogeneous coordinate:

```text
(x, y, z, 1)
```

maka kita menggunakan matrix:

```text
4 × 4
```

Matrix 4×4 dapat merepresentasikan:

- translation 3D;
- rotation 3D;
- scaling 3D;
- View Transformation;
- Projection Transformation.

---

# 5. Persiapan Project

Gunakan struktur:

```text
praktikum-camera-04/
├── index.html
├── style.css
├── main.js
├── math3d.js
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
    Rotating 3D Cube Camera Playground
  </title>

  <link
    rel="stylesheet"
    href="./style.css"
  />
</head>

<body>

  <main class="app">

    <header>
      <h1>
        Rotating 3D Cube Camera Playground
      </h1>

      <p>
        WebGL — Camera, Projection & 3D
      </p>
    </header>

    <canvas
      id="glCanvas"
      width="960"
      height="600">
    </canvas>

    <section id="hud">
      <div>
        Projection:
        <span id="projectionInfo"></span>
      </div>

      <div>
        Camera:
        <span id="cameraInfo"></span>
      </div>

      <div>
        FOV:
        <span id="fovInfo"></span>
      </div>

      <div>
        Near/Far:
        <span id="clipInfo"></span>
      </div>

      <div>
        Depth Test:
        <span id="depthInfo"></span>
      </div>
    </section>

    <section class="controls">
      <strong>Kontrol:</strong>

      <span>Arrow = Camera X/Y</span>
      <span>W/S = Camera Z</span>
      <span>P = Projection Toggle</span>
      <span>[ / ] = FOV</span>
      <span>N = Near/Far Preset</span>
      <span>D = Depth Test</span>
      <span>R = Reset</span>
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
    95vw,
    1020px
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

  background: #020617;
}

#hud {
  display: flex;
  flex-wrap: wrap;

  gap: 12px 22px;

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
```

---

# 9. Mengatur Viewport

```javascript
gl.viewport(
  0,
  0,
  canvas.width,
  canvas.height
);
```

Aspect ratio:

```javascript
const aspect =
  canvas.width /
  canvas.height;
```

Aspect ratio ini akan digunakan oleh Perspective Projection Matrix.

---

# 10. Geometry Cube

Cube memiliki:

```text
6 faces
```

Setiap face:

```text
2 triangles
```

Sehingga:

```text
6 × 2 = 12 triangles
```

Jika setiap triangle menggunakan 3 vertex:

```text
12 × 3 = 36 vertex
```

Untuk praktikum dasar, kita menggunakan vertex tanpa index buffer agar struktur geometry mudah dipahami.

---

# 11. Membuat Cube Vertex Data

Gunakan cube berpusat pada local origin.

```javascript
const cubePositions =
  new Float32Array([
    // Front
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,

    -0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    // Back
     0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,

     0.5, -0.5, -0.5,
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,

    // Left
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,

    -0.5, -0.5, -0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,

    // Right
     0.5, -0.5,  0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,

     0.5, -0.5,  0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,

    // Top
    -0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,

    -0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,

    // Bottom
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,

    -0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5
  ]);
```

---

# 12. Color per Face

Gunakan warna berbeda agar orientation cube mudah diamati.

```javascript
const cubeColors =
  new Float32Array([
    // Front - cyan
    0.0, 0.8, 1.0,
    0.0, 0.8, 1.0,
    0.0, 0.8, 1.0,
    0.0, 0.8, 1.0,
    0.0, 0.8, 1.0,
    0.0, 0.8, 1.0,

    // Back - blue
    0.2, 0.3, 1.0,
    0.2, 0.3, 1.0,
    0.2, 0.3, 1.0,
    0.2, 0.3, 1.0,
    0.2, 0.3, 1.0,
    0.2, 0.3, 1.0,

    // Left - orange
    1.0, 0.5, 0.1,
    1.0, 0.5, 0.1,
    1.0, 0.5, 0.1,
    1.0, 0.5, 0.1,
    1.0, 0.5, 0.1,
    1.0, 0.5, 0.1,

    // Right - green
    0.2, 1.0, 0.4,
    0.2, 1.0, 0.4,
    0.2, 1.0, 0.4,
    0.2, 1.0, 0.4,
    0.2, 1.0, 0.4,
    0.2, 1.0, 0.4,

    // Top - magenta
    1.0, 0.2, 0.8,
    1.0, 0.2, 0.8,
    1.0, 0.2, 0.8,
    1.0, 0.2, 0.8,
    1.0, 0.2, 0.8,
    1.0, 0.2, 0.8,

    // Bottom - yellow
    1.0, 0.9, 0.1,
    1.0, 0.9, 0.1,
    1.0, 0.9, 0.1,
    1.0, 0.9, 0.1,
    1.0, 0.9, 0.1,
    1.0, 0.9, 0.1
  ]);
```

Jumlah color harus sesuai dengan:

```text
36 vertex × 3 komponen
```

---

# 13. Vertex Shader 3D

```javascript
const vertexShaderSource = `#version 300 es

in vec3 a_position;
in vec3 a_color;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 v_color;

void main() {
  gl_Position =
    u_projection
    *
    u_view
    *
    u_model
    *
    vec4(
      a_position,
      1.0
    );

  v_color =
    a_color;
}
`;
```

Perbedaan dengan Pertemuan 3:

```text
vec2 → vec3

mat3 → mat4

Model only
→ Model + View + Projection
```

---

# 14. Fragment Shader

```javascript
const fragmentShaderSource = `#version 300 es

precision highp float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor =
    vec4(
      v_color,
      1.0
    );
}
`;
```

---

# 15. Helper Shader dan Program

Gunakan helper seperti Pertemuan sebelumnya:

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

Program:

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

# 16. Membuat Position Buffer

```javascript
const positionBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  cubePositions,
  gl.STATIC_DRAW
);
```

---

# 17. Membuat Color Buffer

```javascript
const colorBuffer =
  gl.createBuffer();

gl.bindBuffer(
  gl.ARRAY_BUFFER,
  colorBuffer
);

gl.bufferData(
  gl.ARRAY_BUFFER,
  cubeColors,
  gl.STATIC_DRAW
);
```

---

# 18. Attribute Location

```javascript
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
```

---

# 19. Uniform Location

```javascript
const modelLocation =
  gl.getUniformLocation(
    program,
    "u_model"
  );

const viewLocation =
  gl.getUniformLocation(
    program,
    "u_view"
  );

const projectionLocation =
  gl.getUniformLocation(
    program,
    "u_projection"
  );
```

---

# 20. Menyiapkan Attribute Position

```javascript
gl.bindBuffer(
  gl.ARRAY_BUFFER,
  positionBuffer
);

gl.enableVertexAttribArray(
  positionLocation
);

gl.vertexAttribPointer(
  positionLocation,
  3,
  gl.FLOAT,
  false,
  0,
  0
);
```

`3` berarti:

```text
X, Y, Z
```

---

# 21. Menyiapkan Attribute Color

```javascript
gl.bindBuffer(
  gl.ARRAY_BUFFER,
  colorBuffer
);

gl.enableVertexAttribArray(
  colorLocation
);

gl.vertexAttribPointer(
  colorLocation,
  3,
  gl.FLOAT,
  false,
  0,
  0
);
```

---

# 22. File `math3d.js`

Buat helper vector dan matrix agar kode kamera tidak bercampur dengan render loop.

```javascript
export const Vec3 = {
  subtract(a, b) {
    return [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ];
  },

  cross(a, b) {
    return [
      a[1] * b[2] -
      a[2] * b[1],

      a[2] * b[0] -
      a[0] * b[2],

      a[0] * b[1] -
      a[1] * b[0]
    ];
  },

  normalize(v) {
    const length =
      Math.hypot(
        v[0],
        v[1],
        v[2]
      );

    if (
      length <
      0.000001
    ) {
      return [
        0,
        0,
        0
      ];
    }

    return [
      v[0] / length,
      v[1] / length,
      v[2] / length
    ];
  },

  dot(a, b) {
    return (
      a[0] * b[0] +
      a[1] * b[1] +
      a[2] * b[2]
    );
  }
};
```

---

# 23. Matrix 4×4 — Identity

Tambahkan:

```javascript
export const Mat4 = {
  identity() {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }
};
```

---

# 24. Translation Matrix 4×4

Tambahkan:

```javascript
translation(
  tx,
  ty,
  tz
) {
  return new Float32Array([
    1,  0,  0,  0,
    0,  1,  0,  0,
    0,  0,  1,  0,
    tx, ty, tz, 1
  ]);
}
```

---

# 25. Rotation X

```javascript
rotationX(rad) {
  const c =
    Math.cos(rad);

  const s =
    Math.sin(rad);

  return new Float32Array([
    1, 0,  0, 0,
    0, c,  s, 0,
    0, -s, c, 0,
    0, 0,  0, 1
  ]);
}
```

---

# 26. Rotation Y

```javascript
rotationY(rad) {
  const c =
    Math.cos(rad);

  const s =
    Math.sin(rad);

  return new Float32Array([
     c, 0, -s, 0,
     0, 1,  0, 0,
     s, 0,  c, 0,
     0, 0,  0, 1
  ]);
}
```

---

# 27. Scaling Matrix 4×4

```javascript
scaling(
  sx,
  sy,
  sz
) {
  return new Float32Array([
    sx, 0,  0,  0,
    0,  sy, 0,  0,
    0,  0,  sz, 0,
    0,  0,  0,  1
  ]);
}
```

---

# 28. Matrix Multiplication 4×4

Gunakan helper:

```javascript
multiply(a, b) {
  const out =
    new Float32Array(16);

  for (
    let row = 0;
    row < 4;
    row++
  ) {
    for (
      let col = 0;
      col < 4;
      col++
    ) {
      let sum = 0;

      for (
        let i = 0;
        i < 4;
        i++
      ) {
        sum +=
          b[i * 4 + col] *
          a[row * 4 + i];
      }

      out[
        row * 4 + col
      ] = sum;
    }
  }

  return out;
}
```

Catatan penting:

> gunakan helper dan convention yang sama secara konsisten pada seluruh project.

---

# 29. Degree ke Radian

Di `main.js`:

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

# 30. Model Matrix Cube

State cube:

```javascript
const cube = {
  rotationX: 20,
  rotationY: 30
};
```

Buat Model Matrix:

```javascript
function createModelMatrix() {
  const rx =
    Mat4.rotationX(
      degToRad(
        cube.rotationX
      )
    );

  const ry =
    Mat4.rotationY(
      degToRad(
        cube.rotationY
      )
    );

  let model =
    Mat4.identity();

  model =
    Mat4.multiply(
      model,
      rx
    );

  model =
    Mat4.multiply(
      model,
      ry
    );

  return model;
}
```

Cube tetap berada di local origin.

---

# 31. Camera State

```javascript
const camera = {
  position: [
    0.0,
    1.5,
    4.0
  ],

  target: [
    0.0,
    0.0,
    0.0
  ],

  up: [
    0.0,
    1.0,
    0.0
  ]
};
```

---

# 32. Forward Vector

Secara konsep:

```text
Forward =
normalize(
  Target - Position
)
```

Implementasi:

```javascript
const forward =
  Vec3.normalize(
    Vec3.subtract(
      camera.target,
      camera.position
    )
  );
```

---

# 33. Right Vector

Sesuai convention praktikum:

```javascript
const right =
  Vec3.normalize(
    Vec3.cross(
      forward,
      camera.up
    )
  );
```

---

# 34. Corrected Up

```javascript
const correctedUp =
  Vec3.cross(
    right,
    forward
  );
```

Ketiganya membentuk basis camera:

```text
Right
Up
Forward
```

---

# 35. Membuat Look-At / View Matrix

Tambahkan pada `Mat4`:

```javascript
lookAt(
  position,
  target,
  up
) {
  const forward =
    Vec3.normalize(
      Vec3.subtract(
        target,
        position
      )
    );

  const right =
    Vec3.normalize(
      Vec3.cross(
        forward,
        up
      )
    );

  const correctedUp =
    Vec3.cross(
      right,
      forward
    );

  return new Float32Array([
     right[0],
     correctedUp[0],
    -forward[0],
     0,

     right[1],
     correctedUp[1],
    -forward[1],
     0,

     right[2],
     correctedUp[2],
    -forward[2],
     0,

    -Vec3.dot(
      right,
      position
    ),

    -Vec3.dot(
      correctedUp,
      position
    ),

     Vec3.dot(
       forward,
       position
     ),

     1
  ]);
}
```

---

# 36. Memahami View Matrix

View Matrix mengubah:

```text
World Space
→
View Space
```

Secara intuitif:

```text
Camera bergerak kanan
≈
World terlihat bergerak kiri
```

View Matrix dapat dipahami sebagai inverse dari transformasi camera.

---

# 37. Perspective Projection

Tambahkan pada `Mat4`:

```javascript
perspective(
  fovRad,
  aspect,
  near,
  far
) {
  const f =
    1.0 /
    Math.tan(
      fovRad / 2
    );

  const rangeInv =
    1.0 /
    (near - far);

  return new Float32Array([
    f / aspect,
    0,
    0,
    0,

    0,
    f,
    0,
    0,

    0,
    0,
    (near + far) *
      rangeInv,
    -1,

    0,
    0,
    2 * near * far *
      rangeInv,
    0
  ]);
}
```

---

# 38. Parameter Perspective

State projection:

```javascript
const projectionState = {
  mode: "perspective",
  fov: 60,
  near: 0.1,
  far: 100.0
};
```

Aspect:

```javascript
const aspect =
  canvas.width /
  canvas.height;
```

---

# 39. Membuat Perspective Matrix

```javascript
const projection =
  Mat4.perspective(
    degToRad(
      projectionState.fov
    ),
    aspect,
    projectionState.near,
    projectionState.far
  );
```

---

# 40. Field of View

FOV menentukan lebar area pandang.

Eksperimen:

```text
35°
60°
90°
```

Karakteristik:

```text
FOV kecil
→ tampak lebih zoom

FOV besar
→ tampak lebih wide
```

Untuk praktikum, gunakan batas:

```text
30° – 100°
```

---

# 41. Orthographic Projection

Tambahkan:

```javascript
orthographic(
  left,
  right,
  bottom,
  top,
  near,
  far
) {
  return new Float32Array([
    2 / (right - left),
    0,
    0,
    0,

    0,
    2 / (top - bottom),
    0,
    0,

    0,
    0,
    -2 / (far - near),
    0,

    -(right + left) /
      (right - left),

    -(top + bottom) /
      (top - bottom),

    -(far + near) /
      (far - near),

    1
  ]);
}
```

---

# 42. Menjaga Aspect Ratio pada Orthographic

Gunakan:

```javascript
function createOrthographicMatrix() {
  const aspect =
    canvas.width /
    canvas.height;

  const size = 2.0;

  return Mat4.orthographic(
    -size * aspect,
     size * aspect,
    -size,
     size,
     0.1,
     100.0
  );
}
```

Dengan cara ini proporsi horizontal dan vertikal tetap terjaga.

---

# 43. Perspective vs Orthographic

Perbedaan utama:

| Perspective | Orthographic |
|---|---|
| object jauh terlihat kecil | ukuran relatif stabil terhadap depth |
| menggunakan FOV | menggunakan box volume |
| terasa natural | terasa teknis |
| umum pada game 3D | umum pada CAD/map |

---

# 44. Mengaktifkan Depth Test

```javascript
gl.enable(
  gl.DEPTH_TEST
);
```

Pada setiap frame:

```javascript
gl.clear(
  gl.COLOR_BUFFER_BIT |
  gl.DEPTH_BUFFER_BIT
);
```

Tanpa membersihkan depth buffer, depth lama dari frame sebelumnya dapat mengganggu hasil frame baru.

---

# 45. Mengapa Depth Test Diperlukan?

Cube memiliki face depan dan belakang.

Tanpa depth test:

```text
draw order
```

dapat menentukan visibility secara salah.

Dengan depth test:

```text
depth
```

menentukan fragment mana yang terlihat.

---

# 46. Draw Cube

```javascript
function drawCube(
  model,
  view,
  projection
) {
  gl.uniformMatrix4fv(
    modelLocation,
    false,
    model
  );

  gl.uniformMatrix4fv(
    viewLocation,
    false,
    view
  );

  gl.uniformMatrix4fv(
    projectionLocation,
    false,
    projection
  );

  gl.drawArrays(
    gl.TRIANGLES,
    0,
    36
  );
}
```

---

# 47. Automatic Rotation

```javascript
function updateCube(
  dt
) {
  cube.rotationX +=
    25 * dt;

  cube.rotationY +=
    40 * dt;
}
```

Satuan:

```text
degree per second
```

---

# 48. State-Based Camera Control

Gunakan:

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

---

# 49. Camera Position Control

```javascript
const cameraSpeed =
  2.0;

function updateCamera(
  dt
) {
  if (
    keys["arrowleft"]
  ) {
    camera.position[0] -=
      cameraSpeed * dt;
  }

  if (
    keys["arrowright"]
  ) {
    camera.position[0] +=
      cameraSpeed * dt;
  }

  if (
    keys["arrowup"]
  ) {
    camera.position[1] +=
      cameraSpeed * dt;
  }

  if (
    keys["arrowdown"]
  ) {
    camera.position[1] -=
      cameraSpeed * dt;
  }

  if (
    keys["w"]
  ) {
    camera.position[2] -=
      cameraSpeed * dt;
  }

  if (
    keys["s"]
  ) {
    camera.position[2] +=
      cameraSpeed * dt;
  }
}
```

Camera tetap melihat target:

```text
(0,0,0)
```

sehingga perubahan position menghasilkan view direction baru.

---

# 50. Event-Based Projection Toggle

Gunakan:

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key.toLowerCase()
        === "p"
      &&
      !event.repeat
    ) {
      projectionState.mode =
        projectionState.mode
          === "perspective"
        ?
          "orthographic"
        :
          "perspective";
    }
  }
);
```

Ini cocok event-based karena toggle cukup dilakukan sekali per tekanan tombol.

---

# 51. FOV Control

Gunakan state-based:

```javascript
const fovSpeed =
  35.0;

function updateFOV(
  dt
) {
  if (
    keys["["]
  ) {
    projectionState.fov -=
      fovSpeed * dt;
  }

  if (
    keys["]"]
  ) {
    projectionState.fov +=
      fovSpeed * dt;
  }

  projectionState.fov =
    Math.max(
      30,
      Math.min(
        100,
        projectionState.fov
      )
    );
}
```

FOV hanya berpengaruh ketika projection mode adalah perspective.

---

# 52. Near/Far Preset

Gunakan preset agar mahasiswa dapat mengamati clipping dan depth precision tanpa membuat nilai ekstrem secara bebas.

```javascript
const clipPresets = [
  {
    near: 0.1,
    far: 100
  },

  {
    near: 1.0,
    far: 20
  },

  {
    near: 2.5,
    far: 8
  }
];

let clipPresetIndex = 0;
```

Toggle:

```javascript
function nextClipPreset() {
  clipPresetIndex =
    (
      clipPresetIndex + 1
    )
    %
    clipPresets.length;

  const preset =
    clipPresets[
      clipPresetIndex
    ];

  projectionState.near =
    preset.near;

  projectionState.far =
    preset.far;
}
```

---

# 53. Event Near/Far Preset

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key.toLowerCase()
        === "n"
      &&
      !event.repeat
    ) {
      nextClipPreset();
    }
  }
);
```

---

# 54. Depth Test Toggle

State:

```javascript
let depthEnabled =
  true;
```

Toggle:

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key.toLowerCase()
        === "d"
      &&
      !event.repeat
    ) {
      depthEnabled =
        !depthEnabled;
    }
  }
);
```

Dalam render:

```javascript
if (
  depthEnabled
) {
  gl.enable(
    gl.DEPTH_TEST
  );
} else {
  gl.disable(
    gl.DEPTH_TEST
  );
}
```

---

# 55. Reset Camera

```javascript
function resetScene() {
  camera.position[0] =
    0.0;

  camera.position[1] =
    1.5;

  camera.position[2] =
    4.0;

  projectionState.mode =
    "perspective";

  projectionState.fov =
    60;

  projectionState.near =
    0.1;

  projectionState.far =
    100.0;

  depthEnabled =
    true;
}
```

Gunakan event-based:

```text
R → Reset
```

---

# 56. Membuat View Matrix per Frame

```javascript
const view =
  Mat4.lookAt(
    camera.position,
    camera.target,
    camera.up
  );
```

Karena camera position dapat berubah, View Matrix juga berubah.

---

# 57. Membuat Projection Matrix per Frame

```javascript
function createProjectionMatrix() {
  const aspect =
    canvas.width /
    canvas.height;

  if (
    projectionState.mode
      === "perspective"
  ) {
    return Mat4.perspective(
      degToRad(
        projectionState.fov
      ),
      aspect,
      projectionState.near,
      projectionState.far
    );
  }

  const size =
    2.0;

  return Mat4.orthographic(
    -size * aspect,
     size * aspect,
    -size,
     size,
     projectionState.near,
     projectionState.far
  );
}
```

---

# 58. HUD Camera

```javascript
const projectionInfo =
  document.getElementById(
    "projectionInfo"
  );

const cameraInfo =
  document.getElementById(
    "cameraInfo"
  );

const fovInfo =
  document.getElementById(
    "fovInfo"
  );

const clipInfo =
  document.getElementById(
    "clipInfo"
  );

const depthInfo =
  document.getElementById(
    "depthInfo"
  );
```

Update:

```javascript
function updateHUD() {
  projectionInfo.textContent =
    projectionState.mode;

  cameraInfo.textContent =
    `(${camera.position[0].toFixed(2)}, ` +
    `${camera.position[1].toFixed(2)}, ` +
    `${camera.position[2].toFixed(2)})`;

  fovInfo.textContent =
    `${projectionState.fov.toFixed(1)}°`;

  clipInfo.textContent =
    `${projectionState.near} / ` +
    `${projectionState.far}`;

  depthInfo.textContent =
    depthEnabled
      ? "ON"
      : "OFF";
}
```

---

# 59. Rendering Loop

```javascript
let lastTime = 0;

function render(
  time
) {
  const seconds =
    time * 0.001;

  let dt =
    (
      time -
      lastTime
    ) * 0.001;

  lastTime =
    time;

  dt =
    Math.min(
      dt,
      0.05
    );

  updateCube(
    dt
  );

  updateCamera(
    dt
  );

  updateFOV(
    dt
  );

  if (
    depthEnabled
  ) {
    gl.enable(
      gl.DEPTH_TEST
    );
  } else {
    gl.disable(
      gl.DEPTH_TEST
    );
  }

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
    gl.COLOR_BUFFER_BIT |
    gl.DEPTH_BUFFER_BIT
  );

  gl.useProgram(
    program
  );

  const model =
    createModelMatrix();

  const view =
    Mat4.lookAt(
      camera.position,
      camera.target,
      camera.up
    );

  const projection =
    createProjectionMatrix();

  drawCube(
    model,
    view,
    projection
  );

  updateHUD();

  requestAnimationFrame(
    render
  );
}

requestAnimationFrame(
  render
);
```

---

# 60. Eksperimen Wajib 1 — Camera Position

Gunakan camera:

```text
A:
(0, 0, 4)

B:
(2, 0, 4)

C:
(0, 2, 4)
```

Target tetap:

```text
(0,0,0)
```

Jawab:

1. apakah cube berubah posisi di world?
2. apakah yang berubah adalah View Matrix?
3. mengapa sudut pandang berubah?

---

# 61. Eksperimen Wajib 2 — Target

Gunakan camera position tetap:

```text
(0, 1.5, 4)
```

Bandingkan target:

```text
(0,0,0)
```

dengan:

```text
(1,0,0)
```

dan:

```text
(-1,0,0)
```

Amati perubahan arah pandang.

---

# 62. Eksperimen Wajib 3 — Up Vector

Gunakan:

```text
Up = (0,1,0)
```

kemudian secara terkontrol bandingkan dengan arah up lain.

Tujuan:

> melihat bahwa position dan target saja belum sepenuhnya menentukan orientasi camera.

Catat apa yang terjadi pada orientasi tampilan.

---

# 63. Eksperimen Wajib 4 — Perspective vs Orthographic

Gunakan tombol:

```text
P
```

Bandingkan:

```text
Perspective
vs
Orthographic
```

Jawab:

1. apakah kesan depth berubah?
2. projection mana yang tampak lebih natural?
3. projection mana yang menjaga ukuran lebih konsisten terhadap depth?

---

# 64. Eksperimen Wajib 5 — FOV

Bandingkan:

```text
35°
60°
90°
```

Catat:

- lebar area pandang;
- ukuran visual cube;
- karakter perspective;
- distortion di area tepi.

---

# 65. Eksperimen Wajib 6 — Aspect Ratio

Ubah ukuran internal Canvas secara terkontrol.

Contoh:

```text
800 × 800
```

dan:

```text
960 × 540
```

Pastikan:

```javascript
aspect =
  canvas.width /
  canvas.height;
```

selalu dihitung ulang.

Tujuan:

> memahami bahwa projection matrix harus menggunakan aspect ratio yang sesuai viewport.

---

# 66. Eksperimen Wajib 7 — Near Plane

Gunakan preset near/far.

Amati kondisi ketika near plane bergerak menjauh dari camera.

Pertanyaan:

- bagian geometry apa yang mulai di-clip?
- mengapa near plane tidak boleh sembarang mendekati nol?

---

# 67. Eksperimen Wajib 8 — Far Plane

Gunakan camera atau object position yang memungkinkan pengamatan clipping jarak jauh.

Catat kapan object tidak lagi terlihat karena melewati far plane.

---

# 68. Eksperimen Wajib 9 — Depth Test

Gunakan:

```text
D
```

untuk:

```text
Depth Test ON
vs
Depth Test OFF
```

Amati face cube yang berada di belakang.

Pertanyaan:

> mengapa draw order saja tidak cukup untuk menentukan visibility object 3D?

---

# 69. Z-Fighting — Eksperimen Konseptual

Z-fighting terjadi jika dua surface memiliki depth hampir sama.

Gejala:

```text
flickering
surface saling menimpa
pola tidak stabil
```

Faktor:

- surface hampir coplanar;
- near terlalu kecil;
- far sangat besar;
- depth precision terbatas.

Untuk praktikum ini tidak perlu membuat nilai near/far ekstrem pada aplikasi final.

---

# 70. State-Based vs Event-Based Input

Gunakan:

```text
State-Based
→ Camera movement
→ FOV continuous adjustment

Event-Based
→ Projection toggle
→ Depth Test toggle
→ Near/Far preset
→ Reset
```

Alasannya:

```text
Continuous Action
→ diperiksa setiap frame

Discrete Action
→ dijalankan sekali saat event
```

---

# 71. Tugas Utama Praktikum

Bangun:

# Rotating 3D Cube Camera Playground

Requirement minimum:

- [ ] WebGL2 Context;
- [ ] cube 3D dengan 36 vertex;
- [ ] position `vec3`;
- [ ] vertex color;
- [ ] Model Matrix 4×4;
- [ ] View Matrix;
- [ ] camera position;
- [ ] target;
- [ ] up vector;
- [ ] Perspective Projection;
- [ ] Orthographic Projection;
- [ ] projection toggle;
- [ ] aspect ratio yang benar;
- [ ] FOV control;
- [ ] near/far preset;
- [ ] Depth Test ON/OFF;
- [ ] clear depth buffer setiap frame;
- [ ] automatic cube rotation;
- [ ] state-based camera movement;
- [ ] event-based toggle;
- [ ] HUD camera/projection;
- [ ] source code modular;
- [ ] tidak ada error pada Console saat penggunaan normal;
- [ ] minimal dua challenge.

---

# 72. Challenge A — Orbit Camera

Buat camera bergerak melingkar terhadap target.

Konsep:

```text
cameraX =
cos(angle) × radius

cameraZ =
sin(angle) × radius
```

Target tetap:

```text
(0,0,0)
```

---

# 73. Challenge B — Camera Height Control

Tambahkan:

```text
PageUp
PageDown
```

untuk mengubah ketinggian camera.

---

# 74. Challenge C — Target Control

Tambahkan kontrol untuk memindahkan target.

Mahasiswa dapat mengamati bahwa:

```text
Camera Position tetap
+
Target berubah
=
View Direction berubah
```

---

# 75. Challenge D — Projection Comparison Split Mode

Tampilkan dua Canvas:

```text
Left:
Perspective

Right:
Orthographic
```

Gunakan Model Matrix dan camera state yang sama.

Tujuan:

> membandingkan dua projection secara langsung.

---

# 76. Challenge E — Multiple Cube Depth Test

Tambahkan minimal tiga cube pada depth berbeda.

Contoh:

```text
Cube A → z = 0
Cube B → z = -1.5
Cube C → z = 1.5
```

Amati visibility saat Depth Test ON/OFF.

---

# 77. Challenge F — FOV Preset

Tambahkan:

```text
1 → 35°
2 → 60°
3 → 90°
```

Tampilkan FOV aktif pada HUD.

---

# 78. Milestone Implementasi

## Milestone 1

```text
WebGL2
+
Cube Geometry
+
Vertex Color
```

## Milestone 2

```text
Matrix 4×4
+
Model Rotation
```

## Milestone 3

```text
Camera Position
+
Target
+
Up
+
LookAt
```

## Milestone 4

```text
Perspective Projection
```

## Milestone 5

```text
Depth Test
```

## Milestone 6

```text
Automatic Rotation
```

## Milestone 7

```text
State-Based Camera Control
```

## Milestone 8

```text
Orthographic Projection
+
Projection Toggle
```

## Milestone 9

```text
FOV
+
Near/Far Preset
+
Depth Toggle
```

## Milestone 10

```text
HUD
+
2 Challenges
+
Testing
```

---

# 79. Debugging — Cube Tidak Muncul

Periksa:

1. WebGL2 Context berhasil?
2. shader compile?
3. program link?
4. position buffer benar?
5. color buffer benar?
6. `a_position` menggunakan size `3`?
7. model matrix benar?
8. view matrix benar?
9. projection matrix benar?
10. camera berada pada posisi masuk akal?
11. near/far valid?
12. cube berada di dalam frustum?
13. draw count = `36`?
14. matrix dikirim sebelum draw call?
15. viewport benar?

---

# 80. Debugging Camera

Jika tampilan terbalik atau aneh:

- periksa urutan cross product;
- periksa `forward`;
- periksa `up`;
- periksa target tidak sama dengan camera position;
- gunakan convention yang konsisten.

---

# 81. Debugging Perspective

Jika cube terlihat terlalu gepeng atau melebar:

- periksa aspect ratio;
- periksa FOV dalam radian;
- periksa matrix perspective;
- periksa canvas width/height.

---

# 82. Debugging Near/Far

Pastikan:

```text
near > 0
```

dan:

```text
far > near
```

Nilai yang tidak valid dapat menghasilkan projection yang salah.

---

# 83. Debugging Depth

Jika face belakang terlihat di depan:

Periksa:

```javascript
gl.enable(
  gl.DEPTH_TEST
);
```

dan:

```javascript
gl.clear(
  gl.COLOR_BUFFER_BIT |
  gl.DEPTH_BUFFER_BIT
);
```

---

# 84. Test Case

| No. | Pengujian | Hasil yang Diharapkan |
|---:|---|---|
| 1 | Load aplikasi | Cube tampil |
| 2 | Cube rotation | Berputar kontinu |
| 3 | Arrow | Camera X/Y berubah |
| 4 | W/S | Camera Z berubah |
| 5 | P | Projection berganti |
| 6 | Perspective | Depth terasa natural |
| 7 | Orthographic | Ukuran lebih stabil |
| 8 | [ / ] | FOV berubah |
| 9 | N | Near/Far preset berganti |
| 10 | D | Depth Test ON/OFF |
| 11 | R | State kembali awal |
| 12 | HUD | Nilai sesuai state |
| 13 | Resize nilai Canvas | Aspect tetap benar |
| 14 | Console | Tidak ada error normal |

---

# 85. Pertanyaan Pemahaman

Jawab dengan kalimat sendiri.

1. Mengapa camera dibutuhkan pada scene 3D?
2. Apa fungsi camera position?
3. Apa fungsi target?
4. Apa fungsi up vector?
5. Bagaimana menghitung view direction secara konsep?
6. Mengapa Right Vector menggunakan cross product?
7. Apa yang dimaksud corrected up vector?
8. Apa fungsi View Matrix?
9. Mengapa camera secara konseptual dianggap berada di origin pada View Space?
10. Mengapa View Matrix berkaitan dengan inverse camera transform?
11. Apa fungsi Projection Matrix?
12. Apa perbedaan Perspective dan Orthographic Projection?
13. Apa fungsi FOV?
14. Apa pengaruh FOV kecil?
15. Apa pengaruh FOV besar?
16. Apa fungsi aspect ratio?
17. Mengapa aspect ratio yang salah dapat mendistorsi object?
18. Apa fungsi near plane?
19. Apa fungsi far plane?
20. Mengapa near plane tidak sebaiknya terlalu dekat ke nol?
21. Apa hubungan near/far dengan depth precision?
22. Apa fungsi Depth Buffer?
23. Apa fungsi Depth Test?
24. Apa yang terjadi jika Depth Test dimatikan?
25. Apa yang dimaksud Z-Fighting?
26. Mengapa cube terdiri dari triangle?
27. Mengapa position 3D menggunakan `vec3`?
28. Mengapa transformasi 3D menggunakan matrix 4×4?
29. Apa arti persamaan `P × V × M × localPosition`?
30. Mengapa state-based input cocok untuk camera movement?

---

# 86. Pertanyaan Eksperimen

## A — Camera Position

Bandingkan:

```text
(0,0,4)
(2,0,4)
(0,2,4)
```

Apa yang berubah?

## B — Target

Bandingkan target:

```text
(0,0,0)
(1,0,0)
(-1,0,0)
```

Apa efeknya pada View Matrix?

## C — FOV

Bandingkan:

```text
35°
60°
90°
```

Apa perbedaan visual?

## D — Projection

Bandingkan:

```text
Perspective
Orthographic
```

Projection mana yang lebih natural untuk game 3D?

## E — Depth Test

Bandingkan:

```text
ON
OFF
```

Mengapa visibility face berbeda?

---

# 87. README

`README.md` minimal berisi:

```text
Nama
NRP
Deskripsi aplikasi
Kontrol camera
Projection yang tersedia
FOV default
Near/Far preset
Depth Test toggle
Challenge yang dikerjakan
Cara menjalankan
Catatan debugging
```

---

# 88. Output Pengumpulan

```text
praktikum-camera-04/
├── index.html
├── style.css
├── main.js
├── math3d.js
├── README.md
└── screenshot.png
```

Jika diminta:

```text
demo.mp4
```

---

# 89. Refleksi Praktikum

Tuliskan 4–6 kalimat mengenai:

- konsep camera yang paling mudah;
- konsep View Matrix yang paling sulit;
- perbedaan perspective dan orthographic;
- efek FOV;
- fungsi depth test;
- masalah debugging yang ditemui.

---

# 90. Hubungan dengan Pertemuan Berikutnya

Pipeline yang telah dibangun:

```text
Local Vertex
     ↓
Model Matrix
     ↓
World
     ↓
View Matrix
     ↓
View
     ↓
Projection Matrix
     ↓
Clip
     ↓
NDC
     ↓
Screen
```

Pertemuan berikutnya akan menambahkan pembahasan:

```text
Shader
Lighting
Texture
```

Sehingga fokus mulai bergeser dari:

```text
WHERE geometry appears
```

menuju:

```text
HOW surface appears
```

---

# 91. Ringkasan Praktikum

Pada praktikum ini mahasiswa mengimplementasikan:

- cube 3D;
- `vec3` position;
- matrix 4×4;
- Model Matrix;
- camera position;
- target;
- up vector;
- Look-At / View Matrix;
- Perspective Projection;
- Orthographic Projection;
- FOV;
- Aspect Ratio;
- Near Plane;
- Far Plane;
- Depth Buffer;
- Depth Test;
- automatic rotation;
- state-based camera control;
- event-based projection/depth toggle;
- HUD camera.

Benang merah utama:

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

Aplikasi akhir:

# Rotating 3D Cube Camera Playground

menjadi fondasi untuk memahami **Shader, Lighting & Texture pada WebGL** pada pertemuan berikutnya.

