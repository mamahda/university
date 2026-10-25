# Modul Praktikum Grafika Komputer — Pertemuan 5

## Lighting, Shading & Texture pada WebGL

**Mata Kuliah:** EF234504 — Grafika Komputer  
**Pertemuan:** 5  
**Topik:** Lighting, Shading & Texture pada WebGL  
**Dosen:** Dr. Darlis Herumurti  
**Departemen:** Teknik Informatika  

---

# 1. Deskripsi Praktikum

Pada Pertemuan 4, mahasiswa telah membangun pipeline 3D:

```text
Geometry
   ↓ Model Matrix
World Space
   ↓ View Matrix
View Space
   ↓ Projection Matrix
Clip Space
   ↓
Screen
```

Pada Pertemuan 5, fokus berpindah dari:

```text
DI MANA object berada?
```

menjadi:

```text
BAGAIMANA permukaan object terlihat?
```

Untuk itu kita menambahkan tiga kelompok data dan proses utama:

```text
Normal
+
Lighting
+
Texture
```

Aplikasi yang akan dibangun adalah:

# Textured and Lit Cube Playground

Aplikasi akhir menggunakan cube dari konsep Pertemuan 4 dan menambahkan:

```text
Position
+
Normal
+
UV
+
Texture Sampling
+
Ambient Lighting
+
Diffuse Lighting
+
Specular Lighting
+
Normal Matrix
+
Flat / Smooth Shading Comparison
+
Filtering
+
Wrapping
+
Interactive Light Control
```

---

# 2. Capaian Praktikum

Setelah menyelesaikan praktikum, mahasiswa diharapkan mampu:

1. menjelaskan fungsi normal pada shading;
2. membedakan face normal dan vertex normal;
3. menjelaskan flat shading dan smooth shading;
4. melakukan normalisasi vector normal;
5. menjelaskan mengapa normal perlu ditransformasikan;
6. menggunakan Normal Matrix;
7. menjelaskan ambient lighting;
8. menghitung diffuse lighting menggunakan dot product;
9. menjelaskan view direction;
10. menghitung specular lighting sederhana;
11. menjelaskan fungsi shininess;
12. menggabungkan ambient, diffuse, dan specular;
13. menjelaskan UV coordinate;
14. mengirim UV sebagai vertex attribute;
15. membuat dan mengikat texture WebGL;
16. melakukan texture sampling pada fragment shader;
17. membandingkan `NEAREST` dan `LINEAR`;
18. membandingkan `REPEAT`, `CLAMP_TO_EDGE`, dan `MIRRORED_REPEAT`;
19. menggabungkan texture dengan lighting;
20. membuat light control interaktif.

---

# 3. Hasil Akhir Praktikum

Aplikasi akhir minimal memiliki:

```text
Rotating 3D Cube
+
Position Attribute
+
Normal Attribute
+
UV Attribute
+
Texture
+
Ambient
+
Diffuse
+
Specular
+
Perspective Camera
+
Light Position Control
+
Camera-Aware Specular
+
Flat/Smooth Normal Toggle
+
Filtering Toggle
+
Wrapping Toggle
+
HUD
```

---

# 4. Benang Merah Rendering Pertemuan 5

```text
Geometry
   ↓
Position + Normal + UV
   ↓
Vertex Shader
   ├── Transform Position
   ├── Transform Normal
   └── Pass UV
   ↓
Interpolation
   ↓
Fragment Shader
   ├── Texture Sampling
   ├── Ambient
   ├── Diffuse
   └── Specular
   ↓
Final Surface Color
```

---

# 5. Data yang Dibutuhkan per Vertex

Pada praktikum ini setiap vertex mempunyai:

```text
Position
Normal
UV
```

Fungsinya:

| Data | Fungsi |
|---|---|
| Position | menentukan posisi geometry |
| Normal | menentukan arah permukaan |
| UV | menentukan lokasi sampling pada texture |

Selain vertex attribute, shader menerima uniform:

```text
Model Matrix
View Matrix
Projection Matrix
Normal Matrix
Light Position
Light Color
Camera Position
Ambient Strength
Shininess
Texture Sampler
UV Scale
```

---

# 6. Normal: Konsep Dasar

Normal adalah vector yang tegak lurus permukaan.

```text
        Normal
          ↑
          |
    ───────────── Surface
```

Lighting membutuhkan informasi:

> ke arah mana permukaan menghadap?

Tanpa normal, shader tidak dapat menghitung hubungan arah surface dengan arah cahaya secara benar.

---

# 7. Face Normal dan Vertex Normal

## Face Normal

Satu face menggunakan arah normal yang sama.

```text
Triangle Face
     ↑
     N
```

Karakter visual:

```text
perubahan lighting antar-face tegas
```

Ini menghasilkan **flat shading**.

## Vertex Normal

Setiap vertex memiliki normal.

Normal tersebut kemudian diinterpolasi pada rasterization:

```text
Normal Vertex A
Normal Vertex B
Normal Vertex C
       ↓
Interpolation
       ↓
Normal per fragment
```

Ini memungkinkan **smooth shading**.

---

# 8. Flat vs Smooth Shading

| Flat Shading | Smooth Shading |
|---|---|
| normal mengikuti face | normal berbeda per vertex |
| sisi polygon jelas | lighting lebih halus |
| cocok low-poly | cocok permukaan halus |
| transisi tajam | transisi interpolatif |

Hal penting:

> Geometry dapat tetap sama, tetapi normal yang berbeda menghasilkan tampilan shading yang berbeda.

---

# 9. Mengapa Normal Harus Dinormalisasi?

Lighting menggunakan arah vector.

Idealnya:

```text
|N| = 1
```

Pada shader:

```glsl
vec3 N =
  normalize(v_normal);
```

Jika panjang vector tidak satu, hasil:

```text
dot(N, L)
```

dapat tidak merepresentasikan sudut secara benar.

---

# 10. Normal Transformation

Position ditransformasikan menggunakan Model Matrix:

```text
Local Position
      ↓ Model Matrix
World Position
```

Normal juga harus mengikuti transformasi object.

Namun normal tidak selalu boleh diperlakukan sama seperti position, terutama pada:

```text
non-uniform scaling
```

Karena itu digunakan:

# Normal Matrix

Secara konsep:

