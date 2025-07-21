#include <stdio.h>

int main()
{
    long long a, ans = 1;
    scanf("%d", &a);
    for (int i = 1; i <= a; i++)
    {
        ans *= i;
    }

    printf("%d", ans);
}