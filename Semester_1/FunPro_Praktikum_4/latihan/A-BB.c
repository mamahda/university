#include <stdio.h>
#include <stdbool.h>

typedef struct
{
    char NRP[11];
    char nama[21];
    char hobi[21];
    char nrpteman[11];
} mahasiswa;

int main()
{
    int n, t, ans, teman;
    scanf("%d", &n);
    mahasiswa mhs[n];
    for (int i = 0; i < n; i++)
    {
        scanf("%s %s %s %s", mhs[i].NRP, mhs[i].nama, mhs[i].hobi, mhs[i].nrpteman);
    }
    scanf("%d", &t);
    for (int i = 0; i < t; i++)
    {
        bool found1 = false;
        bool found2 = false;
        char nrp[11];
        scanf("%s", nrp);
        for (int j = 0; j < n; j++)
        {
            if (strcmp(nrp, mhs[j].NRP) == 0)
            {
                found1 = true;
                ans = j;
                for (int k = 0; k < n; k++)
                {
                    if (strcmp(mhs[j].nrpteman, mhs[k].NRP) == 0)
                    {
                        found2 = true;
                        teman = k;
                        break;
                    }
                }
                break;
            }
        }

        if (!found1)
        {
            printf("Mahasiswa tidak ditemukan\n\n");
        }
        else
        {
            printf("Profil Mahasiswa:\n");
            printf("NRP: %s\n", mhs[ans].NRP);
            printf("Nama: %s\n", mhs[ans].nama);
            printf("Hobi: %s\n", mhs[ans].hobi);
            if (!found2)
            {
                printf("Mahasiswa ini tidak mempunyai teman dekat\n\n");
                continue;
            }
            else
            {
                printf("Profil Teman Dekat Mahasiswa:\n");
                printf("NRP: %s\n", mhs[teman].NRP);
                printf("Nama: %s\n", mhs[teman].nama);
                printf("Hobi: %s\n\n", mhs[teman].hobi);
            }
        }
    }
}