```text
Normal Matrix
=
inverse transpose
dari bagian linear Model Matrix
```

---

# 11. Lighting Model yang Digunakan

Model lighting sederhana:

```text
Ambient
+
Diffuse
+
Specular
```

Tujuan model ini adalah memahami hubungan:

```text
Surface Normal
Light Direction
View Direction
Surface Color
```

Model ini bukan PBR.

---

# 12. Ambient Lighting

Ambient merupakan cahaya dasar:

```text
Ambient
=
AmbientStrength
× BaseColor
```

Karakter:

- tidak bergantung normal;
- tidak bergantung arah cahaya;
- membuat sisi gelap tetap terlihat.

Ambient pada praktikum ini hanyalah pendekatan sederhana, bukan global illumination.

---

# 13. Diffuse Lighting

Diffuse bergantung pada hubungan:

```text
Normal N
dan
Light Direction L
```

Arah cahaya dari surface ke point light:

```text
L =
normalize(
  LightPosition -
  SurfacePosition
)
```

Diffuse factor:

```text
diff =
max(
  dot(N, L),
  0
)
```

---

# 14. Memahami Dot Product

Untuk unit vector:

```text
dot(N,L) ≈ 1
→ N dan L hampir searah

dot(N,L) ≈ 0
→ hampir tegak lurus

dot(N,L) < 0
→ cahaya berada di belakang surface
```

Karena intensitas tidak boleh negatif:

```glsl
max(
  dot(N, L),
  0.0
)
```

digunakan.

---

# 15. Specular Lighting

Specular menghasilkan highlight.

Diperlukan:

```text
Normal N
Light Direction L
View Direction V
Reflection Direction R
Shininess
```

View direction:

```text
V =
normalize(
  CameraPosition -
  SurfacePosition
)
```

Reflection direction dapat menggunakan GLSL:

```glsl
reflect()
```

Specular sederhana:

```text
spec =
pow(
  max(dot(R,V),0),
  shininess
)
```

---

# 16. Shininess

Nilai shininess kecil:

```text
highlight lebih lebar
```

Nilai besar:

```text
highlight lebih kecil dan tajam
```

Contoh eksperimen:

```text
8
32
128
```

`shininess` pada model ini bukan roughness fisik.

---

# 17. Texture dan UV

Texture adalah image yang dipetakan ke surface.

UV menggunakan coordinate 2D:

```text
U → horizontal
V → vertical
```

Rentang umum:

```text
0 sampai 1
```

Contoh satu quad:

```text
(0,1) ───────── (1,1)
  │               │
  │    Texture    │
  │               │
(0,0) ───────── (1,0)
```

---

# 18. Texture Sampling

Fragment Shader menggunakan sampler:

```glsl
uniform sampler2D u_texture;
```

Sampling:

```glsl
vec4 texColor =
  texture(
    u_texture,
    v_texCoord
  );
```

`texColor` menjadi base color surface.

---

# 19. Filtering

Jika satu texel tidak tepat sesuai satu fragment, GPU membutuhkan aturan sampling.

Dua mode utama:

```text
NEAREST
LINEAR
```

## NEAREST

- memilih texel terdekat;
- terlihat tajam;
- dapat terlihat pixelated.

## LINEAR

- menginterpolasi texel;
- hasil lebih halus.

---

# 20. Wrapping

Jika UV berada di luar:

```text
0 ... 1
```

digunakan wrapping mode:

```text
REPEAT
CLAMP_TO_EDGE
MIRRORED_REPEAT
```

Untuk melihat efek wrapping, modul menyediakan `u_uvScale`.

Contoh:

```text
UV Scale = 3
```

membuat UV menjadi:

```text
0 ... 3
```

sehingga wrapping dapat diamati.

---

# 21. Persiapan Project

Gunakan struktur:

```text
praktikum-lighting-05/
├── index.html
├── style.css
├── main.js
├── math3d.js
└── README.md
```

Baseline menggunakan texture checkerboard yang dibuat secara programatik.

Keuntungan:

- tidak membutuhkan download asset;
- tidak terkena masalah CORS image;
- langsung dapat digunakan untuk eksperimen filtering dan wrapping.

Setelah baseline berhasil, image texture dapat ditambahkan sebagai challenge.

---

# 22. `index.html`

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
    Textured and Lit Cube Playground
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
        Textured and Lit Cube Playground
      </h1>

      <p>
        WebGL — Lighting, Shading & Texture
      </p>
    </header>

    <canvas
      id="glCanvas"
      width="960"
      height="600">
    </canvas>

    <section id="hud">

      <div>
        Shading:
        <span id="shadingInfo"></span>
      </div>

      <div>
        Filtering:
        <span id="filterInfo"></span>
      </div>

      <div>
        Wrapping:
        <span id="wrapInfo"></span>
      </div>

      <div>
        UV Scale:
        <span id="uvInfo"></span>
      </div>

      <div>
        Shininess:
        <span id="shininessInfo"></span>
      </div>

      <div>
        Light:
        <span id="lightInfo"></span>
      </div>

    </section>

    <section class="controls">
      <strong>Kontrol:</strong>

      <span>Arrow = Light X/Y</span>
      <span>W/S = Light Z</span>
      <span>F = Flat/Smooth</span>
      <span>T = Filtering</span>
      <span>G = Wrapping</span>
      <span>[ / ] = UV Scale</span>
      <span>- / + = Shininess</span>
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

# 23. `style.css`

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

# 24. WebGL2 Context

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

Aktifkan depth test:

```javascript
gl.enable(
  gl.DEPTH_TEST
);
```

---

# 25. Cube Geometry

Gunakan cube dengan 36 vertex.

