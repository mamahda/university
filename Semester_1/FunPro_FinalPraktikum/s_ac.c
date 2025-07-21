#include <stdio.h>

int main()
{
    long long n, k, harga;
    int diskon = 0, disongkir = 0;
    scanf("%lld %lld", &n, &k);
    switch (n)
    {
    case 1:
        diskon = 35;
        break;
    case 2:
        diskon = 45;
        break;
    case 3:
        diskon = 50;
        break;
    case 4:
        diskon = 55;
        break;
    case 5:
        diskon = 40;
        break;
    }

    harga = k - (k * diskon / 100);

    if (harga >= 250000)
    {
        disongkir = 100;
    }
    else if (harga >= 150000)
    {
        disongkir = 50;
    }
    else if (harga >= 50000)
    {
        disongkir = 25;
    }

    int ongkir = 50000 - (50000 * disongkir / 100);
    long long total = harga + ongkir;
    long long sisa = 300000 - total;

    if (sisa > 0)
    {
        printf("WOHHHH uangku sisa %lld\n", sisa);
        printf("Mamaa Surip bisa kasi THR ke adek adek, tadi totalnya %lld\n", total);
    }
    else if (sisa < 0)
    {
        printf("Mamaa minta uang, uangku kurang %lld :((\n", -sisa);
        printf("Totalnya tadi %lld\n", total);
    }
    else
    {
        printf("Yeyyy totalnya pas %lld\n", total);
        printf("Mamaa, Surip udah gede ga jadi minta uang :)\n");
    }

    return 0;
}
