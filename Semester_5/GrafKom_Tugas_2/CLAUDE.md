# Petunjuk proyek

Baca `docs/PROJECT_PLAN.md`, `docs/REQUIREMENTS_TRACEABILITY.md`, dan `docs/ROADMAP.md` sebelum mengubah proyek. Naskah tugas menyebut **tiga minggu** dan maksimal dua anggota.

- Target: scene CCWS ITS dari luar (sudah ada) ditambah interior sederhana dan pameran inovasi (kereta, motor listrik, lengan robot) yang dapat dikenali, dengan beberapa interaksi bermakna. Semuanya dibuat dengan WebGL2 langsung dan shader GLSL ES 3.00.
- Kriteria penilaian: kompleksitas, kemiripan dengan real, pembagian, lighting dan texture, kemampuan menjelaskan, dan kemampuan menyelesaikan challenge. Pemetaannya ada di `docs/REQUIREMENTS_TRACEABILITY.md`.
- Halaman utama harus memuat nama kelompok, foto dan video asli, canvas dekat foto, pohon hubungan objek, dan pembagian tugas.
- Tidak ada library 3D (Three.js, Babylon.js, dsb.). Vite hanya server pengembangan dan alat build. Jangan menambah dependensi tanpa alasan jelas.
- Renderer WebGL2 ada di `src/webgl/` dan satu-satunya pemilik state WebGL. Kamera di `src/camera/`. Model di `src/models/` (dikelompokkan: `shared/`, `building/`, `exterior/`, `interior/`, `exhibits/`) hanya membuat simpul scene dan geometri (tidak membuat context atau loop animasi sendiri). Siang–malam dan animasi di `src/world/`. Satu loop `requestAnimationFrame` di `src/core/createApp.js`.
- Bagian yang bergerak memakai simpul pivot di sendi/engsel/poros. Matriks dunia = matriks dunia induk × matriks lokal.
- Mode kamera jalan (WASD) sudah ada atas permintaan tim, dengan tabrakan kotak sederhana; jangan dikembangkan menjadi sistem tabrakan atau fisika penuh. Di luar target: fisika dan mode multipemain. Picking dengan mouse hanya jika mudah dan tidak mengubah arsitektur renderer.
- Ukuran yang belum diukur adalah perkiraan; denah interior bersifat konseptual. Pertahankan foto dan video referensi; jangan memakai model 3D eksternal atau gambar sebagai pengganti pemodelan.
- Jalankan build dan uji browser sesuai perubahan. Jangan menyatakan fitur selesai sebelum diuji; laporkan keterbatasan yang masih ada.
