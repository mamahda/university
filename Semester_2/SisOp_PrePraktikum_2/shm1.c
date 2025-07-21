#include <stdio.h>
#include <sys/ipc.h>
#include <sys/shm.h>
#include <unistd.h>
#include <string.h>

int main(){
  key_t key = 1234;
  char *value;

  int shmid = shmget(key, 1024, IPC_CREAT | 0666);
  value = shmat(shmid, NULL, 0);

  strcpy(value, "Hello ");

  printf("%s\n", value);
  shmdt(value);
}
