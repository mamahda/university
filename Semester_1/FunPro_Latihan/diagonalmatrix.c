#include <stdio.h>

int main()
{
    int n, t;
    int sum1 = 0, sum2 = 0;
    scanf("%d", &n);
    int index1 = 0;
    int index2 = 0;
    int index3 = n - 1;
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
        {
            int test = 0;
            scanf("%d", &t);
            if (index1 == i && index1 == j)
            {
                sum1 += t;
                index1++;
                test += 1;
            }
            if (index2 == i && index3 == j)
            {
                sum2 += t;
                index2++;
                index3--;
                test += 1;
            }
            // printf("%d ", test);
        }
        printf("\n");
    }
    printf("%d %d\n", sum1, sum2);
}