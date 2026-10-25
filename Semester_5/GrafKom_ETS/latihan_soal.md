# Soal & Jawaban Grafika Komputer (WebGL)

Kumpulan soal latihan beserta jawaban dan penjelasannya, dirapikan dari riwayat chat. Topiknya meliputi pipeline grafis, transformasi, viewing dan proyeksi, pencahayaan (model Phong), texture mapping, hierarchical modeling, serta WebGL/GLSL.

> Catatan bertanda ⚠️ ditambahkan saat konversi pada jawaban yang perlu dicek ulang.

---

## Soal 1

Apa peran shininess coefficient dalam model Phong?

- **a.** Menambah warna spektrum baru
- **b.** Mengubah arah sumber cahaya
- **c.** Menentukan tingkat kilauan material
- **d.** Menentukan warna ambient

**✅ Jawaban: c. Menentukan tingkat kilauan material**

Dalam model pencahayaan Phong, shininess coefficient (disebut juga *specular exponent*, $n$) mengatur seberapa tajam atau lembut pantulan cahaya specular pada permukaan objek.

- Nilai shininess **besar** → pantulan specular kecil dan tajam, menandakan permukaan mengilap (logam atau plastik halus).
- Nilai shininess **kecil** → pantulan lebih lebar dan lembut, menandakan permukaan kusam (matte).

Koefisien ini menentukan tingkat kilauan material, bukan warna atau arah cahaya.

---

## Soal 2

Apa yang dimaksud dengan koordinat tekstur dalam texture mapping?

- **a.** Hasil proyeksi objek ke layar
- **b.** Koordinat 3D dari permukaan
- **c.** Titik-titik pada gambar yang akan dimapkan ke permukaan
- **d.** Posisi objek di ruang dunia

**✅ Jawaban: c. Titik-titik pada gambar yang akan dimapkan ke permukaan**

Dalam texture mapping, koordinat tekstur (biasanya $(u, v)$) menentukan bagian mana dari gambar tekstur yang ditempelkan ke permukaan objek 3D.

- $(u, v)$ adalah posisi 2D pada gambar tekstur, biasanya dinormalisasi dari 0 sampai 1.
- Koordinat ini dipetakan ke permukaan objek 3D, sehingga setiap titik pada objek tahu bagian gambar mana yang menjadi teksturnya.

Koordinat tekstur bukan koordinat ruang dunia atau layar, melainkan koordinat pada gambar tekstur itu sendiri.

---

## Soal 3

Apa yang dimaksud dengan rendering equation pada model Phong?

- **a.** Persamaan untuk menghitung tekstur objek
- **b.** Persamaan untuk menghitung proses interaksi antara cahaya yang diserap dan dipantulkan
- **c.** Metode untuk menghapus objek dari layar
- **d.** Persamaan untuk mengukur ukuran objek

**✅ Jawaban: b. Persamaan untuk menghitung proses interaksi antara cahaya yang diserap dan dipantulkan**

Rendering equation pada model Phong menghitung warna akhir suatu titik di permukaan dengan mempertimbangkan interaksi cahaya dengan material. Ada tiga komponen:

1. **Ambient**: cahaya latar umum yang tersebar di seluruh ruang.
2. **Diffuse**: cahaya yang disebarkan merata ke segala arah ketika mengenai permukaan kasar.
3. **Specular**: cahaya yang dipantulkan secara terarah dari permukaan halus dan mengilap.

$$
I = I_a k_a + I_l \left[ k_d (L \cdot N) + k_s (R \cdot V)^n \right]
$$

dengan:

- $I$ = intensitas akhir
- $I_a$, $I_l$ = intensitas cahaya ambient dan sumber cahaya
- $k_a$, $k_d$, $k_s$ = koefisien refleksi material
- $L$, $N$, $R$, $V$ = vektor cahaya, normal, refleksi, dan pandangan
- $n$ = shininess coefficient

---

## Soal 4

Dalam transformasi majemuk, mengapa urutan matriks penting?

- **a.** Karena urutan matriks tidak mempengaruhi hasil
- **b.** Karena matriks paling kiri diabaikan
- **c.** Karena matriks pertama akan menentukan warna objek
- **d.** Karena matriks yang paling kanan dikomputasi terlebih dahulu

**✅ Jawaban: d. Karena matriks yang paling kanan dikomputasi terlebih dahulu**

Dalam transformasi majemuk (*composite transformation*), translasi, rotasi, dan skala digabung lewat perkalian matriks. Perkalian matriks **tidak komutatif**:

$$
A \times B \neq B \times A
$$

Dalam grafika komputer (OpenGL/WebGL, koordinat homogen), matriks paling kanan diterapkan lebih dulu pada vektor titik:

$$
P' = M_3 \times M_2 \times M_1 \times P
$$

Artinya titik $P$ dikenai $M_1$ dulu, lalu $M_2$, terakhir $M_3$. Urutan yang berbeda bisa memberi hasil yang berbeda total.

---

## Soal 5

Perhatikan code berikut:

```js
window.addEventListener("keydown", function() {
   render();
});
```

Pada potongan code di atas, fungsi `render()` akan dipanggil ketika pengguna _______

**✅ Jawaban: menekan tombol pada keyboard**

Event `keydown` mendeteksi saat pengguna menekan tombol keyboard. Begitu event terjadi, fungsi callback, yaitu `render()`, dijalankan. Jadi `render()` dieksekusi setiap kali pengguna menekan tombol di keyboard.

---

## Soal 6

Bagaimana warna disimpan di framebuffer pada sistem warna RGBA?

- **a.** Hanya menyimpan informasi untuk warna hitam putih
- **b.** Sebagai nilai 4 dimensi RGB dan A (opacity)
- **c.** Sebagai RGB saja
- **d.** Sebagai alpha dan beta

**✅ Jawaban: b. Sebagai nilai 4 dimensi RGB dan A (opacity)**

Setiap piksel pada framebuffer menyimpan empat komponen:

- **R (Red)**: intensitas merah
- **G (Green)**: intensitas hijau
- **B (Blue)**: intensitas biru
- **A (Alpha)**: transparansi/opacity

Nilai alpha:

- A = 1 → piksel sepenuhnya tidak transparan (opaque)
- A = 0 → piksel sepenuhnya transparan

---

## Soal 7

Bagaimana normal vector dihitung untuk permukaan bidang (plane)?

- **a.** Menggunakan sudut antara dua vektor
- **b.** Menggunakan hasil perkalian skalar antara dua vektor
- **c.** Menggunakan cross product dari dua vektor
- **d.** Menggunakan dot product dari dua titik

**✅ Jawaban: c. Menggunakan cross product dari dua vektor**

Jika ada tiga titik pada bidang, $P_1, P_2, P_3$, maka dua vektor pada bidang:

$$
\vec{v_1} = P_2 - P_1, \qquad \vec{v_2} = P_3 - P_1
$$

Vektor normal bidang:

$$
\vec{n} = \vec{v_1} \times \vec{v_2}
$$

