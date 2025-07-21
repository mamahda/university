#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <sys/msg.h>
#include <unistd.h>
#include <sys/wait.h>
#include <pthread.h>
#include <sys/types.h>

struct msgbuf {
  long mtype;
  char mtext[1025];
};

pthread_mutex_t lock;
pthread_cond_t cond;
int turn = 1;
int total_workers = 0;

void printlog(char *logmessage) {
  char *log = malloc(1025);
  sprintf(log, "echo \"%s\\n$(cat system.log)\" > system.log", logmessage);

  pid_t pid = fork();
  if (pid == 0) {
    // Child process
    char *args[] = {"/bin/sh", "-c", log, NULL};
    execv("/bin/sh", args);
    exit(0);
  }

  wait(NULL);
  free(log);
}

int count[1024];

void* worker(void *arg) {
  int id = *((int*)arg);
  key_t msgkey = 4321;
  int msqid = msgget(msgkey, 0666);

  struct msgbuf message;

  while (1) {
    if (msgrcv(msqid, &message, sizeof(message.mtext), id, 0) > 0) {
      if (strcmp(message.mtext, "exit") == 0) {
        break;
      }
      
      pthread_mutex_lock(&lock);
      while (turn != id) {
        pthread_cond_wait(&cond, &lock);
      }

      char *logmessage = malloc(1025);
      sprintf(logmessage, "Worker%d: message received", id);
      printlog(logmessage);

      count[id-1]++;

      turn = (turn % total_workers) + 1;
      pthread_cond_broadcast(&cond);
      pthread_mutex_unlock(&lock);
    }
  }
}

int main(){
  key_t workerkey = 1342;
  int workerid = shmget(workerkey, 1024, 0666|IPC_CREAT);
  int *numworker = shmat(workerid, NULL, 0);
  total_workers = *numworker;


  pthread_t thread[*numworker];
  int id[*numworker];
  for(int i = 0; i < *numworker; i++){
    id[i] = i + 1;
    count[i] = 0;
  }

  for(int i = 0; i < *numworker; i++){
    pthread_create(&thread[i], NULL, worker, (void *)&id[i]);
  }

  for(int i = 0; i < *numworker; i++){
    pthread_join(thread[i], NULL);
  }

  printf("\n");
  for(int i = *numworker; i > 0; i--){  
    char *logmessage = malloc(1025);
    sprintf(logmessage, "Worker %d: %d messages", i, count[i-1]);
    printlog(logmessage);
    free(logmessage);
  }

  return 0;
}
