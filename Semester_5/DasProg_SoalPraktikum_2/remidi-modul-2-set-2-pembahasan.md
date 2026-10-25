# Pembahasan Remidi Praktikum Modul 2 - Set 2

**Perulangan, Array, dan String (RPL)**

Semua jawaban sudah diverifikasi dengan menjalankan kode menggunakan gcc.

## Ringkasan Kunci Jawaban

| No | Jawaban |
|---|---|
| 1 | 132 |
| 2 | 12 |
| 3 | 11 |
| 4 | D (a[3] = 6) |
| 5 | 5 |
| 6 | FALSE |
| 7 | 16 |
| 8 | C (2563) |
| 9 | 42925 |
| 10 | 21 |
| Bonus | 385 |

---

## Soal 1 - 2. Loncat Enam

```c
int total = 0;
for (int i = 3; i <= 45; i += 6) {
    if (i % 5 == 0) continue;
    total += i;
}
printf("%d\n", total);
```

### Soal 1. Berapakah keluaran program?

**Jawaban: 132**

Nilai i dimulai dari 3 dan bertambah 6 selama i <= 45:

| i | i % 5 == 0? | Aksi | total |
|---|---|---|---|
| 3 | tidak | total += 3 | 3 |
| 9 | tidak | total += 9 | 12 |
| 15 | **ya** | continue (dilewati) | 12 |
| 21 | tidak | total += 21 | 33 |
| 27 | tidak | total += 27 | 60 |
| 33 | tidak | total += 33 | 93 |
| 39 | tidak | total += 39 | 132 |
| 45 | **ya** | continue (dilewati) | 132 |

Setelah i = 45, i menjadi 51 sehingga perulangan berhenti. Keluaran: **132**.

### Soal 2. Jika `continue` diganti `break`, berapakah keluaran program?

**Jawaban: 12**

`break` langsung menghentikan perulangan saat kondisi pertama kali terpenuhi, yaitu di i = 15. Nilai yang sempat dijumlahkan hanya 3 + 9 = **12**.

---

## Soal 3 - 4. Turun Tangga

```c
int a[6] = {8, 3, 5, 10, 4, 7};
int x = 0;
for (int i = 1; i < 6; i++)
    if (a[i] < a[i - 1])
        x += a[i - 1] - a[i];
printf("%d\n", x);
```

Program menjumlahkan besar **penurunan** antara dua elemen bersebelahan (hanya saat elemen kanan lebih kecil dari elemen kiri).

### Soal 3. Berapakah keluaran program?

**Jawaban: 11**

| i | a[i-1] → a[i] | Turun? | Tambahan x | x |
|---|---|---|---|---|
| 1 | 8 → 3 | ya | 5 | 5 |
| 2 | 3 → 5 | tidak | 0 | 5 |
| 3 | 5 → 10 | tidak | 0 | 5 |
| 4 | 10 → 4 | ya | 6 | 11 |
| 5 | 4 → 7 | tidak | 0 | 11 |

Keluaran: **11**.

### Soal 4. Nilai a[3] manakah yang membuat keluaran menjadi 7?

**Jawaban: D (a[3] = 6)**

Mengganti a[3] hanya memengaruhi dua pasangan: **5 → a[3]** dan **a[3] → 4**. Pasangan 8 → 3 tetap menyumbang 5, sehingga kedua pasangan tadi harus menyumbang tepat 7 − 5 = 2.

| Opsi | a[3] | 5 → a[3] | a[3] → 4 | Total x |
|---|---|---|---|---|
| A | 1 | 4 | 0 (naik) | 5 + 4 = 9 |
| B | 9 | 0 (naik) | 5 | 5 + 5 = 10 |
| C | 4 | 1 | 0 (sama) | 5 + 1 = 6 |
| **D** | **6** | 0 (naik) | 2 | 5 + 2 = **7** |
| E | 12 | 0 (naik) | 8 | 5 + 8 = 13 |

---

## Soal 5 - 6. Sambung Kata

```c
char s[30] = "program";
strcat(s, "komputer");
int c = 0;
for (int i = 0; s[i] != '\0'; i++)
    if (s[i] == 'r' || s[i] == 'm')
        c++;
printf("%d %d\n", (int)strlen(s), c);
```

Setelah `strcat`, isi s menjadi `"programkomputer"` (7 + 8 = 15 karakter). Keluaran lengkap program: `15 5`.

### Soal 5. Berapakah bilangan kedua (nilai c)?

**Jawaban: 5**

| Indeks | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Huruf | p | **r** | o | g | **r** | a | **m** | k | o | **m** | p | u | t | e | **r** |

Huruf `r` muncul 3 kali (indeks 1, 4, 14) dan `m` muncul 2 kali (indeks 6, 9), jadi c = 3 + 2 = **5**.

### Soal 6. Benar atau salah: `strcmp(s, "programming")` menghasilkan nilai positif.

**Jawaban: FALSE**

`strcmp` membandingkan karakter satu per satu dari kiri:

```
s             : p r o g r a m k o m p u t e r
"programming" : p r o g r a m m i n g
                              ^
                         indeks 7
```

Tujuh karakter pertama (`program`) sama. Perbedaan pertama ada di indeks 7: `'k'` (ASCII 107) dibanding `'m'` (ASCII 109). Karena `'k' < 'm'`, hasil `strcmp` **negatif**, bukan positif. Panjang string tidak berpengaruh karena perbedaan sudah ditemukan lebih dulu.

---

## Soal 7 - 8. Digit Bertingkat

```c
int n = 5827, s = 0, k = 1;
while (n > 0) {
    int d = n % 10;
    if (d > 4) s += d;
    else s -= d * k;
    n /= 10;
    k++;
}
printf("%d %d\n", s, k);
```

