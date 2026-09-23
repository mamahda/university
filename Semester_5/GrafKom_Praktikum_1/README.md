# Praktikum Grafika Komputer — Pertemuan 1
## Graphics Playground dengan HTML Canvas

**Mata Kuliah:** EF234504 — Grafika Komputer
**Pertemuan:** 1 — Introduction to Computer Graphics
**Topik Praktikum:** HTML Canvas 2D, Primitive, Coordinate, Animation, dan Interaction

---

# 1. Tujuan Praktikum

Setelah menyelesaikan praktikum ini, mahasiswa diharapkan mampu:

1. Membuat halaman HTML yang memiliki elemen `<canvas>`.
2. Mengakses Canvas 2D Context menggunakan JavaScript.
3. Memahami sistem koordinat pada Canvas.
4. Menggambar primitive sederhana.
5. Mengatur posisi, ukuran, dan warna objek.
6. Membuat animation loop sederhana.
7. Menambahkan interaksi mouse atau keyboard.
8. Menghubungkan konsep koordinat, frame, dan rendering sederhana.

---

# 2. Persiapan

Perangkat lunak yang digunakan:

- Visual Studio Code
- Google Chrome / Chromium / Firefox
- Browser Developer Tools
- JavaScript

Struktur folder:

```text
praktikum-01/
├── index.html
└── script.js
```

---

# 3. Membuat Halaman HTML

Buat file `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Graphics Playground</title>
</head>
<body>

  <canvas
    id="canvas"
    width="800"
    height="600">
  </canvas>

  <script src="script.js"></script>

</body>
</html>
```

Canvas berfungsi sebagai area gambar.

---

# 4. Mendapatkan Canvas Context

Pada `script.js`:

```javascript
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
```

Variabel `ctx` menyediakan fungsi untuk menggambar objek 2D.

---

# 5. Sistem Koordinat Canvas

Canvas menggunakan sistem koordinat:

```text
(0,0) ─────────────→ X
  |
  |
  |
  |
  ↓
  Y
```

Titik `(0,0)` terletak di kiri atas.

Contoh posisi:

```text
(100, 100)
```

berarti 100 pixel dari kiri dan 100 pixel dari atas.

---

# 6. Menggambar Rectangle

```javascript
ctx.fillStyle = "blue";

ctx.fillRect(
  100,
  100,
  200,
  120
);
```

Parameter:

```text
fillRect(x, y, width, height)
```

Eksperimen:

- ubah `x`,
- ubah `y`,
- ubah `width`,
- ubah `height`,
- ubah warna.

---

# 7. Menggambar Garis

```javascript
ctx.beginPath();

ctx.moveTo(100, 100);
ctx.lineTo(400, 300);

ctx.strokeStyle = "black";
ctx.lineWidth = 3;

ctx.stroke();
```

Konsep:

```text
Start Point
     ↓
Line
     ↓
End Point
```

---

# 8. Menggambar Circle

```javascript
ctx.beginPath();

ctx.arc(
  300,
  200,
  50,
  0,
  Math.PI * 2
);

ctx.fillStyle = "red";
ctx.fill();
```

Parameter penting:

- center X,
- center Y,
- radius.

---

# 9. Menggambar Triangle

Canvas tidak menyediakan fungsi khusus `drawTriangle()`.

Triangle dibuat menggunakan path:

```javascript
ctx.beginPath();

ctx.moveTo(300, 100);
ctx.lineTo(200, 300);
ctx.lineTo(400, 300);

ctx.closePath();

ctx.fillStyle = "green";
ctx.fill();
```

---

# 10. Membuat Scene Sederhana

Gabungkan beberapa primitive:

```text
Rectangle
+
Circle
+
Triangle
+
Line
```

Gunakan posisi dan warna berbeda.

Contoh fungsi:

```javascript
function drawScene() {

  ctx.fillStyle = "blue";
  ctx.fillRect(50, 50, 150, 100);

  ctx.beginPath();
  ctx.arc(350, 150, 50, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();

}
```

---

# 11. Membersihkan Canvas

Sebelum menggambar frame berikutnya:

```javascript
ctx.clearRect(
  0,
  0,
  canvas.width,
  canvas.height
);
```

Tanpa proses clear, gambar lama tetap berada di canvas.

---

# 12. Konsep Animation Loop

Animasi dibuat dengan pola:

```text
Update State
     ↓
Clear Canvas
     ↓
Draw Scene
     ↓
Next Frame
```

Browser menyediakan:

```javascript
requestAnimationFrame()
```

---

# 13. Membuat Animation Loop

```javascript
function animate() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  update();
  draw();

  requestAnimationFrame(animate);
}

animate();
```

Ini adalah pola dasar yang nantinya juga sering ditemui pada game loop dan real-time rendering.

---

# 14. Moving Circle

Buat variabel:

```javascript
let x = 100;
let y = 200;
let speedX = 3;
```

Update posisi:

```javascript
function update() {
  x += speedX;
}
```

Draw:

```javascript
function draw() {

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    30,
    0,
    Math.PI * 2
  );

  ctx.fillStyle = "orange";
  ctx.fill();
}
```

