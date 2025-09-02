#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <conio.h> // untuk getch()

#define FILENAME "data.bin"
#define MAX 50

typedef struct {
  char nomor[7];      // 6 digit + '\0'
  char nama[26];      // 25 karakter + '\0'
  int stok;
  double harga;
} Komponen;

void pause_layar() {
  printf("Tekan sembarang tombol untuk melanjutkan...\n");
  getch();
}

void tambah_data(FILE *file) {
  Komponen data;
  printf("Masukkan Nomor Komponen (6 digit): ");
  scanf(" %6s", data.nomor);
  printf("Masukkan Nama Komponen: ");
  scanf(" %[^\n]", data.nama);
  printf("Masukkan Jumlah Stok: ");
  scanf("%d", &data.stok);
  printf("Masukkan Harga Satuan: ");
  scanf("%lf", &data.harga);

  fseek(file, 0, SEEK_END);
  fwrite(&data, sizeof(Komponen), 1, file);
  printf("Data berhasil ditambahkan.\n");
}

void tampil_data(FILE *file, int dengan_index) {
  Komponen data;
  rewind(file);
  int count = 0;
  double total_aset = 0;

  while (fread(&data, sizeof(Komponen), 1, file)) {
    if (dengan_index)
      printf("[%d] ", count);
    printf("Nomor: %s | Nama: %s | Stok: %d | Harga: %.2lf\n",
           data.nomor, data.nama, data.stok, data.harga);
    total_aset += data.stok * data.harga;
    count++;

    if (count % 10 == 0) pause_layar();
  }

  if (count % 10 != 0) pause_layar();

  printf("Total nilai aset: Rp %.2lf\n", total_aset);
}

void ubah_data(FILE *file) {
  Komponen data;
  char nomor_target[7];
  int found = 0;

  printf("Masukkan Nomor Komponen yang ingin diubah: ");
  scanf(" %6s", nomor_target);

  rewind(file);
  long pos = 0;

  while (fread(&data, sizeof(Komponen), 1, file)) {
    if (strcmp(data.nomor, nomor_target) == 0) {
      found = 1;
      printf("Data ditemukan. Masukkan data baru:\n");

      printf("Nomor Komponen (6 digit): ");
      scanf(" %6s", data.nomor);
      printf("Nama Komponen: ");
      scanf(" %[^\n]", data.nama);
      printf("Stok: ");
      scanf("%d", &data.stok);
      printf("Harga: ");
      scanf("%lf", &data.harga);

      fseek(file, pos, SEEK_SET);
      fwrite(&data, sizeof(Komponen), 1, file);
      printf("Data berhasil diubah.\n");
      break;
    }
    pos += sizeof(Komponen);
  }

  if (!found) printf("Data tidak ditemukan.\n");
}

void hapus_data() {
  Komponen data;
  FILE *file = fopen(FILENAME, "rb");
  FILE *temp = fopen("temp.bin", "wb");
  char nomor_target[7];
  int found = 0;

  printf("Masukkan Nomor Komponen yang ingin dihapus: ");
  scanf(" %6s", nomor_target);

  while (fread(&data, sizeof(Komponen), 1, file)) {
    if (strcmp(data.nomor, nomor_target) == 0) {
      found = 1;
      continue; // skip data ini
    }
    fwrite(&data, sizeof(Komponen), 1, temp);
  }

  fclose(file);
  fclose(temp);

  remove(FILENAME);
  rename("temp.bin", FILENAME);

  if (found)
    printf("Data berhasil dihapus.\n");
  else
    printf("Data tidak ditemukan.\n");
}

int hitung_record(FILE *file) {
  fseek(file, 0, SEEK_END);
  long ukuran = ftell(file);
  return ukuran / sizeof(Komponen);
}

void isi_dummy_data(FILE *file) {
  Komponen dummy;
  for (int i = 0; i < MAX; i++) {
    sprintf(dummy.nomor, "%06d", i + 1);
    sprintf(dummy.nama, "Komponen%02d", i + 1);
    dummy.stok = (i + 1) * 2;
    dummy.harga = 10000 + (i * 500);
    fwrite(&dummy, sizeof(Komponen), 1, file);
  }
  printf("50 data dummy berhasil ditambahkan.\n");
}

int main() {
  FILE *file = fopen(FILENAME, "rb+");

  if (!file) {
    file = fopen(FILENAME, "wb+");
    if (!file) {
      perror("Gagal membuat file");
      return 1;
    }
  }

  // Auto-generate dummy data jika kurang dari 50 record
  if (hitung_record(file) < MAX) {
    isi_dummy_data(file);
    fclose(file);
    file = fopen(FILENAME, "rb+");
  }

  int pilih;
  do {
    system("cls");
    printf("== MENU PENGELOLAAN DATA KOMPONEN ==\n");
    printf("1. Tambah Data\n");
    printf("2. Ubah Data\n");
    printf("3. Tampil Semua Data (dengan index)\n");
    printf("4. Tampil Semua Data (tanpa index)\n");
    printf("5. Hapus Data\n");
    printf("6. Keluar\n");
    printf("Pilihan Anda: ");
    scanf("%d", &pilih);

    switch (pilih) {
      case 1: tambah_data(file); break;
      case 2: ubah_data(file); break;
      case 3: tampil_data(file, 1); break;
      case 4: tampil_data(file, 0); break;
      case 5:
        fclose(file);
        hapus_data();
        file = fopen(FILENAME, "rb+");
        break;
      case 6:
        fclose(file);
        printf("Terima kasih!\n");
        break;
      default:
        printf("Pilihan tidak valid!\n");
    }

    if (pilih != 6) pause_layar();

  } while (pilih != 6);

  return 0;
}

