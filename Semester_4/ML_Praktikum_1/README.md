[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/MtNkP18j)

# tugas-1-unsupervised-learning

| Nama                    | NRP        |
| ----------------------- | ---------- |
| Gilbran Mahdavikia Raja | 5025241134 |

## Deskripsi Tugas

Pada tugas ini, kita akan menggunakan FIFA 24 player stats Dataset. Dataset bisa diakses melalui link berikut:\
🔗 https://www.kaggle.com/datasets/rehandl23/fifa-24-player-stats-dataset

Tujuan utama dari tugas ini adalah membangun model K-means, HC, DBSCAN.

Langkah-langkah yang harus dilakukan antara lain:

1. Persiapan Dataset & Eksplorasi Awal

- Memuat dataset, melihat struktur data, dan distribusi label.

2. Preprocessing

- Memproses data agar siap untuk digunakan dalam membangun model.

3. Eksperimen Model K-MEAN

- Bangun model K-MEAN dengan K masing-masing (3,5,7)
- lakukan pengaturan hyperparameter pada K-MEAN
- Lakukan Elbow Method untuk mendapatkan nilai K paling optimal
- dari masing-masing eksperiment di atas, pilih salah satu yang terbaik untuk dibandingkan di akhir

4. Eksperimen Model HC

- Bangun model HC agglomerative dengan n_cluster (3,5,7, dan K hasil elbow Method K-MEAN sebelumnya)
- coba semua linkedage (`'ward', 'complete', 'average', 'single'`)
- Hyperparameter Tunning akan mendapatkan nilai plus
- dari masing-masing eksperiment di atas, pilih salah satu yang terbaik untuk dibandingkan di akhir

5. Eksperimen Model DBSCAN

- Bangun model DBSCAN
- Lakukan eksperiment dengan mengubah hyperparameter `metric=`
- Hyperparameter Tunning akan mendapatkan nilai plus
- dari masing-masing eksperiment di atas, pilih salah satu yang terbaik untuk dibandingkan di akhir

5. Analisis & Kesimpulan

- Bandingkan hasil antar eksperimen yang telah dilakukan dan berikan kesimpulan.
