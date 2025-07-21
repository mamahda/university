#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>
#include <pthread.h>

#define MXLINK 4096
#define MXBUFF 2048
#define MXLINE 64
#define MANHWA 4

typedef struct {
    int  rls;
    char lnk[MXBUFF];
    char hrn[MXLINE];
} Waifu;

const char *dirM = "Manhwa";
const char *dirA = "Archive";
const char *dirH = "Heroines";
const char *dirI = "Images";

void make_dir(const char *);
void Summoning_the_Manhwa_Stats(char*, int [MANHWA], char [][MXLINE], char [][MXLINE], int);
void Seal_the_Scrolls(char [][MXLINE], char [][MXLINE]);
void *Making_the_Waifu_Gallery(void *);
void Zip_Save_Goodbye(char *[], char [][MXLINE], char [][MXLINE]);

void make_dir(const char *dir) {
    char cmd[512];
    snprintf(cmd, sizeof(cmd), "mkdir -p %s", dir);
    execlp("sh", "sh", "-c", cmd, NULL);
}

void Summoning_the_Manhwa_Stats(char *IDcode, int Release[MANHWA], char FILEname[MANHWA][MXLINE], char ZIPname[MANHWA][MXLINE], int indexRelease) {
    char attr[MXLINE][MXLINE];
    int idx = 0, fd[2];
    pipe(fd);

    if(fork() == 0) {
        close(fd[0]);
        dup2(fd[1], STDOUT_FILENO);
        close(fd[1]);
        
        char cmd[512];
        snprintf(cmd, sizeof(cmd), "curl -s https://api.jikan.moe/v4/manga/%s | jq -r '.data as $d | \"\\($d.title_english)\n\\($d.status)\n\\($d.published.from | split(\"T\")[0])\", ($d.genres | map(.name) | join(\", \")), ($d.themes | map(.name) | join(\", \")), ($d.authors | map(.name) | join(\", \"))'", IDcode);
        execlp("sh", "sh", "-c", cmd, NULL);
        exit(0);
    } else {
        close(fd[1]);
        char buff[MXBUFF];
        ssize_t nbytes = read(fd[0], buff, sizeof(buff) - 1);
        buff[nbytes] = '\0';
        close(fd[0]);

        char *token = strtok(buff, "\n");
        while(token && idx < MXLINE) {
            strncpy(attr[idx++], token, MXLINE);
            token = strtok(NULL, "\n");
        }

        int j = 0, k = 0, len = strlen(attr[0]);
        char out[MXLINE], ZIP[MXLINE];
        for (int i = 0; i < len; i++) {
            if(isalnum(attr[0][i])) {
                out[j++] = attr[0][i];
            } else if(attr[0][i] == ' ') {
                out[j++] = '_';
            }
            if(isupper(attr[0][i])) ZIP[k++] = attr[0][i];
        }
        out[j] = '\0';
        ZIP[k] = '\0';

        char tmp[3];
        strncpy(tmp, attr[2] + 5, 2);
        tmp[2] = '\0';
        Release[indexRelease] = atoi(tmp);
        strncpy(FILEname[indexRelease], out, MXLINE);
        strncpy(ZIPname[indexRelease], ZIP, MXLINE);

        if(fork() == 0) {
            char cmd[1024];
            snprintf(cmd, sizeof(cmd), 
            "printf \"Title: %s\\nStatus: %s\\nRelease: %s\\nGenre: %s\\nTheme: %s\\nAuthor: %s\\n\" > ./%s/%s.txt",
            attr[0], attr[1], attr[2], attr[3], attr[4], attr[5], dirM, out);
            execlp("sh", "sh", "-c", cmd, NULL);
            exit(0);
        }
        wait(NULL);
    }
    wait(NULL);
}

void Seal_the_Scrolls(char FILEname[MANHWA][MXLINE], char ZIPname[MANHWA][MXLINE]) {    
    for (int i = 0; i < MANHWA; i++) {
        if(fork() == 0) {
            char cmd[512];
            snprintf(cmd, sizeof(cmd), "zip -q ./%s/%s.zip ./%s/%s.txt", dirA, ZIPname[i], dirM, FILEname[i]);
            execlp("sh", "sh", "-c", cmd, NULL);
            exit(0);
        }
        wait(NULL);
    }    
}

