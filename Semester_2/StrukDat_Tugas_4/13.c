#include <stdio.h>

typedef struct {
  int jobNumber;
  int priority;
} Job;

typedef struct {
  Job jobs[100];  
  int size;
} PQueue;

void create(PQueue* pq) {
  pq->size = 0;
}

void addJob(PQueue* pq, int jobNumber, int priority) {
  if (pq->size == 100) {
    printf("Queue penuh, tidak bisa tambah job.\n");
    return;
  }

  int i = pq->size - 1;
  while (i >= 0 && pq->jobs[i].priority > priority) {
    pq->jobs[i + 1] = pq->jobs[i];
    i--;
  }

  pq->jobs[i + 1].jobNumber = jobNumber;
  pq->jobs[i + 1].priority = priority;
  pq->size++;
}

void deleteHead(PQueue* pq) {
  if (pq->size == 0) {
    printf("Queue kosong, tidak ada job untuk dihapus.\n");
    return;
  }

  printf("Job %d dengan prioritas %d dihapus.\n", pq->jobs[0].jobNumber, pq->jobs[0].priority);

  for (int i = 1; i < pq->size; i++) {
    pq->jobs[i - 1] = pq->jobs[i];
  }
  pq->size--;
}

void removeJob(PQueue* pq, int jobNumber) {
  int found = 0;
  for (int i = 0; i < pq->size; i++) {
    if (pq->jobs[i].jobNumber == jobNumber) {
      found = 1;
      for (int j = i + 1; j < pq->size; j++) {
        pq->jobs[j - 1] = pq->jobs[j];
      }
      pq->size--;
      printf("Job %d dihapus dari queue.\n", jobNumber);
      break;
    }
  }

  if (!found) {
    printf("Job %d tidak ditemukan dalam queue.\n", jobNumber);
  }
}

void print(PQueue* pq) {
  printf("Isi Queue:\n");
  if (pq->size == 0) {
    printf("[kosong]\n");
    return;
  }

  for (int i = 0; i < pq->size; i++) {
    printf("Job %d [Prioritas: %d]\n", pq->jobs[i].jobNumber, pq->jobs[i].priority);
  }
}

int main() {
  PQueue pq;
  create(&pq);

  addJob(&pq, 101, 3);
  addJob(&pq, 102, 1);
  addJob(&pq, 103, 5);
  print(&pq);

  deleteHead(&pq);
  print(&pq);

  removeJob(&pq, 103);
  print(&pq);

  deleteHead(&pq);
  print(&pq);

  return 0;
}

