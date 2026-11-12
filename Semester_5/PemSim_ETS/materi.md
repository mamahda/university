# Pemsim ETS: Belajar simulasi, urut dari nol.

Law & Kelton Bab 1–9.1, disusun ulang mengikuti alur sebuah proyek simulasi: dari "apa itu simulasi" sampai "desain mana yang lebih baik".

> Versi teks dari `Pemsim_ETS_Slides.pdf`. Urutan, isi, dan nomor slide sama dengan PPT; diagram hanya ada di PPT (ditandai *[Diagram: lihat slide N]*).

**Urutan belajar:**

1. Fondasi simulasi · Bab 1
2. Mesin di balik simulasi · Bab 2–3
3. Bekal statistik · Bab 4
4. Data input & distribusi · Bab 6
5. Bilangan acak · Bab 7
6. Variat acak · Bab 8
7. Validasi model · Bab 5
8. Membandingkan alternatif · Bab 9.1
9. ＋ Rekap ujian: peta soal & kartu rumus

### Kenapa urutannya begini?

*Pengantar · slide 2*

Bayangkan kamu disuruh **menyimulasikan antrian kasir minimarket**. Semua bab adalah langkah proyek itu, jadi kita belajar sesuai urutan kerjanya:

**1 Fondasi** (Apa itu simulasi, event, clock. Simulasi antrian dengan tangan.) → **2 Mesin** (List, event list, simlib, software.) → **3 Statistik** (Mean, varians, confidence interval.) → **4 Data input** (Data kedatangan cocok dengan distribusi apa?)

**5 Bilangan acak** (Membuat U(0,1) dengan LCG.) → **6 Variat acak** (Mengubah U menjadi waktu kedatangan.) → **7 Validasi** (Modelnya benar dan mirip aslinya?) → **8 Membandingkan** (1 kasir atau 2 kasir? Pakai CI selisih.)

> **Catatan:** Bab 5 (validasi) sengaja ditaruh setelah Bab 8: kita baru bisa memvalidasi model setelah modelnya jadi, dan ia memakai CI yang sama dengan Bab 9.1.

> **Catatan:** Di pojok kanan bawah tiap slide ada nomor halaman, dan di atasnya ada penunjuk modul: kamu selalu tahu sedang di langkah mana.

### Cara membaca slide ini

*Pengantar · slide 3*

Setiap topik dijelaskan dengan pola yang sama, dari yang paling ringan:

1. **Kenapa perlu?** Masalah apa yang mau diselesaikan.
2. **Konsep + gambar.** Ide utamanya, divisualkan.
3. **Langkah.** Urutan kerja yang bisa kamu ikuti di kertas.
4. **Contoh angka.** Hitungan lengkap dari slide dosen.
5. **Jebakan.** Kesalahan yang sering terjadi di ujian.

> **Intinya**
>
> Ringkasan yang wajib diingat. Kalau waktumu sempit, baca kotak ini saja.

> **Analogi**
>
> Perumpamaan sehari-hari supaya konsep abstrak terasa masuk akal.

> **Contoh**
>
> Angka konkret, dikerjakan langkah demi langkah.

> **Rumus**
>
> Yang perlu ditulis di lembar jawaban.

> **Jebakan**
>
> Hal yang paling sering membuat nilai berkurang.

---

## Fondasi Simulasi

*Modul 1 · Bab 1 · Basic Simulation Modeling* · slide 4

Kita mulai dari pertanyaan paling dasar: simulasi itu apa, dan bagaimana komputer "menjalankan waktu"? Modul ini ditutup dengan simulasi antrian dengan tangan, yang menjadi dasar seluruh mata kuliah.

> **Kenapa duluan?** Semua bab berikutnya (data input, bilangan acak, validasi) adalah bagian dari model yang kamu bangun di sini.

**Langkah di modul ini:**

1. Simulasi, sistem, dan model
2. Diskrit vs kontinu, klasifikasi model
3. Discrete-event simulation: event & clock
4. Komponen model DES
5. Simulasi antrian 1 server dengan tangan
6. Rumus Lindley
7. Simulasi inventori (s, S)
8. Langkah studi, Monte Carlo, plus-minus

### Simulasi = meniru sistem nyata dengan model

*Bab 1.1 · langkah 1 dari 8 · slide 5*

**Sistem** (fasilitas/proses nyata yang ingin dipelajari (bank, pabrik)) → **Asumsi** (logika & matematika tentang cara sistem bekerja) → **Model** (kumpulan asumsi tadi) → **Dijawab dengan…** (model sederhana: rumus (analitik) · model kompleks: simulasi)

> **Intinya**
>
> Kalau modelnya terlalu kompleks untuk rumus, kita **jalankan model secara numerik** di komputer dan mengumpulkan data untuk **mengestimasi** karakteristik sistem. Itulah simulasi.

> **Contoh dari slide**
>
> Pabrik ingin diperluas. Pilihan A: bangun dulu, lihat hasilnya (mahal, kalau gagal rugi besar). Pilihan B: **simulasikan** kondisi sekarang dan setelah diperluas, lalu bandingkan.

> **Analogi**
>
> Pilot berlatih di **simulator**: murah, aman, dan bisa mencoba kondisi ekstrem (badai, mesin mati). Simulasi komputer juga begitu: mencoba sistem tanpa membangun atau mengganggu aslinya.

**Dipakai di mana?**

Manufaktur, militer & logistik, jaringan komputer, transportasi (bandara, tol), layanan (call center, rumah sakit), inventori, keuangan. Konferensi utama: **Winter Simulation Conference**.

### Sistem, state, dan hambatan simulasi

*Bab 1.1–1.2 · langkah 1 dari 8 · slide 6*

**Kosakata dasar**

| Istilah | Arti | Contoh bank |
|---|---|---|
| **Sistem** | kumpulan **entitas** yang berinteraksi untuk suatu tujuan | nasabah, teller |
| **Entitas** | objek di dalam sistem | tiap nasabah |
| **State** | variabel yang menggambarkan sistem *pada suatu waktu* | jumlah teller sibuk, waktu datang tiap nasabah yang antri |

- Batas sistem ditentukan oleh **tujuan studi**.
- Seberapa detail = **judgment call** pemodel.

**Kenapa dulu simulasi kurang dipakai?**

| Hambatan | Sekarang |
|---|---|
| Model sistem besar sangat kompleks | Software pemodelan makin fleksibel & mudah |
| Butuh komputasi besar | Hardware makin cepat & murah |
| Dianggap "cuma programming" | Salah: perlu **metodologi** desain & analisis |

> **Catatan:** Survei OR/MS: simulasi selalu masuk 3 teknik terpenting (nomor 2 setelah math programming di jurnal *Interfaces* 1997).

### Diskrit vs kontinu: kapan state berubah?

*Bab 1.2 · langkah 2 dari 8 · slide 7*

*[Diagram: lihat slide 7]*

**Sistem diskrit**

State berubah **seketika** pada titik-titik waktu yang **terpisah**.

Bank: jumlah nasabah hanya berubah saat ada yang **datang** atau **pergi**. Di antaranya tidak ada perubahan.

**Sistem kontinu**

State berubah **terus-menerus** terhadap waktu.

Pesawat: posisi dan kecepatan berubah setiap saat tanpa jeda.

> **Analogi**
>
> Diskrit = **skor sepak bola** (0–0 lalu tiba-tiba 1–0). Kontinu = **jarum speedometer** (bergerak halus terus). Banyak sistem nyata campuran keduanya.

### Di mana posisi simulasi, dan jenis model apa yang kita pelajari?

*Bab 1.2 · langkah 2 dari 8 · slide 8*

**Cara mempelajari sistem:**

1. Sistem *(↓ aktual terlalu mahal/berisiko)*
2. Eksperimen dengan **model** (bukan sistem aktual) *(↓ bukan maket fisik)*
3. Model **matematis** *(↓ terlalu rumit untuk rumus)*
4. **Simulasi** (bukan solusi analitik)

Simulasi disebut "*method of last resort*", tapi kelebihannya: model **tidak perlu disederhanakan berlebihan** hanya agar bisa diselesaikan rumus.

**Tiga pasang klasifikasi model:**

| Pasangan | Arti | Contoh |
|---|---|---|
| **Statis** vs **dinamis** | tanpa waktu vs berkembang terhadap waktu | Monte Carlo integral vs antrian bank seharian |
| **Deterministik** vs **stokastik** | tanpa acak (output pasti) vs ada input acak (output hanya estimasi) | jadwal tetap vs kedatangan acak |
| **Kontinu** vs **diskrit** | seperti slide sebelumnya | suhu reaktor vs antrian |

> **Hafalkan**
>
> Model operasional umumnya **dinamis + stokastik + diskrit** = Discrete-Event Simulation (DES). Inilah fokus mata kuliah.

### DES: sistem bergerak dari event ke event

*Bab 1.3 · langkah 3 dari 8 · slide 9*

> **Intinya**
>
> **Event** = kejadian **instan** yang **mungkin** mengubah state. Di DES, state hanya berubah saat event terjadi, sehingga cukup "melompat" dari satu event ke event berikutnya.

Contoh yang akan kita pakai terus: **antrian 1 server**. Tujuannya mengestimasi rata-rata **delay di antrian** (lama menunggu, belum termasuk dilayani).

**State yang dicatat:**

- **Status server** idle/busy: untuk memutuskan apa yang terjadi saat ada yang datang
- **Panjang antrian**: tempat menyimpan yang menunggu
- **Waktu datang** tiap orang di antrian: untuk menghitung delay-nya

**Event-nya:**

1. **Arrival**: pelanggan datang
2. **Departure**: selesai dilayani dan pergi

Event "akhir simulasi" bisa ditambahkan, tergantung cara menghentikan simulasi.

**Analogi:**

State itu seperti **papan skor**: hanya diubah saat ada gol (event). Di antara gol, papan tidak perlu dilihat.

### Memajukan waktu: dua mekanisme

*Bab 1.3.1 · langkah 3 dari 8 · slide 10*

*[Diagram: lihat slide 10]*

**Next-event time advance `yang dipakai`**

1. Clock = 0, isi **event list** (waktu event-event mendatang).
2. Clock **melompat** ke event terdekat, jalankan event itu (bisa menambah event baru).
3. Ulangi sampai **stopping rule** terpenuhi.

Periode tanpa aktivitas dilewati. Waktu simulasi tidak berhubungan dengan waktu nyata komputer.

**Fixed-increment `jarang`**

Clock maju tiap Δt, event di dalam interval dianggap terjadi di **akhir** interval.

> **Kekurangan**
>
> Ada **error** waktu event, dan ada **trade-off**: Δt kecil akurat tapi lambat.

> **Analogi**
>
> Next-event = membaca novel dengan pembatas di tiap kejadian penting. Fixed = satpam mengecek CCTV tiap 10 menit.

### 10 komponen model DES

*Bab 1.3.2 · langkah 4 dari 8 · sering keluar · slide 11*

| Komponen | Fungsi | Panitia konser |
|---|---|---|
| **System state** | variabel keadaan sistem | jumlah penonton |
| **Simulation clock** | waktu simulasi saat ini | jam dinding |
| **Event list** | daftar waktu event mendatang | rundown acara |
| **Statistical counters** | pengumpul statistik output | penghitung tiket |
| **Initialization routine** | set model di waktu 0 | persiapan sebelum pintu dibuka |
| **Timing routine** | pilih event berikutnya, majukan clock | MC: "acara berikutnya?" |
| **Event routines** | logika tiap jenis event | SOP tiap acara |
| **Library routines** | utilitas, mis. variat acak | alat undian |
| **Report generator** | laporan hasil akhir | LPJ |
| **Main program** | memanggil semua rutin berurutan | ketua panitia |

**Alur kerjanya:**

1. Main program
2. Initialization: clock = 0, state, counter, event list
3. Timing: ambil event terdekat, majukan clock
4. Event routine: update state & counter, jadwalkan event baru *(↓ selesai? **tidak** → kembali ke Timing)*
5. ya → Report generator

**Entitas** punya **atribut**; satu entitas = satu baris (record) di **list**.

### Antrian 1 server: aturan main & notasi

*Bab 1.4 · langkah 5 dari 8 · slide 12*

**Asumsi (problem statement):**

- Interarrival $A_1, A_2, \dots$ **IID** (independen & berdistribusi sama).
- Service time $S_i$ IID, independen dari interarrival.
- Disiplin **FIFO**.
- Mulai **kosong & idle**; pelanggan pertama datang setelah $A_1$, bukan di waktu 0.
- **Stop** saat pelanggan ke-$n$ **mulai dilayani**.

**Notasi:**

| $t_i$ | waktu datang pelanggan ke-$i$ $(t_0=0)$ |
|---|---|
| $A_i=t_i-t_{i-1}$ | interarrival time |
| $S_i$ | service time |
| $D_i$ | delay di antrian |
| $c_i=t_i+D_i+S_i$ | waktu pergi |

**Tiga ukuran kinerja yang diestimasi:**

**Rata-rata delay** `discrete-time`  
$$\hat d(n)=\frac{\sum_{i=1}^n D_i}{n}$$

rata-rata **per pelanggan**

**Rata-rata jumlah di antrian** `continuous-time`  
$$\hat q(n)=\frac{\int_0^{T(n)}Q(t)\,dt}{T(n)}$$

luas di bawah Q(t) ÷ waktu

**Utilisasi server** `continuous-time`  
$$\hat u(n)=\frac{\int_0^{T(n)}B(t)\,dt}{T(n)}$$

B = 1 sibuk, 0 idle

### Simulasi dengan tangan ①: buat timeline

*Bab 1.4 · langkah 5 dari 8 · wajib bisa · slide 13*

> **Data (menit), n = 6**
>
> A: 0.4, 1.2, 0.5, 1.7, 0.2, 1.6, 0.2, 1.4  
> S: 2.0, 0.7, 0.2, 1.1, 3.7, 0.6

> **Langkah 1 · waktu datang**
>
> Jumlahkan A kumulatif:  
> 0.4, 1.6, 2.1, 3.8, 4.0, 5.6, 5.8, 7.2

> **Langkah 2 · aturan tiap pelanggan**
>
> mulai = max(datang, server kosong)  
> delay = mulai − datang · pergi = mulai + S

*[Diagram: lihat slide 13]*

*Titik = waktu datang · kotak merah = menunggu (delay) · kotak hijau = dilayani. Simulasi berhenti saat P6 mulai dilayani.*

### Simulasi dengan tangan ②: tabel & rata-rata delay

*Bab 1.4 · langkah 5 dari 8 · wajib bisa · slide 14*

| Pel. | Datang | Server kosong | Mulai | Delay | S | Pergi |
|---|---|---|---|---|---|---|
| 1 | 0.4 | 0 | 0.4 | 0.0 | 2.0 | 2.4 |
| 2 | 1.6 | 2.4 | 2.4 | 0.8 | 0.7 | 3.1 |
| 3 | 2.1 | 3.1 | 3.1 | 1.0 | 0.2 | 3.3 |
| 4 | 3.8 | 3.3 | 3.8 | 0.0 | 1.1 | 4.9 |
| 5 | 4.0 | 4.9 | 4.9 | 0.9 | 3.7 | 8.6 |
| 6 | 5.6 | 8.6 | 8.6 | 3.0 | 0.6 | (9.2) |

Cara baca: kolom "server kosong" = waktu pergi pelanggan sebelumnya. Jika datang lebih dulu dari itu, ia harus menunggu.

> **Hasil 1 · rata-rata delay**
>
> $$\hat d(6)=\frac{0+0.8+1.0+0+0.9+3.0}{6}=\frac{5.7}{6}=\mathbf{0.95}\ \text{menit}$$

> **Kapan berhenti?**
>
> Saat pelanggan ke-6 **mulai dilayani**: $T(6)=8.6$. P7 (datang 5.8) dan P8 (datang 7.2) masih di antrian.

> **Jebakan**
>
> Delay = waktu **di antrian** saja. Waktu di sistem = delay + service.

### Simulasi dengan tangan ③: luas di bawah kurva

*Bab 1.4 · langkah 5 dari 8 · wajib bisa · slide 15*

*[Diagram: lihat slide 15]*

Ukuran **continuous-time** dihitung dari **luas**: jumlahkan (tinggi × lebar) tiap potongan waktu.

| Interval | Lama | Q | Luas |
|---|---|---|---|
| 1.6–2.1 | 0.5 | 1 | 0.5 |
| 2.1–2.4 | 0.3 | 2 | 0.6 |
| 2.4–3.1 | 0.7 | 1 | 0.7 |
| 4.0–4.9 | 0.9 | 1 | 0.9 |
| 5.6–5.8 | 0.2 | 1 | 0.2 |
| 5.8–7.2 | 1.4 | 2 | 2.8 |
| 7.2–8.6 | 1.4 | 3 | 4.2 |
| **Total** |   |   | **9.9** |

