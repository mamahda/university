// Sebenernya guys ga perlu ngecekin nilai kartu di semua posisi
// kan yg penting kita tau jumlah kemunculan nilai setiap kartunya brp kali
// jadi langsung hitung aja per input nilai jumlah kemunculannya brp kali

#include <stdio.h>

int main() {
    int n1, n2, n3, n4, n5; // nilai
    char j1, j2, j3, j4, j5; // jenis
    
    // Input 5 kartu (nilai dan jenis)
    scanf("%d %c", &n1, &j1);
    scanf("%d %c", &n2, &j2);
    scanf("%d %c", &n3, &j3);
    scanf("%d %c", &n4, &j4);
    scanf("%d %c", &n5, &j5);

    // ini aku buat variabel counter (c1,c2,c3,c4) buat nampung jumlah kemunculan nilai kartu
    int c1 = 0, c2 = 0, c3 = 0, c4 = 0; 

    // cek n1 dengan 4 kartu sisanya
    if (n1 == n2) c1++; 
    if (n1 == n3) c1++; 
    if (n1 == n4) c1++; 
    if (n1 == n5) c1++; 
    
    // cek n2 dengan 3 kartu sisanya
    if (n2 == n3) c2++;
    if (n2 == n4) c2++;
    if (n2 == n5) c2++;

    // cek n3 dengan 2 kartu sisanya
    if (n3 == n4) c3++;
    if (n3 == n5) c3++;

    // cek n4 dengan kartu terakhir
    if (n4 == n5) c4++;

    // Informasi yang didapet dari variabel counter (c1,c2,c3,c4) itu:
    // --> kalo counter = 1, berarti ada 2 kartu yang nilainya sama
    // --> kalo counter = 2, berarti ada 3 kartu yang nilainya sama
    // --> kalo counter = 3, berarti ada 4 kartu yang nilainya sama
    // --> kalo counter = 4, berarti ada 5 kartu yang nilainya sama
    // Ini udh bisa dipake langsung buat ngecek semua kombinasi

    // tapi disini aku bikin lagi variabel pairs buat nampung jumlah satu pasang kartu yang nilainya sama 
    // kalo ga pake variabel pairs juga bisa, cuman ini supaya aku gausa ngecek kebanyakan aja si
    // khususnya buat ngecek full house kan berarti harus cek apakah c1||c2||c3||c4 = 3 dan c1||c2||c3||c4 = 2
    int pairs = 0; 
    // hitung jumlah pairs
    if (c1 == 1) pairs++; 
    if (c2 == 1) pairs++; 
    if (c3 == 1) pairs++; 
    if (c4 == 1) pairs++;

    // Cek kombinasi
    // Four of a Kind: Ada 4 kartu dengan nilai yang sama
    if (c1 == 3 || c2 == 3 || c3 == 3 || c4 == 3) {
        printf("Four of a Kind");
    }
    // Full house: 3 kartu dengan nilai yang sama dan 2 kartu dengan nilai yang sama.
    // 3 kartu dengan nilai yang sama bisa dicek pake if (counter == 2)
    // 2 kartu dengan nilai yang sama disini aku manfaatin pairsnya karena full house itu kan jumlah pairsnya pasti ada 2:
    // --> 1 pair dari 3 kartu dengan nilai yang sama (contoh nilainya: 12 12 12 --> 12 yang di kartu pertama sama kartu kedua itu kan 1 pair, atau bisa juga dari posisi yang lain tapi mau dimanapun posisinya itu asal ada 2 nilai kartu yang sama artinya ada 1 pair)
    // --> 1 pair nya lagi ya dari 2 kartu yang nilainya sama
    else if ((c1 == 2 || c2 == 2 || c3 == 2 || c4 == 2) && pairs == 2) {
        printf("Full House");
    }
    // Flush: Semua jenis kartu sama
    else if (j1 == j2 && j2 == j3 && j3 == j4 && j4 == j5) {
        printf("Flush\n");
    }
    // Three of a Kind: Ada 3 kartu dengan nilai yang sama
    else if (c1 == 2 || c2 == 2 || c3 == 2 || c4 == 2) {
        printf("Three of a Kind");
    }
    // Two Pair: Ada dua pasang kartu dengan nilai yang sama
    else if (pairs == 2) {
        printf("Two Pair");
    }
    // Pair: Ada satu pasang kartu dengan nilai yang sama
    else if (pairs == 1) {
        printf("One Pair");
    }
    // Tidak ada kombinasi
    else {
        printf("Tidak ada kombinasi khusus");
    }

    return 0;
}