#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct word {
  char c;
  struct word *next;
} word;

typedef struct {
  word *first;
} head;

void init(head *list){
  list->first = NULL;
}

void insert(head *list, char c){
  word *_new = (word*)malloc(sizeof(word));
  _new->c = c;
  _new->next = list->first;
  list->first = _new;
}

bool anagram(head list1, head list2, int length){
  word *first = list1.first;
  int count = 0;
  while (first != NULL){
    word *second = list2.first;
    word *prev = NULL;
    while(second != NULL){
      if(first->c == second->c){
        if(prev == NULL){
          list2.first = second->next;
        }
        else{
          prev->next = second->next;
        }
        free(second);
        count++;
        break;
      }
      prev = second;
      second = second->next;
    }
    first = first->next;
  }
  if(count == length) return true;
  return false;
}

int main(){
  head list1, list2;
  init(&list1);
  init(&list2);

  char str1[100], str2[100];
  printf("masukkan string 1: ");
  scanf("%s", str1);

  printf("masukkan string 2: ");
  scanf("%s", str2);

  int length1, length2;

  length1 = strlen(str1);
  length2 = strlen(str2);

  if(length1 != length2){ 
    printf("panjang dari string 1 dan string 2 tidak sama\n");
    return 0;
  }

  for(int i = 0; i < length1; i++){
    insert(&list1, str1[i]);
    insert(&list2, str2[i]);
  }

  bool _anagram = anagram(list1, list2, length1);

  if(_anagram){
    printf("return [1]: kedua string adalah anagram\n");
  }
  else{
    printf("return [0]: kedua string bukan anagram\n");
  }
}
