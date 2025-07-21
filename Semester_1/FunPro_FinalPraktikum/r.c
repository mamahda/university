#include <stdio.h>

#define MOD 1000000007

long long fibonacci(long long x, long long y, long long a, long long b, long long n)
{
    if (n == 0)
        return x;
    if (n == 1)
        return y;

    long long f0 = x;
    long long f1 = y;
    long long fn;

    for (long long i = 2; i <= n; i++)
    {
        fn = (a * f1 % MOD + b * f0 % MOD) % MOD;
        f0 = f1;
        f1 = fn;
    }

    return fn;
}

int main()
{
    long long n, x, y, a, b;
    scanf("%lld %lld %lld %lld %lld", &x, &y, &a, &b, &n);

    printf("%lld\n", fibonacci(x, y, a, b, n));
    return 0;
}