Hasil cross product adalah vektor yang tegak lurus (normal) terhadap bidang.

---

## Soal 8

Apa kegunaan dari `gl.enable(gl.DEPTH_TEST)` dalam WebGL?

- **a.** Menambahkan warna pada objek
- **b.** Menghapus objek di layar
- **c.** Mempercepat rendering objek 2D
- **d.** Mengaktifkan algoritma z-buffer untuk hidden-surface removal

**✅ Jawaban: d. Mengaktifkan algoritma z-buffer untuk hidden-surface removal**

```js
gl.enable(gl.DEPTH_TEST);
```

Perintah ini mengaktifkan *depth testing* menggunakan Z-buffer, sehingga hanya permukaan yang paling dekat dengan kamera yang ditampilkan dan permukaan di belakangnya disembunyikan (*hidden-surface removal*). Tanpa depth test, objek di belakang bisa menimpa objek di depan sehingga hasil render tampak salah.

---

## Soal 9

Jenis proyeksi apa dalam grafika komputer di mana semua proyektor bertemu di satu titik (centre of projection)?

- **a.** Perspective projection
- **b.** Parallel projection
- **c.** Isometric projection
- **d.** Orthographic projection

**✅ Jawaban: a. Perspective projection**

- **Parallel projection**: semua garis proyektor sejajar, tidak bertemu di satu titik.
- **Perspective projection**: semua garis proyektor bertemu di satu titik pusat proyeksi (*centre of projection*).

Pada perspective projection, objek yang jauh tampak lebih kecil dan yang dekat tampak lebih besar, meniru cara mata manusia melihat.

---

## Soal 10

Pada proses "Computer Viewing", posisi kamera diatur melalui:

- **a.** Model-view matrix
- **b.** Projection matrix
- **c.** Frustum setting
- **d.** Clipping matrix

**✅ Jawaban: a. Model-view matrix**

- **Model matrix**: mengatur posisi dan orientasi objek dalam dunia 3D.
- **View matrix**: mengatur posisi dan arah pandang kamera.

Gabungan keduanya adalah **model-view matrix**, yang mentransformasi koordinat dari world space ke view/camera space. Jadi posisi kamera diatur melalui model-view matrix.

---

## Soal 11

Jika sebuah objek diputar terhadap sumbu z pada dimensi 3D, apa yang akan terjadi pada elemen z?

- **a.** Elemen z akan berubah
- **b.** Elemen z akan digeser
- **c.** Elemen z akan dihapus
- **d.** Elemen z akan tetap sama

**✅ Jawaban: d. Elemen z akan tetap sama**

Rotasi terhadap sumbu z hanya memengaruhi koordinat x dan y:

$$
R_z(\theta) =
\begin{bmatrix}
\cos\theta & -\sin\theta & 0 & 0 \\
\sin\theta & \cos\theta & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

Baris dan kolom ketiga hanya berisi 1 pada diagonal dan 0 di tempat lain, sehingga komponen z tidak berubah.

---

## Soal 12

Perhatikan potongan code berikut:

```js
var thetaLoc = gl.getUniformLocation(program, ”Theta");

var theta[0] = 0.0;
var theta[1] = 0.0;
var theta[2] = 0.0;

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    theta[1] += 10.0;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    render();
}
```

Vertex shader:

```glsl
#version 300 es

in  vec4 aPosition;
in  vec4 aColor;
out vec4 vColor;

uniform vec3 uTheta;

void main()
{
    vec3 angles = radians(uTheta);
    vec3 c = cos(angles);
    vec3 s = sin(angles);

    // Remember: these matrices are column-major
    mat4 rx = mat4(1.0,  0.0,  0.0, 0.0,
                   0.0,  c.x,  s.x, 0.0,
                   0.0, -s.x,  c.x, 0.0,
                   0.0,  0.0,  0.0, 1.0);

    mat4 ry = mat4(c.y, 0.0, -s.y, 0.0,
                   0.0, 1.0,  0.0, 0.0,
                   s.y, 0.0,  c.y, 0.0,
                   0.0, 0.0,  0.0, 1.0);

    vColor = aColor;
    gl_Position = rx * ry * aPosition;
    gl_Position.z = -gl_Position.z;
}
```

Dari code di atas, ada 1 baris code yang error yang berhubungan dengan pengiriman uniform variable dari aplikasi ke vertex shader. Perbaiki 1 baris code tersebut.

**✅ Baris yang salah:**

```js
var thetaLoc = gl.getUniformLocation(program, ”Theta");
```

**Masalahnya:**

- Nama uniform tidak sama dengan yang dideklarasikan di shader (`uniform vec3 uTheta;`), sedangkan di JavaScript tertulis `"Theta"`.
- Tanda kutip pembukanya juga salah format (kutip miring/*smart quote*).

**Perbaikan:**

```js
var thetaLoc = gl.getUniformLocation(program, "uTheta");
```

`gl.getUniformLocation()` mencari uniform berdasarkan nama yang harus sama persis dengan deklarasi di shader. Jika tidak cocok, `thetaLoc` bernilai `null` dan `gl.uniform3fv()` tidak mengirim nilai apa pun ke shader.

---

## Soal 13

Apa yang dilakukan oleh Rasterizer dalam pipeline grafis?

- **a.** Menangani input pengguna
- **b.** Menghasilkan fragmen untuk setiap objek
- **c.** Mengelola alokasi memori
- **d.** Mengonversi objek 3D menjadi gambar 2D

**✅ Jawaban (versi chat): d. Mengonversi objek 3D menjadi gambar 2D**

Rasterizer mengubah representasi geometris menjadi kumpulan fragmen 2D di layar:

1. Menerima output vertex processing (koordinat di ruang layar).
2. Menentukan piksel/fragmen yang dilalui primitif (segitiga, garis).
3. Menginterpolasi atribut (warna, koordinat tekstur, depth) untuk setiap fragmen.

Fragmen hasilnya kemudian diproses di fragment shader sebelum ditampilkan.

> ⚠️ **Catatan:** Di buku Angel & Shreiner (*Interactive Computer Graphics*), yang umum dipakai untuk materi WebGL, rasterizer dijelaskan sebagai tahap yang **menghasilkan sekumpulan fragmen untuk setiap objek**. Jika soal mengacu ke buku/slide tersebut, kemungkinan jawaban yang diharapkan adalah **b. Menghasilkan fragmen untuk setiap objek**.

---

## Soal 14

Terdapat suatu variabel `positionLoc` sebagai berikut: `{ -1, -1, 0, 1, 1, -1 }`

Ada berapa titik yang akan muncul di canvas jika vertex tersebut dibaca dengan code berikut?

```js
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
```

**✅ Jawaban: 2 titik**

Data berisi 6 elemen FLOAT. Parameter kedua `gl.vertexAttribPointer` bernilai `3`, artinya setiap vertex terdiri dari 3 komponen (x, y, z).

$$
\frac{6 \text{ elemen}}{3 \text{ komponen per vertex}} = 2 \text{ vertex}
$$

---

## Soal 15

Bagaimana cara mendefinisikan tekstur dari file gambar GIF dalam WebGL?

- **a.** Memuat gambar dengan objek Image di JavaScript
- **b.** Menghapus piksel biru dari gambar
- **c.** Menggunakan fungsi gl.clear
- **d.** Mengatur filter mode menjadi "linear"

**✅ Jawaban: a. Memuat gambar dengan objek Image di JavaScript**

```js
var texture = gl.createTexture();
var image = new Image();

image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
};

image.src = "gambar.gif";
```

- `new Image()` memuat file gambar.
- `gl.texImage2D()` menyalin data gambar ke memori tekstur GPU.
- `gl.generateMipmap()` membuat level mipmap secara otomatis.

---

## Soal 16

Apa tujuan dari clipping dalam grafika komputer?

- **a.** Untuk meningkatkan warna dalam gambar
- **b.** Untuk hanya menampilkan objek-objek yang berada dalam view volume
- **c.** Untuk mengurangi penggunaan memori
- **d.** Untuk menciptakan efek 3D

**✅ Jawaban: b. Untuk hanya menampilkan objek-objek yang berada dalam view volume**

Clipping memotong bagian objek yang berada di luar area pandang (*view volume*/frustum) agar tidak ditampilkan atau diproses lebih lanjut. Dilakukan sebelum rasterisasi untuk menyederhanakan perhitungan, menghemat waktu rendering, dan menghindari tampilnya objek yang seharusnya tidak terlihat.