```javascript
const positions =
  new Float32Array([
    // Front
    -0.5,-0.5, 0.5,
     0.5,-0.5, 0.5,
     0.5, 0.5, 0.5,

    -0.5,-0.5, 0.5,
     0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,

    // Back
     0.5,-0.5,-0.5,
    -0.5,-0.5,-0.5,
    -0.5, 0.5,-0.5,

     0.5,-0.5,-0.5,
    -0.5, 0.5,-0.5,
     0.5, 0.5,-0.5,

    // Left
    -0.5,-0.5,-0.5,
    -0.5,-0.5, 0.5,
    -0.5, 0.5, 0.5,

    -0.5,-0.5,-0.5,
    -0.5, 0.5, 0.5,
    -0.5, 0.5,-0.5,

    // Right
     0.5,-0.5, 0.5,
     0.5,-0.5,-0.5,
     0.5, 0.5,-0.5,

     0.5,-0.5, 0.5,
     0.5, 0.5,-0.5,
     0.5, 0.5, 0.5,

    // Top
    -0.5, 0.5, 0.5,
     0.5, 0.5, 0.5,
     0.5, 0.5,-0.5,

    -0.5, 0.5, 0.5,
     0.5, 0.5,-0.5,
    -0.5, 0.5,-0.5,

    // Bottom
    -0.5,-0.5,-0.5,
     0.5,-0.5,-0.5,
     0.5,-0.5, 0.5,

    -0.5,-0.5,-0.5,
     0.5,-0.5, 0.5,
    -0.5,-0.5, 0.5
  ]);
```

---

# 26. Face Normal Data — Flat Shading

Setiap face menggunakan satu arah normal.

```javascript
const flatNormals =
  new Float32Array([
    // Front
     0, 0, 1,
     0, 0, 1,
     0, 0, 1,
     0, 0, 1,
     0, 0, 1,
     0, 0, 1,

    // Back
     0, 0,-1,
     0, 0,-1,
     0, 0,-1,
     0, 0,-1,
     0, 0,-1,
     0, 0,-1,

    // Left
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,

    // Right
     1, 0, 0,
     1, 0, 0,
     1, 0, 0,
     1, 0, 0,
     1, 0, 0,
     1, 0, 0,

    // Top
     0, 1, 0,
     0, 1, 0,
     0, 1, 0,
     0, 1, 0,
     0, 1, 0,
     0, 1, 0,

    // Bottom
     0,-1, 0,
     0,-1, 0,
     0,-1, 0,
     0,-1, 0,
     0,-1, 0,
     0,-1, 0
  ]);
```

---

# 27. Smooth Normal Data

Untuk eksperimen pada geometry cube yang sama, kita dapat memakai arah dari center menuju corner.

```javascript
function createSmoothNormals(
  positions
) {
  const normals =
    new Float32Array(
      positions.length
    );

  for (
    let i = 0;
    i < positions.length;
    i += 3
  ) {
    const x =
      positions[i];

    const y =
      positions[i + 1];

    const z =
      positions[i + 2];

    const length =
      Math.hypot(
        x,
        y,
        z
      );

    normals[i] =
      x / length;

    normals[i + 1] =
      y / length;

    normals[i + 2] =
      z / length;
  }

  return normals;
}

const smoothNormals =
  createSmoothNormals(
    positions
  );
```

Catatan:

> Geometry cube tetap sama. Yang kita ubah hanyalah normal. Hasilnya cube dapat terlihat seolah memiliki shading yang lebih membulat.

Ini adalah demonstrasi konsep normal, bukan cara artistik ideal untuk semua cube.

---

# 28. UV Data Cube

Setiap face menggunakan UV:

```text
(0,0)
(1,0)
(1,1)
(0,1)
```

Buat helper:

```javascript
function createCubeUVs() {
  const faceUV = [
    0, 0,
    1, 0,
    1, 1,

    0, 0,
    1, 1,
    0, 1
  ];

  const uv = [];

  for (
    let face = 0;
    face < 6;
    face++
  ) {
    uv.push(
      ...faceUV
    );
  }

  return new Float32Array(
    uv
  );
}

const texCoords =
  createCubeUVs();
```

---

# 29. Vertex Shader

```javascript
const vertexShaderSource = `#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_texCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform mat3 u_normalMatrix;

uniform float u_uvScale;

out vec3 v_worldPosition;
out vec3 v_normal;
out vec2 v_texCoord;

void main() {
  vec4 worldPosition =
    u_model *
    vec4(
      a_position,
      1.0
    );

  v_worldPosition =
    worldPosition.xyz;

  v_normal =
    u_normalMatrix *
    a_normal;

  v_texCoord =
    a_texCoord *
    u_uvScale;

  gl_Position =
    u_projection
    *
    u_view
    *
    worldPosition;
}
`;
```

---

# 30. Apa yang Dikirim Vertex Shader?

Vertex Shader mengirim:

```text
World Position
Normal
UV
```

ke Fragment Shader.

Nilai tersebut diinterpolasi untuk fragment di antara vertex.

---

# 31. Fragment Shader — Lighting + Texture

```javascript
const fragmentShaderSource = `#version 300 es

precision highp float;

in vec3 v_worldPosition;
in vec3 v_normal;
in vec2 v_texCoord;

uniform vec3 u_lightPosition;
uniform vec3 u_lightColor;
uniform vec3 u_cameraPosition;

uniform float u_ambientStrength;
uniform float u_shininess;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
  vec3 N =
    normalize(
      v_normal
    );

  vec3 L =
    normalize(
      u_lightPosition
      -
      v_worldPosition
    );

  vec3 V =
    normalize(
      u_cameraPosition
      -
      v_worldPosition
    );

  float diff =
    max(
      dot(N, L),
      0.0
    );

  vec3 R =
    reflect(
      -L,
      N
    );

  float spec = 0.0;

  if (
    diff > 0.0
  ) {
    spec =
      pow(
        max(
          dot(R, V),
          0.0
        ),
        u_shininess
      );
  }

  vec3 texColor =
    texture(
      u_texture,
      v_texCoord
    ).rgb;

  vec3 ambient =
    u_ambientStrength
    *
    texColor;

  vec3 diffuse =
    diff
    *
    u_lightColor
    *
    texColor;

  vec3 specular =
    spec
    *
    u_lightColor;

  vec3 finalColor =
    ambient
    +
    diffuse
    +
    specular;

  outColor =
    vec4(
      finalColor,
      1.0
    );
}
`;
```

---

# 32. Mengapa Lighting Dilakukan Per Fragment?

Pada praktikum ini lighting dihitung di Fragment Shader.

Keuntungan pembelajaran:

- normal hasil interpolation tersedia per fragment;
- diffuse lebih halus;
- specular highlight lebih baik;
- mudah menggabungkan texture sampling dan lighting.

---

