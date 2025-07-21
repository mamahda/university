#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct node {
  int id;
  char nama[31];
  int warisan;
  struct node *right;
  struct node *left;
} node;

node* create(int id, char nama[], int warisan) {
  node* new = (node*)malloc(sizeof(node));
  new->id = id;
  strcpy(new->nama, nama);
  new->warisan = warisan;
  new->right = NULL;
  new->left = NULL;
  return new;
}

node* insert(node* root, int id, char nama[], int warisan) {
  if (root == NULL) {
    return create(id, nama, warisan);
  }

  if (id < root->id) {
    if (root->left == NULL) {
      root->left = create(id, nama, warisan);
    } else {
      insert(root->left, id, nama, warisan);
    }
  } else if (id > root->id) {
    if (root->right == NULL) {
      root->right = create(id, nama, warisan);
    } else {
      insert(root->right, id, nama, warisan);
    }
  } else {
    printf("ID sudah ada, gagal menambahkan!\n");
  }

  return root;
}

node* findnode(node* root, int id) {
  if (root == NULL) return NULL;
  if (root->id == id) return root;
  if (id < root->id) return findnode(root->left, id);
  return findnode(root->right, id);
}

void inorder(node* root) {
  if (!root) return;
  inorder(root->left);
  printf("ID: %d \nNama: %s \nWarisan: %d juta\n", root->id, root->nama, root->warisan);
  printf("-------------------------\n");
  inorder(root->right);
}

void proseskematian(node* root, int id) {
  node* korban = findnode(root, id);
  if (!korban) {
    printf("Anggota dengan ID %d tidak ditemukan.\n", id);
    return;
  }

  if (!korban->left && !korban->right) {
    printf("Tidak ada anak, warisan hangus.\n");
    korban->warisan = 0;
    return;
  }

  if (korban->left) korban->left->warisan += korban->warisan * 0.6;
  if (korban->right) korban->right->warisan += korban->warisan * 0.4;
  korban->warisan = 0;
  printf("Warisan anggota ID %d telah dibagi ke anak-anaknya.\n", id);
}

void tambah(node** root) {
  int id, warisan;
  char nama[31];

  printf("Masukkan ID: ");
  scanf("%d", &id);
  printf("Masukkan nama: ");
  scanf(" %[^\n]", nama);
  printf("Masukkan warisan(dalam juta): ");
  scanf("%d", &warisan);

  *root = insert(*root, id, nama, warisan);
}

int main() {
  node* root = NULL;
  int menu, id;

  while (1) {
    printf("\nMenu:\n1. Tambah Anggota Keluarga\n2. Tampilkan Struktur Keluarga\n3. Bagi Warisan (Simulasi Kematian)\n4. Keluar\nPilih: ");
    scanf("%d", &menu);
    switch (menu) {
      case 1:
        tambah(&root);
        break;
      case 2:
        printf("\nStruktur Keluarga (Inorder)\n");
        printf("-------------------------\n");
        inorder(root);
        break;
      case 3:
        printf("Masukkan ID anggota yang meninggal: ");
        scanf("%d", &id);
        proseskematian(root, id);
        break;
      case 4:
        printf("Keluar dari program.\n");
        return 0;
      default:
        printf("Pilihan tidak valid.\n");
    }
  }
}