---

## Soal 17

Apa yang dilakukan oleh event listener dalam aplikasi interaktif?

- **a.** Memproses event yang dipicu oleh user
- **b.** Mengatur warna dari objek
- **c.** Mengatur posisi layar
- **d.** Menghapus objek dari layar

**✅ Jawaban: a. Memproses event yang dipicu oleh user**

Event listener mendeteksi dan merespons aksi pengguna, misalnya:

- `click`: pengguna mengklik mouse
- `keydown`: pengguna menekan tombol keyboard
- `mousemove`: pengguna menggerakkan mouse
- `resize`: ukuran jendela diubah

```js
window.addEventListener("keydown", function() {
    render();
});
```

---

## Soal 18

Selain informasi mengenai letak vertex yang membentuk objek dan warna objek, informasi apa lagi yang harus dimiliki oleh objek agar kita bisa melakukan perhitungan cahaya?

**✅ Jawaban: vektor normal (normal vector)**

Untuk menghitung pencahayaan (misalnya model Phong atau Blinn-Phong), setiap permukaan harus memiliki vektor normal, yaitu vektor yang tegak lurus terhadap permukaan. Normal dipakai untuk menentukan:

- seberapa besar intensitas cahaya yang diterima titik tersebut,
- arah pantulan cahaya (specular reflection),
- warna akhir piksel berdasarkan posisi cahaya dan sudut pandang kamera.

Tanpa vektor normal, shader tidak bisa menghitung komponen diffuse maupun specular.

---

## Soal 19

Perhatikan pseudocode berikut:

```glsl
// vertex shader
#version 300 es

in vec4 aPosition;
in vec3 aColor;
out vec3 fColor;

void main()
{
    gl_PointSize = 1.0;
    gl_Position = aPosition;
    fColor = aColor;
}
```

```glsl
// fragment shader
#version 300 es
precision mediump float;

out vec4 fColor;
in vec3 vColor;

void main()
{
    fColor = vec4(vColor, 0.5);
}
```

Terdapat error pada fragment shader di atas, seharusnya …

**✅ Jawaban:**

Nama variabel warna tidak konsisten antara kedua shader. Vertex shader mengeluarkan `out vec3 fColor;`, tetapi fragment shader menerima `in vec3 vColor;`. Keduanya harus bernama sama agar data warna bisa diteruskan.

Perbaikan pada fragment shader: ubah `in vec3 vColor;` menjadi `in vec3 fColor;`. Karena nama `fColor` juga dipakai sebagai output, output sebaiknya diganti nama (misalnya `fragColor`) agar tidak bentrok:

```glsl
#version 300 es
precision mediump float;

in vec3 fColor;
out vec4 fragColor;

void main()
{
    fragColor = vec4(fColor, 0.5);
}
```

---

## Soal 20

Apa perbedaan sumber cahaya dengan nilai w = 1.0 dan w = 0.0 dalam koordinat homogen?

- **a.** w = 1.0 untuk cahaya jauh, w = 0.0 untuk cahaya dekat
- **b.** w = 1.0 untuk posisi titik jelas, w = 0.0 untuk cahaya jauh
- **c.** Tidak ada perbedaan
- **d.** w = 1.0 untuk warna, w = 0.0 untuk intensitas

**✅ Jawaban: b. w = 1.0 untuk posisi titik jelas, w = 0.0 untuk cahaya jauh**

| Nilai w | Jenis sumber cahaya | Penjelasan |
|---|---|---|
| w = 1.0 | Positional light (cahaya titik) | Cahaya berasal dari titik tertentu di ruang 3D (misalnya lampu meja); intensitas berkurang seiring jarak. |
| w = 0.0 | Directional light (cahaya arah) | Cahaya dianggap datang dari jarak tak terhingga sehingga sinarnya sejajar (seperti matahari); tidak ada pelemahan karena jarak. |

---

## Soal 21

Apa fungsi utama dari "LookAt" dalam pengaturan kamera?

- **a.** Mengubah skala objek
- **b.** Menentukan posisi cahaya pada objek
- **c.** Mengatur posisi dan orientasi kamera
- **d.** Mengatur warna pada objek yang dilihat

**✅ Jawaban: c. Mengatur posisi dan orientasi kamera**

Fungsi LookAt (misalnya `gluLookAt()` atau `mat4.lookAt()` di glMatrix) menentukan dari mana kamera melihat, ke arah mana kamera menghadap, dan arah atas kamera:

```c
gluLookAt(eyeX, eyeY, eyeZ,           // posisi kamera
          centerX, centerY, centerZ,  // titik yang dilihat
          upX, upY, upZ);             // arah atas kamera
```

Hasilnya adalah view matrix yang mentransformasi objek dari world space ke camera (view) space.

---

## Soal 22

Komponen berikut mana yang merupakan bagian dari sistem grafika?

- **a.** Mikrofon
- **b.** Ethernet Port
- **c.** Graphical Processing Unit (GPU)
- **d.** Optical Drive

**✅ Jawaban: c. Graphical Processing Unit (GPU)**

GPU melakukan komputasi grafis seperti rendering, shading, dan transformasi objek 2D/3D, serta bekerja sama dengan CPU dan framebuffer dalam pipeline grafis. Opsi lain tidak terkait sistem grafika:

- Mikrofon → perangkat input suara
- Ethernet port → koneksi jaringan
- Optical drive → membaca media CD/DVD

---

## Soal 23

Apa fungsi halfway vector dalam model Phong-Blinn?

- **a.** Mengatur arah cahaya
- **b.** Mengganti normal vector
- **c.** Mengubah warna cahaya
- **d.** Mempermudah perhitungan term specular