---

# 15. Collision dengan Batas Canvas

Agar circle memantul:

```javascript
if (
  x + 30 >= canvas.width ||
  x - 30 <= 0
) {
  speedX *= -1;
}
```

Konsep:

```text
Move
 ↓
Check Boundary
 ↓
Reverse Direction
```

---

# 16. Mouse Position

Tambahkan event:

```javascript
canvas.addEventListener(
  "mousemove",
  function(event) {

    const rect =
      canvas.getBoundingClientRect();

    const mouseX =
      event.clientX - rect.left;

    const mouseY =
      event.clientY - rect.top;

    console.log(mouseX, mouseY);
  }
);
```

---

# 17. Object Mengikuti Mouse

Simpan posisi mouse:

```javascript
let mouseX = 0;
let mouseY = 0;
```

Kemudian update:

```javascript
canvas.addEventListener(
  "mousemove",
  function(event) {

    const rect =
      canvas.getBoundingClientRect();

    mouseX =
      event.clientX - rect.left;

    mouseY =
      event.clientY - rect.top;
  }
);
```

Gunakan:

```javascript
ctx.arc(
  mouseX,
  mouseY,
  20,
  0,
  Math.PI * 2
);
```

---

# 18. Keyboard Interaction

Contoh:

```javascript
window.addEventListener(
  "keydown",
  function(event) {

    if (event.key === "ArrowLeft") {
      playerX -= 10;
    }

    if (event.key === "ArrowRight") {
      playerX += 10;
    }

    if (event.key === "ArrowUp") {
      playerY -= 10;
    }

    if (event.key === "ArrowDown") {
      playerY += 10;
    }

  }
);
```

---

# 19. Struktur Program yang Disarankan

Gunakan struktur:

```javascript
function update() {
  // update posisi dan state
}

function draw() {
  // menggambar seluruh scene
}

function animate() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  update();
  draw();

  requestAnimationFrame(animate);
}

animate();
```

Pemisahan `update()` dan `draw()` membantu memahami pola aplikasi grafika interaktif.

---

# 20. Tugas Praktikum

Buat **Graphics Playground** dengan requirement minimum:

- canvas minimal 800 × 600,
- minimal 3 jenis primitive,
- minimal 3 warna berbeda,
- minimal 1 object bergerak,
- minimal 1 interaksi mouse atau keyboard,
- source code terstruktur dengan fungsi `update()` dan `draw()`.

---

# 21. Challenge

Pilih minimal **dua** challenge:

### Challenge A — Bounce

Buat circle memantul pada keempat batas canvas.

### Challenge B — Mouse Follower

Buat object mengikuti cursor.

### Challenge C — Keyboard Controller

Gerakkan object dengan tombol arah atau WASD.

### Challenge D — Change Color

Klik object untuk mengganti warna.

### Challenge E — Spawn Object

Klik canvas untuk membuat object baru pada posisi mouse.

### Challenge F — Mouse Coordinate

Tampilkan posisi:

```text
Mouse X
Mouse Y
```

langsung pada Canvas.

---

# 22. Challenge Tambahan

Untuk mahasiswa yang ingin mencoba lebih jauh:

- membuat banyak object bergerak,
- memberikan kecepatan berbeda,
- membuat object berubah ukuran,
- membuat trail sederhana,
- mendeteksi collision antardua circle,
- menghitung FPS sederhana.

---

# 23. Pertanyaan Analisis

Jawab setelah praktikum:

1. Di mana titik `(0,0)` pada Canvas?
2. Apa perbedaan `update()` dan `draw()`?
3. Mengapa canvas harus dibersihkan pada setiap frame animasi?
4. Apa fungsi `requestAnimationFrame()`?
5. Bagaimana posisi mouse dikonversi menjadi koordinat Canvas?
6. Mengapa animation loop relevan dengan real-time graphics?
7. Apa hubungan praktikum ini dengan WebGL yang akan dipelajari berikutnya?

---

# 24. Output Pengumpulan

Kumpulkan:

```text
praktikum-01/
├── index.html
├── script.js
└── screenshot.png
```

Opsional:

```text
README.md
```

berisi penjelasan singkat fitur yang dibuat.

---

# 25. Hubungan dengan Pertemuan 2

Pada praktikum ini mahasiswa menggunakan:

```text
Canvas 2D API
```

Pada pertemuan berikutnya mahasiswa akan masuk ke:

```text
WebGL
```

Perbedaannya secara konseptual:

```text
Canvas 2D
High-Level Drawing API

        ↓

WebGL
GPU-Oriented Graphics API
```

Konsep yang tetap digunakan:

- coordinate,
- primitive,
- frame,
- animation loop,
- color,
- rendering.

---

# 26. Ringkasan Praktikum

Konsep utama:

```text
HTML Canvas
     ↓
Coordinate
     ↓
Primitive
     ↓
Color
     ↓
Animation
     ↓
Interaction
     ↓
Graphics Playground
```

Praktikum ini menjadi jembatan dari konsep dasar grafika komputer menuju pemrograman grafika GPU dengan WebGL.

