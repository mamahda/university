#include <stdio.h>

int main()
{
    int n, sum = 0;
    int a = 0, b = 0, c = 0;
    int test = 0;
    scanf("%d", &n);
    if (n >= 1 && n <= 3)
    {
        if (n == 3)
        {
            scanf("%d", &a);
            scanf("%d", &b);
            scanf("%d", &c);
            if ((a >= 1 && a <= 3) && (b >= 1 && b <= 3) && (c >= 1 && c <= 3))
            {
                test = 1;
            }
        }
        else if (n == 2)
        {
            scanf("%d", &a);
            scanf("%d", &b);
            if ((a >= 1 && a <= 3) && (b >= 1 && b <= 3))
            {
                test = 1;
            }
        }
        else if (n == 1)
        {
            scanf("%d", &a);
            if (a >= 1 && a <= 3)
            {
                test = 1;
            }
        }
    }
    else
    {
        printf("Jumlah misi harus antara 1 dan 3!");
        return 0;
    }
    if (test == 1)
    {
        if (a == 1)
        {
            sum += 30;
        }
        if (b == 1)
        {
            sum += 30;
        }
        if (c == 1)
        {
            sum += 30;
        }
        if (a == 2)
        {
            sum += 45;
        }
        if (b == 2)
        {
            sum += 45;
        }
        if (c == 2)
        {
            sum += 45;
        }
        if (a == 3)
        {
            sum += 90;
        }
        if (b == 3)
        {
            sum += 90;
        }
        if (c == 3)
        {
            sum += 90;
        }
        printf("Total waktu yang dihabiskan: %d menit\n", sum);
        printf("Sisa waktu: %d menit\n", 180 - sum);
        if (180 - sum >= 30)
        {
            printf("Benerin mobil kayanya asik di AutoWin. Anjay mulus!");
        }
        else if (180 - sum >= 15)
        {
            printf("Makan dulu gasih brow di Klenger Noodles. Perut kenyang hidup tenang!");
        }
        else if (180 - sum < 15)
        {
            printf("Jangan sok jago, mampus kan ga cukup waktunya. ang ang ang bye bye real life.");
        }
    }
    else if (test == 0)
    {
        printf("Kesulitan yang kamu masukkan tidak valid! Program berhenti.");
    }
}