# 33. Helper Shader

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

  if (
    !gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    )
  ) {
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

# 34. Helper Program

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

  if (
    !gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    )
  ) {
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

# 35. Membuat Program

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

# 36. Attribute Location

```javascript
const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );

const normalLocation =
  gl.getAttribLocation(
    program,
    "a_normal"
  );

const texCoordLocation =
  gl.getAttribLocation(
    program,
    "a_texCoord"
  );
```

---

# 37. Uniform Location

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

const normalMatrixLocation =
  gl.getUniformLocation(
    program,
    "u_normalMatrix"
  );

const lightPositionLocation =
  gl.getUniformLocation(
    program,
    "u_lightPosition"
  );

const lightColorLocation =
  gl.getUniformLocation(
    program,
    "u_lightColor"
  );

const cameraPositionLocation =
  gl.getUniformLocation(
    program,
    "u_cameraPosition"
  );

const ambientLocation =
  gl.getUniformLocation(
    program,
    "u_ambientStrength"
  );

const shininessLocation =
  gl.getUniformLocation(
    program,
    "u_shininess"
  );

const textureLocation =
  gl.getUniformLocation(
    program,
    "u_texture"
  );

const uvScaleLocation =
  gl.getUniformLocation(
    program,
    "u_uvScale"
  );
```

---

# 38. Helper Membuat Buffer

```javascript
function createArrayBuffer(
  data
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
    gl.STATIC_DRAW
  );

  return buffer;
}
```

---

# 39. Membuat Buffer

```javascript
const positionBuffer =
  createArrayBuffer(
    positions
  );

const flatNormalBuffer =
  createArrayBuffer(
    flatNormals
  );

const smoothNormalBuffer =
  createArrayBuffer(
    smoothNormals
  );

const texCoordBuffer =
  createArrayBuffer(
    texCoords
  );
```

---

# 40. Helper Attribute

```javascript
function setupAttribute(
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

---

# 41. Setup Position dan UV

```javascript
setupAttribute(
  positionBuffer,
  positionLocation,
  3
);

setupAttribute(
  texCoordBuffer,
  texCoordLocation,
  2
);
```

Normal akan dipilih saat runtime:

```text
Flat Normal Buffer
atau
Smooth Normal Buffer
```

---

# 42. `math3d.js`

Gunakan helper matrix 4×4 seperti Pertemuan 4.

Minimal diperlukan:

```text
Mat4.identity()
Mat4.rotationX()
Mat4.rotationY()
Mat4.scaling()
Mat4.multiply()
Mat4.lookAt()
Mat4.perspective()
```

Tambahkan helper Normal Matrix pada bagian berikut.

---

# 43. Normal Matrix 3×3

Normal Matrix berasal dari inverse-transpose bagian linear Model Matrix.

Tambahkan pada `math3d.js`:

```javascript
export function normalMatrixFromMat4(
  m
) {
  const a00 = m[0];
  const a01 = m[1];
  const a02 = m[2];

  const a10 = m[4];
  const a11 = m[5];
  const a12 = m[6];

  const a20 = m[8];
  const a21 = m[9];
  const a22 = m[10];

  const b01 =
    a22 * a11 -
    a12 * a21;

  const b11 =
    -a22 * a10 +
    a12 * a20;

  const b21 =
    a21 * a10 -
    a11 * a20;

  let det =
    a00 * b01 +
    a01 * b11 +
    a02 * b21;

  if (
    Math.abs(det) <
    0.000001
  ) {
    return new Float32Array([
      1,0,0,
      0,1,0,
      0,0,1
    ]);
  }

  det =
    1.0 / det;

  const inv00 =
    b01 * det;

  const inv01 =
    (
      -a22 * a01 +
       a02 * a21
    ) * det;

  const inv02 =
    (
       a12 * a01 -
       a02 * a11
    ) * det;

  const inv10 =
    b11 * det;

  const inv11 =
    (
       a22 * a00 -
       a02 * a20
    ) * det;

  const inv12 =
    (
      -a12 * a00 +
       a02 * a10
    ) * det;

  const inv20 =
    b21 * det;

  const inv21 =
    (
      -a21 * a00 +
       a01 * a20
    ) * det;

  const inv22 =
    (
       a11 * a00 -
       a01 * a10
    ) * det;

  // transpose(inverse)
  return new Float32Array([
    inv00,
    inv10,
    inv20,

    inv01,
    inv11,
    inv21,

    inv02,
    inv12,
    inv22
  ]);
}
```

---

# 44. Mengapa Normal Matrix Penting?

Jika Model Matrix hanya rotation dengan uniform scale, transform normal terlihat sederhana.

Tetapi pada:

```text
scaleX ≠ scaleY ≠ scaleZ
```

transform normal yang salah dapat membuat normal tidak lagi tegak lurus surface.

Eksperimen non-uniform scale akan digunakan untuk melihat pentingnya Normal Matrix.

---

# 45. Membuat Texture Checkerboard

Tidak perlu image file eksternal.

```javascript
function createCheckerTexture() {
  const size =
    64;

  const source =
    document.createElement(
      "canvas"
    );

  source.width =
    size;

  source.height =
    size;

  const ctx =
    source.getContext(
      "2d"
    );

  const cells =
    8;

  const cellSize =
    size / cells;

  for (
    let y = 0;
    y < cells;
    y++
  ) {
    for (
      let x = 0;
      x < cells;
      x++
    ) {
      const even =
        (
          x + y
        ) % 2 === 0;

      ctx.fillStyle =
        even
          ? "#f8fafc"
          : "#0ea5e9";

      ctx.fillRect(
        x * cellSize,
        y * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  const texture =
    gl.createTexture();

  gl.bindTexture(
    gl.TEXTURE_2D,
    texture
  );

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    source
  );

  gl.generateMipmap(
    gl.TEXTURE_2D
  );

  return texture;
}
```

---

# 46. Mengaktifkan Texture Unit

```javascript
const texture =
  createCheckerTexture();

gl.activeTexture(
  gl.TEXTURE0
);

gl.bindTexture(
  gl.TEXTURE_2D,
  texture
);

gl.uniform1i(
  textureLocation,
  0
);
```

`0` berarti sampler membaca dari:

```text
TEXTURE0
```

---

# 47. Texture Filtering State

```javascript
let filterMode =
  "LINEAR";
```

Helper:

```javascript
function applyFiltering() {
  gl.bindTexture(
    gl.TEXTURE_2D,
    texture
  );

  if (
    filterMode ===
    "NEAREST"
  ) {
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.NEAREST
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl.NEAREST
    );
  } else {
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );

    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl.LINEAR
    );
  }
}
```

Catatan:

> Untuk eksperimen sederhana ini `LINEAR` digunakan langsung agar perbedaan dengan `NEAREST` mudah diamati. Mipmap tetap dibuat dan dapat dikembangkan sebagai challenge.

---

# 48. Texture Wrapping State

```javascript
const wrapModes = [
  "REPEAT",
  "CLAMP_TO_EDGE",
  "MIRRORED_REPEAT"
];

let wrapIndex =
  0;
```

Helper:

```javascript
function applyWrapping() {
  gl.bindTexture(
    gl.TEXTURE_2D,
    texture
  );

  const modeName =
    wrapModes[
      wrapIndex
    ];

  let mode =
    gl.REPEAT;

  if (
    modeName ===
    "CLAMP_TO_EDGE"
  ) {
    mode =
      gl.CLAMP_TO_EDGE;
  }

  if (
    modeName ===
    "MIRRORED_REPEAT"
  ) {
    mode =
      gl.MIRRORED_REPEAT;
  }

  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    mode
  );

  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    mode
  );
}
```

---

# 49. State Scene

```javascript
const cube = {
  rotationX: 20,
  rotationY: 30,

  scaleX: 1.0,
  scaleY: 1.0,
  scaleZ: 1.0
};

const camera = {
  position: [
    0.0,
    1.4,
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

const light = {
  position: [
    2.0,
    2.0,
    2.0
  ],

  color: [
    1.0,
    1.0,
    1.0
  ]
};

let ambientStrength =
  0.18;

let shininess =
  32.0;

let uvScale =
  1.0;

let shadingMode =
  "FLAT";
```

---

# 50. Model Matrix

Contoh:

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

  const s =
    Mat4.scaling(
      cube.scaleX,
      cube.scaleY,
      cube.scaleZ
    );

  let model =
    Mat4.identity();

  model =
    Mat4.multiply(
      model,
      s
    );

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

---

# 51. Camera dan Projection

View Matrix:

```javascript
const view =
  Mat4.lookAt(
    camera.position,
    camera.target,
    camera.up
  );
```

Perspective:

```javascript
const aspect =
  canvas.width /
  canvas.height;

const projection =
  Mat4.perspective(
    degToRad(60),
    aspect,
    0.1,
    100.0
  );
```

---

# 52. State-Based Light Control

Gunakan keyboard state:

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

# 53. Update Light Position

```javascript
const lightSpeed =
  2.0;

function updateLight(
  dt
) {
  if (
    keys["arrowleft"]
  ) {
    light.position[0] -=
      lightSpeed * dt;
  }

  if (
    keys["arrowright"]
  ) {
    light.position[0] +=
      lightSpeed * dt;
  }

  if (
    keys["arrowup"]
  ) {
    light.position[1] +=
      lightSpeed * dt;
  }

  if (
    keys["arrowdown"]
  ) {
    light.position[1] -=
      lightSpeed * dt;
  }

  if (
    keys["w"]
  ) {
    light.position[2] -=
      lightSpeed * dt;
  }

  if (
    keys["s"]
  ) {
    light.position[2] +=
      lightSpeed * dt;
  }
}
```

Dengan ini mahasiswa dapat melihat hubungan langsung:

```text
Light Position berubah
      ↓
Light Direction berubah
      ↓
Diffuse + Specular berubah
```

---

# 54. Event-Based Shading Toggle

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key.toLowerCase()
        === "f"
      &&
      !event.repeat
    ) {
      shadingMode =
        shadingMode === "FLAT"
          ? "SMOOTH"
          : "FLAT";
    }
  }
);
```

Pada draw:

```javascript
const activeNormalBuffer =
  shadingMode === "FLAT"
    ? flatNormalBuffer
    : smoothNormalBuffer;

