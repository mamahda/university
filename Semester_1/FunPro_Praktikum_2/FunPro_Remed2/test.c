#include <stdio.h>
#include <string.h>
#include <stdbool.h>

int main()
{
    int t;
    scanf("%d", &t);
    int n, e;
    for (int i = 0; i < t; i++)
    {
        scanf("%d", &n);
        int slime[n];
        for (int i = 0; i < n; i++)
        {
            scanf("%d", &slime[i]);
        }
        scanf("%d", &e);
        for (int i = 0; i < n - 1; i++)
        {
            bool swapped = false;
            for (int j = 0; j < n - i - 1; j++)
            {
                if (slime[j] > slime[j + 1])
                {
                    int temp = slime[j];
                    slime[j] = slime[j + 1];
                    slime[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped)
                break;
        }
        for (int i = 0; i < n; i++)
        {
            printf("%d ", slime[i]);
        }

        //     if (killedslime >= n)
        //     {
        //         printf("Cih, %d slime doang gaakan bisa ngapa ngapain gweh!\n", n);
        //     }
        //     else
        //     {
        //         printf("Kaburlah Furina! akan kuhadapi %d Slime terakhir dengan cara lain!\n", (n - killedslime));
        //     }
    }
}