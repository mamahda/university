#include <stdio.h>
#include <math.h>

typedef struct
{
    double x;
    double y;
} koordinat;

int main()
{
    int n, min = 1000000;
    double ans;
    scanf("%d", &n);
    koordinat titik[n];
    double jarak[n][n];
    for (int i = 0; i < n; i++)
    {
        scanf("%lf %lf", &titik[i].x, &titik[i].y);
    }
    for (int i = 0; i < n; i++)
    {
        for (int j = i + 1; j < n; j++)
        {
            double x1 = titik[i].x;
            double x2 = titik[j].x;
            double y1 = titik[i].y;
            double y2 = titik[j].y;
            jarak[i][j] = sqrt(((y1 - y2) * (y1 - y2)) + ((x1 - x2) * (x1 - x2)));
            // printf("%.2lf %.2lf %.2lf %.2lf\n", x1, y1, x2, y2);
            // printf("%.2lf\n", jarak[i][j]);
            if (min > jarak[i][j])
            {
                min = jarak[i][j];
                ans = jarak[i][j];
            }
        }
    }
    printf("%.2lf", ans);
}