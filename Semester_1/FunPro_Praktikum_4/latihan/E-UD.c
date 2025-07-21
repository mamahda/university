#include <stdio.h>
#include <string.h>

typedef struct
{
    char nama[101];
    double tinggi;
    int umur;
} manusia;

void swap(manusia *a, manusia *b)
{
    manusia temp = *a;
    *a = *b;
    *b = temp;
}

int main()
{
    manusia idol[11];
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
    {
        scanf("%s %lf %d", idol[i].nama, &idol[i].tinggi, &idol[i].umur);
    }
    int t;
    scanf("%d", &t);
    for (int i = 0; i < t; i++)
    {
        int a, b;
        scanf("%d %d", &a, &b);
        swap(&idol[a - 1], &idol[b - 1]);
    }
    for (int i = 0; i < n; i++)
    {
        printf("%s\n%.2lf\n%d\n", idol[i].nama, idol[i].tinggi, idol[i].umur);
    }
}