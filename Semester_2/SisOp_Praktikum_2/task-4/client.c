#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/shm.h>
#include <sys/ipc.h>
#include <sys/wait.h>
#include <string.h>
#include <unistd.h>

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

  printf("Maksukkan pesan (pesan;jumlah): ");
  fgets(messages, 1024, stdin);

  messages[strcspn(messages, "\n")] = '\0';

  char *content = malloc(1024);
  char *temp = malloc(1024);
  char *logmessage = malloc(1024);
  char *separator = strchr(messages, ';');
  if (separator) {
    size_t len = separator - messages;
    strncpy(content, messages, len);
    strcpy(temp, separator + 1);
  }

  shmdt(messages);
  int count = atoi(temp);

  sprintf(logmessage, "Message from client: %s\nMessage count: %d", content, count);
  printlog(logmessage);

  wait(NULL);
  free(content);
  free(temp);
  free(logmessage);

  return 0;
}