setupAttribute(
  activeNormalBuffer,
  normalLocation,
  3
);
```

---

# 55. Event-Based Filtering Toggle

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key.toLowerCase()
        === "t"
      &&
      !event.repeat
    ) {
      filterMode =
        filterMode === "LINEAR"
          ? "NEAREST"
          : "LINEAR";

      applyFiltering();
    }
  }
);
```

---

# 56. Event-Based Wrapping Toggle

```javascript
window.addEventListener(
  "keydown",
  (event) => {
    if (
      event.key.toLowerCase()
        === "g"
      &&
      !event.repeat
    ) {
      wrapIndex =
        (
          wrapIndex + 1
        )
        %
        wrapModes.length;

      applyWrapping();
    }
  }
);
```

---

# 57. UV Scale Control

Gunakan state-based:

```javascript
const uvScaleSpeed =
  1.5;

function updateUVScale(
  dt
) {
  if (
    keys["["]
  ) {
    uvScale -=
      uvScaleSpeed * dt;
  }

  if (
    keys["]"]
  ) {
    uvScale +=
      uvScaleSpeed * dt;
  }

  uvScale =
    Math.max(
      0.25,
      Math.min(
        5.0,
        uvScale
      )
    );
}
```

Saat:

```text
UV Scale > 1
```

efek wrapping lebih mudah diamati.

---

# 58. Shininess Control

```javascript
const shininessSpeed =
  50.0;

function updateShininess(
  dt
) {
  if (
    keys["-"] ||
    keys["_"]
  ) {
    shininess -=
      shininessSpeed * dt;
  }

  if (
    keys["+"] ||
    keys["="]
  ) {
    shininess +=
      shininessSpeed * dt;
  }

  shininess =
    Math.max(
      2.0,
      Math.min(
        128.0,
        shininess
      )
    );
}
```

---

# 59. Reset State

```javascript
function resetScene() {
  light.position[0] =
    2.0;

  light.position[1] =
    2.0;

  light.position[2] =
    2.0;

  shininess =
    32.0;

  uvScale =
    1.0;

  shadingMode =
    "FLAT";

  filterMode =
    "LINEAR";

  wrapIndex =
    0;

  cube.scaleX =
    1.0;

  cube.scaleY =
    1.0;

  cube.scaleZ =
    1.0;

  applyFiltering();
  applyWrapping();
}
```

Gunakan:

```text
R → Reset
```

secara event-based.

