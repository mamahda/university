#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    char *filename = "trabowo.zip";

    if(fork() == 0) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "wget -q -O %s \"https://drive.usercontent.google.com/u/0/uc?id=1nP5kjCi9ReDk5ILgnM7UCnrQwFH67Z9B&export=download\"", filename);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }
    wait(NULL);

    if(fork() == 0) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "unzip -q %s", filename);
        execlp("sh", "sh", "-c", cmd, NULL);
    }
    wait(NULL);

    if(fork() == 0) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "rm -rf %s", filename);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }

    return 0;
}