> **Hasil 2 & 3**
>
> $\hat q(6)=9.9/8.6=\mathbf{1.15}$ pelanggan  
> $\hat u(6)=(2.9+4.8)/8.6=7.7/8.6=\mathbf{0.90}$

### Jalan pintas: rumus Lindley

*Bab 1.4 · langkah 6 dari 8 · slide 16*

> **Rumus · antrian 1 server FIFO**
>
> $$D_1=0,\qquad D_{i+1}=\max\{D_i+S_i-A_{i+1},\ 0\}$$

**Membacanya:** pelanggan berikutnya menunggu sebanyak "sisa kerja" pelanggan sekarang ($D_i+S_i$) dikurangi jarak kedatangannya ($A_{i+1}$). Kalau hasilnya negatif, server sudah kosong → delay 0.

**Cek pada data tadi:**

| $D_2=\max(0+2.0-1.2,0)$ | 0.8 ✓ |
|---|---|
| $D_3=\max(0.8+0.7-0.5,0)$ | 1.0 ✓ |
| $D_4=\max(1.0+0.2-1.7,0)$ | 0 ✓ |
| $D_5=\max(0+1.1-0.2,0)$ | 0.9 ✓ |
| $D_6=\max(0.9+3.7-1.6,0)$ | 3.0 ✓ |

> **Soal 1.1 · coba dulu**
>
> A: 1.0, 0.5, 2.0, 0.3, 1.5. S: 1.2, 1.5, 0.5, 0.8, 1.0. FIFO, mulai kosong. Hitung delay untuk n = 4, rata-ratanya, dan T(4).
>
> **Pembahasan:** Datang: 1.0, 1.5, 3.5, 3.8.
>
> $D_1=0$ · $D_2=\max(0+1.2-0.5,0)=0.7$ · $D_3=\max(0.7+1.5-2.0,0)=0.2$ · $D_4=\max(0.2+0.5-0.3,0)=0.4$
>
> Rata-rata $=1.3/4=\mathbf{0.325}$ menit. P4 mulai dilayani di 4.2 → $T(4)=\mathbf{4.2}$.
>
> Bonus: server sibuk 1.0–4.2 → $u=3.2/4.2=0.762$.

### Variasi: aturan berhenti, waktu acak, event graph

*Bab 1.4 · langkah 6 dari 8 · slide 17*

**Stopping rule**

**Setelah n delay:** jumlah pelanggan tetap, tapi waktu akhir $T(n)$ acak.

**Di waktu tetap** (mis. 480 menit): waktu tetap, jumlah delay acak. Tambahkan event buatan **"end-simulation"** (tipe 3) yang dijadwalkan saat inisialisasi; jangan lupa update statistik continuous-time sampai akhir.

**Waktu acak eksponensial**

Di program, interarrival & service diambil dari distribusi eksponensial (mean 1 dan 0.5):

1. Bangkitkan $U\sim U(0,1)$
2. $X=-\beta\ln U$

$\beta=1,\ U=0.37\Rightarrow X=0.994$ menit. Detailnya di Modul 6.

**Event graph**

Untuk model kompleks, event-nya tidak selalu jelas. **Event-graph method** (Schruben, 1983) memakai teori graf untuk menentukan event & inisialisasi. Software: **SIGMA**.

Satu run hanya satu sampel: hasilnya belum "jawaban pasti".

### Simulasi inventori dengan kebijakan (s, S)

*Bab 1.5 · langkah 7 dari 8 · slide 18*

*[Diagram: lihat slide 18]*

*Sketsa level inventori I(t): turun karena permintaan, naik saat pesanan tiba.*

> **Aturan tiap awal bulan**
>
> Cek stok $I$:
>
> - $I\ge s$ → **tidak pesan**
> - $I\lt s$ → pesan $Z=S-I$ ("isi sampai S"), biaya $32+3Z$. Barang tiba setelah lag $\sim U(0.5,1)$ bulan.

- Permintaan berlebih di-**backlog** → $I(t)$ bisa negatif.
- $I^+=\max(I,0)$ barang fisik, biaya simpan $h=\$1$/barang/bulan.
- $I^-=\max(-I,0)$ backlog, biaya kekurangan $\pi=\$5$/barang/bulan.
- Total biaya/bulan = pesan + simpan + kekurangan.

> **Contoh (s, S) = (20, 40)**
>
> $I=15\lt20$ → $Z=25$, biaya $32+75=\$107$. $I=-3$ → $Z=43$, biaya \$161. $I=20$ → tidak pesan.

### Inventori: event dan variat acak yang dibutuhkan

*Bab 1.5 · langkah 7 dari 8 · slide 19*

**4 jenis event:**

1. Pesanan dari supplier tiba
2. Permintaan pelanggan
3. Akhir simulasi (bulan 120)
4. Evaluasi inventori di awal bulan

> **Favorit ujian: kenapa event 3 sebelum 4?**
>
> Di t = 120 keduanya terjadi bersamaan. Jika evaluasi duluan, model bisa **memesan** (dan menanggung biaya) padahal simulasi sudah selesai.

State: level inventori, jumlah pesanan belum datang, waktu event terakhir.

**Variat acak:**

- Waktu antar permintaan: eksponensial (mean 0.1 bulan)
- Delivery lag: $0.5+0.5U$. $U=0.4$ → 0.7 bulan
- Ukuran permintaan 1–4 dengan peluang 1/6, 1/3, 1/3, 1/6: lihat U jatuh di potongan mana

*[Diagram: lihat slide 19]*

### Langkah studi simulasi yang baik (Law)

*Bab 1.6–1.8 · langkah 8 dari 8 · slide 20*

**1** (Formulasi masalah & rencana) → **2** (Kumpulkan data, definisikan model) → **3** (Model konseptual valid? tidak → ke 2) → **4** (Buat program & verifikasi) → **5** (Pilot runs)

**6** (Program valid? tidak → ke 2) → **7** (Rancang eksperimen) → **8** (Production runs) → **9** (Analisis output) → **10** (Dokumentasi & implementasi)

**Jenis simulasi lain:**

- **Continuous**: persamaan diferensial
- **Combined**: tangki diisi terus (kontinu) + event "penuh, katup ditutup" (diskrit)
- **Monte Carlo**: tanpa waktu (statis)

**Pendekatan alternatif:**

- **Parallel/distributed**: model dipecah ke banyak prosesor; sinkronisasi atau rollback ("virtual time")
- **Web-based**: mesin simulasi pusat

**Hubungan ke modul lain:**

Langkah 2 → Modul 4 (data input). Langkah 3, 4, 6 → Modul 7 (validasi). Langkah 9 → Modul 8.

### Monte Carlo, kelebihan, dan jebakan simulasi

*Bab 1.8–1.9 · langkah 8 dari 8 · slide 21*

> **Monte Carlo untuk integral**
>
> Ingin $I=\int_a^b g(x)\,dx$. Ambil $X\sim U(a,b)$, hitung $Y=(b-a)\,g(X)$, lalu **rata-ratakan** Y.

*[Diagram: lihat slide 21]*

$U=0.2,0.5,0.9$ → $X=0.4,1,1.8$ → $Y=2X^2=0.32,\,2,\,6.48$ → rata-rata **2.93** (eksak 2.667; makin banyak sampel makin dekat).

| Kelebihan | Kekurangan | Pitfalls |
|---|---|---|
| Bisa untuk sistem sangat kompleks | Hanya memberi **estimasi** (ada noise) | Tujuan tidak jelas di awal |
| Mudah membandingkan alternatif | Model bisa mahal dibuat | Tingkat detail tidak tepat |
| Kondisi eksperimen terkontrol | Output banyak, perlu analisis statistik | Analisis eksperimen tidak memadai |
| Waktu panjang bisa dikompres |   | Pelatihan kurang |

> **Soal 1.3 · klasifikasikan**
>
> (a) luas danau dengan melempar titik acak (b) antrian ATM seharian (c) gerak roket tanpa gangguan acak
>
> **Pembahasan:** (a) statis, stokastik (Monte Carlo) · (b) dinamis, stokastik, diskrit = DES · (c) dinamis, deterministik, kontinu

### Latihan & ringkasan Modul 1

*Bab 1 · soal & ringkasan · slide 22*

> **Soal 1.2 · kebijakan (s, S) = (25, 60), biaya 32 + 3Z**
>
> Hitung biaya pesan bila stok awal bulan: (a) 30 (b) 10 (c) −5.
>
> **Pembahasan:** (a) $30\ge25$ → tidak pesan, \$0
>
> (b) $Z=60-10=50$ → $32+150=\mathbf{\$182}$
>
> (c) $Z=60-(-5)=65$ → $32+195=\mathbf{\$227}$ (backlog 5 ikut ditutup)

> **Yang harus dibawa ke modul berikutnya**
>
> 1. DES = dinamis + stokastik + diskrit; state berubah saat **event**.
> 2. Next-event: clock melompat ke event terdekat.
> 3. 10 komponen: state, clock, event list, counters, init, timing, event routines, library, report, main.
> 4. Delay: rata-rata per pelanggan. Q dan utilisasi: **luas ÷ waktu**.
> 5. Lindley: $D_{i+1}=\max\{D_i+S_i-A_{i+1},0\}$.
> 6. (s, S): $I\lt s$ → pesan $S-I$; event akhir sebelum evaluasi.

---

## Mesin di Balik Simulasi

*Modul 2 · Bab 2 Modeling Complex Systems · Bab 3 Simulation Software* · slide 23

Di Modul 1 kita menyimpan antrian dan event list dengan tangan. Untuk sistem besar, ini harus diatur rapi: bagaimana list disimpan, alat apa yang membantu (simlib), dan software apa yang dipakai.

> **Fokus ujian:** kebanyakan soal konsep: linked list, fungsi simlib (sampst vs timest), aturan jockeying, dan perbandingan software.

**Langkah di modul ini:**

1. List, record, atribut
2. Sequential vs linked allocation
3. simlib: fakta & 19 fungsi
4. Contoh model: time-shared, bank jockeying, job shop
5. Event list yang efisien
6. Software simulasi: paket vs bahasa
7. Event-scheduling vs process-interaction
8. Fitur software yang diinginkan

### List: tempat menyimpan antrian dan event

*Bab 2.1–2.2 · langkah 1–2 dari 8 · slide 24*

**List:**

kumpulan **record**. Satu record = satu objek (satu orang di antrian, satu event). Record = **baris**.

**Atribut:**

data milik tiap record. Atribut = **kolom**.

**Contoh record:**

Antrian: [waktu datang, tipe, prioritas]  
Event list: [waktu event, tipe event]

*[Diagram: lihat slide 24]*

> **Analogi**
>
> **Sequential** = antri berjejer, menyisip → semua mundur. **Linked** = duduk di mana saja, tiap orang pegang kertas "sesudah saya: kursi no. 7".

### Kenapa linked allocation lebih unggul?

*Bab 2.2 · langkah 2 dari 8 · slide 25*

**Struktur doubly-linked list:**

- **Successor link** (front pointer): record logis berikutnya.
- **Predecessor link** (back pointer): record logis sebelumnya.
- Tiap list punya **head pointer** (record pertama) dan **tail pointer** (terakhir).

> **Contoh di slide**
>
> Area 15 baris × (4 atribut + back + forward pointer), plus array 25 × 2 untuk head/tail tiap list. Contoh list: antrian FIFO, antrian **Shortest-Job-First** (disisipkan terurut naik pada kebutuhan layanan), event list (terurut waktu).

**3 keunggulan linked vs sequential:**

1. **Tambah, hapus, sisip, pindah record jauh lebih cepat**: cukup atur ulang pointer, data tidak bergeser. Penting untuk event list.
2. **Hemat memori tanpa risiko overflow**: beberapa list berbagi area penyimpanan, bisa tumbuh dan menyusut.
3. Memberi **kerangka umum** untuk list processing, yang merupakan bagian besar dari komputasi simulasi.

Sequential (posisi logis = fisik) dipakai di Bab 1.

### simlib: "bahasa simulasi" mini dalam C

*Bab 2.3 · langkah 3 dari 8 · slide 26*

> **Intinya**
>
> **simlib** = kumpulan fungsi C (ada versi FORTRAN) untuk tugas rutin simulasi: list, event list, bilangan/variat acak, statistik, laporan. **Bukan** bahasa simulasi sungguhan, tapi menunjukkan isi software simulasi komersial.

**Fakta yang perlu dihafal (angkanya!):**

**→ 25**

list maksimum

**→ 10**

atribut per record (maxatr, tidak boleh < 4)

**→ List 25**

= event list: atr 1 waktu, atr 2 tipe, terurut naik

**→ float**

tipe data; record dibatasi hardware saja

**Variabel kunci:**

| `sim_time` | simulation clock |
|---|---|
| `next_event_type` | tipe event berikutnya |
| `transfer[1..10]` | wadah atribut keluar/masuk list |
| `list_size[list]` | jumlah record di list |
| `list_rank[list]` | atribut untuk mengurutkan list |
| `FIRST, LAST, INCREASING, DECREASING` | opsi filing 1, 2, 3, 4 |

Inti simlib: kumpulan **doubly linked list** di memori dinamis. Wajib `#include "simlib.h"`.

### 19 fungsi simlib, dikelompokkan per tugas

*Bab 2.3 · langkah 3 dari 8 · slide 27*

**Mulai & list**

`init_simlib` awal tiap run: clock 0, list kosong

`list_file(opsi, list)` masukkan record dari `transfer`: 1 FIRST, 2 LAST, 3 INCREASING, 4 DECREASING

`list_remove(opsi, list)` ambil FIRST/LAST ke `transfer`

**Event**

`timing` ambil event teratas, majukan clock

`event_schedule(time, type)` jadwalkan event

`event_cancel(type)` batalkan event terdekat bertipe itu

**Statistik**

`sampst(value, var)` **discrete-time**: mean, n, max, min

`timest(value, var)` **continuous-time**: mean, max, min

`filest(list)` statistik panjang list

`out_sampst / out_timest / out_filest`

**Acak**

`expon(mean, stream)` · `uniform(a, b, stream)` · `erlang(m, mean, stream)` · `random_integer(prob[], stream)` (prob = CDF, terakhir 1.0)

`lcgrand(stream)` U(0,1), stream 1–100 · `lcgrandst` set seed · `lcgrandgt` ambil seed terkini

> **Jebakan: sampst vs timest**
>
> **sampst** untuk data **per kejadian** (delay pelanggan ke-1, ke-2, …). **timest** untuk variabel yang **bernilai sepanjang waktu** (jumlah di antrian, mesin sibuk). Sama dengan discrete vs continuous-time di Modul 1.

### Urutan kerja program dengan simlib

*Bab 2.3–2.4 · langkah 3 dari 8 · slide 28*

1. Baca parameter input.
2. Panggil `init_simlib`.
3. (Jika perlu) set `list_rank` dan `maxatr`.
4. (Jika perlu) inisialisasi `timest` bernilai bukan nol.
5. Isi event list awal dengan `event_schedule`.
6. Loop: `timing` → panggil fungsi event yang sesuai (switch/case).
7. Akhir: report generator (`sampst, timest, filest, out_*`).

**Error checking:** time reversal (jadwal di masa lalu), nomor list ilegal, mengambil dari list kosong.

> **2.4 · antrian 1 server versi simlib**
>
> | List | 1 antrian [waktu datang], 2 server (dummy), 25 event list |
> |---|---|
> | sampst | 1 = delay |
> | Stream | 1 interarrival, 2 service |

> **Kenapa hasilnya beda dari Bab 1?**
>
> Model dan parameter sama, tapi **bilangan acaknya berbeda** (stream terpisah). Satu run = satu sampel.

> **Catatan:** Tips: tentukan list, atribut, variabel sampst/timest, dan stream **di awal**, tulis, lalu konsisten.

### Contoh model 1: time-shared computer (round-robin)

*Bab 2.5 · langkah 4 dari 8 · slide 29*

- $n$ terminal; job "berpikir" ~ expo(25 dtk), lalu ke CPU.
- Kebutuhan CPU ~ expo(0.8 dtk).
- **Round-robin**: tiap kunjungan maksimal **quantum q = 0.1** dtk. Belum selesai → ke belakang antrian.
- **Swap time τ = 0.15** dtk tiap masuk CPU.
- Response time = kembali ke terminal − meninggalkan terminal.
- Round-robin = kompromi FIFO ($q=\infty$) dan SJF ($q\to0$).

> **Catatan:** Pertanyaan: terminal maksimal agar rata-rata response < 30 dtk? Hasil: **sedikit di bawah 60** (tapi baru satu run).

