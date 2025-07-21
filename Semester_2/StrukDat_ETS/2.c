#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct node {
  int id;
  char nama[31];
  int pri;
  int time;
  struct node *next;
} node;

node* create(int id, char nama[], int pri, int time) {
  node *newNode = (node*) malloc(sizeof(node));
  newNode->id = id;
  strcpy(newNode->nama, nama);
  newNode->pri = pri;
  newNode->time = time;
  newNode->next = NULL;
  return newNode;
}

void tambah(node** head, int* current_time) {
  int id, pri;
  char nama[100];
  printf("Masukkan ID laporan: ");
  scanf("%d", &id);
  printf("Masukkan nama pelapor: ");
  scanf(" %[^\n]", nama);
  printf("Masukkan kode prioritas (1-5): ");
  scanf("%d", &pri);

  node *baru = create(id, nama, pri, (*current_time)++);

  if (*head == NULL || baru->pri < (*head)->pri ||
    (baru->pri == (*head)->pri && baru->time < (*head)->time)) {
    baru->next = *head;
    *head = baru;
  } else {
    node *temp = *head;
    while (temp->next != NULL &&
      (temp->next->pri < baru->pri ||
      (temp->next->pri == baru->pri && temp->next->time <= baru->time))) {
      temp = temp->next;
    }
    baru->next = temp->next;
    temp->next = baru;
  }

  printf("Laporan berhasil ditambahkan.\n");
}

void proses(node** head) {
  if (*head == NULL) {
    printf("Tidak ada laporan dalam antrean.\n");
    return;
  }
  node *temp = *head;
  *head = (*head)->next;
  printf("Memproses laporan:\n");
  printf("ID: %d\n", temp->id);
  printf("Nama: %s\n", temp->nama);
  printf("Prioritas: %d\n", temp->pri);
  printf("Timestamp: %d\n", temp->time);
  free(temp);
}

void tampilkan(node* head) {
  if (head == NULL) {
    printf("Tidak ada Laporan.\n");
    return;
  }
  printf("Daftar laporan dalam antrean:\n");
  node *temp = head;
  while (temp != NULL) {
    printf("-------------------------\n");
    printf("ID: %d\nNama: %s\nPrioritas: %d\nTimestamp: %d\n",
           temp->id, temp->nama, temp->pri, temp->time);
    temp = temp->next;
  }
  printf("-------------------------\n");
}

int main() {
  node* head = NULL;
  int current_time = 1;
  int menu;

  while (1) {
    printf("\nMenu:\n1. Tambah laporan\n2. Proses laporan\n3. Tampilkan semua laporan\n4. Keluar\nPilih: ");
    scanf("%d", &menu);
    switch (menu) {
      case 1:
        tambah(&head, &current_time);
        break;
      case 2:
        proses(&head);
        break;
      case 3:
        tampilkan(head);
        break;
      case 4:
        printf("Keluar dari program.\n");
        return 0;
      default:
        printf("Pilihan tidak valid.\n");
    }
  }
}