**✅ Jawaban: d. Mempermudah perhitungan term specular**

Halfway vector $H$ berada di antara arah cahaya $L$ dan arah pandang $V$:

$$
H = \frac{L + V}{\lVert L + V \rVert}
$$

- **Phong klasik**: specular dihitung dengan $(R \cdot V)^n$, perlu menghitung vektor refleksi $R$ (lebih berat).
- **Blinn-Phong**: specular dihitung dengan $(N \cdot H)^n$, lebih efisien dengan hasil visual serupa.

---

## Soal 24

Apa fungsi stack dalam traversal tree pada hierarchical modeling?

- **a.** Mempercepat proses rendering
- **b.** Menghapus node yang tidak diperlukan
- **c.** Menyimpan warna dan tekstur
- **d.** Menyimpan model-view matrix sementara

**✅ Jawaban: d. Menyimpan model-view matrix sementara**

Dalam hierarchical modeling, objek kompleks (robot, manusia, kendaraan) direpresentasikan sebagai tree. Saat traversal, stack dipakai untuk:

- **push**: menyimpan model-view matrix saat masuk ke cabang baru (misalnya dari badan ke lengan),
- **pop**: mengembalikan matrix sebelumnya saat kembali ke induk (misalnya selesai menggambar lengan kiri, kembali ke badan).

Dengan begitu transformasi tiap bagian tetap konsisten.

---

## Soal 25

Apa fungsi utama dari texture mapping?

- **a.** Mengganti warna objek
- **b.** Memindahkan objek dalam ruang 3D
- **c.** Menghapus bayangan pada objek
- **d.** Menambahkan detail visual pada permukaan objek

**✅ Jawaban: d. Menambahkan detail visual pada permukaan objek**

Texture mapping menempelkan gambar 2D (texture image) ke permukaan objek 3D menggunakan koordinat $(u, v)$, sehingga objek tampak lebih detail dan realistis (misalnya dinding bata atau bola bertekstur planet) tanpa menambah jumlah poligon.

---

## Soal 26

Perangkat mana yang memungkinkan pengguna berinteraksi dengan setiap piksel pada layar?

- **a.** Keyboard
- **b.** Touchscreen
- **c.** Data tablet
- **d.** Joystick

**✅ Jawaban: b. Touchscreen**

Touchscreen memungkinkan pengguna berinteraksi langsung dengan piksel di layar melalui sentuhan jari atau stylus (memilih, menggeser, zoom, menggambar).

- Keyboard → input teks/tombol, tidak terkait posisi piksel.
- Data tablet → interaksi dengan pena, tetapi di permukaan terpisah, bukan langsung di layar.
- Joystick → navigasi/kontrol arah.

---

## Soal 27

Apa peran dari `gl_PointSize` pada vertex shader?

- **a.** Menghapus objek dari layar
- **b.** Mengganti warna titik
- **c.** Menentukan ukuran titik yang akan dirender
- **d.** Mengatur ukuran objek 3D

**✅ Jawaban: c. Menentukan ukuran titik yang akan dirender**

```glsl
void main() {
    gl_Position = aPosition;
    gl_PointSize = 10.0; // ukuran titik 10 piksel
}
```

`gl_PointSize` menentukan ukuran (diameter) titik saat menggambar dengan mode `gl.POINTS`. Jika tidak diatur, ukuran default biasanya 1.0 piksel.

---

## Soal 28

Apa fungsi dari `gl.getUniformLocation()` dalam aplikasi WebGL?

- **a.** Menghapus objek dari buffer
- **b.** Mengambil lokasi variabel uniform dari shader
- **c.** Mengganti warna background
- **d.** Menentukan posisi dari sebuah objek

**✅ Jawaban: b. Mengambil lokasi variabel uniform dari shader**

```js
var thetaLoc = gl.getUniformLocation(program, "uTheta");
gl.uniform3fv(thetaLoc, [0.0, 0.0, 0.0]);
```

Setelah lokasi diperoleh, nilai dikirim ke uniform dengan fungsi seperti `gl.uniform1f()`, `gl.uniform3fv()`, atau `gl.uniformMatrix4fv()`.

---

## Soal 29

Apa keuntungan utama dari menggunakan "double buffering"?

- **a.** Memungkinkan menampilkan objek dengan lebih cepat
- **b.** Menghindari tampilan render yang parsial
- **c.** Menambah warna pada objek
- **d.** Mengurangi penggunaan memori GPU

**✅ Jawaban: b. Menghindari tampilan render yang parsial**

Double buffering memakai dua buffer:

1. **Back buffer**: tempat gambar sedang dirender (tidak terlihat).
2. **Front buffer**: buffer yang sedang ditampilkan di layar.

Setelah rendering di back buffer selesai, kedua buffer ditukar (*swap buffers*), sehingga yang tampil selalu gambar lengkap tanpa flicker atau tearing.

---

## Soal 30

Apa fungsi framebuffer dalam sistem grafika?

- **a.** Mengelola alokasi memori untuk proses CPU
- **b.** Menampung piksel yang akan ditampilkan di layar
- **c.** Memproses perintah grafis dan menggambar bentuk geometris
- **d.** Menyimpan data input dari perangkat seperti keyboard dan mouse

**✅ Jawaban: b. Menampung piksel yang akan ditampilkan di layar**

Framebuffer adalah area memori yang menyimpan nilai setiap piksel hasil rendering. Isinya mencakup:

- **Color buffer**: nilai warna (biasanya RGBA)
- **Depth buffer (Z-buffer)**: kedalaman tiap piksel untuk menentukan visibilitas
- **Stencil buffer**: untuk efek khusus seperti masking atau bayangan

---

## Soal 31

Apa yang membedakan proyeksi planar dari non-planar dalam viewing?

- **a.** Proyeksi planar menggunakan lensa khusus
- **b.** Proyeksi planar tidak membutuhkan permukaan proyeksi
- **c.** Proyeksi planar dilakukan tanpa objek
- **d.** Proyeksi planar dilakukan pada bidang datar

**✅ Jawaban: d. Proyeksi planar dilakukan pada bidang datar**

| Jenis proyeksi | Ciri utama | Permukaan proyeksi |
|---|---|---|
| Planar | Titik objek diproyeksikan ke bidang datar | Datar (misalnya bidang $z = 0$) |
| Non-planar | Titik objek diproyeksikan ke permukaan melengkung (bola, silinder) | Melengkung |

Contoh: orthographic dan perspective projection termasuk planar; panorama, dome display, atau VR mapping termasuk non-planar.

---

## Soal 32

Mengapa lighting dan shading diperlukan dalam grafika komputer?

- **a.** Untuk memberikan warna pada objek
- **b.** Untuk mempercepat proses rendering
- **c.** Untuk membuat model lebih besar
- **d.** Untuk membuat objek terlihat lebih realistis

**✅ Jawaban: d. Untuk membuat objek terlihat lebih realistis**

