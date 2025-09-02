#include <stdio.h>
#include <string.h>
#include <stdlib.h>

typedef struct node {
  int num;
  struct node *next;
} node;

typedef struct {
  node *first;
} head;

void init(head* child){
  child->first = NULL;
}

void insert(head *child, int number){
  node *_new = (node*)malloc(sizeof(node));
  _new->num = number;
  _new->next = child->first;
  child->first = _new;
}

void circular(head* child){
  node *temp = child->first;
  if (child->first == NULL) return;

  while (temp->next != NULL) {
    temp = temp->next;
  }

  temp->next = child->first;
}

int seleksi(head *child, int k){
  if (child->first == NULL) return -1;
  if (child->first->next == child->first) {
    int result = child->first->num;
    free(child->first);
    child->first = NULL;
    return result;
  }

  node *current = child->first;
  node *prev = NULL;

  while (current->next != child->first) {
    current = current->next;
  }
  prev = current;
  current = child->first;

  while (current->next != current) { 
    for (int i = 1; i < k; i++) { 
      prev = current;
      current = current->next;
    }
    
    printf("anak ke-%d tereliminasi\n", current->num);
    prev->next = current->next;

    node *temp = current;
    current = current->next;
    free(temp);
  }

  int result = current->num;
  free(current);
  child->first = NULL;
  return result;
}

int main(){
  int n;
  head child;
  init(&child);

  printf("masukkan jumlah anak: ");
  scanf("%d", &n);
  getchar();

  for(int i = n; i >= 1; i--){ 
    insert(&child, i);
  }
  circular(&child);
  
  printf("yapping sesukamu: ");
  char c;
  int m = 1;
  while (1) {
    c = getchar();
    if (c == '\n' || c == EOF) {
      break;
    } else if (c == ' ') {
      m++;
    } 
  }

  printf("-----------------------\n");
  int ans = seleksi(&child, m);
  printf("-----------------------\n");
  printf("yang menang adalah anak ke-%d\n", ans);

  return 0;
}