void *Making_the_Waifu_Gallery(void *args) {
    Waifu *parameter = args;

    char cmdDir[MXBUFF];
    snprintf(cmdDir, sizeof(cmdDir), "cd ./%s && mkdir -p %s && cd ..", dirH, parameter->hrn);
    system(cmdDir);

    for (int i = 1; i <= parameter->rls; i++) {
        char cmd[MXLINK];
        snprintf(cmd, sizeof(cmd), "mkdir -p ./%s/%s && curl -s -o ./%s/%s/%s_%d.jpg \"%s\"", dirH, parameter->hrn, dirH, parameter->hrn, parameter->hrn, i, parameter->lnk);
        system(cmd);
    }

    free(parameter);
    return NULL;
}

void Zip_Save_Goodbye(char *HRmanhwa[], char FILEname[MANHWA][MXLINE], char ZIPname[MANHWA][MXLINE]) {
    for (int i = 0; i < MANHWA; i++) {
        if(fork() == 0) {
            char cmd[512];
            snprintf(cmd, sizeof(cmd), "mkdir -p ./%s/%s && cd %s && zip -q -r ../%s/%s/%s_%s.zip %s", dirA, dirI, dirH, dirA, dirI, ZIPname[i], HRmanhwa[i], HRmanhwa[i]);
            execlp("sh", "sh", "-c", cmd, NULL);
            exit(0);
        }
    }
    for (int i = 0; i < MANHWA; i++) wait(NULL);
    
    for (int i = 0; i < MANHWA; i++) {
        if(fork() == 0) {
            char cmd[512];
            snprintf(cmd, sizeof(cmd), "find ./%s/%s -type f | sort | while read -r file; do rm \"$file\"; done", dirH, HRmanhwa[i]);
            execlp("sh", "sh", "-c", cmd, NULL);
            exit(0);
        }
    }
    for (int i = 0; i < MANHWA; i++) wait(NULL);
}

int main() {
    char *IDmanhwa[] = {"168827", "147205", "169731", "175521"};
    char *LKmanhwa[] = {
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlmdSSDhJBbCgGHwNfAJVi0rq07v7TXu_nlw&s",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt7950IuqfQTjUQrWilemifRXTZ_lWDEAFyA&s",
        "https://d1ed0vta5mrb00.cloudfront.net/chapters/753123785/thumbnails/01b8de86-08f9-4075-8091-f7f330f3c191.jpg",
        "https://cdn.anime-planet.com/manga/primary/darling-why-cant-we-divorce-novel-1.jpg?t=1741355035"
    };
    char *HRmanhwa[] = {"Lia", "Artezia", "Adelia", "Ophelia"};
    char FILEname[MANHWA][MXLINE];
    char ZIPname[MANHWA][MXLINE];
    int Release[MANHWA];

    pid_t pid[3];

    pid[0] = fork();
    if(pid[0] == 0) {
        make_dir(dirM);
        exit(0);
    }
    
    pid[1] = fork();
    if(pid[1] == 0) {
        make_dir(dirA);
        exit(0);
    }

    pid[2] = fork();
    if(pid[2] == 0) {
        make_dir(dirH);
        exit(0);
    }

    for (int i = 0; i < 3; i++) {
        waitpid(pid[i], NULL, 0);
    }
        
    for (int i = 0; i < MANHWA; i++) Summoning_the_Manhwa_Stats(IDmanhwa[i], Release, FILEname, ZIPname, i);
    
    Seal_the_Scrolls(FILEname, ZIPname);
    
    pthread_t tid[MANHWA];
    for (int i = 0; i < MANHWA; i++) {
        Waifu *args = malloc(sizeof(*args));
        strncpy(args->lnk, LKmanhwa[i], MXBUFF);
        strncpy(args->hrn, HRmanhwa[i], MXLINE);
        args->rls = Release[i];
        pthread_create(&tid[i], NULL, Making_the_Waifu_Gallery, args);
        pthread_join(tid[i], NULL);
    }

    Zip_Save_Goodbye(HRmanhwa, FILEname, ZIPname);

    return 0;
}