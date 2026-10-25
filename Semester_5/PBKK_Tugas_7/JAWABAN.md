# Jawaban Tugas 7 – Lost and Found Departemen Teknik Informatika

## 1. Perbedaan aplikasi desktop dengan aplikasi lain, dan mengapa masih dibutuhkan

### Perbedaan

| Aspek | Aplikasi Desktop | Aplikasi Web | Aplikasi Mobile |
| --- | --- | --- | --- |
| Cara berjalan | Di-*install* dan berjalan langsung di sistem operasi (Windows, macOS, Linux) | Berjalan di browser dan diakses lewat URL | Di-*install* di HP/tablet (Android/iOS) |
| Kebutuhan server | Tidak harus; bisa sepenuhnya lokal atau memakai berkas/folder bersama | Wajib ada *web server* dan *hosting* | Umumnya butuh *backend*/API |
| Akses ke perangkat | Penuh: sistem berkas, folder jaringan, printer, *hardware* | Terbatas oleh *sandbox* browser | Bisa ke kamera dan GPS, tetapi dibatasi izin OS |
| Kinerja | Tinggi, memakai CPU/RAM PC secara langsung | Bergantung pada browser dan jaringan | Dibatasi baterai dan spesifikasi perangkat |
| Koneksi internet | Bisa berjalan *offline* atau cukup di jaringan lokal (LAN) | Umumnya perlu koneksi | Sebagian fitur perlu koneksi |
| Antarmuka | Layar lebar, *mouse* dan *keyboard*, banyak jendela | Responsif mengikuti ukuran browser | Layar kecil dan berbasis sentuhan |
| Distribusi dan *update* | Lewat *installer*/berkas .exe, *update* per PC | Cukup diperbarui sekali di server | Lewat Play Store/App Store |

### Mengapa aplikasi desktop masih dibutuhkan

1. **Kinerja dan responsivitas.** Aplikasi berat seperti IDE (Visual Studio), desain (Photoshop, Figma Desktop), editor video, dan CAD membutuhkan akses langsung ke *hardware*.
2. **Bisa berjalan tanpa internet atau server.** Cocok untuk lingkungan tertutup seperti kantor, laboratorium, kasir, dan rumah sakit. Aplikasi Lost and Found ini cukup memakai satu database di folder bersama jaringan departemen, tanpa perlu *hosting*.
3. **Akses penuh ke sistem.** Aplikasi bisa membaca dan menulis berkas, mengakses folder jaringan, printer, dan perangkat lain. Contohnya, aplikasi ini menyimpan dan mengompres foto barang langsung ke folder bersama.
4. **Keamanan dan kendali data.** Data tetap berada di jaringan internal instansi, bukan di server pihak ketiga.
5. **Produktivitas.** Layar lebar, *shortcut keyboard*, dan banyak jendela cocok untuk pekerjaan administrasi dan input data yang intensif.
6. **Integrasi dengan ekosistem Windows.** Banyak instansi masih memakai PC Windows, sehingga aplikasi WPF/.NET bisa langsung dipakai tanpa infrastruktur tambahan.

## 2. Problem yang diselesaikan dan fitur aplikasi sebagai solusinya

### Problem

Di lingkungan Departemen Teknik Informatika, informasi barang hilang dan barang temuan belum dikelola dengan baik:

1. **Informasi tersebar dan cepat tenggelam.** Pengumuman barang hilang atau temuan dikirim ke berbagai grup chat dan papan pengumuman, lalu tertimbun pesan lain.
2. **Tidak ada tempat terpusat untuk mencari.** Orang yang kehilangan harus bertanya satu per satu, dan penemu tidak tahu harus melapor ke mana.
3. **Laporan tidak lengkap.** Laporan sering tanpa foto, lokasi, tanggal, atau kontak, sehingga sulit mencocokkan barang dengan pemiliknya.
4. **Status tidak jelas.** Tidak diketahui barang mana yang sudah dikembalikan atau ditemukan, sehingga informasi lama terus beredar.
5. **Tidak ada kontrol data.** Siapa pun bisa mengubah informasi, dan posting palsu atau tidak pantas tidak ada yang mengendalikan.

### Fitur sebagai solusi

| No | Problem | Fitur Solusi |
| --- | --- | --- |
| 1 | Informasi tersebar | **Dua dashboard terpusat**, yaitu *Barang Temuan* dan *Laporan Kehilangan*, dalam bentuk kartu berfoto. Semua PC memakai satu database dan folder foto bersama, sehingga posting dari satu pengguna langsung terlihat oleh pengguna lain. |
| 2 | Sulit mencari | **Pencarian dan filter.** Cari berdasarkan nama barang, deskripsi, atau lokasi; filter kategori, lokasi, dan rentang tanggal; urutkan dari yang terbaru atau terlama. |
| 3 | Laporan tidak lengkap | **Form posting terstruktur dengan validasi.** Isian wajib: nama barang, foto (wajib untuk barang temuan), kategori, lokasi, tanggal (tidak boleh di masa depan), deskripsi, dan kontak. |
| 4 | Status tidak jelas | **Status dan arsip otomatis.** Jika status diubah menjadi *Dikembalikan* atau *Ditemukan*, posting otomatis masuk arsip dan hilang dari dashboard. Halaman **Posting Saya** (tab Aktif dan Arsip) memudahkan pengguna mengelola postingnya dan memulihkan arsip jika salah mengubah status. |
| 5 | Tidak ada kontrol data | **Akun dan kepemilikan.** Pengguna mendaftar dan login dengan NIM/NIP dan kata sandi. Kata sandi disimpan dalam bentuk *hash*, dan hanya pemosting yang dapat mengedit, menghapus, dan mengubah status postingnya. |
| 6 | Posting palsu atau tidak pantas | **Takedown oleh Admin.** Admin dapat menghapus permanen posting yang melanggar ketentuan beserta fotonya, selalu dengan konfirmasi. |
