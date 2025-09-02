#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>

int main() {
    if(fork() == 0) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "cd ./film && zip -rq FilmAnimasi.zip ./FilmAnimasi && rm -rf FilmAnimasi");
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }

    if(fork() == 0) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "cd ./film && zip -rq FilmDrama.zip ./FilmDrama && rm -rf FilmDrama");
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }
    
    if(fork() == 0) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "cd ./film && zip -rq FilmHorror.zip ./FilmHorror && rm -rf FilmHorror");
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }
}