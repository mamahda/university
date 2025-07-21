#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main(){
  pid_t child_pid;

  child_pid = fork();

  printf("Hello ");

  if (child_pid != 0) {
    wait(NULL);
    printf("World\n");
  } else {
    sleep(1);
    printf("Parent\n");
  }
}
