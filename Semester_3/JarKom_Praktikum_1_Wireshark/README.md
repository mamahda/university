[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/tPVgLsdF)
| Name | NRP | Class |
| ---- | --- | ----- |
| Gilbran Mahdavikia Raja | 5025241134 | B      |

## Task 1

- Flag

  ```
  JARKOM25{Ja0G_Bbbb4ng3t_S1_1Y928XMCIQ6IXNR8KBME60L66N4HLN@xl0vel16motslwoc4bjc0vfuj2gbb9_97ab51264c2dcb2d12e420885c65d9f0}
  ```
  ![no1](./img/no1.png)

> a. Berapa banyak packet yang terekam pada file pcapng?

> _a. How many packets are recorded in the pcapng file?_

**Answer:** `9596`

- Filter expression

  ```
  -
  ```

- Explanation

  Untuk yang soal ini kita bisa langsung liat ke pojok kanan bawah wireshark, disitu ada tulisan `Packets: 9596`.

- Output result

  ![no1a](./img/no1a.png)

<br>
<br>

> b. Ada berapa jenis protocol (total) yang terekam pada traffic?

> _b. How many types of protocol (totals) are recorded in the traffic?_

**Answer:** `12`

- Filter expression

  ```
  -
  ```

- Explanation

  Kita bisa liat di bagian `Protocol Hierarchy` di menu `Statistics`, disitu ada jumlah total protocol yang terekam pada traffic.

- Output result

  ![no1b](./img/no1b.png)

<br>
<br>

> c. Ada berapa jenis protocol berbasis TCP yang terekam pada traffic?

> _c. How many types of TCP-based applications protocol are recorded in the traffic?_

**Answer:** `8`

- Filter expression

  ```
  -
  ```


- Explanation

  Sama seperti soal sebelumnya, kita bisa liat di bagian `Protocol Hierarchy` di menu `Statistics`, disitu ada list dari protocol yang terekam pada traffic, lalu kita bisa hitung ada berapa jenis protocol berbasis TCP.

- Output result

  ![no1c](./img/no1c.png)

  <br>
  <br>

> d. Ada berapa banyak packet dengan protokol TCP murni yang terekam pada traffic (tanpa data)?

> _d. How many packets with pure TCP protocol are recorded in the traffic (without data)?_

**Answer:** `3223`

- Filter expression

  ```
  tcp.len == 0
  ```

- Explanation

  Gunakan display filter `tcp.len == 0` untuk menampilkan packet dengan protokol TCP murni (tanpa data), lalu lihat di pojok kanan bawah wireshark, disitu ada tulisan `Displayed: 3222 (33.6%)`. Namun, waktu saya submit `3222` keluar response `incorrect answer` lalu saya coba submit dengan angka `+1` dari package yang terdisplay yaitu `3223` ternyata jawabannya benar.

- Output result

  ![no1d](./img/no1d.png)

## Task 2

- Flag

  ```
  JARKOM25{N1c3_0ne_b4nggg_OCSFANIPNKyuMM13ypxmkeyizhikphmsqfvdqc3r4t0ps80024045837050523554_df3110ea6edbe65324f3c6aeebd6ea85}
  ```
  ![no2](./img/no2.png)

> a. Berapa banyak packet berhasil yang berbasis murni TCP dan memiliki flag [ACK]?

> _a. How many packets succeed that are pure TCP based and have [ACK] flag?_

**Answer:** `3209`

- Filter expression
  
  ``` 
  tcp.len == 0 && tcp.flags.ack == 1
  ```

- Explanation

  Gunakan display filter `tcp.len == 0 && tcp.flags.ack == 1` untuk menampilkan packet dengan protokol TCP murni (tanpa data) dan memiliki flag [ACK], lalu lihat di pojok kanan bawah wireshark, disitu ada tulisan `Displayed: 3210 (33.5%)`. Namun, sama seperti soal sebelumnya waktu saya submit `3210` keluar response `incorrect answer` lalu saya coba submit dengan angka `-1` dari package yang terdisplay yaitu `3209` ternyata jawabannya benar.

