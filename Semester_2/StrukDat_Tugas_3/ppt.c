#include <stdio.h>
#include <stdlib.h>

typedef struct node {
  int data;
  struct node *next;
} node;

typedef struct top {
  node *top;
} top;

void init(top *stack){
  stack->top = NULL;
}

void push(top *stack, int data) {
  node *newnode = (node *)malloc(sizeof(node));
  newnode->data = data;
  newnode->next = stack->top;
  stack->top = newnode;
  printf("data %d berhasil ditambahkan\n", data);
}

int pop(top *stack) {
  if (stack->top == NULL) {
    return -1;
  }
  int data = stack->top->data;
  node *temp = stack->top;
  stack->top = stack->top->next;
  free(temp);
  return data;
}

void search(top *stack, int data) {
  node *temp = stack->top;
  int count = 0;
  while (temp != NULL) {
    if (temp->data == data) {
      printf("data ditemukan pada index: %d\n", count);
      return;
    }
    count++;
    temp = temp->next;
  }
  printf("data %d tidak ditemukan\n", data);
}

void edit(top *stack, int olddata, int newdata) {
  node *temp = stack->top;
  while (temp != NULL) {
    if (temp->data == olddata) {
      temp->data = newdata;
      printf("data %d diubah menjadi %d\n", olddata, newdata);
      return;
    }
    temp = temp->next;
  }
  printf("data %d tidak ditemukan\n", olddata);
}

int main(){
  top stack;
  init(&stack);
  while(1){
    printf("\n1: push\n2: pop\n3: search\n4: edit\n5: exit\nchoice: ");
    int choice, data, newdata;
    scanf("%d", &choice);
    switch(choice){
      case 1:
        printf("masukkan data: ");
        scanf("%d", &data);
        push(&stack, data);
        break;
      case 2:
        data = pop(&stack);
        if(data == -1){
          printf("Stack kosong\n");
        }else{
          printf("data %d berhasil dihapus\n", data);
        }
        break;
      case 3:
        printf("masukkan data yang ingin dicari: ");
        scanf("%d", &data);
        search(&stack, data);
        break;
      case 4:
        printf("masukkan data untuk diubah: ");
        scanf("%d", &data);
        printf("masukkan data baru: ");
        scanf("%d", &newdata);
        edit(&stack, data, newdata);
        break;
      case 5:
        return 0;
      default:
        printf("pilihan tidak ada\n");
    }
  }
}
