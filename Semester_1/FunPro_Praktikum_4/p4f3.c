#include <stdio.h>
#include <string.h>
#include <stdbool.h>

struct bola
{
    char nama[100];
    int gol, keypass, dribble, assist;
    char temen[100];
    double motm;
};

int main()
{
    int n;
    scanf("%d", &n);
    struct bola p[n];

    for (int i = 0; i < n; i++)
    {
        scanf("%s", p[i].nama);
        p[i].assist = 0;
        p[i].gol = 0;
        p[i].dribble = 0;
        p[i].keypass = 0;
    }
    for (int i = 0; i < n; i++)
    {
        char asis[100], golin[100];
        int skorgol;
        scanf("%s %s %d", asis, golin, &skorgol);
        for (int j = 0; j < n; j++)
        {
            if (strcmp(asis, p[j].nama) == 0)
            {
                p[j].assist += skorgol;
                strcpy(p[j].temen, golin);
            }

            if (strcmp(golin, p[j].nama) == 0)
            {
                p[j].gol += skorgol;
            }
        }
    }

    for (int i = 0; i < n; i++)
    {
        char input[100];
        int key, drib;
        scanf("%s %d %d", input, &key, &drib);
        for (int j = 0; j < n; j++)
        {
            if (strcmp(input, p[j].nama) == 0)
            {
                p[j].dribble += drib;
                p[j].keypass += key;
            }
        }
        p[i].motm = (3 * p[i].gol) + (2 * p[i].assist) + (p[i].keypass) + (0.2 * p[i].dribble);
    }
    double max = p[0].motm;
    int index = 0;
    for (int i = 1; i < n; i++)
    {
        if (p[i].motm > max)
        {
            max = p[i].motm;
            index = i;
        }
    }

    int k;
    scanf("%d", &k);
    for (int j = 0; j < k; j++)
    {
        char input2[100];
        scanf("%s", input2);
        if (strcmp(input2, "TABLE") == 0)
        {
            for (int i = 0; i < n; i++)
            {
                printf("%s | Goals: %d | Assists: %d | Assist To: %s\n", p[i].nama, p[i].gol, p[i].assist, p[i].temen);
            }
        }

        if (strcmp(input2, "MOTM") == 0)
        {
            printf("Man of the Match: %s", p[index].nama);
        }
    }
}