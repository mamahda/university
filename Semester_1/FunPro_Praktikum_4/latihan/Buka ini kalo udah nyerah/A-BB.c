#include <stdio.h>
#include <string.h>

struct mahasiswa {
    char nrp[11];
    char nama[21];
    char hobi[21];
    char nrp_teman_dekat[11];
};

typedef struct mahasiswa Mahasiswa;

int main() {
    Mahasiswa mhs[101];

    int N;
    scanf("%d", &N);
    for (int i = 0; i < N; i++) {
        scanf("%s", mhs[i].nrp);
        scanf("%s", mhs[i].nama);
        scanf("%s", mhs[i].hobi);
        scanf("%s", mhs[i].nrp_teman_dekat);
    }

    int Q;
    char search[11];
    char friend[11];
    scanf("%d", &Q);
    while (Q--) {
        scanf("%s", search);

        int mhs_found = 0;
        for (int i = 0; i < N; i++) {
            if (strcmp(search, mhs[i].nrp) == 0) {
                printf("Profil Mahasiswa:\n");
                printf("NRP: %s\n", mhs[i].nrp);
                printf("Nama: %s\n", mhs[i].nama);
                printf("Hobi: %s\n", mhs[i].hobi);
                strcpy(friend, mhs[i].nrp_teman_dekat);
                mhs_found = 1;
                break;
            }
        }

        if (!mhs_found) {
            printf("Mahasiswa tidak ditemukan\n\n");
            continue;;
        }

        if (strcmp(friend, "NULL") == 0) {
            printf("Mahasiswa ini tidak mempunyai teman dekat\n\n");
            continue;;
        }

        for (int i = 0; i < N; i++) {
            if (strcmp(friend, mhs[i].nrp) == 0) {
                printf("Profil Teman Dekat Mahasiswa:\n");
                printf("NRP: %s\n", mhs[i].nrp);
                printf("Nama: %s\n", mhs[i].nama);
                printf("Hobi: %s\n\n", mhs[i].hobi);
                break;
            }
        }
    }
    return 0;
}