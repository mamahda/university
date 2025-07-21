#include <stdio.h>

#define MOD 1000000007

long long fibonacci_recursive(int x, int y, int a, int b, long long n)
{
    if (n == 0)
        return x;
    if (n == 1)
        return y;

    return (a * fibonacci_recursive(x, y, a, b, n - 1) % MOD +
            b * fibonacci_recursive(x, y, a, b, n - 2) % MOD) %
           MOD;
}

int main()
{
    int x, y, a, b;
    long long n;
    scanf("%d %d %d %d %lld", &x, &y, &a, &b, &n);

    printf("%lld\n", fibonacci_recursive(x, y, a, b, n));
    return 0;
}