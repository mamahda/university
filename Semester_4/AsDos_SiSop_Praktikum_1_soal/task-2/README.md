# Monyet Punch dan Ayam Wilson

Seekor monyet bernama Punch dan ayam jantan bernama Wilson menjadi terkenal di internet karena perjuangan hidupnya yang tidak mudah. Untuk mengenal Punch dan Wilson, para penggemar membuat sebuah sistem otomatis yang mencatat semua aktivitas mereka sepanjang hari. Semua aktivitas tersebut disimpan dalam file CSV [losiento.csv](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/losiento.csv)

Contoh isi file :

```

    nama_hewan,aksi,durasi_detik,waktu_mulai
    Punch,tidur_siang,7200,20-03-2026 08:10:56
    Punch,makan_siang,650,20-03-2026 12:10:34
    Wilson,bermain,530,20-03-2026 12:15:32
```

Karena data aktivitas Punch dan Wilson semakin banyak dan sulit dianalisis secara manual, penggemar membuat program analisis otomatis menggunakan Shell Script dan AWK. 

a. Penggemar ingin mengetahui aktivitas yang berlangsung lebih dari 2 jam oleh kedua hewan di tanggal 7 Maret 2026. Script untuk analisis ini disimpan dalam file [analisis_a.sh](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/analisis_a.sh). Tampilkan nama hewan, nama aksi dan durasi aktivitas. Format output: `[(Nama_Hewan)] (aktivitas) selama (waktu) detik pada (ddmmyyyy)`. Contoh: `[Punch] tidur siang selama 300 detik pada 07032026`.
Note: karakter _ pada kolom aktivitas diganti dengan spasi.

b. Karena khawatir akan kesehatan Punch dan Wilson yang menurun pada rentang tanggal 1 Maret 2026 sampai 5 Maret 2026, penggemar ingin mengetahui seberapa sering Punch tidur di atas pukul 12.00 siang dan Wilson makan antara pukul 09.00 sampai 19.00. Script untuk analisis ini disimpan dalam file [analisis_b.sh](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/analisis_b.sh) dengan format output sebagai berikut:

`[Punch] tidur sebanyak n kali di atas pukul 12.00 siang.` 

atau

`[Wilson] makan sebanyak n kali dari pukul 08.00 sampai 19.00` 

Note: n merupakan frekuensi dilakukannya aktivitas.

c. Sekarang kamu bertugas untuk mengamati dan mencatat aktivitas yang dilakukan kedua hewan pada file [losiento.csv](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/losiento.csv) di atas. Input dilakukan dengan menjalankan program [input_aktivitas.sh](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/input_aktivitas.sh) dengan ketentuan sebagai berikut:
Format input:
```
Nama :
Aktivitas :
Durasi : 
Waktu mulai :
```
Kemudian kamu harus mencatat riwayat input pada file log yang terpisah berdasarkan nama dan tanggal aktivitas. 
Format penamaan file log adalah sebagai berikut : `(namahewan)_ddmmyyyy.log`. 

File log mencatat aktivitas dengan format sebagai berikut: `[ACCEPTED] (timestamp) : (nama_hewan) (aktivitas) selama (durasi) detik`

Jika input aktivitas yang dimasukkan memiliki durasi lebih besar dari 21600 detik, maka log akan mencatat dengan format sebagai berikut: `[ALERT] (timestamp) : (nama_hewan) (aktivitas) selama (durasi) detik`


d. Setelah aktivitas Punch dan Wilson dicatat pada file log, buatlah script [backup_log.sh](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/backup_log.sh) yang:

- Mengarsipkan semua file .log yang memiliki tanggal yang sama
- Menyimpannya dengan format: `backup_log_ddmmyyyy.zip`, misalnya: `backup_log_08032026.zip`
- Menampilkan isi file zip tersebut.

Contoh output setelah script dijalankan:
```
Log berhasil diarsipkan.
Isi arsip:
Punch_07032026.log
Wilson_07032026.log
```

e. Penggemar ingin agar proses pengarsipan dijalankan secara otomatis setiap pukul 23:59 menggunakan [backup_log.sh](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/backup_log.sh). Karena jumlah arsip semakin banyak, maka setiap pukul 02:34 sistem akan menghapus arsip yang sudah berusia lebih dari 7 hari menggunakan script [remove_archive.sh](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/remove_archive.sh). Simpan konfigurasi penjadwalan tersebut pada file [crontab](https://github.com/oceanite/soalmodul1-sisop26/blob/main/task-2/crontab)
