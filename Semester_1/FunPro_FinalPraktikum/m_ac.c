#include <stdio.h>

int main()
{
    int q, k, count;
    int idx = 1;
    int arr[100001];
    scanf("%d %d", &q, &k);
    int temp = q;
    for (int i = 1; i <= q; i++)
    {
        arr[i] = i;
    }
    while (temp > 1)
    {
        int count = 0;
        while (count < k)
        {
            if (arr[idx] != -1)
            {
                count++;
            }
            if (count < k)
            {
                idx = (idx % q) + 1;
            }
        }
        arr[idx] = -1;
        temp--;
        while (arr[idx] == -1)
        {
            idx = (idx % q) + 1;
        }
    }
    for (int i = 1; i <= q; i++)
    {
        if (arr[i] != -1)
        {
            int ans = arr[i];
            printf("yapp, sapi ke %d sepertinya memang yang terbaik.", ans);
            break;
        }
    }
}