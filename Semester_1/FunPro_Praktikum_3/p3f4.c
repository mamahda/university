#include <stdio.h>

long long l(int n)
{
    if (n == 1)
        return 2;
    return 3 * l(n - 1);
}

int main()
{
    int n;
    scanf("%d", &n);
    long long ans = l(n);
    printf("Ada %lld model, bebaskan aku!", ans);
}