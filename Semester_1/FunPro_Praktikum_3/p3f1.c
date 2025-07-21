#include <stdio.h>

long long sum = 0;
void fibonacci(long long a, long long b, long long c)
{
    if (c < a)
    {
        sum -= a;
        return;
    }
    sum += b;
    fibonacci(b, b + a, c);
    printf("%d ", a);
}

int main()
{
    int n;
    scanf("%d", &n);
    fibonacci(0, 1, n);
    printf("\n%d", sum);
    return 0;
}