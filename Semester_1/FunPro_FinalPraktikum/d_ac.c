#include <stdio.h>
#include <string.h>

int main()
{
    int n, ans = 0;
    char nama[10];
    scanf("%s %d", &nama, &n);
    if (strcmp(nama, "Ellie") == 0)
    {
        // printf("1\n");
        for (int i = 2; i <= n; i++)
        {
            if (i % 2 == 0)
            {
                ans += i;
                // printf("%d\n", i);
            }
        }
        printf("%d", ans);
    }
    else if (strcmp(nama, "Oddie") == 0)
    {
        // printf("2\n");
        for (int i = 1; i <= n; i++)
        {
            if (i % 2 != 0)
            {
                ans += i;
                // printf("%d\n", i);
            }
        }
        printf("%d", ans);
    }
    else
    {
        printf("Who is that?");
    }
}