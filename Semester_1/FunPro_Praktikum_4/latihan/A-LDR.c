#include <stdio.h>
#include <string.h>
#include <stdbool.h>

typedef struct
{
    char ID[10001];
    char Name[11];
    char status[20];
} robot;

int main()
{
    int n, m;
    robot r[100];
    int trash[100] = {0};
    char req[10], ID[10001];
    int baik = 0, rusak = 0, tidak_berfungsi = 0, status[n];
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
    {
        scanf("%s %s %s", r[i].ID, r[i].Name, r[i].status);
        if (strcmp(r[i].status, "Baik") == 0)
        {
            status[i] = 1;
            baik++;
        }
        else if (strcmp(r[i].status, "Rusak") == 0)
        {
            status[i] = 2;
            rusak++;
        }
        else if (strcmp(r[i].status, "Tidak_Berfungsi") == 0)
        {
            status[i] = 3;
            tidak_berfungsi++;
        }
    }
    scanf("%d", &m);
    for (int i = 0; i < m; i++)
    {
        int ans = 0;
        bool cek = false, perbaiki = false, buang = false;
        bool found = false;
        scanf("%s %s", req, ID);
        for (int j = 0; j < n; j++)
        {
            if (strcmp(ID, r[j].ID) == 0)
            {
                ans = j;
                found = true;
                if (strcmp(req, "CEK") == 0)
                {
                    cek = true;
                }
                else if (strcmp(req, "PERBAIKI") == 0)
                {
                    perbaiki = true;
                }
                else if (strcmp(req, "BUANG") == 0)
                {
                    buang = true;
                }
            }
        }
        if (!found || trash[ans] == 1)
        {
            printf("Robot %s tidak ditemukan\n", ID);
        }
        else
        {
            if (cek)
            {
                printf("Robot %s berstatus %s\n", r[ans].Name, r[ans].status);
            }
            if (perbaiki)
            {
                if (status[ans] == 1)
                {
                    printf("Robot %s sudah dalam kondisi baik\n", r[ans].Name);
                }
                else if (status[ans] == 2)
                {
                    printf("Robot %s berhasil diperbaiki\n", r[ans].Name);
                    baik++;
                    rusak--;
                }
                else if (status[ans] == 3)
                {
                    printf("Robot %s sudah tidak dapat diperbaiki\n", r[ans].Name);
                }
            }
            if (buang)
            {
                if (status[ans] == 1)
                {
                    printf("Robot %s dalam kondisi baik\n", r[ans].Name);
                }
                else if (status[ans] == 2)
                {
                    printf("Robot %s masih dapat diperbaiki\n", r[ans].Name);
                }
                else if (status[ans] == 3)
                {
                    printf("Robot %s berhasil dibuang\n", r[ans].Name);
                    trash[ans] = 1;
                    tidak_berfungsi--;
                }
            }
        }
    }
    printf("Baik: %d\n", baik);
    printf("Rusak: %d\n", rusak);
    printf("Tidak_Berfungsi: %d\n", tidak_berfungsi);
}