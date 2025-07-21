#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <sys/wait.h>
 
void *task_thread(void *ptr);
 
int main() {
    pthread_t worker_tid1, worker_tid2;
    const char *message1 = "==> Thread 1";
    const char *message2 = "==> Thread 2";
    int iret1, iret2;
 
    printf("Main: Membuat thread 1...\n");
    iret1 = pthread_create(&worker_tid1, NULL, task_thread, (void*)message1);
    if (iret1) {
        fprintf(stderr, "Error - pthread_create() return code for thread 1: %d\n", iret1);
        exit(EXIT_FAILURE);
    }
 
    printf("Main: Membuat thread 2...\n");
    iret2 = pthread_create(&worker_tid2, NULL, task_thread, (void*)message2);
    if (iret2) {
        fprintf(stderr, "Error - pthread_create() return code for thread 2: %d\n", iret2);
        exit(EXIT_FAILURE);
    }
 
    printf("Main: Thread 1 dan 2 dibuat.\n");
 
    // TODO
    pthread_join(worker_tid1, NULL);
    pthread_join(worker_tid2, NULL);
 
    printf("Main: Kedua thread selesai. Program utama akan selesai.\n");
    exit(EXIT_SUCCESS);
}
 
void *task_thread(void *ptr) {
    char *message;
    message = (char *)ptr;
    printf("%s: Mulai\n", message);
    usleep(50000);
 
    for (int i = 0; i < 5; i++) {
        printf("%s: Hitung %d \n", message, i);
        usleep(50000);
    }
    printf("%s: Selesai\n", message);
 
    return NULL;
}
