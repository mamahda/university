#include <stdio.h>

int main(){
    long long x, y, z, max, min;
    scanf("%lld %lld %lld", &x, &y, &z);

    // definisikan nilai max dan min bernilai x 
    // yang selanjutnya akan di cek dengan nilai y dan z untuk menentukan min dan max dari 3 nilai tersebut
    max = x; 
    min = x;

    // cek stok terbanyak
    if (y > max) max = y; // jika true artinya nilai y lebih besar dari x (karena inisialisasi awal max adalah x)
    if (z > max) max = z; // jika true artinya nilai z lebih besar dari x dan y (karena max sekarang ya antara x atau y tergantung sama pengecekan sebelumnya)

    // cek stok terendah
    if (y < min) min = y; // intinya sama aja kayak yang stok terbanyak
    if (z < min) min = z;

    // cetak stok terbanyak dan terendah
    printf("Stok terbanyak : %lld\n", max);
    printf("Stok terendah : %lld\n", min);
    
    // cek stok yang sama
    if (x == y || x == z) printf("Terdapat toko dengan stok yang sama : %lld", x);
    else if (y == z) printf("Terdapat toko dengan stok yang sama : %lld", y);
    else printf("Tidak ada stok yang sama\n");
    
    return 0;
}