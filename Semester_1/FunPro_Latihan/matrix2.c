#include <stdio.h>

int main()
{
    int n;
    scanf("%d", &n);
    int index = 1;
    int number;
    for (int i = 0; i < n; i++)
    {
        number = index;
        for (int j = 0; j < n; j++)
        {
            printf("%d ", number);
            number += n;
        }
        printf("\n");
        index++;
    }
}