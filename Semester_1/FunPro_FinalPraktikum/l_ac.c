#include <stdio.h>
#include <math.h>

#define PI 3.14159265358979323846

int main()
{
    long double v;
    scanf("%Lf", &v);

    long double r = cbrtl(v / (2 * PI));
    long double h = 2 * r;

    long double l = 2 * PI * r * (r + h);

    printf("Luas permukaan: %.2Lf", l);

    return 0;
}
