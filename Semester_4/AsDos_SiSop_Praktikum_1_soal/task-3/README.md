# Pertunjukan Drama Raja Setan Manchester
Anton merupakan seseorang yang bekerja di FIFA di divisi IT-Dev. Ia sangat suka untuk bermain sepakbola dan menonton pertandingan. Tapi karena bobot pekerjaanya yang sangat berat, Anton dan teman-temanya tidak dapat mengikuti berita sepakbola terbaru. Sebuah ide terbesit di pikiran Anton, ia ingin untuk membuat sebuah script yang dapat menampilkan hasil pertandingan bola yang sedang berlangsung, beserta riwayat pertandingan sebelumnya. Bantulah Anton untuk membuatkan sistem yang dapat membantunya untuk melihat statistik, hasil, dan riwayat pertandingan sepakbola favoritnya. 

## 1. Login dan Register
Untuk memastikan tidak sembarang orang bisa menggunakan aplikasi ini, Anton memutuskan untuk membuat sistem login. Buat sebuah script bernama: `register.sh`. Script ini digunakan untuk mendaftarkan user baru ke dalam sistem. dengan format sebagai berikut :
```sh
Nama lengkap 
Tanggal lahir
Role
```
Contoh Input : 
```
Nama: Anton Gonzales
Tanggal lahir (yyyy-mm-dd): 1969-06-09
Role: Analyst
```
Akan terdapat sebanyak 3 role dengan rincian sebagai berikut : 
```sh
1. Coach
2. Analyst
3. Player
```

### Pembuatan Username & Password
Sistem akan membuat username dan password secara otomatis dengan aturan username: `Kata pertama dari nama lengkap`. Contoh: `Anton Gonzales --> Username: Anton`. Password: `Username + tahun lahir + role`,  contoh: `Anton09061969Analyst`. Data kemudian disimpan ke dalam `/storage/users.txt` dengan format:
```
namaLengkap,tanggal lahir,role,username,password
```
Contoh:
```
Lionel Messi,2003-04-12,Player,Lionel,Lionel2003Player
```

Setelah membuat script `register.sh`, buatlah script `login.sh` agar user dapat melakukan login dan mengakses aplikasi. 
```sh
Username
Password
```
Sistem akan memeriksa apakah data tersebut cocok dengan data pada `users.txt`. Semua aktivitas login/register akan dicatat dalam file `/storage/log/log.txt` dengan format seperti berikut:
- Jika pengguna mencoba register dengan username yang sudah terdaftar :
```log
[ERROR] DD/MM/YY | hh:mm:ss REGISTER: User {USERNAME} sudah terdaftar!
```

- Jika register berhasil
```log
[INFO] DD/MM/YY | hh:mm:ss REGISTER: User {USERNAME} berhasil didaftarkan!
```

- Jika login gagal
```log
[ERROR] DD/MM/YY | hh:mm:ss LOGIN: Gagal melakukan login pada user {USERNAME}!
```

- Jika login berhasil
```log
[INFO] DD/MM/YY | hh:mm:ss LOGIN: User {USERNAME} berhasil login!
```

- Jika logout berhasil
```log
[INFO] DD/MM/YY | hh:mm:ss LOGIN: User {USERNAME} berhasil logout!
```

*Catatan*: Sistem hanya mengizinkan satu pengguna login pada satu waktu. Jika sudah ada pengguna aktif berdasarkan log, login dari pengguna lain tidak diproses sampai sesi sebelumnya berakhir (User yang sedang login melakukan logout).

Setelah user berhasil melakukan login, script `login.sh` akan menampilkan 4 opsi seperti berikut:
``` sh
===== Pertunjukan Drama Raja Setan Manchester =====
1. Lihat statistik pertandingan
2. Hapus user
3. Ubah waktu pengarsipan
4. Keluar
```

