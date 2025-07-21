#include <stdio.h>

int main()
{
    long long a, ans = 0;
    scanf("%lld", &a);
    for (int i = 1; i <= a; i++)
    {
        ans += i * i;
    }

    printf("%lld", ans);
}