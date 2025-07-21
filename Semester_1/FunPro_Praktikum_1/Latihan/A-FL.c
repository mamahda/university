#include <stdio.h>

int main()
{
    int n;
    scanf("%d", &n);
    if ((n / 5) % 3 != 0 || n < 15)
    {
        printf("%d\n", n / 5);
        printf("MISI MENYELAMATKAN LAPUT BERHASIL");
    }
    else
    {
        printf("%d\n", n / 5);
        printf("BOM AKAN MELEDAK DUAR");
    }
}