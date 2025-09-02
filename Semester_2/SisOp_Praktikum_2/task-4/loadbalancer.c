#include <sys/types.h>
#include <sys/shm.h>
#include <pthread.h>
#include <sys/ipc.h>
#include <sys/wait.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/msg.h>

struct msgbuf {
  long mtype;
  char mtext[1024];
};

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

int main(){
  key_t key = 1234;
  char *messages;
  int shmid = shmget(key, 1024, 0666|IPC_CREAT);
  messages = shmat(shmid, NULL, 0);

  key_t msgkey = 4321;
  int msqid = msgget(msgkey, 0666 | IPC_CREAT);
  struct msgbuf message;

  char *temp = malloc(1024);
  char *content = malloc(1024);
  char *separator = strchr(messages, ';');
  if (separator) {
    size_t len = separator - messages;
    strncpy(content, messages, len);
    strcpy(temp, separator + 1);
  }

  shmdt(messages);
  shmctl(shmid, IPC_RMID, NULL);
  int count = atoi(temp);

  key_t workerkey = 1342;
  int workerid = shmget(workerkey, 1024, 0666|IPC_CREAT);
  int *numworker = shmat(workerid, NULL, 0);

  printf("Masukkan jumlah worker: ");
  scanf("%d", numworker);
  
  int num = 1;

  for(int i = 1; i <= 10; i++){
    char *log = malloc(1024);
    char *logmessage = malloc(1024);

    sprintf(logmessage, "Received at lb: %s (#message %d)", content, i);
    printlog(logmessage);
    
    if (num > *numworker) {
      num = 1;
    }

    message.mtype = num;
    snprintf(message.mtext, 1024, "%s", content);
    msgsnd(msqid, &message, strlen(message.mtext) + 1, 0);

    num++;
    wait(NULL);
    free(log);
    free(logmessage);
  }

  for(int i = 0; i < *numworker; i++){
    message.mtype = i + 1;
    snprintf(message.mtext, 1024, "exit");
    msgsnd(msqid, &message, sizeof(message.mtext), 0);
  }

  wait(NULL);
  shmdt(numworker);
  free(content);
  free(temp);

  return 0;
}
