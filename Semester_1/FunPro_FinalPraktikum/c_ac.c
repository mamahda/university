#include <stdio.h>

int main()
{
    long long a, b, c, d;
    scanf("%lld %lld %lld %lld", &a, &b, &c, &d);
    double m, y;

    if (c - a != 0)
    {
        m = (double)(d - b) / (c - a);
        y = b - m * a;
        printf("%.2f %.2f", m, y);
    }
    else
    {
        printf("-_-");
    }

    return 0;
}