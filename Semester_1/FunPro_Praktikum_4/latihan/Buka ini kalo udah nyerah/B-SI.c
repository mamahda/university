#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct Node {
    int key;
    char value[50]; 
    struct Node* next;
};

struct HashMap {
    struct Node** array;
    int size;
};

struct Node* createNode(int key, const char* value) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->key = key;
    strcpy(newNode->value, value);
    newNode->next = NULL;
    return newNode;
}

struct HashMap* createHashMap(int size) {
    struct HashMap* map = (struct HashMap*)malloc(sizeof(struct HashMap));
    map->size = size;
    map->array = (struct Node**)malloc(sizeof(struct Node*) * size);

    for (int i = 0; i < size; i++) {
        map->array[i] = NULL;
    }

    return map;
}

void insert(struct HashMap* map, int key, const char* value) {
    int index = key % map->size;
    struct Node* newNode = createNode(key, value);

    if (map->array[index] == NULL) {
        map->array[index] = newNode;
    } else {
        newNode->next = map->array[index];
        map->array[index] = newNode;
    }
}

const char* get(struct HashMap* map, int key) {
    int index = key % map->size;

    struct Node* current = map->array[index];

    while (current != NULL) {
        if (current->key == key) {
            return current->value;
        }
        current = current->next;
    }

    return NULL;
}

int main() {
  int N, Q; 
  scanf("%d %d", &N, &Q);
  struct HashMap* map = createHashMap(N);

  for(int i = 0; i < N; i++) {
    int key; scanf("%d", &key);
    char value[50]; scanf("%s", value);
    insert(map, key, value);
  }

  for(int i = 0; i < Q; i++) {
    int key; scanf("%d", &key);
    get(map, key) == NULL ? printf("========= Emangnya ada isinya? ============\n") : printf("%s\n", get(map, key));
  }

  return 0;
}
