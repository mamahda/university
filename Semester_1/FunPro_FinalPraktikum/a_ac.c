#include <stdio.h>

int gcd(int input1, int input2)
{
    if (input2 == 0)
    {
        return input1;
    }
    return gcd(input2, input1 % input2);
}

int main()
{
    long long n, k, t, fpb, ans;
    scanf("%lld %lld", &n, &k);
    fpb = gcd(n, k);
    t = n + fpb - 1;
    if (t % fpb == 0)
    {
        t = (t / fpb) - 1;
    }
    else
    {
        t = t / fpb;
    }
    ans = (t * (2 + (t - 1) * fpb)) / 2;

    printf("%lld\n", ans);
    return 0;
}
