#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/wait.h>

#define NFNAME 64
#define NFILES 50

const char *dirname = "./film";

void mkdir();
void f_list(char files[][NFNAME], int *idx);
void mv_log(char *fname, char *genre, int who);
void f_folder(char files[][NFNAME], int start, int end, int who);
void f_worker(char files[][NFNAME], int idx);
int f_count(char *genre);
void total(int cnt[]);

void mkdir() {
    if(fork() == 0) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "cd %s && mkdir -p FilmHorror FilmAnimasi FilmDrama", dirname);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }
    wait(NULL);
}

void f_list(char files[][NFNAME], int *idx) {
    int fd[2];
    pipe(fd);

    if(fork() == 0) {
        close(fd[0]);
        dup2(fd[1], STDOUT_FILENO);
        close(fd[1]);
        
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "cd %s && ls -1 *.jpg | sort -V", dirname);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    } else {        
        close(fd[1]);
        char buff[NFILES * NFNAME + NFILES];
        ssize_t nbytes = read(fd[0], buff, sizeof(buff) - 1);
        buff[nbytes] = '\0';
        close(fd[0]);

        char *token = strtok(buff, "\n");
        while(token && *idx < NFILES) {
            strncpy(files[(*idx)++], token, NFNAME);
            token = strtok(NULL, "\n");
        }
    }
    wait(NULL);
}

void mv_log(char *fname, char *genre, int who) {
    if(fork() == 0) {
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "cd %s && mv -n %s ./%s", dirname, fname, genre);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }
    wait(NULL);

    if(fork() == 0) {
        char cmd[512];
        char *name;
        name = (who == 0) ? "Peddy" : "Trabowo";
        snprintf(cmd, sizeof(cmd), "echo \"[$(date +'%%d-%%m-%%Y %%H:%%M:%%S')]\" %s: %s telah dipindahkan ke %s >> recap.txt", name, fname, genre);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }
    wait(NULL);
}

void f_folder(char files[][NFNAME], int start, int end, int who) {
    for (start; start < end; start++) {     
        if(strstr(files[start], "_animasi")) mv_log(files[start], "FilmAnimasi", who);
        else if(strstr(files[start], "_drama")) mv_log(files[start], "FilmDrama", who);
        else if(strstr(files[start], "_horror")) mv_log(files[start], "FilmHorror", who);
    }
}

void f_worker(char files[][NFNAME], int idx) {
    if(fork() == 0) {
        f_folder(files, 0, idx / 2, 0);
        exit(0);
    }
    
    if(fork() == 0) {
        f_folder(files, idx / 2, idx, 1);
        exit(0);
    }

    wait(NULL);
    wait(NULL);
}

int f_count(char *genre) {
    int film, fd[2];

    pipe(fd);

    if(fork() == 0) {
        dup2(fd[1], STDOUT_FILENO);
        close(fd[0]);
        close(fd[1]);

        char cmd[512];
        snprintf(cmd, sizeof(cmd), "cd %s/%s && ls -1 | wc -l", dirname, genre);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }

    wait(NULL);
    
    char buff[10];
    ssize_t nbytes = read(fd[0], buff, sizeof(buff) - 1);
    buff[nbytes] = '\0';
    film = atoi(buff);
    
    close(fd[0]);
    close(fd[1]);

    return film;
}

void total(int cnt[]) {
    if(fork() == 0) {
        char genre[NFILES];
        if(cnt[3] == cnt[0]) strcpy(genre, "horror");
        if(cnt[3] == cnt[1]) strcpy(genre, "animasi");
        if(cnt[3] == cnt[2]) strcpy(genre, "drama");
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "echo \"Jumlah film horror: %d\nJumlah film animasi: %d\nJumlah film drama: %d\nGenre dengan jumlah film terbanyak: %s\" > total.txt", cnt[0], cnt[1], cnt[2], genre);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    }
    wait(NULL);
}

int main() {
    char files[NFILES][NFNAME];
    int idx = 0, cnt[4] = {0};  // [0]=cnt_horror ; [1]=cnt_animasi ; [2]=cnt_drama ; [3]=cnt_max

    mkdir();
    f_list(files, &idx);
    f_worker(files, idx);

    cnt[0] = f_count("FilmHorror");
    cnt[3] = (cnt[0] > cnt[3]) ? cnt[0] : cnt[3];
    cnt[1] = f_count("FilmAnimasi");
    cnt[3] = (cnt[1] > cnt[3]) ? cnt[1] : cnt[3];
    cnt[2] = f_count("FilmDrama");
    cnt[3] = (cnt[2] > cnt[3]) ? cnt[2] : cnt[3];

    total(cnt);

    return 0;
}