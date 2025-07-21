#include <stdio.h>

long long pola(long long a)
{
    return a * 2;
}

long long aneh(int i)
{
    if (i == 1)
        return 1;
    else
    {
        return i + aneh(i - 1);
    }
}

int main()
{
    int n;
    scanf("%d", &n);
    long long arr[51];
    arr[1] = 1;
    for (int i = 2; i <= n; i++)
    {
        arr[i] = pola(arr[i - 1]) + aneh(i);
    }
    printf("%lld\n", arr[n]);
}