Tanpa lighting dan shading, objek hanya tampak datar (flat color). Dengan keduanya, sistem dapat menampilkan specular highlight, bagian terang-gelap (diffuse shading), serta kesan kedalaman, sehingga objek terlihat lebih alami.

---

## Soal 33

Benar atau salah: "Agar bisa mengaplikasikan tekstur ke dalam suatu objek, kita membutuhkan informasi vektor normal."

**✅ Jawaban: Salah**

Untuk texture mapping biasa yang dibutuhkan adalah **koordinat tekstur (u, v)**, bukan vektor normal.

- Koordinat tekstur menentukan bagian gambar mana yang ditempelkan ke tiap vertex.
- Vektor normal dipakai untuk perhitungan pencahayaan.

Normal baru ikut berperan pada teknik lanjutan seperti bump mapping atau normal mapping, tetapi tidak diperlukan untuk sekadar menempelkan tekstur.

---

## Soal 34

Apa tujuan dari transformasi inversi pada matriks transformasi?

- **a.** Menghapus objek dari layar
- **b.** Menduplikasi objek
- **c.** Mengembalikan objek ke posisi awal
- **d.** Mengubah skala objek

**✅ Jawaban: c. Mengembalikan objek ke posisi awal**

Transformasi inversi membatalkan efek transformasi sebelumnya:

- Translasi +5 pada sumbu X → inversinya translasi −5.
- Rotasi 30° → inversinya rotasi −30°.
- Skala 2× → inversinya skala ½×.

Contoh penggunaannya: mengubah world space ke view space, dan mengembalikan transformasi pada hierarchical modeling.

---

## Soal 35

Tahap pemrosesan mana yang bertanggung jawab untuk menentukan warna dan kedalaman piksel dalam rendering grafis?

- **a.** Fragment Processor
- **b.** Rasterizer
- **c.** Vertex Processor
- **d.** Primitive Assembler

**✅ Jawaban: a. Fragment Processor**

Fragment processor (fragment shader) menghitung warna akhir piksel dari warna interpolasi vertex, tekstur, pencahayaan, dan efek lain (misalnya transparansi), serta menyiapkan nilai depth (z) untuk depth test.

| Tahap | Fungsi utama |
|---|---|
| Vertex Processor | Menghitung posisi vertex di ruang layar |
| Primitive Assembler | Menggabungkan vertex menjadi primitif (garis, segitiga) |
| Rasterizer | Mengubah primitif menjadi fragmen |
| **Fragment Processor** | **Menentukan warna dan kedalaman tiap piksel** |

---

## Soal 36

Apa peran fungsi `glTexImage2D` dalam WebGL?

- **a.** Menghapus tekstur dari buffer
- **b.** Mendefinisikan tekstur sebagai array dari texel
- **c.** Memutar tekstur pada objek
- **d.** Mengubah ukuran tekstur

**✅ Jawaban: b. Mendefinisikan tekstur sebagai array dari texel**

```js
gl.texImage2D(target, level, internalformat, format, type, source);
```

- `target`: biasanya `gl.TEXTURE_2D`
- `level`: level mipmap (0 untuk tekstur utama)
- `internalformat`: format penyimpanan di GPU (misalnya `gl.RGBA`)
- `format`: format data sumber (misalnya `gl.RGBA`)
- `type`: tipe data (misalnya `gl.UNSIGNED_BYTE`)
- `source`: sumber data (Image, Canvas, Video, atau TypedArray)

```js
var texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
```

---

## Soal 37

Perhatikan potongan code berikut:

```js
for (var theta = 0.0; theta < thetaMax; theta += dtheta) {
    vertices[0] = vec2(Math.sin(theta), Math.cos(theta));
    vertices[1] = vec2(Math.sin(theta), -Math.cos(theta));
    vertices[2] = vec2(-Math.sin(theta), -Math.cos(theta));

    gl.bufferSubData(/* ... */);
    render();
}
```

Potongan code di atas berfungsi untuk membuat bangun segitiga terus berputar. Benar/salah, proses perhitungan transformasi pada segitiga tersebut dilakukan pada GPU?

- True
- False

**✅ Jawaban (versi chat): True**

Penjelasan versi chat: data vertex dikirim ke GPU dengan `gl.bufferSubData(...)`, lalu vertex shader, rasterisasi, dan shading dijalankan di GPU.

> ⚠️ **Catatan:** Jawaban ini kemungkinan keliru. Posisi vertex yang sudah diputar dihitung ulang di **JavaScript** (`Math.sin`, `Math.cos`) lalu dikirim lewat `gl.bufferSubData` setiap iterasi. Artinya perhitungan rotasinya dilakukan di **CPU (aplikasi)**, bukan di GPU. Jawaban yang lebih tepat: **False**. Rotasi baru dikerjakan GPU jika sudut dikirim sebagai uniform (misalnya `uTheta`) dan rotasinya dihitung di vertex shader.

---

## Soal 38

Apa yang ditangani oleh GPU dalam sistem grafika?

- **a.** Perangkat Input
- **b.** Manajemen Memori
- **c.** Seluruh proses rendering
- **d.** Komunikasi antar jaringan

**✅ Jawaban: c. Seluruh proses rendering**

Tugas GPU meliputi transformasi koordinat (model, view, projection), perhitungan lighting dan shading, rasterisasi, menjalankan vertex dan fragment shader, serta mengelola tekstur, warna, dan depth buffer. Semua dijalankan secara paralel sehingga jauh lebih cepat dibanding CPU.

---

## Soal 39

Apa fungsi dari matriks translasi 4×4 pada koordinat homogen?

- **a.** Memindahkan objek di ruang 3D
- **b.** Menghapus objek dari ruang
- **c.** Mengubah warna objek
- **d.** Menggandakan objek

**✅ Jawaban: a. Memindahkan objek di ruang 3D**

$$
T(x, y, z) =
\begin{bmatrix}
1 & 0 & 0 & x \\
0 & 1 & 0 & y \\
0 & 0 & 1 & z \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

Jika dikalikan dengan vektor posisi homogen $[X, Y, Z, 1]^T$:

$$
\begin{bmatrix} X + x \\ Y + y \\ Z + z \\ 1 \end{bmatrix}
$$

Objek dipindahkan sejauh $(x, y, z)$. Bentuk 4×4 memungkinkan translasi digabung dengan transformasi lain dalam satu perkalian matriks.

---

## Soal 40

Mengapa proyeksi perspektif memberikan hasil yang lebih realistis dibandingkan proyeksi paralel?

- **a.** Karena semua objek terlihat dengan ukuran yang sama
- **b.** Karena objek yang lebih jauh terlihat lebih kecil
- **c.** Karena tidak ada distorsi sudut
- **d.** Karena hanya menggunakan satu jenis lensa

**✅ Jawaban: b. Karena objek yang lebih jauh terlihat lebih kecil**

Pada proyeksi perspektif, garis proyeksi bertemu di satu titik pusat proyeksi, mirip mata atau kamera. Objek yang jauh tampak lebih kecil sehingga gambar memiliki kesan kedalaman. Pada proyeksi paralel, garis proyeksi sejajar sehingga ukuran objek tetap sama berapa pun jaraknya.

