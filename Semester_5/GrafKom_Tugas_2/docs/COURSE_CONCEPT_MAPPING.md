# Pemetaan Konsep Grafika ke Kode

Setiap konsep di bawah sudah diimplementasikan dan diuji di browser. Nama fungsi dipakai sebagai acuan karena nomor baris bisa berubah.

| Konsep | Di mana | Penjelasan singkat |
|---|---|---|
| WebGL context dan program | `src/webgl/renderer.js` → `createRenderer`, `createProgram`, `compileShader` | `canvas.getContext('webgl2')`, kompilasi vertex dan fragment shader GLSL ES 3.00, link program, ambil lokasi uniform. |
| Buffer dan atribut | `renderer.js` → `uploadGeometry` | Satu VAO per geometri: buffer posisi (location 0), normal (1), UV (2), dan index buffer; digambar dengan `drawElements`. |
| Geometri | `src/webgl/geometry.js` → `box`, `cylinder`, `sphere`, `gablePrism`, `profilePrism`, `extrudedPolygon` | Semua bentuk dibangun dari poligon cembung (`fromPolygons`): normal per sisi (flat shading) dan UV dalam meter, sehingga tekstur bisa diulang menurut ukuran nyata. |
| Transformasi | `src/webgl/mat4.js` → `translation`, `rotationX/Y/Z`, `scaling`, `compose` | Matriks 4×4 column-major untuk vektor kolom. Matriks lokal = T · Rz · Ry · Rx · S (skala dulu, lalu rotasi, lalu translasi). |
| Hierarki (scene graph) | `src/webgl/sceneNode.js` → `createNode`, `traverse` | Matriks dunia anak = dunia induk × lokal anak. Menggerakkan induk (mis. `FrontFacade`) ikut menggerakkan seluruh anaknya. |
| Pivot | `src/models/building/ccwsBuilding.js` → `doorLeaf`, `awningSash`, `wheelieBin`; `environment.js` → `createTree` | Simpul pivot diletakkan di engsel atau poros. Animasi hanya memutar pivot; anak-anaknya ikut berputar mengelilingi titik itu. |
| Kamera | `src/camera/orbitCamera.js`, `mat4.js` → `lookAt`, `perspective` | Kamera orbit: posisi mata dari yaw, pitch, dan jarak ke target. Matriks view = `lookAt`, proyeksi = `perspective` (FOV diubah per preset). `flyTo` menginterpolasi antar sudut. |
| Kamera orang (WASD) | `src/camera/walkCamera.js`, `src/world/walkArea.js` | Posisi mata di tinggi 1,6 m; arah pandang dari yaw dan pitch (mouse), lalu `lookAt(mata, mata + arah)`. WASD menggeser posisi sepanjang vektor maju dan kanan kamera dikali kecepatan × `delta`. Tabrakan: kotak-kotak di bidang tanah dicek per sumbu sehingga kamera bisa menyusur dinding. |
| Normal matrix | `mat4.js` → `normalMatrix` | Invers-transpose 3×3 dari matriks dunia, agar normal tetap tegak lurus walau ada skala tak seragam. |
| Lighting: ambient | fragment shader `LIT_FS` | Ambient hemisfer: campuran warna langit dan tanah menurut arah normal. |
| Lighting: diffuse dan specular | `LIT_FS` | Lambert (`max(dot(n, L), 0)`) dan Blinn-Phong (`pow(dot(n, h), shininess)`) untuk matahari/bulan dan setiap lampu titik. |
| Lampu titik | `LIT_FS` (array `uPointPosition`, `uPointColor`, `uPointRange`), `ccwsBuilding.js` → `lamps` | Tiga lampu (portal dan kanopi), redaman `(1 - d / range)²`, menyala sesuai `lampLevel`. |
| Bayangan | `renderer.js` → `lightSpaceMatrix`, `renderShadowPass`, `sunVisibility` | Shadow mapping: adegan dirender dari matahari (proyeksi ortografis) ke depth texture 2048², lalu tiap fragmen dibandingkan kedalamannya, dengan PCF 3×3 dan bias. |
| Siang–malam | `src/world/dayNight.js` → `environmentAt` | Jam 0–24 diubah menjadi arah dan warna matahari/bulan, warna langit, kabut, dan tingkat lampu. |
| Langit | `renderer.js` → `SKY_VS`, `SKY_FS`, `renderSky` | Segitiga layar penuh; arah pandang dihitung dengan invers (proyeksi × view), lalu gradasi, piringan matahari, dan bintang. |
| Tekstur gambar | `renderer.js` → `getTexture`, `uploadImage`; `MATERIALS.paving` | Gambar `paving-herringbone.jpg` (dari foto tim) diunggah sebagai tekstur, mipmap, `REPEAT`, filter anisotropik. |
| Tekstur prosedural | `src/models/shared/proceduralTextures.js` | Plester, noda alas, beton, genteng, teralis, rumput sintetis, kerikil, dan plafon digambar di canvas 2D (value noise yang bisa diulang), lalu dipakai sebagai tekstur WebGL. |
| Bump mapping | `LIT_FS` → `bumpNormal` | Kecerahan tekstur dianggap tinggi permukaan; normal dimiringkan memakai turunan layar (`dFdx`, `dFdy`), tanpa tangent. |
| Alpha test | `LIT_FS` dan `SHADOW_FS` (`discard`) | Huruf papan nama: piksel transparan dibuang, juga di pass bayangan, sehingga huruf menjatuhkan bayangan berbentuk huruf. |
| Pantulan dan emisi | `LIT_FS` (`uReflect`, `uEmissive`) | Kaca mencampur warna langit menurut Fresnel; jendela dan lampu memancarkan cahaya saat malam. |
| Animasi | `src/world/animator.js` | Berbasis waktu (`time`, `delta`), jadi kecepatan sama di semua komputer: pengunjung berjalan dan pintu yang membuka saat mereka lewat (`peopleMotion.js`), petugas menyapu, pohon, palem, dan urai hierarki. |
| Lubang pada dinding | `src/models/shared/parts.js` → `slabWithOpenings`; `ccwsBuilding.js` → `createWalls`, `wallOpenings` | Dinding berongga dibuat dari kotak-kotak di sekeliling bukaan jendela dan pintu (dipotong menjadi strip horizontal), sehingga interior bisa dilihat dari dalam dan lewat pintu terbuka. |
| Simpul tersembunyi | `sceneNode.js` → `traverse` (`visible === false`) | Simpul dan seluruh turunannya dilewati; dipakai "Buka atap" untuk atap dan plafon. |
| Hierarki artikulasi (robot) | `src/models/exhibits/robotArm.js` | Dasar → `BaseYawPivot` → bahu → siku → pergelangan → gripper → jari. Setiap pivot ada di pusat sendinya; sudut disimpan di objek state, dibatasi, dan diterapkan sebagai rotasi pivot. Memutar bahu membawa siku, lengan bawah, pergelangan, dan gripper. |
| Ambil dan lepas objek | `robotArm.js` → `grab`, `release`, `eulerFromMatrix` | Saat diambil, kotak pindah dari `RobotArmRoot` menjadi anak `GripperRoot` dengan transformasi lokal tetap. Saat dilepas, matriks akar→gripper (hasil kali induk × lokal sepanjang rantai) dikalikan transformasi lokal kotak, lalu diurai kembali menjadi posisi dan sudut Euler (urutan T·Rz·Ry·Rx) agar posisi dan orientasi dunianya tetap. |
| Pivot roda | `src/models/exhibits/motorcycle.js` → `createWheel` | Pivot di pusat poros (poros sejajar Z); hanya rotasi Z pivot yang berubah, rangka tidak ikut. Kecepatan naik dan turun dengan percepatan tetap berbasis `delta`. |
| Cahaya siang dari dalam | `renderer.js` → `glowDay`; `interior.js` → `pane` | Panel jendela memancarkan cahaya sebesar `1 − lampLevel`, jadi terang siang hari dan padam malam hari. |
| Lampu titik interior | `createApp.js` (`draw`), `interior.js` → `INTERIOR_LAYOUT` | Lampu langit-langit digabung dengan lampu luar menjadi array `pointLights` (maksimal 8 untuk shader). Warna semua lampu dikali `lampLevel` dari `dayNight.js`, dan bahan lampu plafon memakai glow yang sama, jadi semuanya menyala saat senja dan padam saat fajar. |
