#include <stdio.h>

int main(){
    int n, m1, m2, m3; // n itu jumlah misi, m1 = misi 1, m2 = misi 2, m3 = misi 3
    int total = 0; // total waktu diinisialisasi 0 karena nanti kan akan nambah sesuai sama kesulitan misi
    int sisa = 180; // sisa waktu diinisialisasi 180 karena ini batas waktu maksimumnya yang nanti akan dikurangin sama waktu tiap misi

    // input jumlah misi
    scanf("%d", &n);
    
    // cek jika jumlah misi tidak valid
    if(n < 1 || n > 3) {
        printf("Jumlah misi harus antara 1 dan 3!");
        return 0;
    }

    // cek misi 1
    if(n >= 1) { // cek jumlah misi n >= 1 supaya sekalian scan dan ngecek misi 1 buat n = 2 dan n = 3
        scanf("%d", &m1);
        if(m1 == 1) total += 30;
        else if(m1 == 2) total += 45;
        else if(m1 == 3) total += 90;
        else {
            printf("Kesulitan yang kamu masukkan tidak valid! Program berhenti.");
            return 0;
        }
    }

    // cek misi 2
    if(n >= 2){ // cek jumlah misi n >= 2 supaya sekalian scan dan ngecek misi 2 buat n = 3
        scanf("%d", &m2);
        if(m2 == 1) total += 30;
        else if(m2 == 2) total += 45;
        else if(m2 == 3) total += 90;
        else {
            printf("Kesulitan yang kamu masukkan tidak valid! Program berhenti.");
            return 0;
        }
    }

    // cek misi 3
    if(n == 3){
        scanf("%d", &m3);
        if(m3 == 1) total += 30;
        else if(m3 == 2) total += 45;
        else if(m3 == 3) total += 90;
        else {
            printf("Kesulitan yang kamu masukkan tidak valid! Program berhenti.");
            return 0;
        }
    }

    // hitung sisa waktu sekarang
    sisa -= total;

    // print output total waktu dan sisa waktu
    printf("Total waktu yang dihabiskan: %d menit\n", total);
    printf("Sisa waktu: %d menit\n", sisa);

    // cek aktivitas tambahan
    if(sisa >= 30) printf("Benerin mobil kayanya asik di AutoWin. Anjay mulus!");
    else if(sisa >= 15) printf("Makan dulu gasih brow di Klenger Noodles. Perut kenyang hidup tenang!");
    else printf("Jangan sok jago, mampus kan ga cukup waktunya. ang ang ang bye bye real life.");

    return 0;
}