---

## Soal 41

Metode apa yang digunakan untuk memetakan tekstur ke permukaan sederhana sebelum dipindahkan ke objek sebenarnya?

- **a.** Backward mapping
- **b.** Two-part mapping
- **c.** Spherical mapping
- **d.** Box mapping

**✅ Jawaban: b. Two-part mapping**

Two-part mapping terdiri dari dua langkah:

1. Tekstur dipetakan ke permukaan perantara yang sederhana (bidang, silinder, atau bola).
2. Permukaan perantara itu kemudian dipetakan ke permukaan objek 3D yang sebenarnya.

Cara ini membuat pemetaan lebih fleksibel untuk objek dengan bentuk kompleks.

---

## Soal 42

Di mana proses transformasi dapat dilakukan dalam pipeline grafika?

- **a.** Dalam aplikasi atau di vertex shader
- **b.** Di dalam canvas
- **c.** Di CPU saja
- **d.** Hanya dalam fragment shader

**✅ Jawaban: a. Dalam aplikasi atau di vertex shader**

1. **Di aplikasi (CPU)**: transformasi dihitung di program (JavaScript/C++), lalu hasilnya dikirim ke GPU. Sederhana untuk objek statis, tetapi membebani CPU.
2. **Di vertex shader (GPU)**: transformasi dilakukan paralel untuk setiap vertex dengan matriks model, view, projection. Lebih cepat dan cocok untuk animasi real-time.

Fragment shader tidak menangani transformasi; tahap itu fokus pada pewarnaan dan pencahayaan piksel.

---

## Soal 43

Apa keuntungan utama dari model hierarchical dalam grafika komputer?

- **a.** Mempermudah proses rendering dinamis
- **b.** Menampilkan semua node secara otomatis
- **c.** Menghapus kebutuhan matrix transformasi
- **d.** Mengurangi jumlah node

**✅ Jawaban: a. Mempermudah proses rendering dinamis**

Dalam model hierarkis, transformasi pada induk (parent) otomatis memengaruhi anak (child). Setiap bagian bisa bergerak relatif terhadap bagian lain tanpa menghitung ulang seluruh posisi secara manual, sehingga efisien untuk animasi robot, karakter manusia, atau sistem mekanik.

---

## Soal 44

Berikut adalah potongan pseudocode di dalam fragment shader untuk mengaplikasikan tekstur ke suatu objek. Lengkapi bagian yang kosong.

```glsl
in vec4 vColor;            // color from rasterizer
in vec2 TexCoord;          // texture coordinate from rasterizer
uniform sampler2D Texture; // texture object from application

void main() {
    gl_FragColor = vColor * texture( _____________ );
}
```

**✅ Jawaban: `Texture, TexCoord`**

```glsl
void main() {
    gl_FragColor = vColor * texture(Texture, TexCoord);
}
```

`texture(Texture, TexCoord)` mengambil warna texel dari objek tekstur pada koordinat tekstur yang diteruskan dari vertex shader. Hasilnya dikalikan dengan warna interpolasi `vColor` untuk menghasilkan warna akhir piksel.

---

## Soal 45

Apa yang dilakukan oleh fungsi `gl.clearColor()`?

- **a.** Menambahkan efek transparan pada objek
- **b.** Merender objek dengan warna putih
- **c.** Mengatur warna background dari layar
- **d.** Mengubah warna elemen HTML

**✅ Jawaban: c. Mengatur warna background dari layar**

```js
gl.clearColor(0.0, 0.0, 0.0, 1.0); // background hitam
gl.clear(gl.COLOR_BUFFER_BIT);
```

Parameter `gl.clearColor(r, g, b, a)` bernilai 0.0–1.0. Setelah itu `gl.clear(gl.COLOR_BUFFER_BIT)` mengisi seluruh layar dengan warna tersebut.

---

## Soal 46

Jika potongan code di dalam aplikasi, vertex shader, dan fragment shader adalah seperti berikut, berwarna apakah objek yang digambar di canvas?

```js
// Aplikasi
let color = new Float32Array([ 0,0,1,  0,1,0,  1,0,0 ]);
var bufferColor = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferColor);
gl.bufferData(gl.ARRAY_BUFFER, color, gl.STREAM_DRAW);

var attributeColor = gl.getAttribLocation(program, "aColor");
gl.vertexAttribPointer(attributeColor, 3, gl.FLOAT, false, 0, 0);
```

```glsl
// vertex shader
in vec4 aPosition;
in vec3 aColor;
out vec3 vColor;

void main()
{
    gl_PointSize = 1.0;
    gl_Position = aPosition;
    vColor = aColor;
}
```

```glsl
// fragment shader
#version 300 es
precision mediump float;
out vec4 fColor;
in vec3 vColor;

void main()
{
    fColor = vec4(vColor, 0.5);
}
```

**✅ Jawaban: gradasi biru–hijau–merah dengan transparansi 50% (semi transparan)**

1. Data warna dari aplikasi:
   - Vertex 1 → biru `(0, 0, 1)`
   - Vertex 2 → hijau `(0, 1, 0)`
   - Vertex 3 → merah `(1, 0, 0)`
2. Vertex shader meneruskan warna tiap vertex ke fragment shader tanpa diubah (`vColor = aColor`).
3. Fragment shader memakai warna hasil interpolasi antar-vertex dengan alpha 0.5.

Hasilnya segitiga bergradasi merah–hijau–biru yang setengah transparan.

---

## Soal 47

Bagaimana intensitas cahaya yang dipantulkan pada permukaan diffuse dihitung dalam model Phong?

- **a.** Menggunakan nilai dot product antara arah cahaya dan normal permukaan
- **b.** Menggunakan skala objek
- **c.** Menggunakan sudut rotasi objek
- **d.** Menggunakan jumlah vertex pada permukaan

**✅ Jawaban: a. Menggunakan nilai dot product antara arah cahaya dan normal permukaan**

$$
I_{diffuse} = k_d \, I_L \, \max(0, \vec{N} \cdot \vec{L})
$$

dengan $k_d$ koefisien refleksi diffuse, $I_L$ intensitas sumber cahaya, $\vec{N}$ normal permukaan, dan $\vec{L}$ arah datang cahaya. Semakin besar nilai dot product, semakin terang pantulan diffuse.

---

## Soal 48

Apa tujuan utama dari hierarchical modeling?

- **a.** Untuk menggambar objek dengan cepat
- **b.** Untuk menampilkan warna pada objek
- **c.** Untuk mengurangi kompleksitas komputasi
- **d.** Untuk merepresentasikan hubungan antara bagian-bagian objek

**✅ Jawaban: d. Untuk merepresentasikan hubungan antara bagian-bagian objek**

Contoh: robot memiliki badan, kepala, lengan, kaki; lengan terdiri dari bahu, siku, dan tangan. Jika bahu bergerak, siku dan tangan ikut bergerak secara relatif. Setiap bagian memiliki transformasi lokal terhadap induknya, dan hubungan ini dikelola dengan matrix stack saat traversal tree.