- Output result

  ![no 2a](./img/no2a.png)

  <br>
  <br>

> b. Berapa banyak packet berhasil yang berbasis murni TCP yang hanya memiliki flag [ACK]?

> _b. How many packets succeed that are pure TCP based and have only [ACK] flag?_

**Answer:** `3172`

- Filter expression

  ```
  tcp.len == 0 && tcp.flags == 0x10
  ```

- Explanation

  Gunakan display filter `tcp.len == 0 && tcp.flags == 0x10` untuk menampilkan packet dengan protokol TCP murni (tanpa data) dan hanya memiliki flag [ACK], lalu lihat di pojok kanan bawah wireshark, disitu ada tulisan `Displayed: 3174 (33.1%)`. Di soal ini saya juga menemukan masalah yang sama seperti di soal sebelumnya, ketika submit `3174` malah keluar response `incorrect answer`, akhirnya saya coba submit dengan rentang `3174-5 < x < 3174+5` ternyata benar di angka `3172`.

- Output result

  ![no 2b](./img/no2b.png)

  <br>
  <br>

> c. Berapa banyak packet berhasil yang berbasis murni TCP dan memiliki flag selain hanya [ACK]?

> _c. How many packets succeed that are pure TCP based and contain flags other than just [ACK] flag?_

**Answer:** `49`

- Filter expression

  ```
  tcp.len == 0 && tcp.flags != 0x10
  ```

- Explanation

  Gunakan display filter `tcp.len == 0 && tcp.flags != 0x10` untuk menampilkan packet dengan protokol TCP murni (tanpa data) dan memiliki flag selain hanya [ACK], lalu lihat di pojok kanan bawah wireshark, disitu ada tulisan `Displayed: 48 (0.5%)`. Di soal ini saya juga menemukan masalah yang sama juga seperti di soal sebelumnya, ketika submit `48` malah keluar response `incorrect answer`, akhirnya saya coba submit dengan rentang `48-5 < x < 48+5` ternyata benar di angka `49`.

- Output result

  ![no 2c](./img/no2c.png)

  <br>
  <br>

## Task 3

- Flag

  ```
  JARKOM25{W0w_Y0uU_h4V33e_d0n3_444_90od_j@bB_ BB7AFg0dl1k39c112cobifvvdncfgoehvv_ab5830b2c3341a3281c555dd3213ee11}
  ```
  ![no3](./img/no3.png)

> a. Pada port berapa client telnet terbuka?

> _a. In what port is the telnet client open?_

**Answer:** `54184`

- Filter expression

  ```
  telnet
  ```

- Explanation

  Gunakan display filter `telnet` untuk menampilkan packet dengan protokol telnet, lalu pilih satu packet yang pertama kali ditangkap oleh wireshark, disitu terlihat bahwa `port destination` nya adalah `54184`.

- Output result

  ![no3a](./img/no3a.png)

  <br>
  <br>

> b. Berapa byte file response yang dikirim dari server?

> _b. How many bytes of the response files are sent from the server?_

**Answer:** `1449`

- Filter expression

  ```
  telnet
  ```

- Explanation

  Gunakan display filter `telnet` untuk menampilkan packet dengan protokol telnet, lalu buka menu tcp stream pada analyze > follow > tcp stream, lalu pada bagian bawah terdapat tulisan `entire conversation`, klik lalu pada `dropdown` terdapat `172.16.16.101:23` (sebagai server) -> `172.16.16.101:54184` (sebagai client) disitu kita bisa lihat ada tulisan `1449 bytes`.

- Output result

  ![no3b](./img/no3b.png)

  <br>
  <br>

> c. Apa username yang digunakan client telnet untuk berhubungan dengan server?

> _c. What telnet client's username is used to connect with the server?_

**Answer:** `jovyan`

- Filter expression

  ```
  telnet
  ```

