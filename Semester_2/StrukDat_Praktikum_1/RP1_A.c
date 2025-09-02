#include <stdio.h>
#include <string.h>

typedef struct{
  int nomor[1001];
  int front;
  int rear;
} queue;

void init(queue *cus){
  cus->front = 0;
  cus->rear = 0;
}

void enqueue(queue *cus, int nomor){
  cus->nomor[cus->rear] = nomor;
  cus->rear++;
}

void dequeue(queue *cus){
  cus->front++;
}

void pembayaran(queue *cus){
  int m;
  scanf("%d", &m);
  for (int i = 0; i < m; i++)
  {
    char status[11];
    scanf("%s", status);
    if (strcmp(status, "BERHASIL")==0)
    {
      dequeue(cus);
    }
    else if(strcmp(status, "GAGAL")==0){
      enqueue(cus, cus->nomor[cus->front]);
      dequeue(cus);
    }
  }
}

void print(queue cus){
  if(cus.front == cus.rear){
    printf("KOSONG");
    return;
  }
  for(int i = cus.front; i < cus.rear; i++){
    printf("%d ", cus.nomor[i]);
  }
}

int main(){
  queue cus;
  init(&cus);

  int n;
  scanf("%d", &n);
  for (int i = 0; i < n; i++)
  {
    int temp;
    scanf("%d", &temp);
    enqueue(&cus, temp);
  }

  pembayaran(&cus);

  print(cus);
  
  return 0;
}