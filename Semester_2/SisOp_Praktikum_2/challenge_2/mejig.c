#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <unistd.h>

int main(){
  char *cmd = malloc(1024);
  pid_t child1 = fork();
  if(child1 == 0){
    printf("pid 1: %d\n", (int)getpid());
    sprintf(cmd, "mkdir -p myfolder");
    char *args[] = {"bin/sh", "-c", cmd, NULL};
    execv("/bin/sh", args);
  }
  wait(NULL);
  
  pid_t child2 = fork();
  if(child2==0){
    printf("pid 2: %d\n", (int)getpid());
    sprintf(cmd, "touch ./myfolder/myfile.txt");
    char *args[] = {"bin/sh", "-c", cmd, NULL};
    execv("/bin/sh", args);
  }
}
