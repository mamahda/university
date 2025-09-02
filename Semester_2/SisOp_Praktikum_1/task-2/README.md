# Liburan Bersama Rudi

Mengisi waktu liburan, Rudi membuat sebuah website untuk personal brandingnya yang sementara berjalan di local pada komputer laboratorium. Rudi yang baru belajar kebingungan karena sering muncul error yang tidak ia pahami. Untuk itu dia meminta ketiga temannya Andi, Budi, dan Caca untuk melakukan pengecekan secara berkala pada website Rudi. Dari pengecekan secara berkala, Rudi mendapatkan sebuah file [access.log](https://drive.google.com/file/d/1yf4lWB4lUgq4uxKP8Pr8pqcAWytc3eR4/view?usp=sharing) yang berisi catatan akses dari ketiga temannya. Namun, Rudi masih tidak paham cara untuk membaca data pada file tersebut sehingga meminta bantuanmu untuk mencari data yang dibutuhkan Rudi.

a. Karena melihat ada IP dan Status Code pada file access.log. Rudi meminta praktikan untuk menampilkan total request yang dibuat oleh setiap IP dan menampilkan jumlah dari setiap status code.

b. Karena banyaknya status code error, Rudi ingin tahu siapa yang menemukan error tersebut. Setelah melihat-lihat, ternyata IP komputer selalu sama. Dengan bantuan [peminjaman_komputer.csv](https://drive.google.com/file/d/1-aN4Ca0M3IQdp6xh3PiS_rLQeLVT1IWt/view?usp=drive_link), Rudi meminta kamu untuk membuat sebuah program bash yang akan menerima inputan tanggal dan IP serta menampilkan siapa pengguna dan membuat file backup log aktivitas, dengan format berikut:

- **Tanggal** (format: `MM/DD/YYYY`)

- **IP Address** (format: `192.168.1.X`, karena menggunakan jaringan lokal, di mana `X` adalah nomor komputer)

- Setelah pengecekan, program akan memberikan **message pengguna dan log aktivitas** dengan format berikut:

  ```
  Pengguna saat itu adalah [Nama Pengguna Komputer]
  Log Aktivitas [Nama Pengguna Komputer]
  ```

  atau jika data tidak ditemukan:

  ```
  Data yang kamu cari tidak ada
  ```

- File akan disimpan pada directory “/backup/[Nama file]”, dengan format nama file sebagai berikut

  ```
  [Nama Pengguna Komputer]_[Tanggal Dipilih (MMDDYYY)]_[Jam saat ini (HHMMSS)].log
  ```

- Format isi log

  ```
  [dd/mm/yyyy:hh:mm:ss]: Method - Endpoint - Status Code
  ```

c. Rudi ingin memberikan hadiah kepada temannya yang sudah membantu. Namun karena dana yang terbatas, Rudi hanya akan memberikan hadiah kepada teman yang berhasil menemukan server error dengan `Status Code 500` terbanyak. Bantu Rudi untuk menemukan siapa dari ketiga temannya yang berhak mendapat hadiah dan tampilkan jumlah `Status Code 500` yang ditemukan

---

# Holiday with Rudi

Filling the holiday time, Rudi created a website for his personal branding that is currently running locally on the laboratory computer. Rudi, who is new to learning, is confused because there are often errors that he does not understand. For that, he asked his three friends Andi, Budi, and Caca to check periodically on Rudi's website. From periodic checks, Rudi got a file [access.log](https://drive.google.com/file/d/1yf4lWB4lUgq4uxKP8Pr8pqcAWytc3eR4/view?usp=sharing) which contains access records from his three friends. However, Rudi still doesn't understand how to read the data in the file so he asks for your help to find the data needed by Rudi.

---

a. Because there are IP and Status Code in the access.log file. Rudi asked the students to display the total requests made by each IP and display the number of each status code.

b. Because of the many error status codes, Rudi wants to know **who found the error**. After looking around, it turns out that the computer's IP is always the same. With the help of [peminjaman_komputer.csv](https://drive.google.com/file/d/1-aN4Ca0M3IQdp6xh3PiS_rLQeLVT1IWt/view?usp=drive_link), Rudi asks you to create a **Bash program** that will receive input:

- **Date** (format: `MM/DD/YYYY`)\_
- **IP Address** (format: `192.168.1.X`, because it uses a local network, where `X` is the computer number)
- After checking, the program will provide **user messages and activity logs** with the following format:

  ```
  The user at that time was [Computer User Name]
  Activity Log [Computer User Name]
  ```

  or if the data is not found:

  ```
  The data you are looking for does not exist
  ```

- File will be saved in the directory "/backup/[File Name]", with the file name format as follows

  ```
  [Computer User Name]_[Selected Date (MMDDYYY)]_[Current Time (HHMMSS)].log
  ```

- Log content format

  ```
  [dd/mm/yyyy:hh:mm:ss]: Method - Endpoint - Status Code
  ```

c. Rudi wants to give a gift to his friend who has helped. But because of limited funds, Rudi will only give gifts to friends who have found the most server errors with `Status Code 500`. Help Rudi find out who of his three friends deserves the prize and display the number of `Status Code 500` found
