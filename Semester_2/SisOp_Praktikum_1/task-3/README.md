# Ignatius Si Cloud Engineer

Ignatius ingin mengembangkan sebuah sistem **Cloud Storage Otomatis** untuk mengelola penyimpanan file secara terintegrasi setelah pengguna berhasil login. Sistem ini harus menyediakan mekanisme **register dan login** untuk memastikan keamanan akses. Serta secara otomatis **mengunduh gambar** dari internet ketika pengguna berhasil login, tentunya layanan Cloud Storage juga memberikan otomasi backup gambar dalam format terkompresi dengan nama yang disesuaikan berdasarkan waktu pembuatan.

a. Login dan Register
Sistem harus memastikan hanya pengguna terdaftar yang dapat mengakses layanan. Proses registrasi dilakukan melalui script `register.sh` dan data pengguna yang berhasil didaftarkan disimpan di `/cloud_storage/users.txt`. Proses login dilakukan melalui script `login.sh` dan semua aktivitas login atau register dicatat dalam file `cloud_log.txt`.

- Data pengguna disimpan dalam: `/cloud_storage/users.txt`
- Kriteria Password:
  - Minimal 8 karakter.
  - Mengandung setidaknya satu huruf kapital, satu angka, dan satu karakter spesial (misalnya: @, #, $, dll.).
  - Password tidak boleh sama dengan username.
  - Tidak boleh mengandung kata "cloud" atau "storage".
- Pencatatan Log :
  Semua aktivitas dicatat dalam `cloud_log.txt` dengan format: `YY/MM/DD hh:mm:ss MESSAGE`
  Contoh pesan log:

  - Jika pengguna mencoba register dengan username yang sudah ada:

    ```
    YY/MM/DD hh:mm:ss REGISTER: ERROR User already exists
    ```

  - Jika pengguna mencoba register tetapi tidak sesuai dengan kriteria password:

    ```
    YY/MM/DD hh:mm:ss REGISTER: ERROR {Penyebab Error}
    ```

  - Jika register berhasil:

    ```
    YY/MM/DD hh:mm:ss REGISTER: INFO User registered successfully
    ```

  - Jika login gagal:

    ```
    YY/MM/DD hh:mm:ss LOGIN: ERROR Failed login attempt on user {USERNAME}
    ```

  - Jika login berhasil:

    ```
    YY/MM/DD hh:mm:ss LOGIN: INFO User {USERNAME} logged in
    ```

  - Jika logout berhasil:

    ```
    YY/MM/DD hh:mm:ss LOGOUT: INFO User {USERNAME} logged out
    ```

**Catatan:** Sistem hanya mengizinkan satu pengguna login pada satu waktu. Jika sudah ada pengguna aktif berdasarkan log, login dari pengguna lain tidak diproses sampai sesi sebelumnya berakhir (User yang sedang login melakukan logout).

b. Pengunduhan Gambar Otomatis
Sistem akan secara berkala memeriksa file log secara berkala untuk mendeteksi apakah ada satu pengguna yang sedang login memanfaatkan script `automation.sh`. Jika terdeteksi, sistem akan menjalankan proses pengunduhan gambar secara otomatis pada script `download.sh`.

- Pengecekan Status Login:

  - Sistem mengecek file log (cloud_log.txt) setiap 2 menit untuk memastikan ada satu pengguna yang login.
  - Jika kondisi terpenuhi, proses download gambar dimulai.
  - Jika pengguna pengguna logout, proses download dihentikan.

  Catatan: Memanfaatkan penggunaan cronjob untuk melakukan otomasi pengecekan status login.

- Penyimpanan Gambar:

  - Download gambar dari Google Images setiap 10 menit bertema alam.
  - Setiap pengguna memiliki folder penyimpanan gambar sendiri di:
    `/cloud_storage/downloads/{USERNAME}/`
  - Gambar yang diunduh harus dinamai dengan format:
    `HH-MM_DD-MM-YYYY.zip` (Contoh: `14-20_12-03-2025.zip` menunjukkan arsip dibuat pada pukul 14:20 tanggal 12 Maret 2025.)

c. Pengarsipan Gambar
Untuk menjaga kerapihan penyimpanan, setiap gambar yang telah diunduh akan **dikumpulkan dan diarsipkan** ke dalam file ZIP secara otomatis **setiap 2 jam** menggunakan script `archive.sh`. Setiap pengguna memiliki folder arsip sendiri.

- Frekuensi Pengarsipan: Sistem mengarsipkan gambar setiap 2 jam.
- Setiap pengguna memiliki folder arsip masing-masing di:
  `/cloud_storage/archives/USERNAME/`
- Format nama file zip:
  `archive_HH-DD-MM-YYYY.zip` (Contoh: `archive_12-03-2025.zip` menunjukkan arsip dibuat pada tanggal 12 Maret 2025.)

---

# Ignatius The Cloud Engineer

Ignatius wants to develop an Automated Cloud Storage System to manage file storage in an integrated manner once a user successfully logs in. This system must provide registration and login mechanisms to ensure secure access. Additionally, it will automatically download images from the internet when a user logs in, and the Cloud Storage service will also automatically back up the downloaded images in a compressed format, with filenames adjusted based on the creation time.

a. Login dan Register
System must ensure that only registered users can access the service. The registration process is done through the `register.sh` script and the data of successfully registered users is stored in `/cloud_storage/users.txt`. The login process is done through the `login.sh` script and all login or registration activities are recorded in the `cloud_log.txt` file.

- User data is stored in: `/cloud_storage/users.txt`
- Password Criteria:
  - Minimum 8 characters.
  - Contains at least one capital letter, one number, and one special character (e.g., @, #, $, etc.).
  - Password must not be the same as the username.
  - Must not contain the words "cloud" or "storage".
- Log Recording:
  All activities are recorded in `cloud_log.txt` with the format: `YY/MM/DD hh:mm:ss MESSAGE`
  Example log messages:

  - If a user tries to register with an existing username:

    ```
    YY/MM/DD hh:mm:ss REGISTER: ERROR User already exists
    ```

  - If a user tries to register but does not meet the password criteria:

    ```
    YY/MM/DD hh:mm:ss REGISTER: ERROR {Error Cause}
    ```

  - If registration is successful:

    ```
    YY/MM/DD hh:mm:ss REGISTER: INFO User registered successfully
    ```

  - If login fails:

    ```
    YY/MM/DD hh:mm:ss LOGIN: ERROR Failed login attempt on user {USERNAME}
    ```

  - If login is successful:

    ```
    YY/MM/DD hh:mm:ss LOGIN: INFO User {USERNAME} logged in
    ```

  - If logout is successful:

    ```
    YY/MM/DD hh:mm:ss LOGOUT: INFO User {USERNAME} logged out
    ```

**Note:** The system only allows one user to log in at a time. If there is an active user based on the log, login from another user is not processed until the previous session ends (The user who is logged in logs out).

b. Automatic Image Download
The system will periodically check the log file to detect if there is one user currently logged in using the `automation.sh` script. If detected, the system will automatically run the image download process in the `download.sh` script.

- Login Status Check:

  - The system checks the log file (cloud_log.txt) every 2 minutes to ensure there is one user logged in.
  - If the condition is met, the image download process begins.
  - If the user logs out, the download process is stopped.

  Note: Utilize the use of cronjob to automate the login status check.

- Image Storage:

  - Download images from Google Images every 10 minutes with a nature theme.
  - Each user has their own image storage folder in:
    `/cloud_storage/downloads/{USERNAME}/`
  - Downloaded images must be named in the format:
    `HH-MM_DD-MM-YYYY.zip` (Example: `14-20_12-03-2025.zip` indicates an archive created at 14:20 on December 12, 2025.)

c. Image Archiving
To maintain storage tidiness, each downloaded image will be **collected and archived** into a ZIP file automatically **every 2 hours** using the `archive.sh` script. Each user has their own archive folder.

- Archiving Frequency: The system archives images every 2 hours.
- Each user has their own archive folder in:
  `/cloud_storage/archives/USERNAME/`
- ZIP file name format:
  `archive_HH-DD-MM-YYYY.zip` (Example: `archive_12-03-2025.zip` indicates an archive created on March 12, 2025.)
