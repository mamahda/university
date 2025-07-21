# **Cella’s Manhwa**

Cella, si ratu scroll Facebook, tiba-tiba terinspirasi untuk mengumpulkan informasi dan foto dari berbagai **manhwa favoritnya**. Namun, kemampuan ngoding Cella masih cetek, jadi dia butuh bantuanmu untuk membuatkan skrip otomatis agar semua berjalan mulus. Tugasmu adalah membantu Cella mengolah data manhwa dan heroine-nya.

Berikut adalah daftar manhwa bergenre shoujo/josei yang paling disukai Cella:

|    No     |      Manhwa      |
| :--------: | :------------: |
| 1 | Mistaken as the Monster Duke's Wife |
| 2 | The Villainess Lives Again |
| 3 | No, I Only Charmed the Princess! |
| 4 | Darling, Why Can't We Divorce? |

### **a. Summoning the Manhwa Stats**

Cella ingin mengambil data detail dari **manhwa** menggunakan [API Jikan](https://docs.api.jikan.moe/). Informasi yang diambil:

- Judul
- Status
- Tanggal rilis
- Genre
- Tema
- Author

Setelah data berhasil diambil, hasilnya harus disimpan ke dalam file teks, dengan nama file disesuaikan dengan **judul versi bahasa Inggris** (tanpa karakter khusus dan spasi diganti dengan underscore). Semua file teks disimpan dalam folder `Manhwa`.

**Contoh format isi file:**

```
Title: The Villain's Daughter-in-Law
Status: Publishing
Release: 2024-10-16
Genre: Fantasy, Romance
Theme: Time Travel
Author: Na, Reuyan, Kim, Dael
```

**&#128161; Hint**

Contoh Penggunaan Simple API:
1. Kunjungi situs **MyAnimeList**.

2. Cari **manhwa** yang diinginkan.

3. Sebagai contoh:

    `https://myanimelist.net/manga/154063/The_Perks_of_Being_a_Villainess`

3. Gunakan **154063** sebagai **ID** untuk melakukan pengambilan data (scraping).

4. Sehingga **endpoint API** akan menjadi seperti berikut:

    `https://api.jikan.moe/v4/manga/154063`

### **b. Seal the Scrolls**

Cella ingin agar setiap file `.txt` tadi di-**zip** satu per satu dan disimpan ke dalam folder baru bernama `Archive`. Yang dimana nama masing masing dari zip diambil dari **huruf kapital nama file**.

### **c. Making the Waifu Gallery**

Setiap manhwa memiliki heroine alias **Female Main Character (FMC)**. Cella ingin mengunduh gambar heroine dari internet, dengan jumlah unduhan sesuai dengan **bulan rilis manhwa**.

**Contoh:**

- Jika rilis bulan Februari → unduh **2 foto**
- Jika rilis bulan Desember → unduh **12 foto**
- Format nama file: `Heroine_1.jpg`, `Heroine_2.jpg`, dst.

Selain itu, Cella ingin melakukan pengunduhan **sesuai urutan** daftar manhwa yang tertera pada deskripsi di atas, dan proses pengunduhan harus menggunakan **thread**, karena Cella malas menunggu. Sebagai contohnya, gambar heroine dari manhwa Mistaken as the Monster Duke's Wife harus diunduh terlebih dahulu dan tidak boleh didahului oleh gambar heroine dari manhwa lainnya.

Seluruh gambar akan disimpan dalam folder Heroines. Di dalam folder Heroines, akan terdapat subfolder dengan nama depan atau nama panggilan heroine dari masing-masing manhwa.

Struktur folder yang diinginkan:

```
Heroines/
├── Alisha/
│   ├── Alisha_1.jpg
│   └── Alisha_2.jpg
└── Dorothea/
    ├── Dorothea_1.jpg
    └── Dorothea_2.jpg
```

### **d. Zip. Save. Goodbye**

Setelah semua gambar heroine berhasil diunduh, Cella ingin mengarsipkannya:

- Setiap folder heroine di-zip dengan format:
  ```
  [HURUFKAPITALNAMAMANHWA]_[namaheroine].zip
  ```
- Disimpan di folder `Archive/Images`
- Setelah zip selesai, gambar pada masing masing folder Heroine akan dihapus secara **urut dengan abjad**.

### Notes &#9888;

- Gunakan `fork()` dan `exec()` untuk soal a, b, dan, d.

- `system()` **HANYA BOLEH DIGUNAKAN (bila ingin)** untuk soal c.

- **Dilarang keras menggunakan external script!**.

- Dilarang menggunakan `mkdir()`.

- Hanya `solver.c` yang dikumpulkan pada GitHub.

---

# **Cella’s Manhwa**

Cella, the queen of Facebook scrolling, suddenly got inspired to collect information and photos from her favorite **manhwa**. However, her coding skills are still basic, so she needs your help to create an automated script to make everything run smoothly. Your task is to assist Cella in processing manhwa data and its heroines.

The following is a list of shoujo/josei genre manhwa most favored by Cella:

|    No     |      Manhwa      |
| :--------: | :------------: |
| 1 | Mistaken as the Monster Duke's Wife |
| 2 | The Villainess Lives Again |
| 3 | No, I Only Charmed the Princess! |
| 4 | Darling, Why Can't We Divorce? |

### **a. Summoning the Manhwa Stats**

Cella wants to retrieve detailed data about **manhwa** using the [Jikan API](https://docs.api.jikan.moe/). The information to be retrieved includes:

- Title
- Status
- Release date
- Genre
- Theme
- Author

Once the data is successfully retrieved, the results must be saved into a text file, with the file name based on the **English title** (special characters removed and spaces replaced with underscores). All text files are stored in the `Manhwa` folder.

**Example file content format:**

```
Title: The Villain's Daughter-in-Law
Status: Publishing
Release: 2024-10-16
Genre: Fantasy, Romance
Theme: Time Travel
Author: Na, Reuyan, Kim, Dael
```

**&#128161; Hint**

Example of Simple API Usage:
1. Visit the **MyAnimeList** website.

2. Search for the desired **manhwa**.

3. For example:

    `https://myanimelist.net/manga/154063/The_Perks_of_Being_a_Villainess`

4. Use **154063** as the **ID** for scraping the data.

5. Therefore, the **API endpoint** will look like this:

    `https://api.jikan.moe/v4/manga/154063`

### **b. Seal the Scrolls**

Cella wants each `.txt` file to be **zipped** individually and stored in a new folder named `Archive`. The name of each zip file should be derived from the **uppercase letters of the file name**.

### **c. Making the Waifu Gallery**

Each manhwa has a heroine, also known as the **Female Main Character (FMC)**. Cella wants to download heroine images from the internet, with the number of downloads corresponding to the **release month of the manhwa**.

**Example:**

- If released in February → download **2 photos**
- If released in December → download **12 photos**
- File name format: `Heroine_1.jpg`, `Heroine_2.jpg`, and so on.

Additionally, Cella wants the downloads to be performed **in order** based on the manhwa list described above, and the download process must use **threads**, as Cella doesn’t want to wait. For example, the heroine images from the manhwa Mistaken as the Monster Duke's Wife must be downloaded first and cannot be preceded by images from other manhwa.

All images will be stored in the Heroines folder. Inside the Heroines folder, there will be subfolders named after the first name or nickname of the heroine from each manhwa.

Desired folder structure:

```
Heroines/
├── Alisha/
│   ├── Alisha_1.jpg
│   └── Alisha_2.jpg
└── Dorothea/
    ├── Dorothea_1.jpg
    └── Dorothea_2.jpg
```

### **d. Zip. Save. Goodbye**

After all heroine images are successfully downloaded, Cella wants them archived:

- Each heroine folder is zipped with the format:
  ```
  [UPPERCASEMANHWANAME]_[heroineName].zip
  ```
- Stored in the `Archive/Images` folder
- Once the zipping is complete, the images in each Heroine folder will be deleted **in alphabetical order**.

### Notes &#9888;

- Use `fork()` and `exec()` for questions a, b, and d.

- `system()` **MAY ONLY BE USED (if desired)** for question c.

- **Strictly prohibited from using external scripts!**

- Using `mkdir()` is not allowed.

- Only `solver.c` should be submitted on GitHub.
