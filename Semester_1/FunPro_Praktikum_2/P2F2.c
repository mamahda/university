#include <stdio.h>
#include <string.h>

int main()
{
    int n;
    scanf("%d", &n);
    char cmd[n][10];
    char stra[n][100000];
    char strb[n][100000];
    for (int i = 0; i < n; i++)
    {
        scanf("%s", &cmd[i]);
        scanf("%s", &stra[i]);
        scanf("%s", &strb[i]);
        if (strcmp(cmd[i], "ANAGRAM") == 0)
        {
            int freqa[123] = {0};
            int freqb[123] = {0};
            int test = 0;
            for (int j = 0; j < strlen(stra[i]); j++)
            {
                freqa[stra[i][j]]++;
                freqb[strb[i][j]]++;
            }
            for (int j = 97; j <= 122; j++)
            {
                if (freqa[j] == freqb[j] && freqa[j] != 0)
                    test += freqa[j];
            }
            if (test == strlen(stra[i]))
                printf("Hhm %s can be arranged into %s", stra[i], strb[i]);
            else
                printf("This cannot lah bro");
        }
        else if (strcmp(cmd[i], "FLIP") == 0)
        {
            int test = 0;
            for (int j = 0; j < strlen(strb[i]); j++)
            {
                if (stra[i][j] == strb[i][strlen(strb[i]) - 1 - j])
                    test++;
            }
            if (test == strlen(strb[i]))
                printf("Flip %s to get %s", stra[i], strb[i]);
            else
                printf("This cannot lah bro");
        }
        printf("\n");
    }
}