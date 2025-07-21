#include <stdio.h>

long long fpb(long long a, long long b)
{
    if (b == 0)
    {
        return a;
    }
    return fpb(b, a % b);
}

int main()
{
    long long a, b;
    scanf("%lld %lld", &a, &b);
    long long gcd = fpb(a, b);
    long long ans = a * b / gcd;
    printf("%lld", ans);
}