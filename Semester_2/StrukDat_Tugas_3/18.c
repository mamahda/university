#include <stdio.h>

typedef struct {
  int arr[100];
  int top;
} stack;

stack s1;
stack s2;

void push(stack *s, int data) {
  if (s->top == 99) {
    printf("Stack penuh!\n");
    return;
  }
  s->arr[++s->top] = data;
}

int pop(stack *s) {
  if (s->top == -1) {
    return -1; 
  }
  return s->arr[s->top--];
}

void printStack(stack *s) {
  for (int i = s->top; i >= 0; i--) {
    printf("%d ", s->arr[i]);
  }
  printf("\n");
}

void sortStack(stack *s1) {
  while (s1->top != -1) {
    int temp = pop(s1);

    while (s2.top != -1 && s2.arr[s2.top] > temp) {
      push(s1, pop(&s2));
    }

    push(&s2, temp);
  }

  while (s2.top != -1) {
    push(s1, pop(&s2));
  }
}

int main() {
  s1.top = -1;
  s2.top = -1;

  int n, data;
  printf("Masukkan jumlah elemen: ");
  scanf("%d", &n);

  printf("Masukkan elemen stack: ");
  for (int i = 0; i < n; i++) {
    scanf("%d", &data);
    push(&s1, data);
  }

  printf("Stack sebelum sorting: ");
  printStack(&s1);

  sortStack(&s1);

  printf("Stack setelah sorting: ");
  printStack(&s1);

  return 0;
}

