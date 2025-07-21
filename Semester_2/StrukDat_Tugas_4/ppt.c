#include <stdio.h>

typedef struct {
  int data[100];
  int head;
  int tail;
} queue;

void create(queue *q) {
  q->head = -1;
  q->tail = -1;
}

int isEmpty(queue q) {
  return (q.head == -1);
}

int isFull(queue q) {
  return (q.tail == 100);
} 

void enqueue(queue *q, int data) {
  if (isEmpty(*q)) {
    q->head = 0;
    q->tail = 0;
    q->data[q->tail] = data;
  } else if (isFull(*q)) {
    printf("Queue penuh\n");
  } else {
    q->tail++;
    q->data[q->tail] = data;
  }
}

void dequeue(queue *q) {
  if (isEmpty(*q)) {
    printf("Queue kosong\n");
  }
  else if (q->head == q->tail){
    q->head = -1;
    q->tail = -1;
  }
  else {
    for (int i = q->head; i < q->tail; i++){
      q->data[i] = q->data[i+1];
    }
    q->tail--;
  }
}

void clear(queue *q){
  q->tail = -1;
  q->head = -1;
}

void search(queue q, int data){
  int found = 0;
  int index = -1;
  if(isEmpty(q)){
    printf("Queue kosong");
  }
  else{
    for(int i = q.head; i <= q.tail; i++){
      if(q.data[i] == data){
        found = 1;
        index = i;
        break;
      }
    }
    if(found){
      printf("data %d ditemukan pada index %d\n", data, index);
    }
    else printf("data %d tidak ada dalam queue\n", data);
  }
}

void print(queue q) {
  if (isEmpty(q)) {
    printf("Queue kosong\n");
    return;
  }
  printf("isi dari queue adalah: ");
  for (int i = q.head; i <= q.tail; i++) {
    printf("%d ", q.data[i]);
  }
  printf("\n");
}

void edit(queue *q, int olddata, int newdata){
  int found = 0;
  if(isEmpty(*q)){
    printf("Queue kosong");
  }
  else{
    for(int i = q->head; i <= q->tail; i++){
      if(q->data[i] == olddata){
        q->data[i] = newdata;
        printf("data %d pada index %d diubah menjadi %d\n", olddata, i, newdata);
        found = 1;
        break;
      }
    }
    if(!found) printf("data tidak ada dalam queue\n");
  }
}

void mean(queue q){
  if(isEmpty(q)){
    printf("Queue kosong");
  }
  int count = 0;
  int jumlah = 0;
  for(int i = q.head; i <= q.tail; i++){
    count += q.data[i];
    jumlah++;
  }
  printf("rata-rata dari data yang terdapat pada queue adalah %.2f\n", (float) count/jumlah);
}

void maximum(queue q){
  if(isEmpty(q)){
    printf("Queue kosong");
    return;
  }
  int max = 0;
  int index = -1;
  for(int i = q.head; i <= q.tail; i++){
    if(q.data[i] > max){
      max = q.data[i];
      index = i;
    }
  }
  printf("data terbesar adalah %d pada index %d\n", max, index);
}

void minimum(queue q){
  if(isEmpty(q)){
    printf("Queue kosong");
    return;
  }
  int min = 99999999;
  int index = -1;
  for(int i = q.head; i <= q.tail; i++){
    if(q.data[i] < min){
      min = q.data[i];
      index = i;
    }
  }
  printf("data terkecil adalah %d pada index %d\n", min, index);
}


int main(){
  queue q;
  create(&q);

  enqueue(&q, 10);
  enqueue(&q, 2);
  enqueue(&q, 8);
  enqueue(&q, 5);
  print(q);

  search(q, 10);

  dequeue(&q);
  enqueue(&q, 10);
  print(q);

  search(q, 10);

  enqueue(&q, 100);
  print(q);

  search(q, 0);
  edit(&q, 100, 0);
  print(q);
  search(q, 0);

  mean(q);
  maximum(q);
  minimum(q);

  clear(&q);
  print(q);

  return 0;
}