> **Contoh · job butuh 0.27 dtk CPU**
>
> *[Diagram: lihat slide 29]*
>
> Kunjungan 1: 0.15 + 0.1 (sisa 0.17) · Kunjungan 2: 0.15 + 0.1 (sisa 0.07) · Kunjungan 3: 0.15 + 0.07 selesai
>
> Total di CPU = $3(0.15)+0.27=\mathbf{0.72}$ dtk

Event: 1 job tiba, 2 job keluar CPU, 3 akhir. List: 1 antrian, 2 CPU, atribut [waktu tiba, sisa service].

### Contoh model 2: bank multiteller dengan jockeying

*Bab 2.6 · langkah 4 dari 8 · slide 30*

*[Diagram: lihat slide 30]*

*Teller 3 baru selesai, n = (3, 2, 1, 3, 4)*

> **Aturan jockey (saat teller i selesai)**
>
> 1. Cari antrian $j$ dengan $n_j\gt n_i+1$ (n = antri + dilayani).
> 2. Pelanggan **paling belakang** antrian $j$ pindah ke $i$.
> 3. Banyak kandidat → pilih yang **paling dekat**; seri → **kiri**.

> **Penyelesaian contoh**
>
> Syarat $n_j\gt 1+1=2$ → kandidat T1 (3), T4 (3), T5 (4). Jarak ke 3: 2, 1, 2 → pilih **T4**.  
> Variasi n = (1, 3, 1, 3, 2): T2 dan T4 sama dekat → pilih kiri, **T2**.

Pelanggan baru: ada teller idle → yang paling kiri; semua sibuk → antrian terpendek (seri → kiri). Pintu tutup menit 480. Hasil: 4 teller bencana, 6 layak, 7 berlebihan.

### Contoh model 3: job shop, lalu event list yang efisien

*Bab 2.7–2.8 · langkah 4–5 dari 8 · slide 31*

**Job shop:**

- 5 stasiun, mesin identik per stasiun; 3 tipe job (peluang 0.3, 0.5, 0.2); interarrival expo(0.25 jam); service 2-Erlang.

| Tipe | Rute stasiun |
|---|---|
| 1 | 3 → 1 → 2 → 5 |
| 2 | 4 → 1 → 3 |
| 3 | 2 → 5 → 1 → 4 → 3 |

> **Rata-rata berbobot peluang tipe**
>
> Delay tipe 1, 2, 3 = 10, 8, 15 jam → $0.3(10)+0.5(8)+0.2(15)=\mathbf{10}$ jam.  
> Dibobot karena peluang tipe sudah diketahui pasti, sehingga keacakan proporsi tipe di satu run hilang.

Utilisasi grup = rata-rata mesin sibuk ÷ jumlah mesin. Hasil: grup 1, 2, 4 padat; tambah mesin di **grup 4**.

**Event list yang efisien (2.8):**

- Pemrosesan event list bisa makan **~40%** waktu komputasi simulasi besar.
- Cara dasar: (a) array per tipe event, cari minimum; (b) list terurut waktu, ambil dari atas.
- Lebih baik: **binary search**, simpan sebagai **tree / heap**, atau manfaatkan struktur model (mis. sisipkan dengan pencarian dari bawah ke atas).

> **Soal 2.1 · jockeying**
>
> 6 teller, teller 4 selesai, n = (2, 4, 3, 1, 3, 4). Dari mana?
>
> **Pembahasan:** Syarat $n_j\gt2$: T2, T3, T5, T6. Jarak: 2, 1, 1, 2. Seri T3 & T5 → kiri, **T3**.

### Software simulasi: paket atau bahasa pemrograman?

*Bab 3.1–3.2 · langkah 6 dari 8 · slide 32*

Hampir semua simulasi mengerjakan 7 hal yang sama, dan software simulasi dibuat untuk mengerjakannya untukmu:

bilangan acak U(0,1) · variat acak · majukan waktu · pilih & jalankan event · kelola list · statistik & laporan · deteksi error

**Paket simulasi unggul karena…**

- Banyak fitur siap pakai → usaha programming jauh berkurang
- Kerangka alami untuk pemodelan
- Model lebih mudah dimodifikasi
- Deteksi error khusus simulasi lebih baik

**Bahasa umum (C, C++, Java) unggul karena…**

- Lebih dikenal dan tersedia luas
- Eksekusi bisa lebih cepat
- Bisa lebih fleksibel
- Biaya software lebih murah

> **Analogi**
>
> Bahasa C = **memasak dari bahan mentah** (bebas, tapi semua dikerjakan sendiri). Paket simulasi = **dapur dengan bumbu jadi** (cepat dan jarang gagal, tapi kreasi dibatasi alat).

### Dua sudut pandang memodelkan: event vs proses

*Bab 3.3 · langkah 7 dari 8 · slide 33*

**Event-scheduling**

Sudut pandang **CCTV ruang kontrol**

10.03 kedatangan  
10.05 kepergian  
10.06 kedatangan

- Identifikasi event, tulis logika tiap event (seperti Bab 1–2)
- Bisa pakai bahasa umum
- **Selama memproses satu event, waktu simulasi tidak berjalan**

**Process-interaction `dipakai software modern`**

Sudut pandang **vlog pelanggan**

datang → antri → dilayani 3 mnt → pulang

- Ikuti **entitas** dari masuk sampai keluar, digambar seperti flowchart
- Bisa banyak entitas dan banyak jenis
- **Selama memproses satu entitas, waktu simulasi berjalan**

> **Catatan:** Klasifikasi sekarang: **general-purpose** (Arena, Extend, SIMUL8, GPSS/SLX…) vs **application-oriented** (manufaktur, call center, kesehatan…).

> **Catatan:** OOP dan simulasi berorientasi objek sama-sama lahir dari **SIMULA (1960-an)**. Contoh produk: MODSIM III.

### Elemen pemodelan & fitur software yang diinginkan

*Bab 3.3–3.4 · langkah 8 dari 8 · slide 34*

**4 elemen pemodelan umum:**

| Elemen | Arti | Rumah sakit |
|---|---|---|
| **Entities** | objek yang bergerak di sistem | pasien |
| **Attributes** | info melekat di tiap entitas (set sama, nilai beda) | usia, urgensi |
| **Resources** | yang melayani: server, mesin, pekerja | dokter, ranjang |
| **Queues** | tempat menunggu jika resource penuh | ruang tunggu IGD |

**Fitur yang diinginkan:**

**Umum**  
fleksibel, mudah, hierarchical, cepat, template, run-time version, impor/ekspor, combined discrete/continuous, mulai dari kondisi non-kosong, simpan state

**Statistik**  
RNG bagus (siklus panjang, banyak stream), **seed default tetap, bukan dari jam komputer**, banyak distribusi, replikasi independen, CI, warmup, desain eksperimen, optimasi

Plus: cocok dengan hardware/OS, animasi (2D/3D, concurrent/post-processing), dukungan & dokumentasi, laporan output yang bisa dikustom.

### Latihan & ringkasan Modul 2

*Bab 2–3 · soal & ringkasan · slide 35*

> **Soal 2.2 · fungsi simlib apa?**
>
> (a) catat delay tiap pelanggan (b) catat jumlah mesin sibuk sepanjang waktu (c) jadwalkan kedatangan berikutnya (d) masukkan ke ujung antrian (e) ambil pelanggan terdepan
>
> **Pembahasan:** (a) `sampst` (b) `timest` (c) `event_schedule` (d) `list_file(LAST, list)` (e) `list_remove(FIRST, list)`

> **Soal 2.3 · job shop**
>
> Peluang tipe 0.3, 0.5, 0.2; delay 12, 6, 20 jam. Rata-rata keseluruhan?
>
> **Pembahasan:** $0.3(12)+0.5(6)+0.2(20)=\mathbf{10.6}$ jam

> **Yang dibawa ke modul berikutnya**
>
> 1. Linked list: sisip/hapus cukup ubah pointer.
> 2. simlib: 25 list, 10 atribut, list 25 = event list.
> 3. sampst = per kejadian, timest = sepanjang waktu.
> 4. Jockey: $n_j\gt n_i+1$, terdekat, seri → kiri.
> 5. Event-scheduling: waktu diam saat event. Process-interaction: waktu berjalan.
> 6. Elemen: entities, attributes, resources, queues.
> 7. Hasil berbeda karena bilangan acak berbeda → kita butuh **statistik** (Modul 3).

---

## Bekal Statistik

*Modul 3 · Bab 4 · Review of Basic Probability and Statistics* · slide 36

Di Modul 1–2 kita lihat: satu run simulasi hanya satu sampel acak. Untuk menyimpulkan sesuatu, kita perlu bahasa statistik. Modul ini adalah "alat" yang dipakai di semua modul berikutnya.

> **Paling penting:** confidence interval (CI). Ia dipakai lagi di validasi (Modul 7) dan membandingkan sistem (Modul 8).

**Langkah di modul ini:**

1. Variabel acak: PMF, PDF, CDF
2. Mean dan varians
3. Kovarians dan korelasi
4. Output simulasi = proses stokastik
5. Estimasi mean dan varians
6. Confidence interval: ide, langkah, contoh
7. t vs z, ukuran sampel

### Variabel acak diskrit: PMF dan CDF

*Bab 4.1 · langkah 1 dari 7 · slide 37*

> **Intinya**
>
> **Variabel acak** = angka yang nilainya ditentukan hasil percobaan acak. **Diskrit**: nilainya bisa dihitung satu-satu (1, 2, 3…). **Kontinu**: bisa berapa saja dalam rentang (2.371 menit).

*[Diagram: lihat slide 37]*

$p(x_i)=P(X=x_i)$, dengan $\sum p(x_i)=1$  
$F(x)=P(X\le x)=\sum_{x_i\le x}p(x_i)$

| x (demand) | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| p(x) | 1/6 | 1/3 | 1/3 | 1/6 |
| F(x) | 1/6 | 1/2 | 5/6 | 1 |

> **Contoh 4.1**
>
> $P(X\le2)=F(2)=1/2$  
> $P(2\le X\le3)=1/3+1/3=2/3$

### Variabel acak kontinu: peluang = luas

*Bab 4.1 · langkah 1 dari 7 · slide 38*

*[Diagram: lihat slide 38]*

$P(X\in B)=\int_B f(x)\,dx$  dan  $F(x)=\int_{-\infty}^x f(y)\,dy$

Jebakan: $P(X=x)=0$ untuk satu titik. Peluang hanya untuk interval.

> **Eksponensial (mean β)**
>
> $$f(x)=\tfrac1\beta e^{-x/\beta},\qquad F(x)=1-e^{-x/\beta}$$

> **Contoh 4.2 · β = 2**
>
> $P(X\le3)=1-e^{-1.5}=\mathbf{0.7769}$ · $P(X\gt1)=e^{-0.5}=\mathbf{0.6065}$  
> $P(1\lt X\le3)=F(3)-F(1)=0.3834$

> **Analogi**
>
> PDF seperti **kepadatan penduduk**: kepadatan di satu titik bukan jumlah orang; jumlah orang = kepadatan × **luas wilayah**.

### Mean (pusat) dan varians (sebaran)

*Bab 4.1 · langkah 2 dari 7 · slide 39*

> **Rumus**
>
> $$\mu=E(X)=\textstyle\sum x_i\,p(x_i)\ \ \text{atau}\ \ \int x f(x)\,dx$$  
> $$\sigma^2=\mathrm{Var}(X)=E(X^2)-\mu^2$$

*[Diagram: lihat slide 39]*

**Sifat yang sering keluar:**

| $E(cX)=cE(X)$ | konstanta keluar biasa |
|---|---|
| $E(X+Y)=E(X)+E(Y)$ | **selalu** |
| $\mathrm{Var}(cX)=c^2\mathrm{Var}(X)$ | konstanta **dikuadratkan** |
| $\mathrm{Var}(X+c)=\mathrm{Var}(X)$ | geser tidak mengubah sebaran |
| $\mathrm{Var}(X+Y)=\mathrm{Var}X+\mathrm{Var}Y$ | hanya jika **independen** |

> **Contoh · demand size**
>
> $E(X)=\frac{1+4+6+4}{6}=\mathbf{2.5}$  
> $E(X^2)=\frac{1+8+18+16}{6}=7.1667$  
> $\mathrm{Var}=7.1667-6.25=\mathbf{0.9167}$, $\sigma=0.957$

E(X)=3, Var=2 → E(4X)=12, Var(4X)=**32** (bukan 8). Normal: ±68% dalam μ±σ, ±95% dalam μ±2σ.

### Kovarians dan korelasi: apakah dua variabel bergerak bersama?

*Bab 4.1 · langkah 3 dari 7 · slide 40*

*[Diagram: lihat slide 40]*

> **Rumus**
>
> $$\mathrm{Cov}(X,Y)=E(XY)-E(X)E(Y)$$  
> $$\mathrm{Cor}=\frac{\mathrm{Cov}}{\sqrt{\mathrm{Var}X\,\mathrm{Var}Y}}\in[-1,1]$$  
> $$\mathrm{Var}(X\pm Y)=\mathrm{Var}X+\mathrm{Var}Y\pm2\,\mathrm{Cov}$$

- Korelasi mengukur hubungan **linear**. $Y=aX+b$: Cor = +1 (a>0) atau −1 (a<0).
- **Independen ⇒ uncorrelated**, tapi tidak sebaliknya.

> **Contoh**
>
> Var X = 4, Var Y = 9, Cov = 3 → Cor = 3/6 = 0.5  
> Var(X − Y) = 4 + 9 − 6 = **7** · Var(X + Y) = 19

> **Catatan:** Cov positif **mengecilkan** Var(X − Y). Ini kunci teknik common random numbers di Modul 8.

### Output simulasi adalah proses stokastik

*Bab 4.2 · langkah 4 dari 7 · slide 41*

*[Diagram: lihat slide 41]*

**Proses stokastik** = barisan variabel acak sejenis yang terurut waktu. Discrete-time: $D_1, D_2,\dots$ Continuous-time: $\{Q(t)\}$.

> **Problem 4.2 · favorit ujian**
>
> **Apakah $D_i$ dan $D_{i+1}$ independen?** Tidak, mereka **berkorelasi positif**. Kalau pelanggan ke-i menunggu lama, yang berikutnya kemungkinan juga lama. Lindley: $D_{i+1}$ dihitung langsung dari $D_i$.

Korelasi lebih besar jika utilisasi tinggi (ρ = 0.9 ≫ 0.5) dan mengecil jika jaraknya (lag) makin jauh.

> **Akibatnya**
>
> Data **dalam satu run** bukan IID → jangan langsung masukkan ke rumus varians/CI.  
> Rata-rata dari **replikasi independen** (run 1, run 2, …) adalah IID → boleh.

### Mengestimasi mean dan varians dari sampel

*Bab 4.3 · langkah 5 dari 7 · slide 42*

Misal $X_1,\dots,X_n$ IID, mean μ dan varians σ² tidak diketahui. Kita menebaknya dari data:

**(1) Rata-rata sampel:**

$$\bar X(n)=\frac{\sum X_i}{n}$$

(2) tak bias: $E[\bar X]=\mu$

**(4) Varians sampel:**

$$S^2(n)=\frac{\sum(X_i-\bar X)^2}{n-1}$$

bagi **n − 1**, bukan n

**(3, 5) Varians rata-rata:**

$$\mathrm{Var}[\bar X]=\frac{\sigma^2}{n}\approx\frac{S^2(n)}{n}$$

makin banyak data, makin stabil

> **Problem 4.3 · buktikan X̄ tak bias**
>
> $E[\bar X]=E[\tfrac1n\sum X_i]=\tfrac1n\sum E(X_i)=\tfrac1n\cdot n\mu=\mu$ ∎

> **Catatan:** Masalahnya: $\bar X$ sendiri acak. Di satu percobaan bisa dekat μ, di percobaan lain jauh. Seberapa dekat? Jawabannya: **confidence interval**.

### Confidence interval: ide dasarnya

*Bab 4.4 · langkah 6 dari 7 · slide 43*

*[Diagram: lihat slide 43]*

> **Rumus (6) · CI 100(1−α)%**
>
> $$\bar X(n)\pm\underbrace{t_{n-1,\,1-\alpha/2}\sqrt{\frac{S^2(n)}{n}}}_{\text{half-length}}$$

> **Analogi**
>
> Menebak suhu rata-rata kota dari 5 hari: bukan "pasti 30.0°C", tapi "**antara 28.8 dan 31.2°C, yakin 90%**". Data makin banyak → rentang makin sempit. Keyakinan makin tinggi → rentang makin lebar (jaring dilebarkan).

> **Interpretasi yang benar**
>
> ~~"Peluang μ ada di [3.94, 4.86] adalah 90%"~~ ✗ μ itu konstanta.  
> ✓ "**90% dari interval yang dibuat dengan cara ini akan memuat μ**" (seperti gambar kiri).

### Menghitung CI langkah demi langkah

*Bab 4.4 · langkah 6 dari 7 · wajib bisa · slide 44*

