#include <stdio.h>
#include <string.h>

int main()
{
    int n;
    int oceanid = 0;
    int otoritas = 0;
    char hierarki[4][10] = {"", "lyney", "hutao", "furina"};
    int last = 0;

    scanf("%d", &n);

    for (int i = 0; i < n; i++)
    {
        char chara[10], cmd[10];
        scanf("%s %s", chara, cmd);

        int pangkat;
        if (strcmp(chara, "lyney") == 0)
        {
            pangkat = 1;
        }
        else if (strcmp(chara, "hutao") == 0)
        {
            pangkat = 2;
        }
        else
        {
            pangkat = 3;
        }

        if (strcmp(cmd, "beraksi") == 0)
        {
            if ((oceanid == 0 || oceanid == 1) && pangkat >= otoritas)
            {
                printf("Oceanid Minion beraksi sesuai keinginan %s.\n", chara);
                otoritas = pangkat;
                last = pangkat;
                oceanid = 2;
            }
            else if (oceanid == 2 && pangkat >= otoritas)
            {
                printf("Oceanid Minion sudah diperintah beraksi oleh %s.\n", hierarki[last]);
                otoritas = pangkat;
            }
            else if (pangkat < otoritas)
            {
                printf("Oceanid Minion tidak nurut karena wewenang %s lebih rendah dari %s.\n", chara, hierarki[otoritas]);
            }
        }
        else if (strcmp(cmd, "istirahat") == 0)
        {
            if (oceanid == 0)
            {
                printf("Oceanid Minion marah karena belum diperintah apa-apa, tetapi sudah disuruh istirahat!\n");
                break;
            }
            else if (oceanid == 1 && pangkat >= otoritas)
            {
                printf("Oceanid Minion sudah diperintah istirahat oleh %s.\n", hierarki[last]);
                otoritas = pangkat;
            }
            else if (oceanid == 2 && pangkat >= otoritas)
            {
                printf("Oceanid Minion istirahat sesuai keinginan %s.\n", chara);
                otoritas = pangkat;
                last = pangkat;
                oceanid = 1;
            }
            else if (pangkat < otoritas)
            {
                printf("Oceanid Minion tidak nurut karena wewenang %s lebih rendah dari %s.\n", chara, hierarki[otoritas]);
            }
        }
    }

    return 0;
}
