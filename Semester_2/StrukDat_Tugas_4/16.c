#include <stdio.h>

typedef struct {
  int data[100];
  int top;
} stack;

typedef struct {
  stack in;
  stack out;
} queue;

void initStack(stack* s) {
  s->top = -1;
}

void initQueue(queue* q) {
  initStack(&q->in);
  initStack(&q->out);
}

int isEmpty(stack* s) {
  return s->top == -1;
}

int isFull(stack* s) {
  return s->top == 99;
}

void push(stack* s, int data) {
  if (isFull(s)) {
    printf("Stack penuh\n");
    return;
  }
  s->data[++s->top] = data;
}

int pop(stack* s) {
  if (isEmpty(s)) {
    printf("Stack kosong\n");
    return -1;
  }
  return s->data[s->top--];
}

void printQueue(queue* q) {
  printf("Stack IN: ");
  if (isEmpty(&q->in)) {
    printf("[kosong]");
  } else {
    for (int i = q->in.top; i >= 0; i--) {
      printf("%d ", q->in.data[i]);
    }
  }

  printf("\nStack OUT: ");
  if (isEmpty(&q->out)) {
    printf("[kosong]");
  } else {
    for (int i = q->out.top; i >= 0; i--) {
      printf("%d ", q->out.data[i]);
    }
  }
  printf("\n\n");
}

void enqueue(queue* q, int data) {
  push(&q->in, data);
  printf("ENQUEUE: %d\n", data);
  printQueue(q);
}

void dequeue(queue* q) {
  if (isEmpty(&q->out)) {
    while (!isEmpty(&q->in)) {
      push(&q->out, pop(&q->in));
    }
  }

  if (isEmpty(&q->out)) {
    printf("DEQUEUE: Queue kosong\n");
    printQueue(q);
    return;
  }

  int data = pop(&q->out);
  printf("DEQUEUE: %d\n", data);
  printQueue(q);
}

int main() {
  queue q;
  initQueue(&q);

  enqueue(&q, 10);
  enqueue(&q, 20);
  enqueue(&q, 30);
  dequeue(&q);
  enqueue(&q, 40);
  dequeue(&q);
  dequeue(&q);
  dequeue(&q);
  dequeue(&q);

  return 0;
}

