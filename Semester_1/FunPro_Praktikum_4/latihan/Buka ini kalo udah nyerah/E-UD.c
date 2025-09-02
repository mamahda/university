#include <stdio.h>
#include <string.h>

struct KartuIdol {
    char nama[200];
    double tinggi;
    int umur;
};

void swapNama(char *a, char *b) {
    char temp[200];
    strcpy(temp, a);
    strcpy(a, b);
    strcpy(b, temp);
}

void swapTinggi(double *a, double *b) {
    double temp = *a;
    *a = *b;
    *b = temp;
}

void swapUmur(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int N;
    scanf("%d", &N);

    struct KartuIdol arr[N];

    for(int i = 0; i < N; i++) {
        scanf("%s%lf%d", arr[i].nama, &arr[i].tinggi, &arr[i].umur);
    }

    int M;
    scanf("%d", &M);
    for(int i = 0; i < M; i++) {
        int a, b;
        scanf("%d%d", &a, &b);
        a--;
        b--;
        swapNama(arr[a].nama, arr[b].nama);
        swapTinggi(&arr[a].tinggi, &arr[b].tinggi);
        swapUmur(&arr[a].umur, &arr[b].umur);
    }

    for(int i = 0; i < N; i++) {
        printf("%s\n%.2lf\n%d\n", arr[i].nama, arr[i].tinggi, arr[i].umur);
    }

    return 0;
}