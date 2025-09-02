#include <stdio.h>
#include <stdlib.h>
#include <time.h>

typedef struct node {
  int value;
  struct node* next;
} node;

typedef struct {
  node* head;
  node* tail;
} list;

void init(list* num) {
  num->head = NULL;
  num->tail = NULL;
}

void ll_pushFront(list* num, int number) {
  node* newNode = (node*)malloc(sizeof(node));
  newNode->value = number;
  if (num->head == NULL) {
    num->head = newNode;
    num->tail = newNode;
    newNode->next = newNode;
  } else {
    newNode->next = num->head;
    num->head = newNode;
    num->tail->next = newNode;
  }
}

void ll_pushBack(list* num, int number) {
  node* newNode = (node*)malloc(sizeof(node));
  newNode->value = number;
  newNode->next = num->head;
  if (num->head == NULL) {
    num->head = newNode;
    num->tail = newNode;
    newNode->next = newNode;
  } else {
    num->tail->next = newNode;
    num->tail = newNode;
  }
}

void ll_pushAt(list* num, int index, int number) {
  if (index == 0) {
    ll_pushFront(num, number);
    return;
  }
  node* newNode = (node*)malloc(sizeof(node));
  newNode->value = number;
  node* temp = num->head;
  for (int i = 0; i < index - 1 && temp->next != num->head; i++) {
    temp = temp->next;
  }
  newNode->next = temp->next;
  temp->next = newNode;
  if (temp == num->tail) {
    num->tail = newNode;
  }
}

void ll_popFront(list* num) {
  if (num->head == NULL) return;
  node* temp = num->head;
  if (num->head == num->tail) {
    num->head = NULL;
    num->tail = NULL;
  } else {
    num->head = num->head->next;
    num->tail->next = num->head;
  }
  free(temp);
}

void ll_popBack(list* num) {
  if (num->head == NULL) return;
  node* temp = num->head;
  if (num->head == num->tail) {
    free(num->head);
    num->head = NULL;
    num->tail = NULL;
  } else {
    while (temp->next != num->tail) {
      temp = temp->next;
    }
    free(num->tail);
    temp->next = num->head;
    num->tail = temp;
  }
}

void ll_print(list num) {
  if (num.head == NULL) return;
  node* temp = num.head;
  do {
    printf("%d->", temp->value);
    temp = temp->next;
  } while (temp != num.head);
  printf("Head\n");
}

void ll_search(list num, int number) {
  if (num.head == NULL) printf("List kosong\n");
  node* temp = num.head;
  int index = 0;
  do {
    if (temp->value == number) {
      printf("Elemen ditemukan pada index %d\n", index);
      return;
    }
    temp = temp->next;
    index++;
  } while (temp != num.head);
  printf("Elemen tidak ditemukan\n");
}

int main() {
  list num;
  init(&num);
  
  ll_pushBack(&num, 1);
  ll_pushBack(&num, 2);
  ll_pushBack(&num, 3);
  ll_print(num);
  
  ll_popFront(&num);
  ll_print(num);
  
  ll_popBack(&num);
  ll_print(num);
  
  ll_pushAt(&num, 1, 4);
  ll_print(num);
  
  ll_search(num, 4);
  ll_search(num, 5);
  
  ll_pushFront(&num, 5);
  ll_print(num);
  
  return 0;
}

