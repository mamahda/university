# Praktikum Modul 2

**Perulangan, Array, dan String (RPL) - Set C**

**Petunjuk.** Semua potongan kode ditulis dalam bahasa C dan berada di dalam fungsi main(); stdio.h dan string.h sudah di-include. Program tidak menerima masukan dari pengguna. Kerjakan tanpa compiler: tebak, telusuri, dan hitung dengan tangan.

---

## Soal 1-3. Loncat Empat

Tuliskan jawaban dalam bentuk ANGKA.

```c
int total = 0;
for (int i = 1; i <= 30; i += 4) {
    if (i % 3 == 0) continue;
    total += i;
}
printf("%d\n", total);
```

**Soal 1.** Berapakah keluaran program?

Jawab:

**Soal 2.** Jika kata continue diganti break, berapakah keluaran program?

Jawab:

**Soal 3.** Pada program asli, berapa kali kondisi i <= 30 dievaluasi (termasuk evaluasi terakhir yang bernilai salah)?

Jawab:

---

## Soal 4-5. Papan Catur

```c
int m[3][4] = {{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}};
int x = 0;
for (int i = 0; i < 3; i++)
    for (int j = 0; j < 4; j++)
        if ((i + j) % 2 == 0)
            x += m[i][j];
printf("%d\n", x);
```

**Soal 4.** Berapakah keluaran program?

Tuliskan jawaban dalam bentuk ANGKA.

Jawab:

**Soal 5.** Jika kondisi (i + j) % 2 == 0 diganti menjadi j > i, berapakah keluaran program?

Coret Jawaban Yang Benar

- A. 26
- B. 38
- C. 42
- D. 36
- E. 52

---

## Soal 6-8. Tempel Kata

```c
char a[20] = "kode";
char b[] = "program";
strcat(a, b);
int len = strlen(a), c = 0;
for (int i = 0; i < len; i++)
    if (a[i] == 'o' || a[i] == 'r')
        c++;
printf("%d %d\n", len, c);
```

**Soal 6.** Keluaran program berupa dua bilangan. Berapakah bilangan pertama (nilai len)?

Tuliskan jawaban dalam bentuk ANGKA.

Jawab:

**Soal 7.** Berapakah bilangan kedua pada keluaran (nilai c)?

Coret Jawaban Yang Benar

- A. 2
- B. 3
- C. 4
- D. 5
- E. 11

**Soal 8.** Setelah strcat(a, b) dijalankan, strcmp(a, b) menghasilkan nilai negatif.

Tuliskan jawaban dalam bentuk TRUE / FALSE.

Jawab:

---

## Soal 9-10. Segitiga Genap Menurun

Tuliskan jawaban dalam bentuk ANGKA.

```c
for (int i = 1; i <= 5; i++) {
    for (int j = i; j >= 1; j--)
        printf("%d", (i + j) * 2);
    printf("\n");
}
```

**Soal 9.** Pada seluruh keluaran program, berapa kali karakter '1' dicetak?

Jawab:

**Soal 10.** Jumlahkan semua nilai (i + j) * 2 yang dicetak oleh seluruh pemanggilan printf("%d", (i + j) * 2). Berapakah hasilnya (jumlah bilangan, bukan jumlah digit)?

Jawab:

---

## Soal 11-13. Bit Menyala

```c
int n = 2026, s = 0, k = 0;
while (n > 0) {
    s += n % 2;
    n /= 2;
    k++;
}
printf("%d %d\n", s, k);
```

**Soal 11.** Keluaran program berupa dua bilangan. Berapakah bilangan pertama (nilai s)?

Tuliskan jawaban dalam bentuk ANGKA.

Jawab:

**Soal 12.** Jika nilai awal n diganti salah satu bilangan berikut, bilangan manakah yang membuat keluaran program menjadi 3 7?

Coret Jawaban Yang Benar

- A. 37
- B. 44
- C. 56
- D. 49
- E. 70

**Soal 13.** Jika nilai awal n adalah bilangan bulat dari 1 sampai 63 (inklusif), ada berapa nilai n yang membuat bilangan pertama pada keluaran bernilai 2?

Tuliskan jawaban dalam bentuk ANGKA.

Jawab:

---

## Soal 14-15. Genap di Depan

```c
int a[7] = {6, 2, 9, 4, 7, 1, 5};
int i = 0, j = 6;
while (i < j) {
    if (a[i] % 2 == 0) i++;
    else {
        int t = a[i];
        a[i] = a[j];
        a[j] = t;
        j--;
    }
}
for (int k = 0; k < 7; k++)
    printf("%d ", a[k]);
```

**Soal 14.** Setelah perulangan while selesai, berapakah nilai a[2] + a[3]?

Tuliskan jawaban dalam bentuk ANGKA.

Jawab:

**Soal 15.** Selama perulangan while berjalan, pertukaran nilai (isi blok else) terjadi tepat 4 kali.

Tuliskan jawaban dalam bentuk TRUE / FALSE.

Jawab:

---

## Soal 16-18. Kurung Terdalam

```c
char s[] = "(()(()))()";
int c = 0, best = 0;
for (int i = 0; s[i] != '\0'; i++) {
    if (s[i] == '(') c++;
    else c--;
    if (c > best) best = c;
}
printf("%d\n", best);
```

**Soal 16.** Berapakah keluaran program?

Tuliskan jawaban dalam bentuk ANGKA.

Jawab:

**Soal 17.** String manakah yang membuat keluaran program bernilai 2?

Coret Jawaban Yang Benar

- A. "()()()"
- B. "((()))"
- C. "(()())"
- D. ")(()"
- E. "((("

