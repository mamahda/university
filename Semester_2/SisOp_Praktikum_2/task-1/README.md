# Trabowo & Peddy Movie Night

Trabowo dan sahabatnya, Peddy, sedang menikmati malam minggu di rumah sambil mencari film seru untuk ditonton. Mereka menemukan sebuah file ZIP yang berisi gambar-gambar poster film yang sangat menarik. File tersebut dapat diunduh dari **[Google Drive](https://drive.google.com/file/d/1nP5kjCi9ReDk5ILgnM7UCnrQwFH67Z9B/view?usp=sharing)**. Karena penasaran dengan film-film tersebut, mereka memutuskan untuk membuat sistem otomatis guna mengelola semua file tersebut secara terstruktur dan efisien. Berikut adalah tugas yang harus dikerjakan untuk mewujudkan sistem tersebut:

### **a. Ekstraksi File ZIP**

Trabowo langsung mendownload file ZIP tersebut dan menyimpannya di penyimpanan lokal komputernya. Namun, karena file tersebut dalam bentuk ZIP, Trabowo perlu melakukan **unzip** agar dapat melihat daftar film-film seru yang ada di dalamnya.

### **b. Pemilihan Film Secara Acak**

Setelah berhasil melakukan unzip, Trabowo iseng melakukan pemilihan secara acak/random pada gambar-gambar film tersebut untuk menentukan film pertama yang akan dia tonton malam ini.

**Format Output:**

```
Film for Trabowo & Peddy: ‘<no_namafilm_genre.jpg>’
```

### **c. Memilah Film Berdasarkan Genre**

Karena Trabowo sangat perfeksionis dan ingin semuanya tertata rapi, dia memutuskan untuk mengorganisir film-film tersebut berdasarkan genre. Dia membuat 3 direktori utama di dalam folder `~/film`, yaitu:

- **FilmHorror**
- **FilmAnimasi**
- **FilmDrama**

Setelah itu, dia mulai memindahkan gambar-gambar film ke dalam folder yang sesuai dengan genrenya. Tetapi Trabowo terlalu tua untuk melakukannya sendiri, sehingga ia meminta bantuan Peddy untuk memindahkannya. Mereka membagi tugas secara efisien dengan mengerjakannya secara bersamaan (overlapping) dan membaginya sama banyak. Trabowo akan mengerjakan dari awal, sementara Peddy dari akhir. Misalnya, jika ada 10 gambar, Trabowo akan memulai dari gambar pertama, gambar kedua, dst dan Peddy akan memulai dari gambar kesepuluh, gambar kesembilan, dst. Lalu buatlah file “recap.txt” yang menyimpan log setiap kali mereka selesai melakukan task

Contoh format log :

```
[15-04-2025 13:44:59] Peddy: 50_toystory_animasi.jpg telah dipindahkan ke FilmAnimasi
```

Setelah memindahkan semua film, Trabowo dan Peddy juga perlu menghitung jumlah film dalam setiap kategori dan menuliskannya dalam file **`total.txt`**. Format dari file tersebut adalah:

```
Jumlah film horror: <jumlahfilm>
Jumlah film animasi: <jumlahfilm>
Jumlah film drama: <jumlahfilm>
Genre dengan jumlah film terbanyak: <namagenre>
```

### **d. Pengarsipan Film**

Setelah semua film tertata dengan rapi dan dikelompokkan dalam direktori masing-masing berdasarkan genre, Trabowo ingin mengarsipkan ketiga direktori tersebut ke dalam format **ZIP** agar tidak memakan terlalu banyak ruang di komputernya.

---

# Trabowo & Peddy Movie Night

Trabowo and his friend, Peddy, are enjoying Saturday night at home while looking for exciting movies to watch. They found a ZIP file containing posters of very interesting movies. The file can be downloaded from **[Google Drive](https://drive.google.com/file/d/1nP5kjCi9ReDk5ILgnM7UCnrQwFH67Z9B/view?usp=sharing)**. Out of curiosity about the movies, they decided to create an automatic system to manage all these files in a structured and efficient manner. Here are the tasks that need to be done to realize this system:

### **a. Unzip the ZIP File**

Trabowo immediately downloaded the ZIP file and saved it to his local computer storage. However, since the file is in ZIP format, Trabowo needs to **unzip** it to see the list of exciting movies inside.

### **b. Random Movie Selection**

After successfully unzipping, Trabowo randomly selected one of the movie posters to determine the first movie he will watch tonight.

**Output Format:**

```
Film for Trabowo & Peddy: ‘<no_namafilm_genre.jpg>’
```

### **c. Sorting Movies by Genre**

Because Trabowo is very perfectionist and wants everything to be neatly arranged, he decided to organize the movies by genre. He created 3 main directories inside the `~/film` folder, namely:

- **FilmHorror**
- **FilmAnimasi**
- **FilmDrama**

After that, he started moving the movie posters into the appropriate folders based on their genres. However, Trabowo is too old to do it himself, so he asked Peddy for help. They efficiently divided the tasks by working simultaneously (overlapping) and splitting them equally. Trabowo will start from the beginning, while Peddy will start from the end. For example, if there are 10 images, Trabowo will start from the first image, the second image, etc., and Peddy will start from the tenth image, the ninth image, etc. Then create a file "recap.txt" that logs every time they finish a task.

Log format example:

```
[15-04-2025 13:44:59] Peddy: 50_toystory_animasi.jpg telah dipindahkan ke FilmAnimasi
```

When they finish moving all the movies, Trabowo and Peddy also need to count the number of movies in each category and write it in the **`total.txt`** file. The format of that file is:

```
Jumlah film horror: <jumlahfilm>
Jumlah film animasi: <jumlahfilm>
Jumlah film drama: <jumlahfilm>
Genre dengan jumlah film terbanyak: <namagenre>
```

### **d. Archiving Movies**

After all the movies are neatly arranged and grouped in their respective directories by genre, Trabowo wants to archive the three directories into a **ZIP** format to save space on his computer.
