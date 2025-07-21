#include <stdio.h>
#include <stdlib.h>

typedef struct node {
  int num;
  struct node* next;
} node;

typedef struct {
  node* first;
} head;

void init(head *number) {
  number->first = NULL;
}

void insert(head *number, int n) {
  node *_new = (node*) malloc(sizeof(node));
  _new->num = n;
  _new->next = number->first;
  number->first = _new;
}

void print(head number) {
  node *print = number.first;
  while (print != NULL) {
    printf("%d->", print->num);
    print = print->next;
  }
  printf("NULL\n");
}

void summm(head *sum, head *carry, int n1, int n2) {
  int total = n1 + n2 + carry->first->num;
  int digit = total % 10;
  int newCarry = total / 10;

  insert(carry, newCarry);
  insert(sum, digit);
}

void operation(head number1, head number2) {
  head carry, sum;
  init(&carry);
  init(&sum);

  insert(&carry, 0); 
  node *first = number1.first;
  node *second = number2.first;

  while (first != NULL || second != NULL) {
    int num1 = (first ? first->num : 0);
    int num2 = (second ? second->num : 0);

    summm(&sum, &carry, num1, num2);

    if(first != NULL) first = first->next;
    if(second != NULL) second = second->next;
  }

  if (carry.first->num > 0) {
    insert(&sum, carry.first->num);
  }
  printf("---------------------------------------");
  printf("\nHasil penjumlahan: ");
  node *print = sum.first;
  while (print != NULL) {
    printf("%d", print->num);
    print = print->next;
  }
  printf("\n");
}

int main() {
  head number1, number2;
  init(&number1);
  init(&number2);

  printf("Masukkan angka pertama: ");
  char input;
  while ((input = getchar()) != '\n' && input != EOF) {
    insert(&number1, input - '0');
  }

  printf("Masukkan angka kedua: ");
  while ((input = getchar()) != '\n' && input != EOF) {
    insert(&number2, input - '0');
  }
  printf("---------------------------------------\n");
  printf("Angka pertama: ");
  print(number1);
  printf("Angka kedua: ");
  print(number2);

  operation(number1, number2);

  return 0;
}