---

## Soal 49

Model pencitraan manakah yang digambarkan mengikuti cahaya dari suatu sumber hingga interaksinya dengan objek?

- **a.** Rasterization
- **b.** Ray Tracing
- **c.** Pinhole Camera Model
- **d.** Radiosity

**✅ Jawaban: b. Ray Tracing**

Ray tracing menelusuri jalur sinar cahaya dan interaksinya dengan objek, termasuk pantulan, pembiasan, bayangan, dan cahaya tidak langsung.

- **Forward ray tracing**: dari sumber cahaya ke kamera.
- **Backward ray tracing** (lebih umum): dari kamera ke sumber cahaya, demi efisiensi.

Hasilnya sangat realistis tetapi butuh komputasi lebih besar dibanding rasterization.

---

## Soal 50

Model Phong terdiri dari komponen apa saja?

- **a.** Diffuse, refractive, dan emissive
- **b.** Ambient, reflective, dan emissive
- **c.** Diffuse, specular, dan ambient
- **d.** Diffuse, refractive, dan shadow

**✅ Jawaban: c. Diffuse, specular, dan ambient**

1. **Ambient**: cahaya latar yang tersebar; mencegah bagian bayangan benar-benar gelap.
   $$I_{ambient} = k_a I_a$$
2. **Diffuse**: pantulan menyebar sesuai hukum Lambert, bergantung pada sudut antara cahaya dan normal.
   $$I_{diffuse} = k_d I_L \max(0, \vec{N} \cdot \vec{L})$$
3. **Specular**: pantulan terarah yang memberi efek kilau.
   $$I_{specular} = k_s I_L (\vec{R} \cdot \vec{V})^n$$

---

## Soal 51

Suatu elemen geometry dinyatakan dengan `vec4{3, 2, 4, 1}`, maka elemen tersebut berupa:

**✅ Jawaban: titik (point) dalam ruang 3D homogen**

| Nilai w | Jenis elemen | Arti |
|---|---|---|
| w = 1 | Titik (point) | Posisi absolut di ruang 3D |
| w = 0 | Vektor arah (direction) | Arah tanpa posisi tetap |

Karena w = 1, `vec4{3, 2, 4, 1}` adalah titik dengan koordinat $(x, y, z) = (3, 2, 4)$.

---

## Soal 52

Apa yang dimaksud dengan ambient light dalam model Phong?

- **a.** Cahaya dari banyak sumber yang tersebar di lingkungan
- **b.** Cahaya dari satu sumber langsung
- **c.** Cahaya yang hanya terlihat oleh kamera
- **d.** Cahaya yang memantulkan warna merah

**✅ Jawaban: a. Cahaya dari banyak sumber yang tersebar di lingkungan**

Ambient light berasal dari pantulan-pantulan cahaya di lingkungan, tidak memiliki arah tertentu, dan menerangi seluruh permukaan secara konstan, termasuk bagian yang tidak terkena cahaya langsung.

$$
I_{ambient} = k_a \times I_a
$$

dengan $I_a$ intensitas cahaya ambient dan $k_a$ koefisien refleksi ambient material.

---

## Soal 53

Pada rotasi 2D, bagaimana rumus koordinat x' ditentukan jika rotasi dilakukan dengan sudut θ?

- **a.** x' = x cos θ − y sin θ
- **b.** x' = x sin θ + y cos θ
- **c.** x' = x − y
- **d.** x' = x cos θ + y sin θ

**✅ Jawaban: a. x' = x cos θ − y sin θ**

Rotasi titik $(x, y)$ terhadap titik asal sebesar θ (berlawanan arah jarum jam):

$$
\begin{bmatrix} x' \\ y' \end{bmatrix} =
\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}
\begin{bmatrix} x \\ y \end{bmatrix}
$$

$$
x' = x\cos\theta - y\sin\theta, \qquad y' = x\sin\theta + y\cos\theta
$$

---

## Soal 54

Mengapa urutan pembuatan polygon penting dalam menentukan inward dan outward facing polygons?

- **a.** Mempercepat proses rendering
- **b.** Mengubah warna objek
- **c.** Menghemat memori
- **d.** Mempengaruhi hasil rendering

**✅ Jawaban: d. Mempengaruhi hasil rendering**

Urutan vertex (*winding order*) menentukan arah hadap permukaan:

- **Counter-clockwise (CCW)**: biasanya dianggap menghadap ke luar (front face).
- **Clockwise (CW)**: dianggap menghadap ke dalam (back face).

GPU memakai informasi ini untuk back-face culling. Jika urutannya salah, polygon dianggap terbalik dan permukaan yang seharusnya terlihat malah dibuang.

---

## Soal 55

Apa jenis permukaan yang memantulkan cahaya ke semua arah secara merata?

- **a.** Shiny surface
- **b.** Transparent surface
- **c.** Specular surface
- **d.** Diffuse surface

**✅ Jawaban: d. Diffuse surface**

Permukaan diffuse mengikuti hukum Lambert: intensitas pantulan sebanding dengan kosinus sudut antara arah cahaya dan normal.

$$
I = k_d \, I_L \, \max(0, \vec{N} \cdot \vec{L})
$$

Hasilnya warna lembut tanpa kilau, seperti kertas, dinding matte, atau kain.

---

## Soal 56

Apa kegunaan fungsi rotate dan translate dalam hierarchical modeling?

- **a.** Untuk menambahkan node baru
- **b.** Untuk membuat warna objek
- **c.** Untuk menentukan ukuran objek
- **d.** Untuk membentuk matrix transformasi

**✅ Jawaban: d. Untuk membentuk matrix transformasi**

- `translate` memindahkan posisi objek.
- `rotate` memutar objek terhadap sumbu tertentu.

Keduanya membentuk atau memodifikasi matrix transformasi tiap node, yang menggambarkan hubungan spasial antarbagian dalam hierarki. Matrix ini dapat disimpan sementara di matrix stack selama traversal.

---

## Soal 57

Misal suatu objek mempunyai warna biru dan juga dipengaruhi oleh cahaya. Lengkapi code agar objek yang ditampilkan mempunyai efek cahaya yang berinteraksi dengan warna objek.

```glsl
// fragment shader
precision mediump float;
uniform vec4 uAmbientProduct;
uniform vec4 uDiffuseProduct;
uniform vec4 uSpecularProduct;
uniform float uShininess;
in vec3 uN, uL, uE;
out vec4 fColor;

void main()
{
    vec4 vColor;
    vec3 H = normalize(vL + vE);
    vec4 ambient = uAmbientProduct;

    float Kd = max(dot(vL, vN), 0.0);
    vec4 diffuse = Kd * uDiffuseProduct;

    float Ks = pow(max(dot(N, H), 0.0), uShininess);
    vec4 specular = Ks * uSpecularProduct;

    if (dot(L, N) < 0.0)
        specular = vec4(0.0, 0.0, 0.0, 1.0);

    vec3 Warna = vec3(0.0, 0.0, 1.0)

    fColor = __________________;
    fColor.a = 1.0;
}
```

