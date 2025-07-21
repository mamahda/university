#include <stdio.h>

int main()
{
    int n;
    scanf("%d", &n);
    int buah[11];
    for (int i = 1; i <= 10; i++)
        buah[i] = 0;

    for (int i = 0; i < n; i++)
    {
        int temp;
        scanf("%d", &temp);
        buah[temp]++;
    }
    int test = 0;
    int max = buah[1];
    int modus = 1;
    for (int i = 2; i <= 10; i++)
    {
        if (buah[i] == max)
            test = 1;
        if (max < buah[i])
        {
            max = buah[i];
            modus = i;
            test = 0;
        }
    }
    if (test == 1)
        printf("-1");
    else if (test == 0)
    {
        printf("%d\n", modus);
        printf("%d", n - max);
    }
}