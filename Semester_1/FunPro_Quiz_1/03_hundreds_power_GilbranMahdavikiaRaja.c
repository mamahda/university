#include <stdio.h>
// 5025241134 Gilbran Mahdavikia Raja
int main()
{
    int n;
    printf("100 to the power of: ");
    scanf("%d", &n);

    if (n >= 0)
    {
        printf("1");
        for (int i = 0; i < n; i++)
        {
            printf("00");
        }
    }
    else if (n < 0)
    {
        for (int i = n; i < 0; i++)
        {
            if (i == n)
            {
                printf("0.0");
            }
            else
            {
                printf("00");
            }
        }
        printf("1");
    }
}