**Soal 18.** Jika string s diganti string sepanjang 4 karakter yang hanya terdiri dari '(' dan ')' (ada 16 kemungkinan, yakni "((((", "((()", ..., "))))"), pada berapa kemungkinan keluaran program bernilai 2?

Tuliskan jawaban dalam bentuk ANGKA.

Jawab:

---

## Soal 19-20. Pasangan Kelipatan Tiga

Tuliskan jawaban dalam bentuk ANGKA.

```c
int a[8] = {3, 7, 1, 8, 6, 5, 9, 4};
int c = 0;
for (int i = 0; i < 8; i++)
    for (int j = i + 1; j < 8; j++)
        if ((a[i] + a[j]) % 3 == 0)
            c++;
printf("%d\n", c);
```

**Soal 19.** Berapakah keluaran program?

Jawab:

**Soal 20.** Jika array diganti menjadi 9 elemen berisi 1, 2, 3, ..., 9 dan semua batas 8 pada program diganti 9, berapakah keluaran program?

Jawab:

---

## Soal 21-23. Ganjil Genap Huruf

```c
char s[] = "matematika";
int cnt[26] = {0};
for (int i = 0; s[i] != '\0'; i++)
    cnt[s[i] - 'a']++;
int u = 0, g = 0;
for (int k = 0; k < 26; k++) {
    if (cnt[k] > 0) u++;
    if (cnt[k] % 2 == 1) g++;
}
printf("%d %d\n", u, g);
```

**Soal 21.** Berapakah keluaran program?

Coret Jawaban Yang Benar

- A. 6 4
- B. 4 6
- C. 6 3
- D. 10 4
- E. 5 4

**Soal 22.** Jika huruf pertama string s dihapus sehingga s menjadi "atematika", keluaran program menjadi 6 5.

Tuliskan jawaban dalam bentuk TRUE / FALSE.

Jawab:

**Soal 23.** Jika string s diganti string sepanjang 4 huruf yang hanya terdiri dari 'a' dan 'b' (ada 16 kemungkinan, "aaaa", "aaab", "aaba", ..., "bbbb"), ada berapa kemungkinan bilangan kedua pada keluaran bernilai 0?

Tuliskan jawaban dalam bentuk ANGKA.

Jawab:

---

## Soal 24-25. Saling Prima

Tuliskan jawaban dalam bentuk ANGKA.

```c
int c = 0;
for (int n = 1; n <= 12; n++) {
    int a = n, b = 12;
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    if (a == 1) c++;
}
printf("%d\n", c);
```

**Soal 24.** Berapakah keluaran program?

Jawab:

**Soal 25.** Selama program berjalan, pernyataan a = b; dijalankan sebanyak berapa kali?

Jawab:

---

# Kunci Jawaban Set C

| No | Jawaban | Pembahasan singkat |
|---|---|---|
| 1 | 90 | i = 1, 5, 9, 13, 17, 21, 25, 29; nilai 9 dan 21 dilewati, sisanya 1 + 5 + 13 + 17 + 25 + 29 |
| 2 | 6 | 1 + 5, lalu perulangan berhenti di i = 9 |
| 3 | 9 | 8 kali bernilai benar, ditambah 1 kali bernilai salah saat i = 33 |
| 4 | 38 | Posisi dengan i + j genap: 1 + 3 + 6 + 8 + 9 + 11 |
| 5 | D | Posisi dengan j > i: 2 + 3 + 4 + 7 + 8 + 12 = 36 |
| 6 | 11 | a menjadi "kodeprogram" |
| 7 | C | Dua huruf o dan dua huruf r, jadi c = 4 |
| 8 | TRUE | Karakter pertama 'k' lebih kecil dari 'p' |
| 9 | 10 | Baris keluaran: 4 / 86 / 12108 / 16141210 / 2018161412 |
| 10 | 180 | Jumlah per baris: 4 + 14 + 30 + 52 + 80 |
| 11 | 8 | 2026 dalam biner adalah 11111101010 (8 bit bernilai 1, 11 digit) |
| 12 | E | 70 = 1000110 (3 bit bernilai 1, 7 digit); pilihan lain hanya 6 digit |
| 13 | 15 | Memilih 2 dari 6 posisi bit: C(6,2) |
| 14 | 11 | Array akhir: 6 2 4 7 1 5 9, sehingga 4 + 7 |
| 15 | TRUE | Pertukaran terjadi saat a[2] bernilai 9, 5, 1, lalu 7; setelah itu a[2] = 4 dan i = j |
| 16 | 3 | Kedalaman maksimum tercapai pada karakter ke-6 |
| 17 | C | A = 1, B = 3, C = 2, D = 1, E = 3 |
| 18 | 4 | "(()(", "(())", "()((", ")(((" |
| 19 | 9 | Sisa bagi 3: tiga elemen bersisa 0, tiga bersisa 1, dua bersisa 2; C(3,2) + 3 × 2 |
| 20 | 12 | Masing-masing 3 elemen per sisa; C(3,2) + 3 × 3 |
| 21 | A | m = 2, a = 3, t = 2, e = 1, i = 1, k = 1; 6 huruf berbeda, 4 berfrekuensi ganjil |
| 22 | TRUE | m menjadi 1 kali, sehingga huruf berfrekuensi ganjil bertambah menjadi 5 |
| 23 | 8 | "aaaa", "bbbb", dan 6 string dengan dua huruf a dan dua huruf b |
| 24 | 4 | n yang saling prima dengan 12: 1, 5, 7, 11 |
| 25 | 32 | Banyak putaran while untuk n = 1 sampai 12: 2, 2, 2, 2, 4, 2, 5, 3, 3, 3, 3, 1 |
