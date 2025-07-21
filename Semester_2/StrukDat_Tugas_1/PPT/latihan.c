#include <stdio.h>
#include <string.h>

typedef struct {
  char NIK[17];
  char nama[256];
  char tempat_lahir[256];
  char tanggal_lahir[11];
  char jenis_kelamin[2];
  char alamat[256];
  char agama[256];
} KTP;

KTP penduduk[100];
int count = 0;

void insertData() {
  if (count >= 100) {
    printf("Database penuh, tidak bisa menambah data!\n");
    return;
  }

  printf("\nTAMBAH DATA KTP\n");
  printf("====================\n");
  printf("NIK: ");
  scanf("%s", penduduk[count].NIK);
  getchar();

  printf("Nama: ");
  fgets(penduduk[count].nama, 256, stdin);
  penduduk[count].nama[strcspn(penduduk[count].nama, "\n")] = 0;

  printf("Tempat Lahir: ");
  fgets(penduduk[count].tempat_lahir, 256, stdin);
  penduduk[count].tempat_lahir[strcspn(penduduk[count].tempat_lahir, "\n")] = 0;

  printf("Tanggal Lahir (DD-MM-YYYY): ");
  scanf("%s", penduduk[count].tanggal_lahir);
  getchar();

  printf("Jenis Kelamin (L/P): ");
  scanf("%s", penduduk[count].jenis_kelamin);
  getchar();

  printf("Alamat: ");
  fgets(penduduk[count].alamat, 256, stdin);
  penduduk[count].alamat[strcspn(penduduk[count].alamat, "\n")] = 0;

  printf("Agama: ");
  fgets(penduduk[count].agama, 256, stdin);
  penduduk[count].agama[strcspn(penduduk[count].agama, "\n")] = 0;

  count++;
  printf("Data berhasil ditambahkan!\n\n");
}

void deleteData() {
  if (count == 0) {
    printf("Database kosong!\n");
    return;
  }

  char nik[16];
  printf("\nHAPUS DATA KTP\n");
  printf("====================\n");
  printf("Masukkan NIK yang akan dihapus: ");
  scanf("%s", nik);

  int found = 0;
  for (int i = 0; i < count; i++) {
    if (strcmp(penduduk[i].NIK, nik) == 0) {
      found = 1;
      for (int j = i; j < count - 1; j++) {
        penduduk[j] = penduduk[j + 1];
      }
      count--;
      printf("Data dengan NIK %s berhasil dihapus!\n\n", nik);
      break;
    }
  }

  if (!found) {
    printf("Data dengan NIK %s tidak ditemukan!\n\n", nik);
  }
}

void showData() {
  if (count == 0) {
    printf("Database kosong!\n\n");
    return;
  }

  printf("\nDATA KTP\n");
  printf("====================\n");
  for (int i = 0; i < count; i++) {
    printf("Data ke-%d\n", i + 1);
    printf("NIK: %s\n", penduduk[i].NIK);
    printf("Nama: %s\n", penduduk[i].nama);
    printf("Tempat Lahir: %s\n", penduduk[i].tempat_lahir);
    printf("Tanggal Lahir: %s\n", penduduk[i].tanggal_lahir);
    printf("Jenis Kelamin: %s\n", penduduk[i].jenis_kelamin);
    printf("Alamat: %s\n", penduduk[i].alamat);
    printf("Agama: %s\n", penduduk[i].agama);
    printf("--------------------\n");
  }
  printf("\n");
}

void searchData() {
  if (count == 0) {
    printf("Database kosong!\n\n");
    return;
  }

  char nik[16];
  printf("\nCARI DATA KTP\n");
  printf("====================\n");
  printf("Masukkan NIK yang akan dicari: ");
  scanf("%s", nik);

  int found = 0;
  for (int i = 0; i < count; i++) {
    if (strcmp(penduduk[i].NIK, nik) == 0) {
      found = 1;
      printf("Data ditemukan!\n");
      printf("NIK: %s\n", penduduk[i].NIK);
      printf("Nama: %s\n", penduduk[i].nama);
      printf("Tempat Lahir: %s\n", penduduk[i].tempat_lahir);
      printf("Tanggal Lahir: %s\n", penduduk[i].tanggal_lahir);
      printf("Jenis Kelamin: %s\n", penduduk[i].jenis_kelamin);
      printf("Alamat: %s\n", penduduk[i].alamat);
      printf("Agama: %s\n", penduduk[i].agama);
      break;
    }
  }

  if (!found) {
    printf("Data dengan NIK %s tidak ditemukan!\n", nik);
  }

  printf("\n");
}

int main(){
  while(1){
    int choice;
    printf("apa yang anda ingin lakukan?\n");
    printf("1. Tambah Data KTP\n");
    printf("2. Hapus Data KTP\n");
    printf("3. Tampilkan Semua Data KTP\n");
    printf("4. Cari Data KTP\n");
    printf("5. Keluar Program\n");
    printf("Choice: ");
    scanf("%d", &choice);
    switch(choice){
      case 1:
        insertData();
        break;
      case 2:
        deleteData();
        break;
      case 3:
        showData();
        break;
      case 4:
        searchData();
        break;
      case 5:
        printf("\nSampai Jumpa (＾▽＾)\n");
        return 0;
      default:
        printf("Invalid choice\n\n");
    }
  }
}
