#include <stdio.h>
#include <math.h>

int main()
{
    int t;
    int n[100001];
    int modus = 0;
    int ans = 1;
    int max = 0;
    int prima = 0;
    scanf("%d", &t);
    for (int i = 0; i < t; i++)
    {
        int temp;
        scanf("%d", &temp);
        if (max < temp)
            max = temp;
        n[temp]++;
    }
    modus = n[1];
    for (int i = 2; i <= max; i++)
    {
        if (modus <= n[i])
        {
            modus = n[i];
            ans = i;
        }
    }
    printf("Modus: %d\n", ans);
    for (int i = 2; i <= trunc(sqrt(ans)); i++)
    {
        if (ans % i == 0)
            prima = 1;
    }
    if (prima == 1 || ans == 1)
        printf("Yah, modusnya gak prima.");
    else if (prima == 0)
        printf("Wah, modusnya prima nihh.");
}