> **Data: 5 replikasi rata-rata delay**
>
> 4.2, 3.8, 5.1, 4.6, 4.3 → buat CI 90% dan 95%

1. $\bar X=22/5=\mathbf{4.4}$
2. Deviasi −0.2, −0.6, 0.7, 0.2, −0.1 → kuadrat 0.04, 0.36, 0.49, 0.04, 0.01 → jumlah 0.94 → $S^2=0.94/4=\mathbf{0.235}$
3. $\sqrt{S^2/n}=\sqrt{0.047}=0.2168$
4. 90%: $t_{4,0.95}=2.132$ → half = 0.462 → **[3.938, 4.862]**
5. 95%: $t_{4,0.975}=2.776$ → half = 0.602 → **[3.798, 5.002]**

> **Memilih nilai t**
>
> CI 90% → α = 0.1 → cari $t_{n-1,\ 0.95}$  
> CI 95% → α = 0.05 → cari $t_{n-1,\ 0.975}$  
> derajat bebas = **n − 1**

| df | 4 | 5 | 9 | 19 | ∞ |
|---|---|---|---|---|---|
| t 0.95 | 2.132 | 2.015 | 1.833 | 1.729 | 1.645 |
| t 0.975 | 2.776 | 2.571 | 2.262 | 2.093 | 1.960 |

Tabel lengkap biasanya diberikan di ujian.

*[Diagram: lihat slide 44]*

### t vs z, dan berapa data yang dibutuhkan?

*Bab 4.4 · langkah 7 dari 7 · slide 45*

**Kenapa pakai t, bukan z?**

- $t_{n-1}\gt z$ untuk n ≥ 2: ekor t lebih "gemuk" → CI lebih lebar, lebih hati-hati.
- t mendekati z saat n besar (n = 50: t ≈ z).
- t mengurangi efek **skewness** dan n kecil.
- α makin kecil (keyakinan tinggi) → half-length makin panjang.

Jika X normal, coverage tepat 1 − α. Jika tidak normal dan n kecil, coverage turun (makin parah jika makin miring).

