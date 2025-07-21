#include <stdio.h>
#include <string.h>

int main()
{
    int n;
    scanf("%d", &n);
    int labirin[n][n];
    int angka = 1;
    int k = 0;
    int l = 0;
    int tempn = n;
    for (int i = 0; i < n * n; i++)
    {
        if (k < tempn && l < tempn)
        {
            labirin[k][l] = angka;
            k++;
        }
        else if (k == tempn && l < tempn)
        {
            labirin[k][l] = angka;
            l++;
        }
        else if (k <= tempn && l == tempn)
        {
            k--;
            labirin[k][l] = angka;
        }
        else
        {
            l--;
            labirin[k][l] = angka;
        }
        angka++;
        tempn--;
    }
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            printf("%d ", labirin[j][i]);
        }
        printf("\n");
    }
}