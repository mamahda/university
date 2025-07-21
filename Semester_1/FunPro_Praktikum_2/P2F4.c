#include <stdio.h>
#include <math.h>

int main()
{
    long long n, m, f;
    long long k = 0;
    int digit;
    scanf("%lld %lld %lld", &n, &m, &f);
    if (n >= f)
    {
        digit = log2(n) + 1;
    }
    else
    {
        digit = log2(f) + 1;
    }

    int test = 0;
    for (int i = 1; i <= digit; i++)
    {
        int tempn = (n >> (digit - i)) & 1;
        int tempf = (f >> (digit - i)) & 1;
        if (tempn == 1 && tempf == 1)
        {
            k = k << 1;
            test = 1;
        }
        else if (tempn == 1 && tempf == 0)
        {
            k = k << 1;
        }
        else if (tempn == 0 && tempf == 1)
        {
            k = k << 1;
            k++;
        }
        else if (tempn == 0 && tempf == 0)
        {
            if (test == 1)
            {
                k = k << 1;
                k++;
            }
            else
            {
                k = k << 1;
            }
        }
    }
    if ((n ^ k) >= m)
    {
        printf("HAHAHA, I CAN SAVE THE WORLD");
    }
    else
    {
        printf("OH NOOO, I FAILED");
    }
}