- Explanation

  Sama sepert soal sebelumnya, kita gunakan display filter 'telnet' untuk menampilkan packet dengan protokol telnet, lalu buka menu tcp stream pada analyze > follow > tcp stream, lalu pada bagian text area setelah `login:` terdapat username yang digunakan client telnet untuk berhubungan dengan server yaitu `jovyan`.

- Output result

  ![no3c](./img/no3cd.png)

  <br>
  <br>

> d. Apa password client telnet?

> _d. What is the telnet client's password?_

**Answer:** `123`

- Filter expression

  ```
  telnet
  ```

- Explanation

  Sama seperti sebelumnya, kita tinggal liat saja kata setelah `Password:` pada bagian text area di tcp stream, disitu tertulis passwordnya yaitu `123`.

- Output result

  ![no3c](./img/no3cd.png)

  <br>
  <br>

## Task 4

- Flag

  `put your flag here`

> a. Apa perintah pertama yang ditulis client pada koneksi telnet?

> _a. What is the first command that client wrote on telnet connection?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> b. Apa nama file .txt di server (ditulis bersama ekstensinya)?

> _b. What is the name of .txt file on the server (write with the extension)?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> c. Apa kata pertama dari frasa yang dimasukkan client ke dalam file sebelumnya?

> _c. What is the first word that the client inserted into the previous file?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

## Task 5

- Flag

  `put your flag here`

> a. Berapa banyak packet berbasis HTTP yang terekam pada file pcapng?

> _a. How many HTTP packets are recorded in the pcapng file?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> b. Ada berapa HTTP packet yang berupa response?

> _b. How many response HTTP packets are recorded in the traffic?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> c. Ada berapa paket berbasis HTTP yang berhasil?

> _c. How many HTTP packets that succeed?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> d. Apa alamat IP dari client HTTP yang tersambung lokal dengan mesin lain?

> _d. What is the client HTTP IP Address in connection with other local machine?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

## Task 6

- Flag

  `put your flag here`

> a. Apakah kamu menemukan fake flag? Tuliskan seluruhnya!

> _a. Did you find the fake flag? Write it whole!_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> b. Tuliskan username dan password yang tertulis! (format username:password)

> _b. Write the written username and password! (format username:password)_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

## Task 7

- Flag

  `put your flag here`

> Apa nama gambar yang direquest oleh client? (tulis dengan ekstensinya)

> _What is the image that is being requested by the client? (write with its extension)_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

## Task 8

- Flag

  `put your flag here`

> a. Berapa banyak packet berbasis FTP yang terekam pada file pcapng? (with the data)

> _a. How many FTP packets are recorded in the pcapng file? (with the data)_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> b. Apa username dan password client di koneksi FTP? (tulis dalam format username:password)

> _b. What is the client's username and password in FTP connection? (write in following format username:password)_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> c. What is the client's command for showing server directory that was sent on request packet?

> _c. Apa command client untuk melihat direktori server yang dikirimkan dalam request packet?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

## Task 9

- Flag

  `put your flag here`

> a. Apa alamat IP dari FTP server?

> _a. What is the FTP server IP Address?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> b. Berapa banyak file yang ada dalam direktori FTP server?

> _b. How many files are there inside the FTP server directory?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> c. Apa nama dari file yang digunakan dalam page.html? (tulis lengkap namanya beserta ekstensinya dan dipisahkan dengan koma ',')

> _c. What are the filenames used in the page.html? (write the filebames with their extensions and separate them with comma ',')_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

## Task 10

- Flag

  `put your flag here`

> a. Apa nama file yang mengandung string terencode?

> _a. What is the filename that contains encoded string?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> b. Apa nama file hasil copy file sebelumnya?

> _b. What is the filename of the previous file copy?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

> c. What is the decoded string from the previous file?

> _c. Apa decoded string dari file tersebut?_

**Answer:** `put your answer here`

- Filter expression

  `put your filter here (if any)`

- Explanation

  `put your explanation here`

- Output result

  `put your output result here`

  <br>
  <br>

## Summary

## Problems
