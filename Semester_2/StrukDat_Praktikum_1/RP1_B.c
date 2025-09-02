#include <stdio.h>
#include <stdlib.h>

typedef struct
{
  long long berat[100001];
  int size;
} pqueue;

void init(pqueue *makanan)
{
  makanan->size = 0;
}

void enqueue(pqueue *makanan, long long berat)
{
  int i = makanan->size - 1;
  while(i >= 0 && makanan->berat[i] > berat)
  {
    makanan->berat[i + 1] = makanan->berat[i];
    i--;
  }
  makanan->berat[i + 1] = berat;
  makanan->size++;
}

void dequeue(pqueue *makanan, long long berat)
{
  for (int i = 0; i < makanan->size; i++)
  {
    if (berat == makanan->berat[i])
    {
      for (int j = i; j < makanan->size - 1; j++)
      {
        makanan->berat[j] = makanan->berat[j + 1];
      }
      makanan->size--;
      break;
    }
  }
}

void makan(pqueue *makanan)
{
  while (makanan->size > 1)
  {
    int berat1 = makanan->berat[makanan->size - 1];
    int berat2 = makanan->berat[makanan->size - 2];
    if (berat1 == berat2)
    {
      dequeue(makanan, berat1);
      dequeue(makanan, berat2);
    }
    else
    {
      enqueue(makanan, berat1 - berat2);
      dequeue(makanan, berat1);
      dequeue(makanan, berat2);
    }
  }
}

void printqueue(pqueue *makanan)
{
  if(makanan->size == 0){
    printf("0");
    return;
  }
  for (int i = 0; i < makanan->size; i++)
  {
    printf("%lld ", makanan->berat[i]);
  }
}

int main()
{
  pqueue makanan;
  init(&makanan);

  int n;
  scanf("%d", &n);
  for (int i = 0; i < n; i++)
  {
    long long temp;
    scanf("%lld", &temp);
    enqueue(&makanan, temp);
  }
  makan(&makanan);
  printqueue(&makanan);
}