#include <stdio.h>

int main(){
    unsigned long long a, b, c, d, e, f, g, h, i;
    int arya = 0, andi = 0; // variabel untuk menghitung jumlah kemenangan arya dan andi
    scanf("%llu %llu %llu %llu %llu %llu %llu %llu %llu", &a, &b, &c, &d, &e, &f, &g, &h, &i);

    // kalkulasi agar berapapun input yang diberikan maka akan diubah menjadi angka 0 1 2
    a %= 3; 
    b %= 3; 
    c %= 3;
    d %= 3; 
    e %= 3; 
    f %= 3;
    g %= 3; 
    h %= 3; 
    i %= 3;

    printf("%llu | %llu | %llu\n", a, b, c);
    printf("%llu | %llu | %llu\n", d, e, f);
    printf("%llu | %llu | %llu\n", g, h, i);

    // baris 1 --> a | b | c
    if(a == b && a == c && a == 1) arya++; // --> kalo baris 1 isinya 1 semua artinya arya menang, simpan di variabel arya
    else if (a == b && a == c && a == 2) andi++; // --> kalo baris 1 isinya 2 semua artinya andi menang, simpan di variabel andi

    // sisanya sama aja cuman ngecek buat baris ke 2 dan seterusnya

    // baris 2 --> d | e | f
    if(d == e && d == f && d == 1) arya++; 
    else if (d == e && d == f && d == 2) andi++;

    // baris 3 --> g | h | i
    if(g == h && g == i && g == 1) arya++;
    else if (g == h && g == i && g == 2) andi++;

    // kolom 1 --> a d g
    if(a == d && a == g && a == 1) arya++;
    else if (a == d && a == g && a == 2) andi++;

    // kolom 2 --> b e h
    if(b == e && b == h && b == 1) arya++;
    else if (b == e && b == h && b == 2) andi++;

    // kolom 3 --> c f i
    if(c == f && c == i && c == 1) arya++;
    else if (c == f && c == i && c == 2) andi++;

    // diagonal kiri atas ke kanan bawah --> a e i
    if(a == e && a == i && a == 1) arya++;
    else if (a == e && a == i && a == 2) andi++;

    // diagonal kanan atas ke kiri bawah --> c e g
    if(c == e && c == g && c == 1) arya++;
    else if (c == e && c == g && c == 2) andi++;

    // jika keduanya menang
    if ((arya == 1) && (andi == 1)){
        printf("Terjadi alomani dua kemenangan!\nLah dua duanya menang, selamat Arya dan Andi");
    } 
    // arya menang 1 kali
    else if (arya == 1) {
        printf ("Keberuntungan ada di kamu, selamat Arya");
    }
    // arya menang 2 kali
    else if (arya == 2) {
        printf("Terjadi alomani dua kemenangan!\nLah menang dua kali kamu Arya");
    }
    // andi menang 1 kali
    else if (andi == 1) {
        printf ("Keberuntungan ada di kamu, selamat Andi");
    }
    // andi menang 2 kali
    else if (andi == 2) {
        printf("Terjadi alomani dua kemenangan!\nLah menang dua kali kamu Andi");
    } 
    // tidak ada yang menang
    else {
        printf ("Yahh kurang beruntung nih, gaada kemenangan!");
    }
    return 0;
}