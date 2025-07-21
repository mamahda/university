#include <stdio.h>

int main()
{
    long long int x, y, z;
    long long int max, min;
    int test = 0;
    scanf("%lld %lld %lld", &x, &y, &z);

    if (x >= y)
    {
        if (x >= z)
        {
            max = x;
            if (z >= y)
            {
                min = y;
            }
            else if (y > z)
            {
                min = z;
            }
        }
        else if (z > x)
        {
            max = z;
            min = y;
        }
    }
    else if (y >= x)
    {
        if (y >= z)
        {
            max = y;
            if (z >= x)
            {
                min = x;
            }
            else if (x > z)
            {
                min = z;
            }
        }
        else if (z > y)
        {
            max = z;
            min = x;
        }
    }

    printf("Stok terbanyak : %lld\n", max);
    printf("Stok terendah : %lld\n", min);
    if (x == y && test == 0)
    {
        printf("Terdapat toko dengan stok yang sama : %lld", x);
        test = 1;
    }
    if (y == z && test == 0)
    {
        printf("Terdapat toko dengan stok yang sama : %lld", y);
        test = 1;
    }
    if (z == x && test == 0)
    {
        printf("Terdapat toko dengan stok yang sama : %lld", z);
        test = 1;
    }
    if (x != y && y != z && x != z || test == 0)
    {
        printf("Tidak ada stok yang sama");
    }
}