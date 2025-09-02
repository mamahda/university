# Organize and Analyze Anthony's Favorite Films

Anthony sedang asyik menonton film favoritnya dari Netflix, namun seiring berjalannya waktu, koleksi filmnya semakin menumpuk. Ia pun memutuskan untuk membuat sistem agar film-film favoritnya bisa lebih terorganisir dan mudah diakses. Anthony ingin melakukan beberapa hal dengan lebih efisien dan serba otomatis.

> Film-film yang dimaksud adalah film-film yang ada di dalam file ZIP yang bisa diunduh dari **[Google Drive](https://drive.google.com/file/d/12GWsZbSH858h2HExP3x4DfWZB1jLdV-J/view?usp=drive_link)**.

Berikut adalah serangkaian tugas yang Anthony ingin capai untuk membuat pengalaman menonton filmnya jadi lebih menyenangkan:

### **a. One Click and Done!**

Pernahkah kamu merasa malas untuk mengelola file ZIP yang penuh dengan data film? Anthony merasa hal yang sama, jadi dia ingin semuanya serba instan dengan hanya satu perintah. Dengan satu perintah saja, Anthony bisa:

- Mendownload file ZIP yang berisi data film-film Netflix favoritnya.
- Mengekstrak file ZIP tersebut ke dalam folder yang sudah terorganisir.
- Menghapus file ZIP yang sudah tidak diperlukan lagi, supaya tidak memenuhi penyimpanan.

Buatlah skrip yang akan mengotomatiskan proses ini sehingga Anthony hanya perlu menjalankan satu perintah untuk mengunduh, mengekstrak, dan menghapus file ZIP.

### **b. Sorting Like a Pro**

Koleksi film Anthony semakin banyak dan dia mulai bingung mencari cara yang cepat untuk mengelompokkannya. Nah, Anthony ingin mengelompokkan film-filmnya dengan dua cara yang sangat mudah:

1. Berdasarkan huruf pertama dari judul film.
2. Berdasarkan tahun rilis (release year).

Namun, karena Anthony sudah mempelajari **multiprocessing**, dia ingin mengelompokkan kedua kategori ini secara paralel untuk menghemat waktu.

**Struktur Output:**

- **Berdasarkan Huruf Pertama Judul Film:**

  - Folder: `judul/`
  - Setiap file dinamai dengan huruf abjad atau angka, seperti `A.txt`, `B.txt`, atau `1.txt`.
  - Jika judul film tidak dimulai dengan huruf atau angka, film tersebut disimpan di file `#.txt`.

- **Berdasarkan Tahun Rilis:**
  - Folder: `tahun/`
  - Setiap file dinamai sesuai tahun rilis film, seperti `1999.txt`, `2021.txt`, dst.

Format penulisan dalam setiap file :

```
Judul Film - Tahun Rilis - Sutradara
```

Setiap proses yang berjalan akan mencatat aktivitasnya ke dalam satu file bernama **`log.txt`** dengan format:

```
[jam:menit:detik] Proses mengelompokkan berdasarkan [Abjad/Tahun]: sedang mengelompokkan untuk film [judul_film]
```

**Contoh Log:**

```
[14:23:45] Proses mengelompokkan berdasarkan Abjad: sedang mengelompokkan untuk film Avengers: Infinity War
[14:23:46] Proses mengelompokkan berdasarkan Tahun: sedang mengelompokkan untuk film Kung Fu Panda
```

### **c. The Ultimate Movie Report**

Sebagai penggemar film yang juga suka menganalisis, Anthony ingin mengetahui statistik lebih mendalam tentang film-film yang dia koleksi. Misalnya, dia ingin tahu berapa banyak film yang dirilis **sebelum tahun 2000** dan **setelah tahun 2000**.

Agar laporan tersebut mudah dibaca, Anthony ingin hasilnya disimpan dalam file **`report_ddmmyyyy.txt`**.

**Format Output dalam Laporan:**

```
i. Negara: <nama_negara>
Film sebelum 2000: <jumlah>
Film setelah 2000: <jumlah>

...
i+n. Negara: <nama_negara>
Film sebelum 2000: <jumlah>
Film setelah 2000: <jumlah>
```

Agar penggunaannya semakin mudah, Anthony ingin bisa menjalankan semua proses di atas melalui sebuah antarmuka terminal interaktif dengan pilihan menu seperti berikut:
1. Download File
2. Mengelompokkan Film
3. Membuat Report

Catatan:
- Dilarang menggunakan `system`
- Harap menggunakan thread dalam pengerjaan soal C

---

# Organize and Analyze Anthony's Favorite Films

Anthony is enjoying watching his favorite movies on Netflix, but over time, his movie collection has grown significantly. He decided to create a system to make his favorite movies more organized and easily accessible. Anthony wants to achieve several tasks more efficiently and automatically.

> The movies in question are the ones contained in a ZIP file that can be downloaded from **[Google Drive](https://drive.google.com/file/d/12GWsZbSH858h2HExP3x4DfWZB1jLdV-J/view?usp=drive_link)**.

Here are the tasks Anthony wants to accomplish to make his movie-watching experience more enjoyable:

### **a. One Click and Done!**

Have you ever felt lazy managing ZIP files full of movie data? Anthony feels the same way, so he wants everything to be instant with just one command. With a single command, Anthony can:

- Download a ZIP file containing his favorite Netflix movie data.
- Extract the ZIP file into an organized folder.
- Delete the unnecessary ZIP file to save storage space.

Create a script that automates this process so Anthony only needs to run one command to download, extract, and delete the ZIP file.

### **b. Sorting Like a Pro**

Anthony's movie collection is growing, and he's starting to get confused about how to quickly organize it. Anthony wants to group his movies in two very simple ways:

1. By the first letter of the movie title.
2. By release year.

However, since Anthony has learned about **multiprocessing**, he wants to group these two categories in parallel to save time.

**Output Structure:**

- **By First Letter of Movie Title:**

  - Folder: `judul/`
  - Each file is named with an alphabet letter or number, such as `A.txt`, `B.txt`, or `1.txt`.
  - If the movie title does not start with a letter or number, the movie is stored in the file `#.txt`.

- **By Release Year:**
  - Folder: `tahun/`
  - Each file is named according to the movie's release year, such as `1999.txt`, `2021.txt`, etc.

The format for each file:

```
Movie Title - Release Year - Director
```

Each running process will log its activity into a single file named **`log.txt`** in the following format:

```
[hour:minute:second] Grouping process by [Alphabet/Year]: currently grouping movie [movie_title]
```

**Example Log:**

```
[14:23:45] Grouping process by Alphabet: currently grouping movie Avengers: Infinity War
[14:23:46] Grouping process by Year: currently grouping movie Kung Fu Panda
```

### **c. The Ultimate Movie Report**

As a movie enthusiast who also loves analysis, Anthony wants to gain deeper insights into his movie collection. For example, he wants to know how many movies were released **before the year 2000** and **after the year 2000**.

To make the report easy to read, Anthony wants the results saved in a file named **`report_ddmmyyyy.txt`**.

**Output Format in the Report:**

```
i. Country: <country_name>
Movies before 2000: <count>
Movies after 2000: <count>

...
i+n. Country: <country_name>
Movies before 2000: <count>
Movies after 2000: <count>
```

To make it even easier to use, Anthony wants to be able to run all of the above processes through an interactive terminal interface with menu options like the following:
1. Download File
2. Categorize Movies
3. Create Report

Notes:
- It is forbidden to use `system`
- Please use threads in working with question C.