## 2. Penampil Statistik Pertandingan
Setelah membantu Anton untuk membuat sistem login dan register, Anton kemudian meminta mu untuk membuatkan `script.sh` yang akan berisi template laporan seperti berikut:
```sh
====================================================
           LAPORAN STATISTIK PERTANDINGAN
====================================================

Tanggal Laporan : [YYYY MM DD]
Waktu Generate  : [ss:mm:hh]

----------------------------------------------------
STATISTIK UMUM
----------------------------------------------------

Total Pertandingan        : [TOTAL_MATCH]
Total Gol                 : [TOTAL_GOALS]
Rata-rata Shots           : [AVG_SHOTS]

----------------------------------------------------
PERTANDINGAN TERBARU {team1} VS {team2}
----------------------------------------------------

PEMENANG                 : [WINNER]
GOL {team1}              : [GOALWINNINGTEAM]
GOL {team2}              : [GOALLOSINGTEAM]
AVERAGE SHOTS {team1}    : [AVERAGESHOTTEAM1]
AVERAGE SHOTS {team2}    : [AVERAGESHOTTEAM1]

----------------------------------------------------
RIWAYAT PERTANDINGAN 
----------------------------------------------------
No | Home Team | Away Team | Score | Shots | Winner
----------------------------------------------------
1  | Barca     | Madrid    | 2-1   | 12-9  | Barca
2  | City      | Arsenal   | 1-1   | 10-10 | Draw
```
Riwayat pertandingan hanya akan menampilkan maksimal hasil dari 5 pertandingan sebelumnya. 

**Untuk menjaga keamanan aplikasinya, Anton menginginkan agar `script.sh` tidak dapat dibuka sembarangan dan hanya dapat dijalankan jika terpanggil pada `login.sh`.**

Setiap `script.sh` yang dipanggil untuk menampilkan statistik pertandingan akan dicatat juga pada `/storage/log/log.txt` dengan format sebagai berikut:
- Jika perbedaan skor lebih dari 2:
``` log
[INFO] DD/MM/YY | hh:mm:ss MATCH: HAHAHA, {timKalah} menjadi penghibur yang sangat lucu!
```

- Jika perbedaan skor kurang dari sama dengan 2:
```log
[INFO] DD/MM/YY | hh:mm:ss MATCH: GACOR, {timMenang} menang bolo!
```

- Jika pertandingan Draw
```log
[INFO] DD/MM/YY | hh:mm:ss MATCH: Kok malah DRAW, ga seru ah!
```

Selain mencatat log, hasil pertandingan yang di generate oleh `script.sh` juga akan disimpan pada file tersendiri di directory `storage/matchStatistic` dengan format nama file:
```
MATCH_YY-MM-DD_MM:HH.txt
```

*Catatan*: Silahkan gunakan crontab untuk menjalankan `generate.sh` setiap 2 menit . Data yang dihasilkan oleh `generate.sh` yang nantinya akan digunakan oleh `script.sh` untuk menampilkan statistik pertandingan.

## 3. Penghapusan User
Jika user memilih `2` maka akan menampilkan daftar akun yang ingin dan dapat dihapus. Syarat untuk menghapus akun adalah `loggedUserLevel > targetUserLevel`, dengan level user sebagai berikut:
```
Coach   = 3
Analyst = 2
Player  = 1
```
User yang sudah dihapus tidak dapat lagi digunakan untuk melakukan login dan user hanya dapat menghapus akun lain dengan `targetUserLevel` yang lebih rendah (tidak boleh setara atau lebih tinggi).

## 4. Pengarsipan
Setelah membuat program yang sangat kompleks, Anton juga ingin merapihkan penyimpanan sistem. Oleh karena itu, bantulah Anton kembali untuk mengarsipkan setiap hasil pertandingan ketika `script.sh` dipanggil yang telah disimpan pada directory `/storage/matchStatistic`. Setiap hasil file yang di generate akan dikumpulkan dan diarsipkan kedalam ZIP file dengan default waktu selama 2 jam menggunakan script `archive.sh`. Hasil ZIP file akan dimasukan kedalam directory `/storage/archive`.

Format penamaan ZIP file adalah seperti berikut:
```txt
MATCH_archive_YYYYMMDD_HHMM.zip
```

Bila user memilih opsi `3` pada script `login.sh`, maka user dapat mengubah interval pengarsipan dengan memasukan input dalam menit seperti berikut:
```txt
Masukan interval pengarsipan (dalam menit): 
```
*Catatan*: Jika user tidak memasukan angka, gunakan waktu default 2 jam. 