---

# 60. Automatic Cube Rotation

```javascript
function updateCube(
  dt
) {
  cube.rotationX +=
    20.0 * dt;

  cube.rotationY +=
    35.0 * dt;
}
```

---

# 61. Draw Scene

```javascript
function drawScene() {
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    0.025,
    0.04,
    0.08,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT |
    gl.DEPTH_BUFFER_BIT
  );

  gl.useProgram(
    program
  );

  setupAttribute(
    positionBuffer,
    positionLocation,
    3
  );

  setupAttribute(
    texCoordBuffer,
    texCoordLocation,
    2
  );

  const activeNormalBuffer =
    shadingMode === "FLAT"
      ? flatNormalBuffer
      : smoothNormalBuffer;

  setupAttribute(
    activeNormalBuffer,
    normalLocation,
    3
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
    Mat4.perspective(
      degToRad(60),
      canvas.width /
      canvas.height,
      0.1,
      100.0
    );

  const normalMatrix =
    normalMatrixFromMat4(
      model
    );

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

  gl.uniformMatrix3fv(
    normalMatrixLocation,
    false,
    normalMatrix
  );

  gl.uniform3fv(
    lightPositionLocation,
    light.position
  );

  gl.uniform3fv(
    lightColorLocation,
    light.color
  );

  gl.uniform3fv(
    cameraPositionLocation,
    camera.position
  );

  gl.uniform1f(
    ambientLocation,
    ambientStrength
  );

  gl.uniform1f(
    shininessLocation,
    shininess
  );

  gl.uniform1f(
    uvScaleLocation,
    uvScale
  );

  gl.activeTexture(
    gl.TEXTURE0
  );

  gl.bindTexture(
    gl.TEXTURE_2D,
    texture
  );

  gl.uniform1i(
    textureLocation,
    0
  );

  gl.drawArrays(
    gl.TRIANGLES,
    0,
    36
  );
}
```

---

# 62. HUD

```javascript
const shadingInfo =
  document.getElementById(
    "shadingInfo"
  );

const filterInfo =
  document.getElementById(
    "filterInfo"
  );

const wrapInfo =
  document.getElementById(
    "wrapInfo"
  );

const uvInfo =
  document.getElementById(
    "uvInfo"
  );

const shininessInfo =
  document.getElementById(
    "shininessInfo"
  );

const lightInfo =
  document.getElementById(
    "lightInfo"
  );
```

Update:

```javascript
function updateHUD() {
  shadingInfo.textContent =
    shadingMode;

  filterInfo.textContent =
    filterMode;

  wrapInfo.textContent =
    wrapModes[
      wrapIndex
    ];

  uvInfo.textContent =
    uvScale.toFixed(2);

  shininessInfo.textContent =
    shininess.toFixed(1);

  lightInfo.textContent =
    `(${light.position[0].toFixed(2)}, ` +
    `${light.position[1].toFixed(2)}, ` +
    `${light.position[2].toFixed(2)})`;
}
```

---

# 63. Rendering Loop

```javascript
let lastTime =
  0;

function render(
  time
) {
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

  updateLight(
    dt
  );

  updateUVScale(
    dt
  );

  updateShininess(
    dt
  );

  drawScene();

  updateHUD();

  requestAnimationFrame(
    render
  );
}

applyFiltering();
applyWrapping();

requestAnimationFrame(
  render
);
```

---

# 64. Milestone Implementasi

Kerjakan bertahap.

## Milestone 1 — Cube dari Pertemuan 4

```text
Position
+
MVP
+
Depth Test
```

Target:

> cube berputar tanpa lighting dan texture.

## Milestone 2 — Normal Buffer

```text
Position
+
Normal
```

Target:

> normal berhasil masuk ke shader.

## Milestone 3 — Diffuse Saja

Implementasikan:

```text
dot(N,L)
```

Target:

> sisi cube berubah terang sesuai light position.

## Milestone 4 — Ambient

Tambahkan ambient.

Target:

> sisi gelap tetap sedikit terlihat.

## Milestone 5 — Specular

Tambahkan:

```text
V
R
shininess
```

Target:

> highlight terlihat ketika orientasi sesuai.

## Milestone 6 — UV + Texture

Tambahkan texture checkerboard.

Target:

> setiap face cube memiliki texture.

## Milestone 7 — Lighting + Texture

Gunakan:

```text
Texture sebagai Base Color
×
Lighting Contribution
```

## Milestone 8 — Flat/Smooth Toggle

Target:

> geometry sama memberi karakter shading berbeda.

## Milestone 9 — Filtering + Wrapping

Target:

> mahasiswa dapat membandingkan mode sampling.

## Milestone 10 — Light Control + HUD

Target:

> hubungan light direction dan hasil shading dapat diamati langsung.

---

# 65. Eksperimen Wajib 1 — Normalization

Pada fragment shader, bandingkan:

```glsl
vec3 N =
  normalize(v_normal);
```

dengan penggunaan normal tanpa `normalize()`.

Catat perbedaan hasil, terutama ketika normal merupakan hasil interpolation dan transformasi.

Setelah eksperimen, kembalikan `normalize()`.

---

# 66. Eksperimen Wajib 2 — Flat vs Smooth

Tekan:

```text
F
```

Bandingkan:

```text
FLAT
vs
SMOOTH
```

Jawab:

1. apakah geometry berubah?
2. apakah normal berubah?
3. mengapa highlight dan diffuse tampak berbeda?
4. mengapa cube smooth dapat terlihat seolah lebih membulat?

---

# 67. Eksperimen Wajib 3 — Ambient Strength

Bandingkan:

```text
0.0
0.15
0.4
```

Amati sisi yang tidak menerima diffuse secara kuat.

Jawab:

> mengapa ambient bukan pengganti diffuse?

---

# 68. Eksperimen Wajib 4 — Diffuse Dot Product

Pindahkan light menggunakan keyboard.

Cari kondisi:

```text
N ≈ L
```

dan:

```text
N ⟂ L
```

Amati perubahan brightness.

Hubungkan hasil visual dengan:

```text
dot(N,L)
```

---

# 69. Eksperimen Wajib 5 — Specular

Bandingkan shininess:

```text
8
32
128
```

Amati:

- lebar highlight;
- ketajaman highlight;
- lokasi highlight relatif terhadap camera.