> **Problem 4.4 · half-length ∝ 1/√n**
>
> Ingin half-length jadi **setengah**: $\sqrt{n'}=2\sqrt n\Rightarrow n'=4n$. Dari 50 replikasi → **200**.  
> Umum: dipersempit k kali → n dikali **k²**.

1. n = 50 → half-length h *(↓ × 4 data)*
2. n = 200 → half-length h/2 *(↓ × 4 lagi)*
3. n = 800 → half-length h/4

### Latihan Modul 3

*Bab 4 · soal & ringkasan · slide 46*

> **Soal 4.1 · X = 0, 1, 2 dengan p = 0.2, 0.5, 0.3**
>
> Hitung E(X), Var(X), Var(3X + 2).
>
> **Pembahasan:** E = 0 + 0.5 + 0.6 = 1.1 · E(X²) = 0.5 + 1.2 = 1.7 · Var = 1.7 − 1.21 = **0.49** · Var(3X+2) = 9(0.49) = **4.41**

> **Soal 4.2 · interarrival expo mean 4**
>
> P(datang dalam 2 menit)? P(lebih dari 8 menit)?
>
> **Pembahasan:** $1-e^{-0.5}=\mathbf{0.3935}$ · $e^{-2}=\mathbf{0.1353}$

> **Soal 4.3 · n = 10, X̄ = 12.5, S² = 4**
>
> Buat CI 90%.
>
> **Pembahasan:** $t_{9,0.95}=1.833$ · half = $1.833\sqrt{0.4}=1.159$ · CI = **[11.341, 13.659]**. Agar half ≈ 0.58: ±40 replikasi.

> **Soal 4.4 · Var X = Var Y = 5, Cor = 0.8**
>
> Cov dan Var(X − Y)? Bandingkan jika independen.
>
> **Pembahasan:** Cov = 0.8·5 = 4 · Var(X−Y) = 10 − 8 = **2**. Independen: 10. Korelasi positif membuat selisih jauh lebih stabil.

---

## Data Input & Distribusi

*Modul 4 · Bab 6 · Input Analysis* · slide 47

Model antrian butuh waktu antar kedatangan dan waktu layanan yang acak. Dari mana bentuk acaknya? Dari data nyata: kita pilih distribusi, tebak parameternya, lalu uji kecocokannya.

> **Alurnya 3 langkah:** ① tebak keluarga distribusi → ② estimasi parameter (MLE) → ③ uji kecocokan (chi-square, K-S). Soal hitungan paling sering: **K-S** dan **chi-square**.

**Langkah di modul ini:**

1. Tiga cara memakai data
2. Keluarga + parameter (location, scale, shape)
3. Katalog distribusi
4. Langkah ①: menebak keluarga (cv, Lexis, skewness, histogram)
5. Langkah ②: MLE
6. Langkah ③: uji chi-square
7. Langkah ③: uji Kolmogorov-Smirnov

### Tiga cara "menggerakkan" model dengan data

*Bab 6 · langkah 1 dari 7 · slide 48*

| Cara | Idenya | Plus | Minus |
|---|---|---|---|
| **1. Trace-driven** | data nyata dipakai langsung berurutan | sederhana, meniru perilaku nyata persis | tidak bisa menghasilkan nilai di luar sampel |
| **2. Distribusi empiris** | tabel frekuensi kumulatif F(x) dari data, lalu sampel dari tabel | tanpa asumsi bentuk distribusi | tidak rata jika sampel kecil; **tidak bisa keluar dari [min, max]** |
| **3. Distribusi teoritis** | cocokkan data ke expo, gamma, … | halus; bisa menghasilkan nilai ekstrem; ringkas | harus memilih keluarga & menguji kecocokan |

> **Analogi · meniru gaya bicara teman**
>
> **Trace** = memutar ulang rekaman. **Empiris** = memotong rekaman dan menyusun ulang acak. **Teoritis** = mempelajari polanya lalu membuat kalimat baru.

> **Contoh empiris · LOS rumah sakit (N = 546)**
>
> F(3) = 0.601, F(4) = 0.689. Bilangan acak 0.62 ada di antaranya → interpolasi:  
> $x=3+\frac{0.62-0.601}{0.689-0.601}\approx\mathbf{3.2}$ hari

### Distribusi = keluarga + parameter

*Bab 6 · langkah 2 dari 7 · slide 49*

Keluarga dikenali dari **bentuk** density-nya. Lalu ada 3 jenis parameter yang mengatur posisi dan bentuk kurva:

*[Diagram: lihat slide 49]*

**Location γ**

Menggeser kurva kiri/kanan, bentuk tetap.  
a pada U(a, b), μ pada normal

**Scale β**

Meregangkan/menekan, seperti ganti satuan menit → jam.  
β pada eksponensial, σ pada normal

**Shape α**

Mengubah bentuk kurva.  
α pada gamma dan Weibull

> **Analogi foto di HP**
>
> Location = menggeser foto. Scale = zoom in/out. Shape = filter yang mengubah bentuk wajah.

### Katalog distribusi: kenali bentuknya

*Bab 6 · langkah 3 dari 7 · slide 50*

*[Diagram: lihat slide 50]*

> **Catatan:** Hubungan penting: **expo = gamma(1, β) = Weibull(1, β)**. Jumlah m expo(β) = **m-Erlang** = gamma(m, β). Jumlah t Bernoulli = binomial.

> **Catatan:** Normal **jangan** untuk service time (bisa negatif). Lognormal: $\ln X$ normal, jadi data bisa di-log lalu dianalisis sebagai normal.

### Katalog distribusi: mean, varians, kegunaan

*Bab 6 · langkah 3 dari 7 · tabel wajib · slide 51*

| Distribusi | Parameter | Mean | Varians | Kegunaan / catatan |
|---|---|---|---|---|
| **U(a, b)** | a, b | (a+b)/2 | (b−a)²/12 | hanya tahu batas; bahan membangkitkan distribusi lain |
| **expo(β)** | scale β | β | β² | **interarrival time** |
| **gamma(α, β)** | shape α, scale β | αβ | αβ² | waktu tugas; α bulat → m-Erlang |
| **Weibull(α, β)** | shape α, scale β | $\frac\beta\alpha\Gamma(\frac1\alpha)$ | rumit | **waktu sampai rusak**; $F=1-e^{-(x/\beta)^\alpha}$ |
| **N(μ, σ²)** | μ, σ | μ | σ² | error dari set point, jumlah banyak besaran |
| **LN(μ, σ²)** | scale μ, shape σ | $e^{\mu+\sigma^2/2}$ | $e^{2\mu+\sigma^2}(e^{\sigma^2}-1)$ | waktu tugas |
| **Bernoulli(p)** | p | p | p(1−p) | sukses (1) / gagal (0) |
| **bin(t, p)** | t, p | tp | tp(1−p) | jumlah cacat dalam batch t; simetris hanya jika p = 0.5 |

**Cek cepat:** U(2, 10) → mean 6, var 64/12 = 5.33 · gamma(3, 2) → mean 6, var 12 (= 3-Erlang mean 2) · bin(20, 0.1) → mean 2, var 1.8

### Langkah ①: menebak keluarga dari statistik ringkasan

*Bab 6 · langkah 4 dari 7 · ① tebak keluarga · slide 52*

| Statistik | Rumus | Petunjuk |
|---|---|---|
| Mean vs median | $\bar X$, $\hat x_{0.5}$ | sama → simetris; mean > median → miring kanan |
| **Coef. of variation** (kontinu) | $cv=S/\bar X$ | **cv ≈ 1 → eksponensial**; cv > 1 → lognormal |
| **Lexis ratio** (diskrit) | $\tau=S^2/\bar X$ | **τ ≈ 1 → Poisson**; < 1 binomial; > 1 negative binomial |
| **Skewness** | $\nu=\frac{E[(X-\mu)^3]}{\sigma^3}$ | 0 simetris; **> 0 miring kanan**; < 0 kiri |

Gunakan juga pengetahuan awal: normal tidak cocok untuk service time karena bisa negatif.

1. Data kontinu atau diskrit? *(↓ kontinu ↓ hitung cv)*
2. cv ≈ 1 → **eksponensial** *(↓ cv ≠ 1 ↓)*
3. cv < 1 → gamma / Weibull  ·  cv > 1 → **lognormal** *(↓ diskrit ↓ hitung τ)*
4. τ ≈ 1 Poisson · < 1 binomial · > 1 neg. binomial

*[Diagram: lihat slide 52]*

### Histogram: menebak dengan mata

*Bab 6 · langkah 4 dari 7 · ① tebak keluarga · slide 53*

- Gambar histogram, bandingkan bentuknya dengan katalog.
- Coba beberapa lebar kelas: jangan terlalu **kotak-kotak** (boxy), jangan terlalu **bergerigi** (scraggly).

> **Aturan Sturges · jumlah kelas**
>
> $$k=\lfloor 1+3.322\log_{10} n\rfloor$$

| n | hitung | k |
|---|---|---|
| 30 | 1 + 3.322(1.477) = 5.91 | **5** |
| 100 | 1 + 3.322(2) = 7.64 | **7** |
| 1000 | 1 + 3.322(3) = 10.97 | **10** |

> **Catatan tentang slide dosen**
>
> Contoh slide (median 0.0739, CV 0.7875, skewness 0.719) menulis "left skewed". Menurut definisi, **ν = 0.719 > 0 berarti miring kanan**. Kesimpulan tetap: CV ≠ 1 → bukan eksponensial; kandidat **gamma, Weibull, beta**. Di ujian jawab sesuai definisi.

> **Histogram densitas (Bab 7)**
>
> Tinggi batang = frekuensi relatif ÷ lebar kelas, agar **luas** batang = frekuensi relatif. Contoh: 31 dari 78 data, lebar 2 → 0.397/2 = 0.199.

### Langkah ②: Maximum Likelihood Estimator (MLE)

*Bab 6 · langkah 5 dari 7 · ② estimasi parameter · slide 54*

> **Intinya**
>
> Untuk data IID, likelihood $L(\theta)=f_\theta(X_1)\cdots f_\theta(X_n)$. **MLE** = nilai θ yang **memaksimumkan** L: parameter yang membuat data kita "paling mungkin terjadi".

> **Analogi**
>
> Ada sandal ukuran 44 di depan kelas. Pemilik yang "paling mungkin"? Teman yang kakinya paling besar. MLE memilih parameter yang paling masuk akal menghasilkan data.

*[Diagram: lihat slide 54]*

**Turunan MLE eksponensial (sering ditanya):**

1. $L(\beta)=\prod\frac1\beta e^{-X_i/\beta}=\beta^{-n}e^{-\sum X_i/\beta}$
2. Ambil ln: $\ln L=-n\ln\beta-\frac1\beta\sum X_i$
3. Turunkan = 0: $-\frac n\beta+\frac{1}{\beta^2}\sum X_i=0$
4. $\hat\beta=\frac1n\sum X_i=\bar X$

> **Catatan:** MLE β eksponensial = **rata-rata sampel**.

> **MLE gamma (pakai tabel)**
>
> $T=[\ln\bar X-\frac1n\sum\ln X_i]^{-1}$ → cari $\hat\alpha$ di tabel → $\hat\beta=\bar X/\hat\alpha$.  
> Slide: $\bar X=0.1035$, $\frac1n\sum\ln X_i=-2.6534$ → T ≈ 2.6 → $\hat\alpha=1.464$, $\hat\beta\approx0.0707$

### Langkah ③: seberapa cocok? Grafik dulu, lalu uji

*Bab 6 · langkah 6 dari 7 · ③ uji kecocokan · slide 55*

**Heuristik grafik:**

- **Density/histogram overplot**: tumpuk f(x) di atas histogram.
- **Frequency comparison**: proporsi data vs teoritis per kelas.
- **Distribution function difference**: plot $\hat F(x)-F_n(x)$; bagus jika selisih **< 0.10** di semua titik.
- **P-P plot**: $\hat F$ vs $F_n$; bagus jika dekat garis 45°.

**Uji hipotesis:**

**H₀**: data berasal dari distribusi yang diusulkan  
**H₁**: tidak

**Chi-square**

data **dikelompokkan** ke interval, bandingkan O vs E

**K-S**

data **mentah diurutkan**, bandingkan CDF; lebih kuat

> **Jebakan**
>
> **Gagal menolak H₀ ≠ membuktikan H₀ benar.** Artinya hanya: tidak ada alasan kuat untuk menolak.

### Uji chi-square: bandingkan frekuensi O dan E

*Bab 6 · langkah 6 dari 7 · ③ chi-square · slide 56*

*[Diagram: lihat slide 56]*

*Soal 6.4: 100 data, 5 interval sama peluang, O = 18, 25, 22, 15, 20*

1. Bagi data menjadi **k interval**.
2. Hitung $O_j$ = banyak data di interval j.
3. $E_j=n\,p_j=n[\hat F(a_j)-\hat F(a_{j-1})]$. Usahakan **E ≥ 5** (gabung interval).
4. $\chi^2_0=\sum\frac{(O_j-E_j)^2}{E_j}$
5. **Tolak H₀** jika $\chi^2_0\gt\chi^2_{k-1,\,1-\alpha}$

> **Penyelesaian soal 6.4 (α = 0.05)**
>
> $\chi^2_0=\frac{4+25+4+25+0}{20}=\mathbf{2.9}$. Kritis $\chi^2_{4,0.95}=9.488$. 2.9 < 9.488 → **tidak menolak H₀**.

### Chi-square: contoh slide dan catatan derajat bebas

*Bab 6 · langkah 6 dari 7 · ③ chi-square · slide 57*

> **Contoh slide · 30 data, fit gamma, k = 3 setelah digabung**
>
> | Interval s.d. | O | E | (O−E)²/E |
> |---|---|---|---|
> | 0.06 | 13 | 11.555 | 0.181 |
> | 0.12 | 6 | 9.076 | 1.042 |
> | 0.18+ | 11 | 8.419 | 0.791 |
> | **χ²₀** |   |   | **2.014** |
>
> $\chi^2_{2,0.95}=5.991$. 2.014 < 5.991 → data sesuai gamma.

> **Jebakan**
>
> - Bagi dengan **E**, bukan O.
> - Bandingkan **jumlah** χ², bukan rata-ratanya.
> - $p_j$ (peluang) ≠ $E_j$ (frekuensi = n·p).

> **Derajat bebas**
>
> Yang tepat ada di antara $k-s-1$ dan $k-1$ (s = jumlah parameter yang diestimasi). Slide memakai **k − 1**; ikuti soal.

Chi-square dikenal **lemah** (power rendah) dan hasilnya bergantung pada pemilihan interval.

### Uji Kolmogorov-Smirnov: jarak terjauh dua CDF

*Bab 6 · langkah 7 dari 7 · ③ K-S · slide 58*

*[Diagram: lihat slide 58]*

> **Analogi**
>
> Dua pelari (CDF data dan CDF teori) berlari dari 0 ke 1. K-S hanya peduli **jarak terjauh** di antara mereka. Kalau kecil, mereka dianggap "berlari bersama".

> **Rumus · data diurutkan dulu**
>
> $$D^+=\max\Big\{\tfrac in-\hat F(X_{(i)})\Big\},\quad D^-=\max\Big\{\hat F(X_{(i)})-\tfrac{i-1}n\Big\}$$  
> $$D_n=\max\{D^+,D^-\}$$

Kenapa dua? Tangga data naik di tiap titik: $D^+$ mengukur ujung **atas** anak tangga, $D^-$ ujung **bawah**.

### K-S langkah demi langkah: uji U(0,1), 10 data

*Bab 6 · langkah 7 dari 7 · ③ K-S · slide 59*

| i | X(i) = F̂ | i/n | (i−1)/n | i/n − F̂ | F̂ − (i−1)/n |
|---|---|---|---|---|---|
| 1 | 0.09 | 0.1 | 0.0 | 0.01 | **0.09** |
| 2 | 0.23 | 0.2 | 0.1 | −0.03 | **0.13** |
| 3 | 0.24 | 0.3 | 0.2 | 0.06 | 0.04 |
| 4 | 0.26 | 0.4 | 0.3 | 0.14 | −0.04 |
| 5 | 0.36 | 0.5 | 0.4 | 0.14 | −0.04 |
| 6 | 0.38 | 0.6 | 0.5 | 0.22 | −0.12 |
| 7 | 0.55 | 0.7 | 0.6 | 0.15 | −0.05 |
| 8 | 0.62 | 0.8 | 0.7 | 0.18 | −0.08 |
| 9 | 0.65 | 0.9 | 0.8 | **0.25** | −0.15 |
| 10 | 0.76 | 1.0 | 0.9 | 0.24 | −0.14 |

1. $D^+=0.25$, $D^-=0.13$ → $D_{10}=\mathbf{0.25}$
2. Terkoreksi (semua parameter diketahui):  
$(\sqrt{10}+0.12+\frac{0.11}{\sqrt{10}})(0.25)=3.317(0.25)=\mathbf{0.83}$
3. Kritis α = 0.10: **1.224** (0.05: 1.358; 0.01: 1.628)
4. 0.83 < 1.224 → **tidak menolak H₀**

> **Jebakan**
>
> **Urutkan** data dulu · hitung **dua** kolom · nilai negatif **jangan dimutlakkan** (slide menukar label D⁺/D⁻, hasil tetap 0.25).

Jika soal memberi D kritis langsung, bandingkan D dengan itu tanpa koreksi.

### Latihan Modul 4

*Bab 6 · soal latihan · slide 60*

> **Soal 6.1 · tebak keluarganya**
>
> (a) mean 5.0, sd 5.1 (b) diskrit: mean 4, var 4.1 (c) diskrit: mean 6, var 2.4 (d) kontinu CV = 1.8
>
> **Pembahasan:** (a) CV ≈ 1.02 → **eksponensial** (b) τ ≈ 1 → **Poisson** (c) τ = 0.4 → **binomial** (d) CV > 1 → **lognormal**

> **Soal 6.2 · MLE eksponensial**
>
> Data: 2.1, 0.4, 1.7, 3.2, 0.9, 1.5, 0.6, 2.8. MLE β dan CV?
>
> **Pembahasan:** $\hat\beta=13.2/8=\mathbf{1.65}$ · S² = 1.026, S = 1.013 · CV = **0.61**, jauh dari 1 → cek lagi dengan K-S.

> **Soal 6.3 · K-S, uji U(0,1), α = 0.10**
>
> Data: 0.15, 0.31, 0.42, 0.47, 0.85
>
> **Pembahasan:** | i | F̂ | i/n − F̂ | F̂ − (i−1)/n |
> |---|---|---|---|
> | 1 | 0.15 | 0.05 | **0.15** |
> | 2 | 0.31 | 0.09 | 0.11 |
> | 3 | 0.42 | 0.18 | 0.02 |
> | 4 | 0.47 | **0.33** | −0.13 |
> | 5 | 0.85 | 0.15 | 0.05 |
>
> D = 0.33 · terkoreksi $(2.236+0.12+0.049)(0.33)=\mathbf{0.794}\lt1.224$ → **tidak menolak H₀**

---

## Bilangan Acak

*Modul 5 · Bab 7 · Random Number Generation* · slide 61

Semua keacakan di simulasi berawal dari satu bahan: bilangan acak U(0,1). Modul ini membahas cara membuatnya dengan algoritma (LCG) dan cara mengujinya.

> **Hampir pasti keluar:** hitung barisan **LCG**, tentukan **periode**, dan uji **runs** / **chi-square**.

**Langkah di modul ini:**

1. Pseudo-random dan sifat U(0,1)
2. Sifat generator yang baik
3. LCG: cara menghitung
4. Periode: tiga aturan
5. Middle-square
6. Uji uniformity (chi-square)
7. Uji independence (runs, autokorelasi, lattice)

### Pseudo-random: terlihat acak, tapi bisa diulang

*Bab 7 · langkah 1–2 dari 7 · slide 62*

> **Intinya**
>
> Acak sungguhan (dadu, roulette) tidak bisa dibuat dengan algoritma. Yang bisa: barisan yang **terlihat acak** dan lulus uji statistik → **pseudo-random numbers**. Syaratnya: **uniform** dan **independen**.

> **Sifat U(0,1)**
>
> $$f(x)=1,\quad F(x)=x,\quad E=\tfrac12,\quad \mathrm{Var}=\tfrac13-\tfrac14=\tfrac1{12}$$

- **Uniformity**: (0,1) dibagi n interval sama → tiap interval berisi ±N/n data.
- **Independence**: nilai sebelumnya tidak memengaruhi nilai berikutnya.

**5 sifat generator yang baik:**

| **Speed** | cepat |
|---|---|
| **Portable** | hasil sama di hardware/software lain |
| **Long cycle** | baru berulang setelah sangat panjang |
| **Repeatability** | bisa diulang persis (debugging, membandingkan skenario) |
| **Statistik bagus** | lulus uji uniformity & independence |

> **Analogi**
>
> Pseudo-random = **playlist shuffle yang direkam**: terdengar acak, tapi dengan seed yang sama urutannya persis sama. Justru itu berguna.

### Linear Congruential Generator (LCG)

*Bab 7 · langkah 3 dari 7 · wajib bisa · slide 63*

> **Rumus**
>
> $$X_{i+1}=(aX_i+c)\bmod m,\qquad R_i=\frac{X_i}{m}$$

| $X_0$ | **seed** |
|---|---|
| a | multiplier |
| c | increment: c ≠ 0 **mixed**, c = 0 **multiplicative** (MCG) |
| m | modulus |

**mod** = sisa bagi: 11 mod 3 = 2 · 502 mod 100 = 2

> **Keterbatasan**
>
> R hanya bisa 0, 1/m, …, (m−1)/m, dan periode paling panjang m. Maka m dibuat sangat besar ($2^{31}-1$, $2^{48}$). Kualitas sangat bergantung pada a, c, m.

> **Contoh slide · X₀ = 27, a = 17, c = 43, m = 100**
>
> 1. $17\cdot27+43=502$ → $X_1=2$, $R_1=0.02$
> 2. $17\cdot2+43=77$ → $X_2=77$, $R_2=0.77$
> 3. $17\cdot77+43=1352$ → $X_3=52$, $R_3=0.52$
> 4. $17\cdot52+43=927$ → $X_4=27$ = seed lagi!
>
> Periode hanya **4** → generator jelek.

Alasannya: untuk m bukan pangkat 2, full period butuh a − 1 habis dibagi semua faktor prima m. 100 = 2²·5², sedangkan a − 1 = 16 tidak habis dibagi 5.

### Periode = berapa langkah sampai angka berulang

*Bab 7 · langkah 3–4 dari 7 · slide 64*

*[Diagram: lihat slide 64]*

> **Catatan:** Kiri: siklus pendek, hanya 4 dari 100 angka yang mungkin pernah muncul.

> **Catatan:** Kanan: **full period**, semua 0–15 muncul tepat sekali sebelum kembali ke 7.

### Tiga aturan periode LCG

*Bab 7 · langkah 4 dari 7 · hafalkan · slide 65*

**① Mixed (c ≠ 0):**

$m=2^b$  
$a=1+4k$  
c relatif prima dengan m (**c ganjil**)

**→ m**

full period

**② Multiplicative, m = 2ᵇ:**

c = 0  
$a=3+8k$ atau $5+8k$  
$X_0$ **ganjil**

**→ m/4**

**③ Multiplicative, m prima:**

c = 0  
a **primitif**: k terkecil dengan $a^k-1$ habis dibagi m adalah k = m − 1

**→ m − 1**

> **Contoh MCG · a = 13, c = 0, m = 64**
>
> 13 = 5 + 8(1) → periode m/4 = **16**. X₀ = 1: 13, 41, 21, 17, 29, 57, 37, 33, 45, 9, 53, 49, 61, 25, 5, 1.  
> **Seed memengaruhi periode**: X₀ = 2 → 8, X₀ = 4 → 4, X₀ = 16 → 1. Dengan X₀ = 1 hanya angka 4k + 1 yang muncul (celah besar).

> **Cara cek di ujian**
>
> 1. c = 0 atau tidak?
> 2. m pangkat 2 atau prima?
> 3. Cocokkan bentuk a: (a − 1)/4 bulat? (a − 3)/8 atau (a − 5)/8 bulat?
> 4. Cek c ganjil / X₀ ganjil.
>
> Mixed LCG berpotensi periode lebih panjang daripada MCG.

### Middle-square (von Neumann): cara lama

*Bab 7 · langkah 5 dari 7 · slide 66*

1. Kuadratkan bilangan 4 digit (tambahkan nol di depan jika < 8 digit).
2. Ambil **4 digit tengah** sebagai bilangan berikutnya.
3. $U=Z/10000$

> **Kelemahan**
>
> Barisan bisa cepat "mati" menjadi 0 atau terjebak siklus pendek. Tidak dipakai lagi dalam praktik.

| i | Zᵢ | Uᵢ | Zᵢ² |
|---|---|---|---|
| 0 | 7182 | – | 51 **5811** 24 |
| 1 | 5811 | 0.5811 | 33 **7677** 21 |
| 2 | 7677 | 0.7677 | 58 **9363** 29 |
| 3 | 9363 | 0.9363 | 87 **6657** 69 |

### Menguji generator ①: uniformity dengan chi-square

*Bab 7 · langkah 6 dari 7 · uji uniformity · slide 67*

Sama seperti Modul 4: bagi (0,1) menjadi k interval sama lebar, bangkitkan N bilangan, bandingkan O dengan **E = N/k**.

> **Contoh slide · N = 1000, k = 10, E = 100**
>
> O: 110, 100, 90, 100, 100, 100, 100, 100, 100, 100  
> $\chi^2_0=\frac{100}{100}+0+\frac{100}{100}+0+\dots=\mathbf{2.0}$  
> $\chi^2_{9,0.95}=16.919$ → 2.0 < 16.919 → **lulus**

Slide menampilkan "Avg 0.2" (jumlah ÷ 10). Yang dibandingkan dengan tabel adalah **jumlahnya**, 2.0.

> **Kartu ETS · 40 bilangan, 4 kelas, O = 12, 8, 11, 9**
>
> Uji U(0,1), α = 0.05, $\chi^2_{3,0.95}=7.815$.
>
> **Pembahasan:** $p_i=1/4$ → $E_i=40\times0.25=\mathbf{10}$
>
> $\chi^2=\frac{4}{10}+\frac{4}{10}+\frac1{10}+\frac1{10}=\mathbf{1.0}$
>
> 1.0 < 7.815 → **H₀ tidak ditolak**, data konsisten dengan U(0,1).

### Menguji generator ②: runs test (up and down)

*Bab 7 · langkah 7 dari 7 · uji independence · slide 68*

*[Diagram: lihat slide 68]*

*Soal 7.4: tanda + + + − + − + − − → **6 run***

1. Tulis tanda tiap pasangan berurutan: **+** naik, **−** turun.
2. **Run** = deretan tanda yang sama. Hitung jumlah run, a.
3. $\mu_a=\frac{2N-1}{3}$, $\sigma_a^2=\frac{16N-29}{90}$
4. $Z_0=\frac{a-\mu_a}{\sigma_a}$
5. Terima H₀ (independen) jika $|Z_0|\le z_{\alpha/2}$ (1.96 untuk α = 0.05).

> **Kenapa jumlah run penting?**
>
> Terlalu **sedikit** run → angka "ikut tren" (naik terus lalu turun terus). Terlalu **banyak** → zig-zag terlalu teratur. Keduanya tanda tidak acak.

### Runs test: contoh slide dan soal

*Bab 7 · langkah 7 dari 7 · uji independence · slide 69*

> **Contoh slide · N = 1000, a = 620 run**
>
> $\mu_a=(2000-1)/3=666.33$  
> $\sigma_a^2=(16000-29)/90=177.46$, $\sigma_a=13.32$  
> $Z_0=(620-666.33)/13.32=\mathbf{-3.478}$

*[Diagram: lihat slide 69]*

$|Z_0|\gt1.96$ → **tolak H₀**: bilangan tidak independen. (Generator X₀ = 1, a = 11, c = 3, m = 101.)

> **Soal 7.3 · N = 40, a = 21 run, α = 0.05**
>
> **Pembahasan:** $\mu_a=79/3=26.33$ · $\sigma_a^2=611/90=6.789$, $\sigma_a=2.606$  
> $Z_0=(21-26.33)/2.606=\mathbf{-2.05}$  
> |−2.05| > 1.96 → **tolak H₀** (terlalu sedikit run)

*[Diagram: lihat slide 69]*

### Menguji generator ③: autokorelasi dan lattice plot

*Bab 7 · langkah 7 dari 7 · uji independence · slide 70*

**Uji autokorelasi**

Korelasi antara bilangan ke-i dan ke-(i + j); j = **lag**. Lag 2: pasangan (1, 3), (2, 4), …

> **Rumus**
>
> $$\rho_j=\frac{C_{i,i+j}}{\sqrt{\sigma_i^2\sigma_{i+j}^2}},\quad C_{i,i+j}=E(R_iR_{i+j})-E(R_i)E(R_{i+j})$$

> **Contoh slide · 100 bilangan, lag 2**
>
> $C=0.250-0.499(0.506)=-0.0022$ → $\rho_2\approx-0.026$: sangat kecil, **tidak ada autokorelasi**.

**Lattice plot**

*[Diagram: lihat slide 70]*

Plot pasangan $(R_i,R_{i+1})$. Titik LCG jatuh di **garis-garis sejajar** (hyperplane).

Garis sedikit atau ada **celah besar** → generator buruk. Gambar: generator contoh slide (a = 11, c = 3, m = 101).

### Latihan Modul 5

*Bab 7 · soal latihan · slide 71*

> **Soal 7.1 · a = 7, c = 5, m = 32, X₀ = 3**
>
> Hitung X₁–X₄, R₁–R₄. Full period?
>
> **Pembahasan:** X₁ = 26 mod 32 = **26** (0.8125) · X₂ = 187 mod 32 = **27** (0.84375) · X₃ = 194 mod 32 = **2** (0.0625) · X₄ = **19** (0.59375)
>
> m = 2⁵ ✓, c ganjil ✓, tapi a = 7 ≠ 1 + 4k ✗ → **tidak** full period (periodenya 8).

> **Soal 7.2 · MCG m = 2¹⁶, a = 21, c = 0**
>
> Periode maksimal dan syarat seed?
>
> **Pembahasan:** 21 = 5 + 8(2) ✓ → m/4 = **16384**, dengan **X₀ ganjil**.

> **Kartu ETS · X₀ = 7, a = 5, c = 3, m = 16**
>
> Hitung X₁–X₃, R₁–R₃. Full period?
>
> > **Catatan:** Bawa ke modul berikutnya: kita sekarang punya R ∈ (0,1). Modul 6 mengubah R menjadi waktu kedatangan, waktu layanan, dll.
>
> **Pembahasan:** X₁ = 38 mod 16 = **6** → 0.375
>
> X₂ = 33 mod 16 = **1** → 0.0625
>
> X₃ = 8 mod 16 = **8** → 0.5
>
> m = 2⁴ ✓, a = 1 + 4(1) ✓, c ganjil ✓ → **ya, periode 16**

---

## Variat Acak

*Modul 6 · Bab 8 · Generating Random Variates* · slide 72

Modul 5 memberi U(0,1). Modul ini mengubah U menjadi angka dari distribusi yang kita mau: waktu layanan eksponensial, Weibull, Erlang, normal, dan data empiris.

> **Bab paling banyak hitungan.** Kuasai inverse transform (expo, Weibull, empiris, diskrit), konvolusi, acceptance-rejection, dan polar.

**Langkah di modul ini:**

1. Konsep: U sebagai bahan baku
2. Inverse transform: eksponensial, Weibull, uniform
3. Inverse untuk empiris dan diskrit
4. Konvolusi (Erlang)
5. Acceptance-rejection
6. Normal: polar, Box-Muller; lognormal, beta
7. Proses kedatangan Poisson

### Satu bahan, banyak resep

*Bab 8 · langkah 1 dari 7 · slide 73*

**LCG** ((Modul 5)) → **U ~ U(0,1)** (bahan baku) → **Metode** (inverse · konvolusi · A-R · polar) → **X** (waktu dalam menit, jam, …)

> **Analogi**
>
> U(0,1) itu **tepung**. Metode pembangkitan adalah **resep**: tepung yang sama bisa jadi roti (eksponensial), kue (normal), atau mie (Erlang).

> **Kriteria metode yang baik**
>
> **Exact** (benar-benar dari distribusi itu) · **efisien** (waktu, memori, setup) · **sederhana** · **robust** untuk semua nilai parameter.

**Memilih metode:**

| Situasi | Metode |
|---|---|
| CDF bisa dibalik dengan rumus (expo, Weibull, uniform, empiris, diskrit) | **Inverse transform** |
| Variat = jumlah beberapa variat yang mudah (Erlang, binomial) | **Konvolusi** |
| CDF tidak punya invers tertutup (gamma, f(x) rumit) | **Acceptance-rejection** |
| Normal | **Polar** / Box-Muller |

### Inverse transform: baca grafik CDF dari sumbu y

*Bab 8 · langkah 2 dari 7 · inverse transform · slide 74*

*[Diagram: lihat slide 74]*

> **Ide**
>
> CDF bernilai di [0, 1], sama seperti U. Anggap $U=F(X)$, lalu selesaikan untuk X:  
> $$X=F^{-1}(U)$$

1. Ambil U di **sumbu y**.
2. Tarik garis **horizontal** sampai menyentuh kurva F.
3. Turun **vertikal** ke sumbu x: itulah X.

> **Catatan:** Polanya: **punya R, cari X** → tulis R = F(X), lalu selesaikan X. Kalau **punya X, cari peluang** → pakai F(x) biasa (seperti di K-S).

### Menurunkan rumus: eksponensial, Weibull, uniform

*Bab 8 · langkah 2 dari 7 · inverse transform · slide 75*

**Eksponensial (β)**

1. $U=1-e^{-X/\beta}$
2. $1-U=e^{-X/\beta}$
3. $\ln(1-U)=-X/\beta$
4. $X=-\beta\ln(1-U)$

1 − U juga U(0,1), jadi boleh $X=-\beta\ln U$.

> **β = 1, U = 0.6**
>
> $-\ln0.4=\mathbf{0.916}$ (versi $-\ln U$: 0.511)

**Weibull (α, β)**

1. $U=1-e^{-(X/\beta)^\alpha}$
2. $-\ln(1-U)=(X/\beta)^\alpha$
3. $X=\beta[-\ln(1-U)]^{1/\alpha}$

Sama seperti expo + satu langkah: **pangkatkan 1/α**.

> **α = 1.5, β = 2, U = 0.5**
>
> $2(0.6931)^{0.667}=2(0.7832)=\mathbf{1.566}$

**Uniform (a, b)**

1. $U=\frac{X-a}{b-a}$
2. $X=a+(b-a)U$

U = 0 → a, U = 1 → b.

> **a = 2, b = 10, U = 0.35**
>
> $2+8(0.35)=\mathbf{4.8}$

> **Jebakan**
>
> Ikuti rumus yang diminta soal: $-\beta\ln(1-U)$ dan $-\beta\ln U$ memberi angka berbeda untuk U yang sama. Pakai tombol **ln**, bukan log. Laju λ → β = 1/λ. Weibull: pangkatkan dulu, baru kali β.

### Inverse untuk data empiris: interpolasi garis lurus

*Bab 8 · langkah 3 dari 7 · empiris kontinu · slide 76*

*[Diagram: lihat slide 76]*

Titik CDF dari data (5 interval, masing-masing peluang 0.2) disambung **garis lurus**.

> **Rumus · jika $c_{i-1}\le U\lt c_i$**
>
> $$X=x_{i-1}+\underbrace{\frac{x_i-x_{i-1}}{c_i-c_{i-1}}}_{a_i\ \text{(kemiringan)}}(U-c_{i-1})$$

> **Contoh slide · U = 0.7**
>
> 0.6 ≤ 0.7 < 0.8 → segmen (1.45, 0.6)–(1.83, 0.8)  
> $a_i=0.38/0.2=1.9$ → $X=1.45+1.9(0.1)=\mathbf{1.64}$

**Jebakan:** porsi dihitung di sumbu **F**, dikali lebar **x**; jangan lupa **+ x awal**. Hasil boleh pecahan.

### Inverse untuk distribusi diskrit: U jatuh di potongan mana?

*Bab 8 · langkah 3 dari 7 · diskrit · slide 77*

*[Diagram: lihat slide 77]*

> **Aturan**
>
> X = nilai **terkecil** x dengan $F(x)\ge U$.  
> Potongan tiap nilai: dari CDF baris sebelumnya sampai CDF baris itu.

- **Bernoulli(p)**: U ≤ p → 1, selain itu 0.
- **Discrete uniform** {i…j}: $X=i+\lfloor(j-i+1)U\rfloor$
- **Binomial(t, p)**: jumlahkan t Bernoulli.

> **Contoh**
>
> Demand: U = 0.62 → F(2) = 0.5 < 0.62 ≤ F(3) = 0.833 → **X = 3**
>
> Dadu {1..6}, U = 0.47 → $1+\lfloor2.82\rfloor=\mathbf{3}$
>
> Binomial(3, 0.4), U = 0.2, 0.7, 0.35 → 1, 0, 1 → **X = 2**

> **Kartu ETS · nilai 1, 2, 3, frekuensi 5, 10, 5**
>
> Ubah R = 0.80 dan R = 0.30.
>
> **Pembahasan:** p = 0.25, 0.5, 0.25 → CDF 0.25, 0.75, 1 → R = 0.80 → **3**; R = 0.30 → **2**. Jangan urutkan R.

### Konvolusi: jika X adalah jumlah, bangkitkan lalu jumlahkan

*Bab 8 · langkah 4 dari 7 · konvolusi · slide 78*

**Loket 1** ($Y_1\sim$ expo(β/3)) + **Loket 2** ($Y_2\sim$ expo(β/3)) + **Loket 3** ($Y_3\sim$ expo(β/3)) = **Total waktu** (3-Erlang, mean β)

> **m-Erlang dengan mean β**
>
> $$X=\sum_{i=1}^m\Big(-\frac\beta m\ln U_i\Big)=-\frac\beta m\ln\Big(\prod_{i=1}^m U_i\Big)$$

Tiap tahap punya mean **β/m**. Trik "ln dari perkalian" cukup satu kali ln.

> **Jebakan**
>
> Pakai **β/m** per tahap, bukan β. Satu X butuh m bilangan U.

> **Contoh slide · m = 2, β = 1, U = 0.2, 0.4**
>
> $X=-\frac12\ln(0.08)=-\frac12(-2.526)=\mathbf{1.263}$

> **Soal 8.3 · 3-Erlang mean 3, U = 0.5, 0.8, 0.3**
>
> **Pembahasan:** β/m = 1 → $X=-\ln(0.12)=\mathbf{2.120}$

> **Kartu ETS · Erlang k = 2, mean 6, U = 0.5, 0.5**
>
> **Pembahasan:** β/k = 3 → $Y_1=Y_2=2.079$ → **X = 4.159**. Cek: $-3\ln0.25=4.159$ ✓

### Acceptance-rejection: lempar dart di bawah atap

*Bab 8 · langkah 5 dari 7 · acceptance-rejection · slide 79*

*[Diagram: lihat slide 79]*

*Target f(x) = 2x, atap t(x) = 2. Titik hijau diterima, titik putih ditolak.*

Dipakai jika CDF tidak bisa dibalik. Pilih atap **t(x) ≥ f(x)** untuk semua x yang mudah dibangkitkan.

1. $c=\int t(x)\,dx$ (≥ 1), $r(x)=t(x)/c$ adalah density.
2. Bangkitkan Y dari r (biasanya inverse).
3. Bangkitkan U independen.
4. $U\le f(Y)/t(Y)$ → **terima X = Y**; jika tidak, **ulangi**.

> **Analogi**
>
> Lempar dart ke area di bawah atap. Jatuh di bawah kurva f → diterima; di sela f dan t → dibuang. Peluang diterima = **1/c**, rata-rata **c** percobaan per variat.

### Acceptance-rejection: contoh hitungan

*Bab 8 · langkah 5 dari 7 · acceptance-rejection · slide 80*

> **Slide · gamma(2, 1) dengan t(x) = 0.4 di [0, 10]**
>
> c = 4 → r(x) = 0.1 = U(0, 10) → Y = 10R. f(x) = x e^(−x).
>
> | R | Y | f(Y) | f/t | U | Hasil |
> |---|---|---|---|---|---|
> | 0.8107 | 8.107 | 0.002 | 0.006 | 0.911 | tolak |
> | 0.0306 | 0.306 | 0.226 | 0.564 | 0.453 | **terima** |
>
> t = 0.4 bukan atap bagus: celah lebar, c = 4 → rata-rata 4 percobaan.

> **Slide · gamma(α, 1), 0 < α < 1, α = 0.5**
>
> b = (e + α)/e = 1.184. U₁ = 0.2 → P = bU₁ = 0.2368 ≤ 1 → Y = P^(1/α) = **0.056**. Terima jika U₂ ≤ e^(−Y) = 0.945; U₂ = 0.4 → **terima**.  
> Jika P > 1: Y = −ln((b − P)/α), terima jika U₂ ≤ Y^(α−1).

> **Soal 8.6 · f(x) = 2x di [0,1], t(x) = 2**
>
> (a) c dan efisiensi? (b) R = 0.3, U = 0.5? (c) R = 0.8, U = 0.5?
>
> **Pembahasan:** (a) c = 2, r = U(0,1) → Y = R; peluang terima 0.5  
> (b) batas f/t = 0.6/2 = 0.3; U = 0.5 > 0.3 → **tolak**  
> (c) batas = 1.6/2 = 0.8; U ≤ 0.8 → **terima, X = 0.8**

> **Jebakan**
>
> Terima jika U **≤** batas. Kandidat yang ditolak **tidak dicatat**. Ditolak bukan kesalahan, itu bagian dari metode.

### Normal: metode polar (Marsaglia–Bray)

*Bab 8 · langkah 6 dari 7 · normal · slide 81*

*[Diagram: lihat slide 81]*

*Pasangan (V₁, V₂) harus jatuh di dalam lingkaran.*

1. Bangkitkan $U_1,U_2$; $V_i=2U_i-1$ (pindah ke [−1, 1]).
2. $W=V_1^2+V_2^2$. Jika **W > 1** ulangi.
3. $Y=\sqrt{-2\ln W/W}$
4. $X_1=YV_1$, $X_2=YV_2$: **dua** N(0,1) sekaligus.

> **Contoh slide · U₁ = 0.8, U₂ = 0.3**
>
> V = 0.6, −0.4 → W = 0.52 ✓ → $Y=\sqrt{1.3079/0.52}=1.586$  
> $X_1=\mathbf{0.952}$, $X_2=\mathbf{-0.634}$. Untuk N(10, 2²): 10 + 2(0.952) = 11.904

> **Soal 8.4 · U₁ = 0.6, U₂ = 0.25 → N(50, 4²)**
>
> **Pembahasan:** V = 0.2, −0.5 → W = 0.29 → Y = 2.922 → X₁ = **0.584**, X₂ = **−1.461** → 50 + 4(0.584) = **52.34**

### Alternatif normal, lognormal, dan beta

*Bab 8 · langkah 6 dari 7 · slide 82*

**Jumlah 12 uniform**

$$Z=\sum_{i=1}^{12}U_i-6\approx N(0,1)$$

Mean 12·½ − 6 = 0, varians 12·1/12 = 1 (teorema limit pusat). **Aproksimasi**, tidak exact.

**Box-Muller**

$$Z=\sqrt{-2\ln U_1}\cos(2\pi U_2),\ \ \sqrt{-2\ln U_1}\sin(2\pi U_2)$$

U₁ = 0.5, U₂ = 0.25: √(−2 ln 0.5) = 1.177; cos(π/2) = 0 → Z = 0; sin → Z = 1.177. **Kalkulator mode radian!**

**Lognormal**

Jika Y ~ N, maka $e^Y$ ~ LN.

1. Ubah parameter: $\mu_N=\ln\frac{\mu_L^2}{\sqrt{\mu_L^2+\sigma_L^2}}$, $\sigma_N^2=\ln\frac{\mu_L^2+\sigma_L^2}{\mu_L^2}$
2. Bangkitkan Y ~ N(μ_N, σ_N²)
3. $X=e^Y$

**Beta(1, 2)**

$Y_1\sim$ gamma(1, 1), $Y_2\sim$ gamma(2, 1), lalu $X=\frac{Y_1}{Y_1+Y_2}$.

Normal umum: $X=\mu+\sigma Z$.

### Proses kedatangan Poisson

*Bab 8 · langkah 7 dari 7 · proses Poisson · slide 83*

> **Rumus · laju λ ⇔ interarrival expo dengan mean 1/λ**
>
> $$t_i=t_{i-1}-\frac1\lambda\ln U$$

*[Diagram: lihat slide 83]*

*λ = 2 pelanggan/menit: U = 0.5 → t₁ = 0.347; U = 0.2 → t₂ = 1.152 menit*

*[Diagram: lihat slide 83]*

**Non-stationary: laju berubah terhadap waktu**

> **Salah**
>
> Mengganti λ begitu saja di tengah jalan. Kedatangan tepat sebelum jam sibuk mendapat interarrival panjang (dari λ kecil), sehingga **melompati jam sibuk**.

**Solusi L&K:** algoritma **thinning** (berbasis A-R). Saran slide: buat **create node terpisah per periode** dengan λ berbeda.

### Latihan Modul 6

*Bab 8 · soal latihan · slide 84*

> **Soal 8.1 · expo mean 2**
>
> $X=-\beta\ln(1-U)$ dengan U = 0.75? $-\beta\ln U$ dengan U = 0.25?
>
> **Pembahasan:** $-2\ln0.25=\mathbf{2.773}$ untuk keduanya (karena 1 − 0.75 = 0.25).

> **Soal 8.2 · turunkan: f(x) = x/2, 0 ≤ x ≤ 2**
>
> Hitung untuk U = 0.36.
>
> **Pembahasan:** $F(x)=x^2/4$ → $U=X^2/4$ → $X=2\sqrt U$ → $2(0.6)=\mathbf{1.2}$

> **Kartu ETS · Weibull α = 2, β = 4 jam, R = 0.60**
>
> **Pembahasan:** −ln(0.4) = 0.9163 → √0.9163 = 0.9572 → X = 4(0.9572) = **3.829 jam**

> **Soal 8.5 · CDF empiris slide**
>
> X untuk U = 0.33 dan U = 0.9?
>
> **Pembahasan:** U = 0.33: segmen (0.8, 0.2)–(1.24, 0.4), a = 2.2 → 0.8 + 2.2(0.13) = **1.086**  
> U = 0.9: segmen (1.83, 0.8)–(2.76, 1), a = 4.65 → 1.83 + 0.465 = **2.295**

> **Kartu ETS · titik CDF (0; 0), (4; 0.5), (10; 1), R = 0.75**
>
> **Pembahasan:** Segmen F 0.5–1 (x 4–10). Porsi = 0.25/0.5 = 0.5 → X = 4 + 0.5(6) = **7**

> **Kartu ETS · Bernoulli p = 0.3, t = 3; Uniform(5, 15)**
>
> R = 0.25, 0.45, 0.10; lalu R = 0.4
>
> **Pembahasan:** 1, 0, 1 → binomial **X = 2** · Uniform: 5 + 10(0.4) = **9**

---

## Validasi Model

*Modul 7 · Bab 5 · Building Valid, Credible, and Appropriately Detailed Models* · slide 85

Modelnya sudah jadi: data input sudah di-fit, bilangan dan variat acak sudah dibangkitkan. Sekarang: apakah program benar, apakah model mirip sistem nyata, dan apakah manajer mau percaya?

> **Sering keluar:** definisi (verifikasi vs validasi vs kredibilitas), teknik-tekniknya, dan satu hitungan **CI selisih** (memakai CI dari Modul 3).

**Langkah di modul ini:**

1. Definisi V, V, kredibilitas, akreditasi
2. Posisi dalam alur studi
3. Menentukan tingkat detail
4. 6 teknik verifikasi
5. 6 teknik validasi (Law & Kelton)
6. Membandingkan output dengan sistem nyata
7. Kerangka Schellenberger (T-O-D)

### Empat istilah yang sering tertukar

*Bab 5 · langkah 1 dari 7 · hafalkan · slide 86*

**Verifikasi**

**building the model right**

Model konseptual sudah diterjemahkan **benar** menjadi program (debugging).

**Validasi**

**building the right model**

Model **merepresentasikan sistem nyata** dengan akurat, untuk tujuan studi.

**Kredibilitas**

**dipercaya**

Pengambil keputusan (klien, manajer) **menerima** model dan hasilnya.

**Akreditasi**

**disertifikasi**

Pengakuan resmi oleh **lembaga independen** (mis. DoD AS).

> **Analogi: resep kue pesanan pelanggan**
>
> - Model konseptual = **resep** di kertas · program = **kue** yang dibuat
> - **Verifikasi**: kue dibuat **persis sesuai resep**?
>
> - **Validasi**: resepnya memang menghasilkan kue **yang dipesan**? (pesan brownies, resepnya bolu → salah)
> - **Kredibilitas**: pelanggan percaya dan mau membeli · **Akreditasi**: sertifikat BPOM

### Di mana V&V terjadi dalam alur studi?

*Bab 5 · langkah 2 dari 7 · slide 87*

**Sistem** → **Model konseptual** (VALIDASI) → **Program** (VERIFIKASI) → **Hasil "benar"** (VALIDASI) → **Implementasi** (KREDIBILITAS)

analisis → programming → run eksperimen → "menjual" keputusan

- Terverifikasi + tervalidasi = syarat **perlu, tapi tidak cukup** untuk kredibel.
- Verified → validated → credible: makin ke kanan makin **penting**, makin **sulit**, butuh makin banyak **waktu** dan **orang**.

> **Pertanyaan berjenjang**
>
> Program benar? → program = model yang benar? → model benar untuk keputusan ini? → keputusannya **robust**? → seberapa **sensitif** terhadap parameter?

### Seberapa detail modelnya? 7 panduan

*Bab 5 · langkah 3 dari 7 · slide 88*

1. **Definisikan isu dan ukuran kinerja dulu.** Model yang benar untuk masalah yang salah tidak berguna.
2. **Entitas model tidak harus sama dengan entitas nyata.** Inventori: satu entitas per hari.
3. **Tidak semua bagian perlu detail.** Parkiran bank: bank cukup dimodelkan sebagai delay.
4. **Mulai "cukup detail", tambah sesuai kebutuhan** bersama SME (WIP tak terbatas → batas buffer → kerusakan mesin).

5. **Tanya orang yang paham + sensitivity analysis**: detailkan bagian penting, mis. mesin **bottleneck**.
6. **Ketersediaan data membatasi detail.** Sistem baru → kurang detail; fine-tuning → lebih detail.
7. **Faktor banyak → saring** dengan model kasar atau design of experiments: coba nilai min dan max, lihat apakah hasil berubah signifikan.

### 6 teknik verifikasi: apakah programnya benar?

*Bab 5 · langkah 4 dari 7 · verifikasi · slide 89*

**→ 1**

**Per modul**

Bangun dan uji sepotong-sepotong. Bagian yang belum dibuat diganti "dummy" (kotak dengan delay acak).

**→ 2**

**> 1 orang**

**Structured walk-through**: kelompok membaca program bersama.

**→ 3**

**Cek kewajaran**

Jalankan berbagai setting. Utilisasi ≈ laju datang ÷ laju layanan.

**→ 4**

**Trace**

Lihat event demi event (TNOW, CREATE, ASSIGN, QUEUE…) atau debugger interaktif.

**→ 5**

**Asumsi analitik**

Sederhanakan hingga punya rumus (mis. jadi M/M/s), lalu bandingkan.

**→ 6**

**Animasi**

Amati pergerakan entitas untuk menemukan perilaku aneh.

> **Contoh cek kewajaran**
>
> Kedatangan 8/jam, server melayani 10/jam → ρ = 8/10 = **0.8**. Jika simulasi memberi utilisasi 0.35 atau 1.2, hampir pasti ada bug.

### 6 teknik validasi & kredibilitas (Law & Kelton)

*Bab 5 · langkah 5 dari 7 · validasi · slide 90*

| # | Teknik | Isi pokok |
|---|---|---|
| 1 | **Informasi & data berkualitas** | wawancara SME, observasi (representatif? bias? error?), teori (kedatangan biasanya **Poisson**), studi serupa, intuisi pemodel |
| 2 | **Interaksi rutin dengan manajer** | tujuan bisa direformulasi; manajer terlibat dan menerima asumsi |
| 3 | **Assumptions document + structured walk-through** | dokumen tujuan, subsistem, asumsi + alasannya, ringkasan data; dibahas **poin demi poin di depan semua SME** |
| 4 | **Validasi komponen kuantitatif** | uji goodness-of-fit, uji homogenitas (Kruskal-Wallis), **sensitivity analysis dengan CRN**, desain eksperimen |
| 5 | **Validasi output keseluruhan** | paling definitif: bandingkan dengan sistem nyata (**results validation**); **Turing test**: ahli diminta membedakan output simulasi dan data nyata |
| 6 | **Animasi** | meyakinkan pengambil keputusan |

> **Catatan:** Validasi adalah **proses sejak awal** proyek, bukan aktivitas di akhir. Tidak ada model yang 100% valid.

> **Catatan:** Selisih besar dengan sistem nyata? Mungkin sistem tidak bekerja seperti diasumsikan, ada kendala yang terlewat, atau parameternya salah.

### Kenapa satu run tidak cukup untuk validasi?

*Bab 5 · langkah 6 dari 7 · output vs sistem nyata · slide 91*

*[Diagram: lihat slide 91]*

**Basic inspection** = membandingkan **satu** hasil nyata dengan **satu** run simulasi.

> **Contoh slide**
>
> Nyata ~ N(150, 30²), simulasi ~ N(140, 30²). Kita tahu modelnya **tidak valid** (beda 10).

- Kalau kebetulan melihat run 3 atau 9 saja (peluang **20%**), keduanya tampak mirip → "valid". Salah.
- Run 2 atau 10: simulasi tampak lebih besar. Juga salah.

> **Catatan:** Karena output acak, kita perlu statistik: **CI untuk selisih**.

### CI selisih (paired-t): memuat 0 atau tidak?

*Bab 5 · langkah 6 dari 7 · wajib bisa · slide 92*

Bentuk selisih $W_j$ = nyata − simulasi tiap pasangan, lalu buat CI biasa (Modul 3) untuk W:

*[Diagram: lihat slide 92]*

> **Contoh slide · 10 pasang**
>
> $\bar W=7.17$, $S_W^2=578.91$, $t_{9,0.95}=1.833$  
> CI = $7.17\pm1.833\sqrt{57.89}=7.17\pm13.95=\mathbf{[-6.78,\ 21.12]}$  
> Memuat 0 → "valid"? **Padahal tidak!** Penyebabnya: **data terlalu sedikit**. Welch juga: [−11.7, 26.04].

> **Pesan moral**
>
> "CI memuat 0" artinya **tidak cukup bukti ada perbedaan**, **bukan bukti keduanya sama**. Dengan n kecil CI lebar dan hampir selalu memuat 0. Kumpulkan data sebanyak mungkin.

### Kerangka Schellenberger: 3 dimensi validitas (T-O-D)

*Bab 5 · langkah 7 dari 7 · slide 93*

Berguna terutama jika **tidak ada sistem nyata** sebagai pembanding.

**T · Technical**

"Apakah isinya benar?"

- **Model validity**: asumsi matematis, isi, kausal
- **Data validity**: representatif, akurat, tidak memihak
- **Logical validity**: penerjemahan ke kode setia
- **Predictive validity**: output sesuai harapan

**O · Operational**

"Perilakunya masuk akal & bisa dipakai?"

- **Degree of improvement**: robust? (saran perbaikan 60% → error kecil tak berarti)
- **Model sensitivity**: what-if (Poisson vs ON-OFF, FIFO vs LIFO, beban rendah–tinggi)
- **Implementability**: bisa diterapkan

**D · Dynamic**

"Tetap berguna tahun depan?"

- **Maintainability**: mudah diubah
- **Review process**: ditinjau berkala
- **Update process**: parameter diperbarui berkala

### Latihan Modul 7

*Bab 5 · soal latihan · slide 94*

> **Soal 5.1 · verifikasi atau validasi?**
>
> (a) trace event per event (b) bandingkan waktu tunggu simulasi dengan data kasir (c) walk-through program oleh 3 programmer (d) Turing test (e) bandingkan dengan rumus M/M/1 (f) histogram data input vs distribusi fit
>
> **Pembahasan:** (a) verifikasi (b) validasi (results) (c) verifikasi (d) validasi (e) verifikasi (asumsi analitik) (f) validasi komponen  
> **Awas:** walk-through atas **asumsi/model konseptual** di depan SME = validasi (#3); atas **program** = verifikasi.

> **Soal 5.2 · selisih (nyata − simulasi): 3, −1, 4, 2, 2**
>
> Buat CI 90%. Valid secara statistik?
>
> **Pembahasan:** 1. $\bar W=10/5=2$
> 2. Deviasi 1, −3, 2, 0, 0 → kuadrat 14 → $S^2=3.5$
> 3. $t_{4,0.95}=2.132$ → half = $2.132\sqrt{0.7}=1.784$
> 4. CI = **[0.216, 3.784]**
>
> Tidak memuat 0 → berbeda signifikan → model **belum valid** (simulasi cenderung lebih kecil).

---

## Membandingkan Alternatif

*Modul 8 · Bab 9.1 · Comparing Alternatives (L&K Bab 10)* · slide 95

Model sudah valid. Pertanyaan terakhir proyek: desain mana yang lebih baik, 1 kasir atau 2 kasir? Karena output acak, kita tidak bisa sekadar membandingkan dua angka rata-rata.

> **Semua metode di sini adalah CI dari Modul 3**, diterapkan pada **selisih**. Hitungan wajib: paired-t, Welch, Bonferroni, dan N tahap 2.

**Langkah di modul ini:**

1. Masalahnya: distribusi output tumpang tindih
2. Membaca CI selisih
3. Paired-t
4. Common random numbers (CRN)
5. Welch (modified two-sample)
6. Lebih dari 2 sistem: Bonferroni
7. Memilih yang terbaik: prosedur dua tahap

### Masalahnya: hasil dua kebijakan saling tumpang tindih

*Bab 9.1 · langkah 1–2 dari 7 · slide 96*

*[Diagram: lihat slide 96]*

> **Kasus slide**
>
> 3 server: **satu antrian bersama** atau **antrian per server**? Distribusi output keduanya tumpang tindih, jadi sulit dibilang mana yang lebih baik dari satu run.

> **Solusi**
>
> Buat **CI untuk selisih** (sistem 1 − sistem 2), lalu lihat posisinya terhadap 0:

*[Diagram: lihat slide 96]*

> **Analogi**
>
> Dua pelari rata-rata 10.2 dan 10.4 detik. Benar lebih cepat, atau cuma kebetulan? Jika seluruh kisaran selisih yang masuk akal ada di satu sisi nol, berarti memang lebih cepat.

### Paired-t: CI biasa untuk selisih tiap replikasi

*Bab 9.1 · langkah 3 dari 7 · paired-t · slide 97*

> **Rumus**
>
> $Z_j=X_{1j}-X_{2j}$ untuk replikasi j = 1..n  
> $$\bar Z\pm t_{n-1,\,1-\alpha/2}\sqrt{\frac{S_Z^2}{n}}$$  
> Slide menulis $\widehat{\mathrm{Var}}=\frac{\sum(Z_j-\bar Z)^2}{n(n-1)}$: sama dengan $S_Z^2/n$.

- Syarat: $n_1=n_2=n$, dan selisih $Z_j$ IID.
- **Tidak** perlu $X_{1j}$ dan $X_{2j}$ independen → boleh (malah bagus) memakai **CRN**.

> **Contoh 10.3 · CI 90% untuk S1 − S2**
>
> | Rep | S1 | S2 | Z |
> |---|---|---|---|
> | 1 | 126.97 | 118.21 | 8.76 |
> | 2 | 124.31 | 120.22 | 4.09 |
> | 3 | 126.68 | 122.45 | 4.23 |
> | 4 | 122.66 | 122.68 | −0.02 |
> | 5 | 127.33 | 119.40 | 7.93 |
>
> $\bar Z=4.998$, $S_Z^2=12.34$, $t_{4,0.95}=2.13$  
> CI = $4.998\pm2.13(1.571)=\mathbf{[1.65,\ 8.35]}$  
> Tidak memuat 0 → **berbeda**; S1 lebih besar (jika biaya → S2 lebih baik).

### Common random numbers: beri "cuaca" yang sama

*Bab 9.1 · langkah 4 dari 7 · CRN · slide 98*

Paired-t paling tajam jika varians selisih kecil. Ingat Modul 3:

> **Kuncinya**
>
> $$\mathrm{Var}(Z_1-Z_2)=\mathrm{Var}Z_1+\mathrm{Var}Z_2-2\,\mathrm{Cov}(Z_1,Z_2)$$  
> Cov positif besar → varians selisih kecil → CI sempit.

**Cara membuat korelasi positif:**

1. Kedua sistem memakai **stream bilangan acak yang sama**.
2. Stream dipakai untuk **tujuan yang sama** (stream 1 kedatangan, stream 2 layanan).
3. Service time **dibangkitkan saat kedatangan** dan disimpan sebagai atribut.
4. Jumlah data kedua sistem **sama**.

**Stream 1** (kedatangan) ⇉ **Sistem A** (1 kasir)

**Stream 2** (layanan) ⇉ **Sistem B** (2 kasir)

pelanggan ke-j datang di waktu yang sama dengan kebutuhan layanan yang sama di kedua sistem

> **Analogi**
>
> Membandingkan dua merek ban: pasang di **mobil, jalan, dan cuaca yang sama**. Perbedaan hasil benar-benar karena bannya.

> **Catatan:** Bukti angka: Soal 9.1 vs 9.2 (data sama). Paired-t: lebar 0.82. Welch: lebar 1.47.

### Welch: jika data tidak bisa dipasangkan

*Bab 9.1 · langkah 5 dari 7 · Welch · slide 99*

Dipakai jika $n_1\ne n_2$ atau kedua sistem disimulasikan **independen**.

> **Rumus**
>
> $$\bar X_1-\bar X_2\pm t_{\hat f,\,1-\alpha/2}\sqrt{\frac{S_1^2}{n_1}+\frac{S_2^2}{n_2}}$$  
> $$\hat f=\frac{\big(\frac{S_1^2}{n_1}+\frac{S_2^2}{n_2}\big)^2}{\frac{(S_1^2/n_1)^2}{n_1-1}+\frac{(S_2^2/n_2)^2}{n_2-1}}$$

$\hat f$ biasanya bukan bulat → interpolasi tabel t, atau bulatkan ke bawah (konservatif).

> **Contoh 10.3 dengan Welch**
>
> 1. $S_1^2/5=0.817$, $S_2^2/5=0.752$ → jumlah 1.569
> 2. $\hat f=\frac{1.569^2}{0.817^2/4+0.752^2/4}=\frac{2.462}{0.3083}=\mathbf{7.99}$
> 3. $t_{7.99,0.95}\approx1.86$
> 4. CI = $4.998\pm1.86(1.253)=\mathbf{[2.67,\ 7.33]}$

|   | Paired-t | Welch |
|---|---|---|
| n | $n_1=n_2$ | boleh beda |
| Antar sistem | boleh berkorelasi (CRN) | harus independen |
| df | n − 1 | $\hat f$ |

### Lebih dari 2 sistem: Bonferroni

*Bab 9.1 · langkah 6 dari 7 · Bonferroni · slide 100*

> **Intinya**
>
> Kalau membuat **c** CI dan ingin **semuanya benar sekaligus** dengan keyakinan ≥ 1 − α, tiap CI dibuat dengan keyakinan **1 − α/c**.

**Dengan standar:**

bandingkan 2..k dengan sistem 1  
**c = k − 1**  
$\alpha'=\frac{\alpha}{k-1}$

**Semua pasangan:**

**c = k(k−1)/2**  
$\alpha'=\frac{\alpha}{k(k-1)/2}$

> **Analogi**
>
> Peluang salah tiap tebakan 10%, menebak 4 kali → peluang **minimal satu** salah bisa sampai 40%. Agar tetap ≤ 10%, tiap tebakan harus jauh lebih hati-hati (2.5%).

> **Slide · base + 4 alternatif, α = 0.1**
>
> c = 4 → α' = 0.025 tiap CI (keyakinan 97.5%), CI Welch Base − Alt:
>
> |   | Bawah | Atas | Hasil |
> |---|---|---|---|
> | vs 1 | 1.44 | 8.52 | **berbeda** |
> | vs 2 | −4.97 | 7.43 | tidak |
> | vs 3 | −10.90 | −1.82 | **berbeda** |
> | vs 4 | −20.23 | −14.07 | **berbeda** |
>
> Slide menyebut hanya 1 dan 4; dari tabelnya, CI vs 3 juga tidak memuat 0.

> **Soal 9.3 · 5 sistem, keyakinan total 90%**
>
> **Pembahasan:** Semua pasangan: 10 CI → α' = 0.01 → tiap CI **99%**. Dengan standar: 4 CI → **97.5%**.

### Memilih sistem terbaik dari k sistem: prosedur dua tahap

*Bab 9.1 · langkah 7 dari 7 · seleksi terbaik · slide 101*

> **Tentukan dulu**
>
> **P*** = peluang memilih dengan benar yang diinginkan (P* > 1/k).  
> **d*** = **indifference amount**: selisih yang dianggap tidak penting.

> **Analogi d***
>
> Memilih rute pulang. Beda 30 detik? Tidak peduli. Maka d* = 30 detik: jaminan hanya berlaku jika yang terbaik unggul ≥ d*.

**Tips:** n₀ ≥ 20; P* sekecil mungkin dan d* sebesar mungkin agar replikasi tidak membengkak (N ∝ 1/d*²).

1. **Tahap I**: jalankan n₀ replikasi tiap sistem (±20) → $\bar X_i^{(1)}$, $S_i^2$
2. Hitung total replikasi: $N_i=\max\Big\{n_0+1,\Big\lceil\frac{h_1^2S_i^2}{(d^*)^2}\Big\rceil\Big\}$ (h₁ dari tabel)
3. **Tahap II**: jalankan $N_i-n_0$ replikasi tambahan → $\bar X_i^{(2)}$
4. Bobot $W_{i1}$ (rumus di slide berikutnya), $W_{i2}=1-W_{i1}$
5. $\tilde X_i=W_{i1}\bar X_i^{(1)}+W_{i2}\bar X_i^{(2)}$ → **pilih $\tilde X$ terkecil**

### Contoh 10.8: 5 kebijakan inventori

*Bab 9.1 · langkah 7 dari 7 · seleksi terbaik · slide 102*

P* = 0.90, d* = 1, n₀ = 20, h₁ = 2.747

| Sistem | X̄⁽¹⁾ | S² | Nᵢ | X̄⁽²⁾ | W₁ | X̃ |
|---|---|---|---|---|---|---|
| 1 | 126.48 | 14.52 | 110 | 124.45 | 0.206 | 124.87 |
| **2** | 121.92 | 7.96 | 61 | 121.63 | 0.386 | **121.74** |
| 3 | 127.16 | 9.45 | 72 | 126.11 | 0.322 | 126.45 |
| 4 | 130.71 | 8.25 | 63 | 132.03 | 0.368 | 131.54 |
| 5 | 144.07 | 6.20 | 47 | 144.83 | 0.459 | 144.48 |

> **Rumus bobot**
>
> $$W_{i1}=\frac{n_0}{N_i}\Big[1+\sqrt{1-\frac{N_i}{n_0}\Big(1-\frac{(N_i-n_0)(d^*)^2}{h_1^2S_i^2}\Big)}\Big]$$

> **Hitungan sistem 1**
>
> $N_1=\max\{21,\lceil2.747^2(14.52)\rceil\}=\max\{21,110\}=110$  
> $W_{11}=0.206$ → $\tilde X_1=0.206(126.48)+0.794(124.45)=124.87$

*[Diagram: lihat slide 102]*

> **Catatan:** Pilih **sistem 2**, yakin ≥ 90% ini yang terbaik (asal unggul ≥ d* = 1).

> **Soal 9.4 · n₀ = 20, h₁ = 2.747, d* = 1.5**
>
> Nᵢ untuk S² = 9 dan S² = 4?
>
> **Pembahasan:** S² = 9: ⌈30.18⌉ = 31 → **N = 31** · S² = 4: ⌈13.41⌉ = 14 → **N = 21**

### Latihan Modul 8: paired-t vs Welch pada data yang sama

*Bab 9.1 · soal latihan · slide 103*

6 replikasi waktu tunggu. A: 12.4, 10.8, 13.1, 11.5, 12.0, 11.9 · B: 10.9, 10.1, 11.8, 11.2, 10.6, 10.4

> **Soal 9.1 · paired-t (dengan CRN), CI 90% A − B**
>
> **Pembahasan:** 1. Selisih: 1.5, 0.7, 1.3, 0.3, 1.4, 1.5 → $\bar Z=1.117$
> 2. Σ deviasi² = 1.248 → $S^2=0.2497$
> 3. $t_{5,0.95}=2.015$ → half = 2.015(0.204) = 0.411
> 4. CI = **[0.706, 1.528]**
>
> Tidak memuat 0 → A lebih lama menunggu → **B lebih baik**.

> **Soal 9.2 · Welch (anggap independen)**
>
> **Pembahasan:** 1. $\bar A=11.95$, $S_A^2=0.611$; $\bar B=10.833$, $S_B^2=0.371$
> 2. $S^2/n$: 0.1018 + 0.0618 = 0.1636
> 3. $\hat f=0.02677/(0.002073+0.000764)=9.43$ → t ≈ 1.82
> 4. half = 1.82(0.4045) = 0.737 → CI = **[0.38, 1.85]**
>
> Lebih lebar dari paired-t → manfaat CRN/pairing terlihat.

---

## Siap Ujian

*Rekap ujian* · slide 104

Semua modul sudah dilalui. Bagian ini untuk dibaca ulang sebelum ujian: cara mengenali jenis soal, rumus kilat per modul, dan kalimat jawaban yang aman.

> **Tips umum:** tulis **rumus dulu**, baru angka (nilai parsial) · selalu tulis **kesimpulan** · cek t atau z, df = n − 1 · kalkulator: **ln**, eˣ, pangkat, mode radian untuk Box-Muller.

**Langkah di modul ini:**

1. Peta soal: pakai metode yang mana?
2. Rumus kilat Modul 1–3
3. Rumus kilat Modul 4–5
4. Rumus kilat Modul 6
5. Rumus kilat Modul 7–8
6. Kalimat jawaban yang aman

### Soal ini memintaku melakukan apa?

*Rekap · peta soal ETS · slide 105*

**GRN** (membuat R (0–1) dari seed, a, c, m) → **GRV** (mengubah R menjadi X (menit, jam…)) → **Uji** (chi-square / K-S: cocok dengan teori?)

| Ciri soal | Metode | Lihat |
|---|---|---|
| Diberi X₀, a, c, m; minta deret R atau periode | **LCG** | Modul 5 |
| Data dikelompokkan ke kelas, ada O dan E | **Chi-square** | Modul 4–5 |
| Data mentah diurutkan, bandingkan CDF, ada D kritis | **K-S** | Modul 4 |
| Deret naik/turun, jumlah run | **Runs test** | Modul 5 |
| Punya R, cari X; eksponensial (mean β) / Weibull (α, β) | **Inverse transform** | Modul 6 |
| Kandidat U₁, keputusan terima/tolak U₂, ada f, g/t, c | **Acceptance-rejection** | Modul 6 |
| Tabel frekuensi nilai tertentu (X harus salah satunya) | **Empiris diskrit** | Modul 6 |
| Titik CDF disambung garis (X boleh pecahan) | **Empiris kontinu** | Modul 6 |
| "Erlang", "k tahap", jumlah beberapa expo | **Konvolusi** | Modul 6 |
| Replikasi dua sistem / nyata vs simulasi, minta CI | **Paired-t / Welch** | Modul 7–8 |

### Rumus kilat: Modul 1–3 (Bab 1–4)

*Rekap · rumus kilat · slide 106*

| Topik | Yang harus diingat |
|---|---|
| DES | dinamis + stokastik + diskrit; state berubah saat event |
| Time advance | next-event (dipakai) vs fixed-increment (error + trade-off) |
| 10 komponen | state, clock, event list, counters, init, timing, event routines, library, report, main |
| Kinerja antrian | $\hat d=\sum D_i/n$; $\hat q=\int Q/T$, $\hat u=\int B/T$ |
| Lindley | $D_{i+1}=\max\{D_i+S_i-A_{i+1},0\}$ |
| (s, S) | I < s → Z = S − I, biaya 32 + 3Z; h = 1, π = 5; event 3 sebelum 4 |
| Monte Carlo | $Y=(b-a)g(X)$, rata-rata Y → ∫g |
| simlib | 25 list, 10 atribut, list 25 = event list; sampst / timest / filest |
| Jockey | $n_j\gt n_i+1$, terdekat, seri → kiri |
| Software | event-scheduling vs process-interaction; entities, attributes, resources, queues |

> **Statistik**
>
> $$E(X)=\textstyle\sum xp(x),\quad \mathrm{Var}=E(X^2)-\mu^2,\quad \mathrm{Var}(cX)=c^2\mathrm{Var}X$$  
> $$\mathrm{Var}(X\pm Y)=\mathrm{Var}X+\mathrm{Var}Y\pm2\mathrm{Cov}$$  
> $$\mathrm{Cov}=E(XY)-E(X)E(Y),\quad \mathrm{Cor}=\tfrac{\mathrm{Cov}}{\sqrt{\mathrm{Var}X\mathrm{Var}Y}}$$  
> $$S^2=\tfrac{\sum(X_i-\bar X)^2}{n-1},\quad \bar X\pm t_{n-1,1-\alpha/2}\sqrt{S^2/n}$$
>
> Half-length ÷ 2 → n × 4. Data dalam satu run berkorelasi; antar replikasi IID. Expo: $F=1-e^{-x/\beta}$.

### Rumus kilat: Modul 4–5 (Bab 6–7)

*Rekap · rumus kilat · slide 107*

| Distribusi | Mean | Varians | Catatan |
|---|---|---|---|
| U(a, b) | (a+b)/2 | (b−a)²/12 |   |
| expo(β) | β | β² | interarrival, cv = 1 |
| gamma(α, β) | αβ | αβ² | α bulat → Erlang |
| Weibull | — | waktu rusak; α = 1 → expo |
| N(μ, σ²) | μ | σ² | bukan untuk service time |
| Bernoulli(p) | p | p(1−p) |   |
| bin(t, p) | tp | tp(1−p) | jumlah t Bernoulli |

cv = 1 → expo; cv > 1 → lognormal. τ = 1 Poisson, < 1 binomial, > 1 neg. binomial. Sturges $k=\lfloor1+3.322\log n\rfloor$. MLE expo: $\hat\beta=\bar X$.

> **Uji**
>
> Chi-square: $\sum(O-E)^2/E$, E ≥ 5, tolak jika $\gt\chi^2_{k-1,1-\alpha}$
>
> K-S: $D^+=\max(\frac in-F)$, $D^-=\max(F-\frac{i-1}n)$; terkoreksi $(\sqrt n+0.12+0.11/\sqrt n)D$ vs 1.224 (α = 0.10)
>
> Runs: $\mu_a=\frac{2N-1}3$, $\sigma_a^2=\frac{16N-29}{90}$, terima jika $|Z|\le1.96$

> **LCG**
>
> $X_{i+1}=(aX_i+c)\bmod m$, $R=X/m$  
> Periode **m**: c ganjil, m = 2ᵇ, a = 1 + 4k · **m/4**: c = 0, m = 2ᵇ, a = 3/5 + 8k, X₀ ganjil · **m − 1**: c = 0, m prima, a primitif

### Rumus kilat: Modul 6 (Bab 8)

*Rekap · rumus kilat · slide 108*

| Distribusi / metode | Rumus | Jebakan |
|---|---|---|
| Expo(β) | $X=-\beta\ln(1-U)$ atau $-\beta\ln U$; laju λ: $-\frac1\lambda\ln U$ | ikuti versi yang diminta; ln bukan log |
| Uniform(a, b) | $X=a+(b-a)U$ | (b − a) dikurung |
| Weibull(α, β) | $X=\beta[-\ln(1-U)]^{1/\alpha}$ | pangkat dulu, lalu × β |
| Empiris kontinu | $X=x_{i-1}+\frac{x_i-x_{i-1}}{c_i-c_{i-1}}(U-c_{i-1})$ | + x awal segmen |
| Diskrit | X terkecil dengan F(X) ≥ U; Bernoulli: U ≤ p → 1 | batas pakai CDF |
| Discrete uniform | $X=i+\lfloor(j-i+1)U\rfloor$ |   |
| m-Erlang (mean β) | $X=-\frac\beta m\ln\prod U_i$ | β/m per tahap |
| Acceptance-rejection | t ≥ f, c = ∫t, Y ~ t/c, terima jika $U\le f(Y)/t(Y)$; peluang 1/c | ≤ berarti terima |
| Normal (polar) | $V=2U-1$, $W=V_1^2+V_2^2\le1$, $Y=\sqrt{-2\ln W/W}$, $X=YV$ | W > 1 → ulang |
| Box-Muller · normal umum | $\sqrt{-2\ln U_1}\cos(2\pi U_2)$ · $X=\mu+\sigma Z$ · $\sum^{12}U-6$ | mode radian |
| Poisson process | $t_i=t_{i-1}-\frac1\lambda\ln U$ | non-stationary: thinning |

### Rumus kilat: Modul 7–8 (Bab 5 & 9.1)

*Rekap · rumus kilat · slide 109*

- **Verifikasi** = model **right** (program = konsep). Teknik: modular, walk-through program, cek kewajaran, trace, asumsi analitik, animasi.
- **Validasi** = **right** model (model = sistem nyata). Teknik: data berkualitas, manajer, assumptions document + walk-through SME, validasi komponen (fit, homogenitas, sensitivity + CRN), validasi output (Turing test), animasi.
- **Kredibilitas** = dipercaya pengambil keputusan · **Akreditasi** = lembaga independen.
- **T-O-D**: Technical (model, data, logical, predictive) · Operational (improvement, sensitivity, implementability) · Dynamic (maintainability, review, update).
- Basic inspection berbahaya; CI memuat 0 ≠ bukti sama.

> **Membandingkan**
>
> $$\text{Paired-t: }\bar Z\pm t_{n-1,1-\alpha/2}\sqrt{S_Z^2/n}$$  
> $$\text{Welch: }(\bar X_1-\bar X_2)\pm t_{\hat f,1-\alpha/2}\sqrt{\tfrac{S_1^2}{n_1}+\tfrac{S_2^2}{n_2}}$$  
> $$\text{Bonferroni: }\alpha'=\tfrac{\alpha}{k-1}\ \text{(standar)},\ \ \tfrac{\alpha}{k(k-1)/2}\ \text{(semua)}$$  
> $$N_i=\max\Big\{n_0+1,\Big\lceil\tfrac{h_1^2S_i^2}{d^{*2}}\Big\rceil\Big\}$$
>
> CI tidak memuat 0 → berbeda. CRN: stream sama, tujuan sama, service dibangkitkan saat datang, n sama. Seleksi: pilih X̃ terkecil.

### Kalimat jawaban yang aman untuk ujian

*Rekap · menulis jawaban · slide 110*

| Situasi | Tulis seperti ini |
|---|---|
| Statistik uji < nilai kritis | "Gagal menolak H₀. Tidak ada bukti cukup bahwa data tidak mengikuti distribusi tersebut." |
| Statistik uji > nilai kritis | "H₀ ditolak. Data tidak konsisten dengan distribusi tersebut." |
| CI selisih tidak memuat 0 | "Kedua sistem berbeda signifikan; sistem … lebih kecil/besar." |
| CI selisih memuat 0 | "Tidak ada bukti perbedaan yang signifikan (bukan berarti keduanya sama; data mungkin kurang)." |
| Mean sampel ≠ mean teori | "Tidak harus sama karena berasal dari sedikit observasi; selisihnya akibat variasi sampling dan mengecil jika sampel diperbanyak." |
| Distribusi vs metode | "Weibull/eksponensial adalah distribusi; inverse transform, A-R, konvolusi adalah metode untuk membangkitkannya." |
| Empiris kontinu bisa pecahan | "Titik CDF dihubungkan garis lurus, sehingga X diinterpolasi di antara titik data (tetap di dalam rentang data)." |

> **Catatan:** Latihan campuran: Soal 1.1 (antrian), 4.3 (CI), 5.2 (CI selisih), 6.3 (K-S), 7.1–7.3 (LCG, runs), 8.2 & 8.4 (inverse, polar), 9.1–9.2 (paired-t, Welch). Kerjakan tanpa melihat pembahasan.
