/*
5025241102 Kemas Muhammad Athariq
5025241134 Gilbran Mahdavikia Raja
*/

import { Mat3 } from "./matrix3.js";

// Derajat -> radian (Math.sin/cos memakai radian)
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

const WIDTH = 600;
const HEIGHT = 395.25;

// Setup canvas (tajam di layar HiDPI) & WebGL2 context
const canvas = document.getElementById("glCanvas");
const dpr = window.devicePixelRatio || 1;
canvas.width = Math.round(WIDTH * dpr);
canvas.height = Math.round(HEIGHT * dpr);
canvas.style.width = WIDTH + "px";
canvas.style.height = HEIGHT + "px";

const gl = canvas.getContext("webgl2", { antialias: true });
if (!gl) {
  alert("WebGL2 tidak tersedia pada browser/perangkat ini.");
  throw new Error("WebGL2 tidak tersedia.");
}

// Vertex shader: posisi dikalikan matriks transformasi (u_matrix)
const vertexShaderSource = `#version 300 es

in vec2 a_position;
uniform mat3 u_matrix;

void main() {
  vec3 position = u_matrix * vec3(a_position, 1.0);
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Fragment shader: warna solid dari uniform u_color
const fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

// Compile shader dan tampilkan info log jika gagal
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader gagal dikompilasi:\n" + info);
  }
  return shader;
}

// Link vertex + fragment shader menjadi satu program
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program gagal di-link:\n" + info);
  }
  return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

const aPosition = gl.getAttribLocation(program, "a_position");
const uMatrix = gl.getUniformLocation(program, "u_matrix");
const uColor = gl.getUniformLocation(program, "u_color");

// Koordinat piksel 600 x 395.25 -> clip space
const projection = Mat3.projection(WIDTH, HEIGHT);

// Upload vertex ke GPU buffer (sekali saat inisialisasi)
function createShape(vertices, mode) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return { buffer, mode, count: vertices.length / 2 };
}

// Vertex lingkaran untuk TRIANGLE_FAN (titik pertama = pusat)
function circleVertices(segments, startAngle, endAngle) {
  const v = [0, 0];
  for (let i = 0; i <= segments; i++) {
    const a = startAngle + (endAngle - startAngle) * (i / segments);
    v.push(Math.cos(a), Math.sin(a));
  }
  return v;
}

// Geometri dasar dalam local coordinate berukuran satuan
const shapes = {
  square: createShape([
    0, 0, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 1,
  ], gl.TRIANGLES),

  triangle: createShape([
    0.5, 0,
    0, 1,
    1, 1,
  ], gl.TRIANGLES),

  circle: createShape(circleVertices(48, 0, Math.PI * 2), gl.TRIANGLE_FAN),

  halfCircle: createShape(circleVertices(32, Math.PI, Math.PI * 2), gl.TRIANGLE_FAN),

  line: createShape([
    0, -0.5, 1, -0.5, 0, 0.5,
    0, 0.5, 1, -0.5, 1, 0.5,
  ], gl.TRIANGLES),
};

// Segitiga statis dengan titik bebas (gunung, jalan, sisi atap)
const staticShapes = {
  mountainLeft: createShape([18.75, 165, 156, 71.25, 268.5, 165], gl.TRIANGLES),
  mountainRight: createShape([268.5, 165, 397.5, 67.5, 558.75, 165], gl.TRIANGLES),
  road: createShape([267.75, 165, 371.25, 387.75, 461.25, 387.75], gl.TRIANGLES),
  roofSide: createShape([
    242.25, 225, 157.5, 225, 199.5, 285,
    157.5, 225, 120, 285, 199.5, 285,
  ], gl.TRIANGLES),
};

// Warna hex "#rrggbb" -> [r, g, b, a] rentang 0..1
function hexToRgba(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1];
}

// Campuran dua warna hex (t = 0 -> hexA, t = 1 -> hexB)
function mixColor(hexA, hexB, t) {
  const a = parseInt(hexA.slice(1), 16);
  const b = parseInt(hexB.slice(1), 16);
  let out = 0;
  for (const shift of [16, 8, 0]) {
    const ca = (a >> shift) & 255;
    const cb = (b >> shift) & 255;
    out |= Math.round(ca + (cb - ca) * t) << shift;
  }
  return "#" + out.toString(16).padStart(6, "0");
}

// Menggambar satu shape dengan model matrix dan warna tertentu
function drawShape(shape, matrix, color) {
  gl.bindBuffer(gl.ARRAY_BUFFER, shape.buffer);
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix3fv(uMatrix, false, Mat3.multiply(projection, matrix));
  gl.uniform4fv(uColor, hexToRgba(color));

  gl.drawArrays(shape.mode, 0, shape.count);
}

// Kotak: (x, y) = pojok kiri atas, ukuran w x h
function drawRect(x, y, w, h, color, angle = 0) {
  let m = Mat3.translation(x, y);
  m = Mat3.rotate(m, angle);
  m = Mat3.scale(m, w, h);
  drawShape(shapes.square, m, color);
}

// Segitiga sama kaki di dalam kotak (x, y, w, h), puncak di tengah atas
function drawTriangle(x, y, w, h, color) {
  let m = Mat3.translation(x, y);
  m = Mat3.scale(m, w, h);
  drawShape(shapes.triangle, m, color);
}

// Lingkaran dengan pusat (cx, cy) dan radius r
function drawCircle(cx, cy, r, color) {
  let m = Mat3.translation(cx, cy);
  m = Mat3.scale(m, r, r);
  drawShape(shapes.circle, m, color);
}

// Setengah lingkaran bagian atas (untuk matahari terbit)
function drawHalfCircle(cx, cy, r, color) {
  let m = Mat3.translation(cx, cy);
  m = Mat3.scale(m, r, r);
  drawShape(shapes.halfCircle, m, color);
}

// Garis tebal = kotak tipis yang diputar, ujungnya dibulatkan
function drawLine(x1, y1, x2, y2, thickness = 3, color = COLOR.ink) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1);

  let m = Mat3.translation(x1, y1);
  m = Mat3.rotate(m, angle);
  m = Mat3.scale(m, length, thickness);
  drawShape(shapes.line, m, color);

  drawCircle(x1, y1, thickness / 2, color);
  drawCircle(x2, y2, thickness / 2, color);
}

// Palet warna semua objek
const COLOR = {
  paper:     "#f7f6f3",
  sky:       "#b0e6fa",
  skyNight:  "#3a4d7a",
  sun:       "#ffd60a",
  moon:      "#f4f1c9",
  star:      "#fffbe6",
  mountain:  "#7c685e",
  grass:     "#cfeaac",
  road:      "#bfd3c9",
  roofFront: "#e93a3e",
  roofSide:  "#c92f33",
  wallFront: "#ffffff",
  wallSide:  "#ececec",
  window:    "#ffe58f",
  leaf:      "#32c832",
  trunk:     "#16582a",
  ink:       "#1a1a1a",
};

// Langit (warna berganti saat malam)
function drawSky() {
  drawRect(7.5, 6, 585, 159, isNight ? COLOR.skyNight : COLOR.sky);
}

// Tanah / sawah di bawah garis gunung
function drawGround() {
  drawRect(7.5, 165, 585, 222.75, COLOR.grass);
}

// Matahari + 16 sinar yang berputar dan ikut di-scale terhadap pusat matahari
function drawSun() {
  const cx = 268.5, cy = 165, r = 51;
  drawHalfCircle(cx, cy, r * sunScale, COLOR.sun);

  const r1 = r + 16.5, r2 = r + 39;
  for (let deg = 0; deg < 360; deg += 22.5) {
    let m = Mat3.translation(cx, cy);
    m = Mat3.scale(m, sunScale, sunScale);
    m = Mat3.rotate(m, degToRad(deg) + sunAngle);

    const [x1, y1] = Mat3.transformPoint(m, r1, 0);
    const [x2, y2] = Mat3.transformPoint(m, r2, 0);
    drawLine(x1, y1, x2, y2, 3, COLOR.sun);
  }
}

// Bintang "+" yang berkelap-kelip (ukuran & kecerahan mengikuti sin waktu)
function drawStars(seconds) {
  const stars = [
    [45, 30, 3.75], [90, 67.5, 3], [127.5, 22.5, 4.5], [172.5, 15, 3],
    [195, 41.25, 3], [225, 15, 3.75], [300, 52.5, 3], [315, 30, 3],
    [352.5, 56.25, 4.5], [390, 41.25, 3], [420, 22.5, 3], [457.5, 82.5, 3.75],
    [487.5, 15, 3], [525, 26.25, 3.75], [570, 60, 3], [577.5, 127.5, 3.75],
    [30, 112.5, 3],
  ];
  stars.forEach(([x, y, size], i) => {
    const twinkle = 0.5 + 0.5 * Math.sin(seconds * 3 + i * 1.7);
    const s = size * (0.4 + 0.6 * twinkle);
    const color = mixColor(COLOR.skyNight, COLOR.star, 0.3 + 0.7 * twinkle);

    drawLine(x - s, y, x + s, y, 1.125, color);
    drawLine(x, y - s, x, y + s, 1.125, color);
    drawCircle(x, y, s * 0.35, color);
  });
}

// Bulan sabit = lingkaran bulan yang sebagian ditutup lingkaran warna langit
function drawMoon() {
  const cx = 268.5, cy = 112.5, r = 30 * sunScale;
  drawCircle(cx, cy, r, COLOR.moon);
  drawCircle(cx + r * 0.4, cy - r * 0.25, r * 0.85, COLOR.skyNight);
}

// Burung "V" + "_", sayap berputar di pivot ujung bawah V (flap 1 = V, 0 = datar)
function drawBird(x, y, wing, flap) {
  const a = degToRad(60) * flap;

  const left = Mat3.rotate(Mat3.translation(x, y), a);
  const right = Mat3.rotate(Mat3.translation(x, y), -a);
  const [lx, ly] = Mat3.transformPoint(left, -wing, 0);
  const [rx, ry] = Mat3.transformPoint(right, wing, 0);

  drawLine(lx, ly, x, y, 2.625);
  drawLine(x, y, rx, ry, 2.625);

  const body = wing * 0.35;
  drawLine(x - body, y, x + body, y, 2.625);
}

// Mengembalikan value ke rentang [min, min + range)
function wrap(value, min, range) {
  return ((value - min) % range + range) % range + min;
}

// 3 burung formasi "V"; yang keluar canvas muncul lagi di sisi seberang
function drawBirds(seconds) {
  const birds = [
    [476.25, 52.5, 0.0],
    [510, 78.75, 1.3],
    [543.75, 52.5, 2.6],
  ];
  for (const [x, y, phase] of birds) {
    const flap = 0.5 + 0.5 * Math.sin(seconds * 6 + phase);
    const wx = wrap(x + birdOffsetX, -BIRD_WING, BIRD_SPAN);
    drawBird(wx, y, BIRD_WING, flap);
  }
}

// Dua gunung dari segitiga statis
function drawMountains() {
  drawShape(staticShapes.mountainLeft, Mat3.identity(), COLOR.mountain);
  drawShape(staticShapes.mountainRight, Mat3.identity(), COLOR.mountain);
}

// Jalan + marka putus-putus di tengah
function drawRoad() {
  drawShape(staticShapes.road, Mat3.identity(), COLOR.road);

  const top = [267.75, 165];
  const bottomMid = [416.25, 387.75];
  for (let t = 0.1; t < 0.95; t += 0.14) {
    const t2 = t + 0.06;
    drawLine(
      top[0] + (bottomMid[0] - top[0]) * t, top[1] + (bottomMid[1] - top[1]) * t,
      top[0] + (bottomMid[0] - top[0]) * t2, top[1] + (bottomMid[1] - top[1]) * t2,
      2.25
    );
  }
}

// Rumput "v" yang melambai dengan pivot di pangkalnya
function drawGrass(seconds) {
  const spots = [
    [472.5, 198.75], [514.5, 217.5], [554.25, 228.75], [469.5, 238.5],
    [429.75, 229.5], [366.75, 212.25], [531.75, 258], [486, 275.25],
    [406.5, 258], [537.75, 306.75], [498, 309], [441, 295.5],
    [463.5, 335.25], [509.25, 354.75],
  ];
  for (const [x, y] of spots) {
    const sway = degToRad(12) * Math.sin(seconds * 2.5 + x * 0.04);
    const m = Mat3.rotate(Mat3.translation(x, y), sway);

    const [ax, ay] = Mat3.transformPoint(m, 3.75, -6.75);
    const [bx, by] = Mat3.transformPoint(m, -9.75, -9);
    drawLine(ax, ay, x, y, 2.25);
    drawLine(x, y, bx, by, 2.25);
  }
}

// Rumah: dinding, atap, jendela & pintu
function drawHouse() {
  drawRect(129, 285, 79.5, 49.5, COLOR.wallSide);
  drawRect(208.5, 285, 67.5, 49.5, COLOR.wallFront);

  drawShape(staticShapes.roofSide, Mat3.identity(), COLOR.roofSide);
  drawTriangle(199.5, 225, 85.5, 60, COLOR.roofFront);

  const windows = [
    [135.75, 295.5, 12.75, 19.5],
    [158.25, 295.5, 12.75, 19.5],
    [180.75, 295.5, 12.75, 19.5],
    [226.5, 298.5, 12, 18],
    [248.25, 298.5, 15, 33],
  ];
  for (const [x, y, w, h] of windows) {
    drawRect(x, y, w, h, COLOR.window);
  }
}

// Pohon: daun dari tumpukan lingkaran, batang dari kotak
function drawTree() {
  const leaves = [
    [82.5, 234, 30],
    [106.5, 240, 19.5],
    [58.5, 240, 19.5],
    [82.5, 208.5, 21],
    [99, 217.5, 16.5],
    [66, 217.5, 16.5],
  ];
  for (const [x, y, r] of leaves) drawCircle(x, y, r, COLOR.leaf);

  drawRect(75, 243.75, 13.5, 86.25, COLOR.trunk);
}

// State animasi & kontrol
let sunAngle = 0;
const sunRotationSpeed = degToRad(20);

let birdOffsetX = 0;
const birdSpeed = 112.5;
const BIRD_WING = 22.5;
const BIRD_SPAN = WIDTH + 2 * BIRD_WING;

let sunScale = 1;
const sunScaleSpeed = 0.8;

let isNight = false;
let isPaused = false;
let animTime = 0;

// Mengembalikan semua state ke kondisi awal
function resetScene() {
  sunAngle = 0;
  birdOffsetX = 0;
  sunScale = 1;
  isNight = false;
  isPaused = false;
  animTime = 0;
}

// Input: panah = state-based (kontinu), W/E/R = event-based (sekali tekan)
const keys = {};

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (key.startsWith("arrow")) {
    event.preventDefault();
  }

  if (event.repeat) return;

  if (key === "w") isNight = !isNight;
  if (key === "e") isPaused = !isPaused;
  if (key === "r") resetScene();
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

// Membatasi value di rentang [min, max]
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Membaca tombol panah setiap frame (burung bergerak, matahari di-scale)
function handleInput(dt) {
  if (keys["arrowleft"])  birdOffsetX -= birdSpeed * dt;
  if (keys["arrowright"]) birdOffsetX += birdSpeed * dt;
  if (keys["arrowup"])    sunScale += sunScaleSpeed * dt;
  if (keys["arrowdown"])  sunScale -= sunScaleSpeed * dt;

  birdOffsetX = wrap(birdOffsetX, 0, BIRD_SPAN);
  sunScale = clamp(sunScale, 0.5, 1.5);
}

// Animasi hanya berjalan saat tidak di-pause; kontrol tetap aktif
function update(dt) {
  handleInput(dt);

  if (!isPaused) {
    animTime += dt;
    sunAngle += sunRotationSpeed * dt;
  }
}

// Menggambar seluruh scene (yang digambar belakangan ada di depan)
function drawScene(seconds) {
  gl.viewport(0, 0, canvas.width, canvas.height);

  const bg = hexToRgba(COLOR.paper);
  gl.clearColor(bg[0], bg[1], bg[2], 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  drawSky();
  if (isNight) {
    drawStars(seconds);
    drawMoon();
  } else {
    drawSun();
  }
  drawGround();
  drawMountains();
  drawBirds(seconds);
  drawRoad();
  drawGrass(seconds);
  drawHouse();
  drawTree();
}

// Rendering loop
let lastTime = 0;

function render(time) {
  const dt = Math.min((time - lastTime) * 0.001, 0.05);
  lastTime = time;

  update(dt);
  drawScene(animTime);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