**✅ Jawaban:**

```glsl
fColor = vec4((ambient.rgb + diffuse.rgb) * Warna + specular.rgb, 1.0);
```

---

## Soal 58

Terdapat suatu segitiga dengan posisi titik-titik sebagai berikut:

```js
var vertices = [
    vec2(-2, -2),
    vec2( 0,  2),
    vec2( 2, -2),
];
```

Bangun datar apakah yang akan tampak di layar jika settingan projection matrix-nya adalah sebagai berikut?

```js
projectionMatrix = ortho(0, 0.5, 0, 0.5, 0, 1);
```

**✅ Jawaban (versi chat): tidak ada bangun datar yang tampak (segitiga tidak terlihat)**

Penjelasan versi chat:

1. Koordinat segitiga berada di rentang x dan y dari −2 sampai 2.
2. `ortho(0, 0.5, 0, 0.5, 0, 1)` hanya menampilkan area x: 0 → 0.5, y: 0 → 0.5, z: 0 → 1.
3. Disimpulkan semua titik segitiga berada di luar volume pandang sehingga tidak ada yang terlihat.

> ⚠️ **Catatan:** Jawaban ini kemungkinan keliru. Memang ketiga *vertex* berada di luar volume pandang, tetapi area x ∈ [0, 0.5], y ∈ [0, 0.5] justru **seluruhnya berada di dalam segitiga**: pada y = 0 segitiga membentang x ∈ [−1, 1], dan pada y = 0.5 membentang x ∈ [−0.75, 0.75]. Akibatnya seluruh volume pandang tertutup oleh segitiga (z = 0 tepat di bidang near, masih ikut terlihat), sehingga yang tampak di layar adalah **persegi/kotak yang memenuhi seluruh canvas** dengan warna segitiga.

---

## Soal 59

Berikut adalah potongan code di fragment shader untuk menambahkan efek cahaya pada objek. Lengkapi code agar objek yang ditampilkan mempunyai efek cahaya.

```glsl
// fragment shader
precision mediump float;
uniform vec4 uAmbientProduct;
uniform vec4 uDiffuseProduct;
uniform vec4 uSpecularProduct;
uniform float uShininess;
in vec3 uN, uL, uE;
out vec4 fColor;

void main()
{
    vec4 vColor;
    vec3 H = normalize(vL + vE);
    vec4 ambient = uAmbientProduct;

    float Kd = max(dot(vL, vN), 0.0);
    vec4 diffuse = Kd * uDiffuseProduct;

    float Ks = pow(max(dot(N, H), 0.0), uShininess);
    vec4 specular = Ks * uSpecularProduct;

    if (dot(L, N) < 0.0)
        specular = vec4(0.0, 0.0, 0.0, 1.0);

    fColor = __________________;
    fColor.a = 1.0;
}
```

**✅ Jawaban:**

```glsl
fColor = ambient + diffuse + specular;
```

---

## Soal 60

Manakah dari perangkat berikut yang BUKAN merupakan output device?

- **a.** Cathode-Ray Tube (CRT)
- **b.** Layar Sentuh
- **c.** Printer
- **d.** Mouse

**✅ Jawaban: d. Mouse**

| Perangkat | Jenis | Fungsi |
|---|---|---|
| Cathode-Ray Tube (CRT) | Output | Menampilkan gambar di monitor |
| Layar sentuh | Input & output | Menampilkan gambar dan menerima sentuhan |
| Printer | Output | Mencetak ke media fisik |
| **Mouse** | **Input** | Mengirim perintah/posisi kursor ke komputer |

---

## Soal 61

Terdapat tiga buah objek, yaitu meja, toples, dan bola. Toples diletakkan menempel di atas meja, dan bola berada di dalam toples. Gambarkan hubungan hierarki ketiga objek tersebut.

**✅ Jawaban singkat: Meja → Toples → Bola** (Bola anak dari Toples, Toples anak dari Meja)

```
Meja  (root / parent)
│
└── Toples  (child dari Meja)
      │
      └── Bola  (child dari Toples)
```

| Objek | Transformasi relatif terhadap | Jenis transformasi |
|---|---|---|
| Meja | Dunia (world) | Translasi/rotasi global |
| Toples | Meja | Translasi di atas meja |
| Bola | Toples | Translasi di dalam toples |

Jika meja digerakkan, toples dan bola ikut bergerak; jika toples digeser, bola ikut berpindah secara relatif.

---

## Soal 62

Jika code di dalam fragment shader adalah seperti berikut, berwarna apakah objek yang digambar di canvas?

```glsl
#version 300 es
precision mediump float;
out vec4 fColor;

void main()
{
    fColor = vec4(0.0, 0.0, 1.0, 1.0);
}
```

**✅ Jawaban: biru solid**

- R = 0.0 → tidak ada merah
- G = 0.0 → tidak ada hijau
- B = 1.0 → biru penuh
- A = 1.0 → tidak transparan

---

## Soal 63

Lengkapi code berikut agar objek yang ditampilkan mempunyai tekstur, efek cahaya, dan warna.

```glsl
in vec4 vColor;            // informasi warna objek dari rasterizer
in vec2 TexCoord;          // texture coordinate dari rasterizer
uniform sampler2D Texture; // texture object dari application
in vec4 LightColor;        // hasil perhitungan Phong model dari vertex shader

void main() {
    gl_FragColor = __________________;
}
```

**✅ Jawaban:**

```glsl
gl_FragColor = LightColor * vColor * texture2D(Texture, TexCoord);
```

Warna akhir adalah perkalian tiga komponen: efek cahaya (`LightColor`), warna objek (`vColor`), dan tekstur (`texture2D(Texture, TexCoord)`).

---

## Soal 64

Apa yang salah dari fungsi `torso()` tersebut?

*(Soal asli menyertakan gambar kode yang tidak ikut tersalin.)*

**✅ Jawaban:**

Variabel yang dikirim ke shader tidak konsisten. Baris yang salah:

```js
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instance));
```

Variabel yang dibuat sebelumnya adalah `instanceMatrix = mult(...)`, sedangkan `instance` tidak pernah dideklarasikan sehingga muncul error *"instance is not defined"*.

**Perbaikan:**

```js
gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
```

`instanceMatrix` menyimpan kombinasi transformasi (translate dan scale) dari `modelViewMatrix` untuk menggambar torso dengan benar.

---

## Soal 65

Lengkapi code berikut agar menghasilkan gambar pada soal.

*(Soal asli menyertakan gambar hasil yang tidak ikut tersalin; gambarnya berupa garis-garis yang terhubung berurutan tanpa menutup kembali ke titik awal.)*

```js
gl.drawArrays(_______________, 0, n);
```

**✅ Jawaban:**

```js
gl.drawArrays(gl.LINE_STRIP, 0, n);
```

`gl.LINE_STRIP` menghubungkan setiap vertex secara berurutan tanpa menutup garis kembali ke titik awal (berbeda dengan `gl.LINE_LOOP`, yang menutup bentuknya).