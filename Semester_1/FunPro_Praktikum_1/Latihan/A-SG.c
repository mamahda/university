#include <stdio.h>

int main()
{
    int n, m, p;
    scanf("%d %d %d", &n, &m, &p);
    if ((n * m) % p == 0)
    {
        printf("Tidak Ada Sisa");
    }
    else
    {
        printf("%d", (n * m) % p);
    }
}