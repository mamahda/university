#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>
 
pthread_t tid[5];
int job_counter = 0;
 
pthread_mutex_t mutex_lock;
 
void* job_executor(void* arg)
{
    int current_job_id;
 
    pthread_mutex_lock(&mutex_lock);
 
    job_counter += 1;
    current_job_id = job_counter;
    printf("\n--> Job %d: Mulai...\n", current_job_id);
 
    // TODO

    unsigned long i;
    for (i = 0; i < (0xFFFFFF); i++);
    
    printf("--> Job %d: Selesai.\n", current_job_id);
    pthread_mutex_unlock(&mutex_lock); 
 
    return NULL;
}
 
int main(void)
{
    int i = 0;
    int error;
 
    if (pthread_mutex_init(&mutex_lock, NULL) != 0) {
        printf("\nMutex initialization failed\n");
        return 1;
    }
 
    printf("Main: Membuat thread untuk mengeksekusi job...\n");
 
    while (i < 5) {
        error = pthread_create(&(tid[i]), NULL, &job_executor, NULL);
        if (error != 0) {
            printf("\nThread can't be created :[%s]", strerror(error));
            return 1;
        }
        i++;
    }
 
    pthread_join(tid[0], NULL);
    pthread_join(tid[1], NULL);
    pthread_join(tid[2], NULL);
    pthread_join(tid[3], NULL);
    pthread_join(tid[4], NULL);
 
    pthread_mutex_destroy(&mutex_lock);
 
    printf("\nMain: Semua job selesai. Total job dieksekusi: %d\n", job_counter);
 
    return 0;
}
