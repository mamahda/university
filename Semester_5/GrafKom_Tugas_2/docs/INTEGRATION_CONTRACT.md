# Kesepakatan Integrasi

Struktur kode yang sekarang dipakai:

| Bagian | File | Tugas |
|---|---|---|
| Renderer | `src/webgl/renderer.js` | Satu-satunya pemilik WebGL context, shader, buffer, tekstur, dan shadow map. Menerima scene graph, kamera, dan data lingkungan per frame. |
| Matematika dan geometri | `src/webgl/mat4.js`, `geometry.js`, `sceneNode.js` | Matriks, bentuk dasar, dan simpul hierarki. Tidak menyentuh WebGL. |
| Kamera | `src/camera/orbitCamera.js`, `src/world/cameraPresets.js` | Kamera orbit dan sudut-sudut yang dicocokkan dengan foto. |
| Model | `src/models/building/ccwsBuilding.js`, `environment.js`, `parts.js`, `proceduralTextures.js` | Hanya membuat data: simpul, geometri, dan material. Mengembalikan `root`, simpul yang dianimasikan (`animated`), dan lampu (`lamps`). Tidak membuat context atau loop. |
| Dunia | `src/world/dayNight.js`, `animator.js` | Siang–malam (data cahaya dan langit) dan animasi berbasis waktu yang mengubah pivot. |
| Aplikasi dan UI | `src/core/createApp.js`, `src/ui/*` | Loop `requestAnimationFrame`, opsi halaman, pohon objek. |

Material adalah objek biasa: `color`, opsional `texture` (URL atau canvas), `tileSize` (meter per pengulangan), `flatColor` (warna saat tekstur dimatikan), `specular`, `shininess`, `bump`, `reflect`, `emissive` dan `glow`, `emissiveMask`, `alphaTest`, `castShadow`.

Model interior dan pameran mengikuti pola yang sama dengan tambahan antarmuka kendali:

| Modul | Mengembalikan |
|---|---|
| `createInterior()` | `root`, `ceiling` (untuk potongan), `workspaceLights`, `exhibitionLights` (diredupkan otomatis menurut `lampLevel`) |
| `createTrain()` | `root`, `update(delta)`, `setDoorOpen(on)`, `setLightsOn(on)`, `state()` |
| `createMotorcycle()` | `root`, `update(delta, { spin })`, `setPowered(on)`, `state()` |
| `createRobotArm()` | `root`, `update(delta)`, `setJoint(name, nilai)`, `setPose`, `resetPose`, `pickPose`, `grab()` (ambil atau lepas), `resetCube`, `getTarget`, `getCurrent`, `isHolding` |
| `createExhibition()` | `root`, `train`, `motorcycle`, `robot`, `update(delta, { animate })` |

Model tidak mengimpor UI; `src/ui/bindUI.js` memanggil metode di atas lewat `app.exhibits`. Lampu titik interior diteruskan ke renderer oleh `createApp.js` (maksimal 8 sekaligus). Properti material tambahan: `glowAlways` (menyala terus) dan `glowDay` (menyala hanya siang). Simpul dengan `visible = false` tidak digambar.

Koordinasikan perubahan file bersama. Proyek tidak memakai library 3D apa pun; satu-satunya dependensi adalah Vite sebagai server pengembangan.