---

# 70. Eksperimen Wajib 6 — View Direction

Pertahankan light position.

Ubah camera position pada kode atau buat challenge camera control.

Amati bahwa specular dapat berubah walaupun light tidak berubah.

Alasannya:

```text
V =
CameraPosition -
SurfacePosition
```

---

# 71. Eksperimen Wajib 7 — NEAREST vs LINEAR

Tekan:

```text
T
```

Bandingkan:

```text
NEAREST
LINEAR
```

Gunakan UV scale atau camera yang membuat texture terlihat cukup dekat.

Catat:

- ketajaman texel;
- smoothing;
- karakter pixelated.

---

# 72. Eksperimen Wajib 8 — Wrapping

Naikkan:

```text
UV Scale > 1
```

Kemudian tekan:

```text
G
```

Bandingkan:

```text
REPEAT
CLAMP_TO_EDGE
MIRRORED_REPEAT
```

Jelaskan perilaku masing-masing ketika UV keluar dari 0–1.

---

# 73. Eksperimen Wajib 9 — Normal Matrix

Ubah:

```javascript
cube.scaleX = 1.8;
cube.scaleY = 0.6;
cube.scaleZ = 1.0;
```

Gunakan Normal Matrix seperti baseline.

Kemudian, untuk eksperimen saja, ganti transform normal dengan bagian Model Matrix yang tidak menggunakan inverse-transpose.

Bandingkan lighting.

Setelah observasi, kembalikan penggunaan Normal Matrix.

---

# 74. Eksperimen Wajib 10 — Texture Tanpa Lighting

Sementara pada Fragment Shader, gunakan:

```glsl
outColor =
  texture(
    u_texture,
    v_texCoord
  );
```

Bandingkan dengan versi:

```text
Texture
+
Ambient
+
Diffuse
+
Specular
```

Jawab:

> informasi visual apa yang ditambahkan oleh lighting?

---

# 75. Debugging — Object Gelap Total

Periksa:

1. normal benar?
2. normal dinormalisasi?
3. light position benar?
4. diffuse menggunakan `max(dot(...),0)`?
5. ambient strength terlalu kecil?
6. normal matrix benar?
7. warna texture valid?
8. sampler terikat ke texture unit yang benar?

---

# 76. Debugging — Texture Hitam

Periksa:

```text
Texture dibuat?
Texture di-bind?
TEXTURE0 aktif?
u_texture = 0?
UV buffer benar?
a_texCoord size = 2?
```

Gunakan:

```javascript
console.log(
  gl.getError()
);
```

secara terbatas untuk membantu diagnosis.

---

# 77. Debugging — Texture Terbalik

Coordinate image dan UV dapat memiliki orientasi V yang berbeda tergantung sumber texture.

Untuk image texture, salah satu opsi WebGL:

```javascript
gl.pixelStorei(
  gl.UNPACK_FLIP_Y_WEBGL,
  true
);
```

Gunakan hanya jika diperlukan dan pahami efeknya.

Texture checkerboard baseline simetris sehingga masalah ini tidak terlihat jelas.

---

# 78. Debugging — Specular Tidak Terlihat

Periksa:

- `cameraPosition`;
- `lightPosition`;
- `V`;
- `R`;
- shininess terlalu besar;
- light berada di belakang surface;
- normal salah.

Gunakan shininess sedang:

```text
16 – 32
```

untuk debugging awal.

---

# 79. Debugging — Wrapping Tidak Terlihat

Jika UV hanya:

```text
0 sampai 1
```

maka `REPEAT` dan `CLAMP_TO_EDGE` dapat terlihat sama.

Naikkan:

```text
u_uvScale = 2 atau 3
```

agar UV keluar dari rentang 0–1.

---

# 80. Debugging — Flat/Smooth Tidak Berbeda

Pastikan:

```text
flatNormalBuffer
```

dan:

```text
smoothNormalBuffer
```

benar-benar berbeda dan buffer aktif di-bind sebelum draw call.

---

# 81. Tugas Utama Praktikum

Bangun:

# Textured and Lit Object

Requirement minimum:

- [ ] cube 3D dari Pertemuan 4;
- [ ] position attribute;
- [ ] normal attribute;
- [ ] UV attribute;
- [ ] face normal;
- [ ] alternatif smooth vertex normal;
- [ ] normal normalization;
- [ ] Normal Matrix;
- [ ] ambient lighting;
- [ ] diffuse lighting;
- [ ] dot product;
- [ ] point light position;
- [ ] specular lighting;
- [ ] view direction;
- [ ] reflection direction;
- [ ] shininess;
- [ ] texture sampler;
- [ ] texture sampling;
- [ ] UV coordinate;
- [ ] `NEAREST` dan `LINEAR`;
- [ ] minimal dua wrapping mode;
- [ ] lighting + texture;
- [ ] animated cube rotation;
- [ ] state-based light control;
- [ ] event-based mode toggle;
- [ ] HUD;
- [ ] tidak ada error Console pada penggunaan normal;
- [ ] minimal dua challenge.

---

# 82. Challenge A — Image Texture

Tambahkan file:

```text
assets/texture.png
```

Load menggunakan `Image`.

Setelah image selesai:

```javascript
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  image
);
```

Pastikan image berasal dari project/local server yang sama agar tidak terkena kendala CORS.

---

# 83. Challenge B — Ambient Control

Tambahkan:

```text
A / Z
```

untuk mengubah:

```text
Ambient Strength
```

HUD menampilkan nilainya.

---

# 84. Challenge C — Camera Control

Tambahkan state-based camera movement dari Pertemuan 4.

Amati secara khusus perubahan specular ketika camera bergerak.

---

# 85. Challenge D — Non-Uniform Scale Mode

Tambahkan toggle:

```text
N
```

untuk:

```text
Uniform Scale
vs
Non-Uniform Scale
```

Gunakan challenge ini untuk menunjukkan fungsi Normal Matrix.

---

# 86. Challenge E — Light Orbit

Buat point light bergerak mengorbit cube:

```javascript
light.position[0] =
  Math.cos(time) * radius;

light.position[2] =
  Math.sin(time) * radius;
```

Tambahkan toggle automatic/manual.

---

# 87. Challenge F — Lighting Components Toggle

Tambahkan:

```text
1 → Ambient ON/OFF
2 → Diffuse ON/OFF
3 → Specular ON/OFF
```

Tujuan:

> melihat kontribusi masing-masing komponen secara terpisah.

---

# 88. Challenge G — Mipmap Filtering

Eksplorasi:

```text
LINEAR_MIPMAP_LINEAR
NEAREST_MIPMAP_NEAREST
```

Bandingkan dengan filtering tanpa mipmap pada kondisi texture terlihat jauh.

Challenge ini melampaui minimum slide tetapi tetap terkait langsung dengan texture filtering.

---

# 89. Test Case

| No. | Pengujian | Hasil yang Diharapkan |
|---:|---|---|
| 1 | Load aplikasi | Cube tampil |
| 2 | Rotation | Cube berputar |
| 3 | Texture | Checkerboard terlihat |
| 4 | Flat shading | Per-face lighting tegas |
| 5 | Smooth shading | Lighting lebih halus |
| 6 | Arrow/W/S | Light bergerak |
| 7 | Diffuse | Brightness berubah dengan light |
| 8 | Specular | Highlight terlihat |
| 9 | Shininess | Ukuran highlight berubah |
| 10 | T | Filtering berganti |
| 11 | G | Wrapping berganti |
| 12 | UV Scale | Pattern repeat/clamp terlihat |
| 13 | Normal Matrix | Non-uniform scale tetap masuk akal |
| 14 | HUD | State tampil benar |
| 15 | Console | Tidak ada error normal |

---

# 90. Pertanyaan Pemahaman

Jawab dengan kalimat sendiri.

1. Apa fungsi normal dalam lighting?
2. Apa perbedaan face normal dan vertex normal?
3. Apa perbedaan flat shading dan smooth shading?
4. Mengapa normal harus dinormalisasi?
5. Mengapa normal perlu ikut ditransformasikan?
6. Mengapa normal tidak selalu cukup dikalikan Model Matrix biasa?
7. Apa fungsi Normal Matrix?
8. Apa yang dimaksud inverse-transpose secara konseptual?
9. Apa fungsi ambient lighting?
10. Mengapa ambient sederhana bukan global illumination?
11. Apa fungsi diffuse lighting?
12. Apa arti `dot(N,L)`?
13. Mengapa digunakan `max(dot(N,L),0)`?
14. Apa fungsi light direction?
15. Apa fungsi view direction?
16. Apa fungsi reflection direction?
17. Apa fungsi specular lighting?
18. Apa pengaruh shininess?
19. Apa yang dimaksud Phong Reflection Model sederhana?
20. Apa perbedaan per-vertex dan per-fragment lighting?
21. Apa fungsi UV coordinate?
22. Apa fungsi texture sampler?
23. Apa yang dimaksud texture sampling?
24. Apa perbedaan pixel dan texel?
25. Apa perbedaan `NEAREST` dan `LINEAR`?
26. Apa fungsi wrapping?
27. Apa perbedaan `REPEAT` dan `CLAMP_TO_EDGE`?
28. Mengapa UV scale diperlukan untuk mudah melihat wrapping?
29. Mengapa texture dapat digunakan sebagai base color?
30. Bagaimana lighting dan texture digabungkan?

---

# 91. Pertanyaan Analisis

## A — Normal

Geometry cube sama tetapi normal diubah dari face normal menjadi smooth normal.

Mengapa hasil shading berubah?

## B — Diffuse

Jika:

```text
dot(N,L) = 1
```

apa artinya secara geometris?

## C — Specular

Mengapa highlight dapat berubah ketika camera bergerak walaupun light position tetap?

## D — Texture

Mengapa texture memberi detail visual tanpa menambah triangle?

## E — Normal Matrix

Mengapa non-uniform scaling menjadi kasus penting untuk transformasi normal?

---

# 92. README

`README.md` minimal berisi:

```text
Nama
NRP
Deskripsi aplikasi
Kontrol keyboard
Jenis shading
Texture yang digunakan
Filtering yang tersedia
Wrapping yang tersedia
Nilai ambient default
Nilai shininess default
Challenge yang dikerjakan
Cara menjalankan
Catatan debugging
```

---

# 93. Output Pengumpulan

```text
praktikum-lighting-05/
├── index.html
├── style.css
├── main.js
├── math3d.js
├── README.md
└── screenshot.png
```

Jika menggunakan image texture:

```text
praktikum-lighting-05/
└── assets/
    └── texture.png
```

Jika diminta:

```text
demo.mp4
```

---

# 94. Refleksi Praktikum

Tuliskan 4–6 kalimat mengenai:

- perbedaan flat dan smooth shading;
- komponen lighting yang paling mudah dipahami;
- fungsi dot product;
- pengaruh shininess;
- perbedaan filtering;
- kesalahan texture atau normal yang ditemukan.

---

# 95. Hubungan dengan Three.js

Pada Three.js, banyak proses yang dikerjakan manual pada praktikum ini akan disediakan melalui abstraction seperti:

```text
Geometry
Material
Texture
Light
Mesh
Camera
```

Namun di balik abstraction tersebut tetap terdapat konsep:

```text
Position
Normal
UV
Shader
Texture Sampling
Lighting
```

Karena itu pemahaman WebGL fundamental membantu mahasiswa memahami apa yang dikerjakan engine/library di belakang layar.

---

# 96. Ringkasan Praktikum

Pada praktikum ini mahasiswa mengembangkan object 3D dari Pertemuan 4 menjadi surface yang memiliki informasi visual lebih kaya.

Pipeline akhirnya:

```text
Geometry
   ↓
Position + Normal + UV
   ↓
Vertex Shader
   ├── Model/View/Projection
   ├── Normal Transformation
   └── UV
   ↓
Interpolation
   ↓
Fragment Shader
   ├── Normalize Normal
   ├── Texture Sampling
   ├── Ambient
   ├── Diffuse
   └── Specular
   ↓
Final Surface Color
```

Benang merah konsep:

```text
Position
→ WHERE surface is

Normal
→ WHICH WAY surface faces

UV
→ WHICH PART of texture is used

Lighting
→ HOW light affects surface

Texture
→ WHAT base visual detail surface has
```

Aplikasi akhir:

# Textured and Lit Cube Playground

menjadi penutup rangkaian WebGL low-level sebelum materi berikutnya:

# Introduction to Three.js
