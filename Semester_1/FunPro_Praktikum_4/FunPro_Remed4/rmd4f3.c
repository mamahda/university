#include <stdio.h>
#include <string.h>
#include <stdbool.h>

typedef struct
{
    char nama[100];
    char ip[100];
    char uuid[100];
} player;

int main()
{
    int n;
    scanf("%d", &n);

    player p[100];

    for (int i = 0; i < n; i++)
    {
        scanf("%s %s %s", p[i].nama, p[i].ip, p[i].uuid);
    }

    int t;
    scanf("%d", &t);
    for (int i = 0; i < t; i++)
    {
        char temp[256];
        bool found = false;
        scanf("%s", temp);
        for (int j = 0; j < n; j++)
        {
            if (strcmp(p[j].nama, temp) == 0)
            {
                printf("asyik %s-%s diperbolehkan bermain\n", p[j].uuid, p[j].nama);
                found = true;
                break;
            }
        }
        if (!found)
        {
            printf("hmm, kayaknya ada yang salah dengan datamu\n");
        }
    }

    return 0;
}