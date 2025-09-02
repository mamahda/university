#include <stdio.h>
#include <stdlib.h>

typedef struct list{
  int data;
  struct list* next;
} list;

typedef struct head{
  list *first;
  list *last;
} head;

void init(head *ll){
  ll->first = NULL;
  ll->last = NULL;
}

void inserttail(head *ll, int data){
  list *newnode = (list*)malloc(sizeof(list));
  newnode->data = data;
  newnode->next = NULL;
  if(ll->first == NULL){
    ll->first = newnode;
    ll->last = newnode;
  } else {
    ll->last->next = newnode;
    ll->last = newnode;
  }
 }

void print(head ll){
  list *print = (list*)malloc(sizeof(list));
  print = ll.first;
  while(print != NULL){
    printf("%d ", print->data);
    print = print->next;
  }
}

int main(){
  head ll;
  init(&ll);
  
  int n;
  scanf("%d", &n);
  for(int i = 0; i < n; i++){
    int temp;
    scanf("%d", &temp);
    inserttail(&ll, temp);
  }

  list *first = ll.first;
  while(first != NULL && first->next != NULL){
    int temp = first->data;
    first->data = first->next->data;
    first->next->data = temp;
    first = first->next->next;   
  }
  print(ll);
}
