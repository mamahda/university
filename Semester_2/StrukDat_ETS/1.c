#include <stdio.h>

typedef struct {
  int x[1001];
  int y[1001];
  int top;
} koordinat;

void init(koordinat *a){
  a->top = 0;
  a->x[a->top] = 0;
  a->y[a->top] = 0;
}

void push(koordinat *a, int x, int y) {
  a->top++;
  a->x[a->top] = x;
  a->y[a->top] = y;
}

void pop(koordinat *a){
  a->top--;
}

int main() {
  koordinat a;
  init(&a);
  char direction;
  int temp;
  while(scanf("%c", &direction)!=EOF) {
    printf("posisi x:%d y:%d\n", a.x[a.top], a.y[a.top]);
    switch(direction) {
      case 'U':
        temp = a.y[a.top];
        temp++;
        push(&a, a.x[a.top], temp);
        break;
      case 'D':
        temp = a.y[a.top];
        temp--;
        push(&a, a.x[a.top], temp);
        break;
      case 'L':
        temp = a.x[a.top];
        temp--;
        push(&a, temp, a.y[a.top]);
        break;
      case 'R':
        temp = a.x[a.top];
        temp++;
        push(&a, temp, a.y[a.top]);
        break;
      case 'B':
        pop(&a);
        break;
    }
  }
}