Digit diproses dari **kanan ke kiri**. Digit besar (5–9) ditambahkan apa adanya. Digit kecil (0–4) dikurangkan setelah dikali k, yaitu posisinya dari kanan (1, 2, 3, ...).

### Soal 7. Berapakah bilangan pertama (nilai s)?

**Jawaban: 16**

| n | k | d | d > 4? | Operasi | s |
|---|---|---|---|---|---|
| 5827 | 1 | 7 | ya | s += 7 | 7 |
| 582 | 2 | 2 | tidak | s -= 2 × 2 | 3 |
| 58 | 3 | 8 | ya | s += 8 | 11 |
| 5 | 4 | 5 | ya | s += 5 | 16 |
| 0 | 5 | - | - | perulangan berhenti | 16 |

Keluaran lengkap: `16 5`. Bilangan pertama adalah **16**.

### Soal 8. Bilangan mana yang membuat nilai s menjadi 0?

**Jawaban: C (2563)**

Telusuri digit dari kanan (posisi k = 1, 2, 3, 4):

| Opsi | n | k=1 | k=2 | k=3 | k=4 | s akhir |
|---|---|---|---|---|---|---|
| A | 4371 | 1 → −1 | 7 → +7 | 3 → −9 | 4 → −16 | **−19** |
| B | 7148 | 8 → +8 | 4 → −8 | 1 → −3 | 7 → +7 | **4** |
| **C** | **2563** | 3 → −3 | 6 → +6 | 5 → +5 | 2 → −8 | **0** |
| D | 3925 | 5 → +5 | 2 → −4 | 9 → +9 | 3 → −12 | **−2** |
| E | 6402 | 2 → −2 | 0 → −0 | 4 → −12 | 6 → +6 | **−8** |

Hanya 2563 yang menghasilkan s = −3 + 6 + 5 − 8 = **0**.

---

## Soal 9 - 10. Piramida Kaleng

```c
int N = 4;
long long total = 0;
for (int i = 1; i <= N; i++) {
    for (int j = 1; j <= i; j++)
        total += 2 * j - 1;
}
printf("%lld\n", total);
```

**Kunci pemahaman:** perulangan dalam menjumlahkan bilangan ganjil 1 + 3 + 5 + ... + (2i − 1). Jumlah i bilangan ganjil pertama selalu sama dengan **i²**:

- i = 1: 1 = 1²
- i = 2: 1 + 3 = 4 = 2²
- i = 3: 1 + 3 + 5 = 9 = 3²
- i = 4: 1 + 3 + 5 + 7 = 16 = 4²

Jadi `total` = 1² + 2² + ... + N², dengan rumus:

$$\sum_{i=1}^{N} i^2 = \frac{N(N+1)(2N+1)}{6}$$

Cek contoh soal: N = 4 → 4 · 5 · 9 / 6 = 30 ✓

### Soal 9. Jumlah kaleng untuk N = 50?

**Jawaban: 42925**

$$\frac{50 \cdot 51 \cdot 101}{6} = \frac{257550}{6} = 42925$$

### Soal 10. Lapisan paling sedikit agar jumlah kaleng ≥ 3000?

**Jawaban: 21**

Perkiraan awal: jumlah kuadrat ≈ N³/3, jadi N³ ≈ 9000 dan N ≈ 20,8. Cek di sekitar nilai tersebut:

| N | Perhitungan | Total |
|---|---|---|
| 20 | 20 · 21 · 41 / 6 | 2870 (< 3000) |
| 21 | 21 · 22 · 43 / 6 | 3311 (≥ 3000) |

Lapisan paling sedikit adalah **21**.

---

## Soal Bonus - Loker Sekolah

```c
int N = 6;
int buka[101] = {0};
for (int k = 1; k <= N; k++)
    for (int i = k; i <= N; i += k)
        buka[i] = !buka[i];
int jumlah = 0;
for (int i = 1; i <= N; i++)
    if (buka[i]) jumlah += i;
printf("%d\n", jumlah);
```

### Soal Bonus. Jika N = 100, berapakah keluaran program?

**Jawaban: 385**

**Langkah 1: kapan sebuah loker dibalik?** Loker nomor i dibalik oleh siswa ke-k jika i kelipatan k, yaitu jika **k adalah pembagi i**. Jadi loker i dibalik tepat sebanyak **jumlah pembagi i**.

**Langkah 2: kapan loker berakhir terbuka?** Semua loker mulai tertutup. Loker berakhir terbuka jika dibalik **ganjil** kali, artinya i harus punya jumlah pembagi yang ganjil.

**Langkah 3: bilangan mana yang pembaginya ganjil?** Pembagi biasanya berpasangan: jika d membagi i, maka i/d juga membagi i. Contoh untuk 12: (1, 12), (2, 6), (3, 4), sehingga ada 6 pembagi (genap). Pasangan hanya "berimpit" saat d = i/d, yaitu ketika i = d². Contoh untuk 16: (1, 16), (2, 8), (4, 4), dan 4 hanya dihitung sekali, sehingga ada 5 pembagi (ganjil).

Jadi **loker yang terbuka adalah loker bernomor kuadrat sempurna**.

Cek contoh N = 6: kuadrat sempurna ≤ 6 adalah 1 dan 4, jumlahnya 5 ✓ (sesuai gambar pada soal).

**Langkah 4: hitung untuk N = 100.** Kuadrat sempurna ≤ 100 adalah 1, 4, 9, 16, 25, 36, 49, 64, 81, 100.

$$1 + 4 + 9 + \dots + 100 = \sum_{i=1}^{10} i^2 = \frac{10 \cdot 11 \cdot 21}{6} = 385$$

Keluaran program: **385**.
