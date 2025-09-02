#include <stdio.h>

typedef struct {
  int burger[200]; 
  int isYou[200];  
  int front;
  int rear;
} queue;

void init(queue *q) {
  q->front = 0;
  q->rear = 0;
}

void enqueue(queue *q, int val, int you) {
  q->burger[q->rear] = val;
  q->isYou[q->rear] = you;
  q->rear++;
}

void dequeue(queue *q) {
  q->front++;
}

int main() {
  int x, y, z;
  scanf("%d %d %d", &x, &y, &z);
  int sum = 0, burger = y;
  queue q;
  init(&q);

  for (int i = 0; i < x; i++) {
    int b;
    scanf("%d", &b);
    sum += b;
    enqueue(&q, b, (i == x - 1) ? 1 : 0); 
  }

  int antreUlang = 0;
  int urutan = 1;
  int dapet = 0;

  while (q.front < q.rear && y > 0) {
    if (urutan % z == 0) {
      enqueue(&q, q.burger[q.front], q.isYou[q.front]);
      antreUlang++;
    } else {
      if (q.burger[q.front] <= y) {
        y -= q.burger[q.front];
        if (q.isYou[q.front]) {
          dapet = 1;
        }
      } else {
        break;
      }
    }
    dequeue(&q);

    urutan++;
  }
  printf("%d ", antreUlang);
  if (sum <= burger) printf("Yes Dapat burger gratis!!!\n");
  else if(sum > burger) printf("NOO tidak Dapat :(\n");

  return 0;
}

