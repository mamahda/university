#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <pthread.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <sys/stat.h>
#include <time.h>
#include <dirent.h>
#include <ctype.h>
#include <errno.h>

#define ZIP_FILE "NetflixCollect.zip"
#define EXTRACT_FOLDER "NetflixCollect"
#define INPUT_FILE "NetflixCollect/netflixData.csv"
#define OUTPUT_FOLDER "HasilPengelompokan"
#define JUDUL_FOLDER "HasilPengelompokan/Judul"
#define TAHUN_FOLDER "HasilPengelompokan/Tahun"
#define LOG_FILE "log.txt"
#define CSV_FILE "NetflixCollect/netflixData.csv"
#define MAX_NEGARA 1000

pthread_mutex_t log_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t file_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t lock;

// ==================== MENU 1 ====================

void menu1() {
    char *download_link = "https://drive.google.com/uc?export=download&id=12GWsZbSH858h2HExP3x4DfWZB1jLdV-J";
    pid_t pid_download = fork();

    if (pid_download == 0) {
        char *args[] = {"/usr/bin/wget", "-O", ZIP_FILE, download_link, NULL};
        execv("/usr/bin/wget", args);
        perror("Download gagal");
        exit(1);
    } else {
        wait(NULL);
        pid_t pid_extract = fork();
        if (pid_extract == 0) {
            char *args1[] = {"/usr/bin/unzip", ZIP_FILE, "-d", EXTRACT_FOLDER, NULL};
            execv("/usr/bin/unzip", args1);
            perror("Extract gagal");
            exit(1);
        } else {
            wait(NULL);
            remove(ZIP_FILE);
            printf("Extract selesai dan file ZIP dihapus!\n");
        }
    }
}

// ==================== MENU 2 ====================

typedef struct {
    char title[256];
    char director[256];
    int release_year;
} FilmData;

void create_folder(const char *folder_name) {
    struct stat st = {0};
    if (stat(folder_name, &st) == -1) {
        mkdir(folder_name, 0755);
    }
}

void write_log(const char *activity, const char *title) {
    time_t now = time(NULL);
    struct tm *t = localtime(&now);
    char timestamp[20];
    strftime(timestamp, sizeof(timestamp), "[%H:%M:%S]", t);

    pthread_mutex_lock(&log_mutex);
    FILE *log = fopen(LOG_FILE, "a");
    if (log != NULL) {
        fprintf(log, "%s Proses mengelompokkan berdasarkan %s: sedang mengelompokkan untuk film %s\n", 
                timestamp, activity, title);
        fclose(log);
    }
    pthread_mutex_unlock(&log_mutex);
}

void* process_film(void *arg) {
    FilmData *film = (FilmData *)arg;
    char first_char = film->title[0];
    char file_judul[512], file_tahun[512];
    char formatted_text[1024];

    if (isalpha(first_char)) {
        sprintf(file_judul, "%s/%c.txt", JUDUL_FOLDER, toupper(first_char));
    } else if (isdigit(first_char)) {
        sprintf(file_judul, "%s/%c.txt", JUDUL_FOLDER, first_char);
    } else {
        sprintf(file_judul, "%s/#.txt", JUDUL_FOLDER);
    }

    sprintf(file_tahun, "%s/%d.txt", TAHUN_FOLDER, film->release_year);
    sprintf(formatted_text, "%s - %d - %s\n", film->title, film->release_year, film->director);

    pthread_mutex_lock(&file_mutex);
    FILE *fjudul = fopen(file_judul, "a");
    if (fjudul) {
        fputs(formatted_text, fjudul);
        fclose(fjudul);
    }
    pthread_mutex_unlock(&file_mutex);
    write_log("Abjad", film->title);

    pthread_mutex_lock(&file_mutex);
    FILE *ftahun = fopen(file_tahun, "a");
    if (ftahun) {
        fputs(formatted_text, ftahun);
        fclose(ftahun);
    }
    pthread_mutex_unlock(&file_mutex);
    write_log("Tahun", film->title);

    free(film);
    pthread_exit(NULL);
}

void menu2() {
    create_folder(OUTPUT_FOLDER);
    create_folder(JUDUL_FOLDER);
    create_folder(TAHUN_FOLDER);

    FILE *csv = fopen(INPUT_FILE, "r");
    if (!csv) {
        perror("Gagal membuka file CSV");
        return;
    }

    FILE *log = fopen(LOG_FILE, "w");
    if (log) fclose(log);

    char line[1024];
    fgets(line, sizeof(line), csv); // skip header

    pthread_t threads[1024];
    int thread_count = 0;

    while (fgets(line, sizeof(line), csv)) {
        FilmData *film = malloc(sizeof(FilmData));
        if (!film) continue;

        char country[256];
        sscanf(line, "%255[^,],%255[^,],%255[^,],%d", film->title, film->director, country, &film->release_year);

        if (pthread_create(&threads[thread_count++], NULL, process_film, film) != 0) {
            perror("Gagal membuat thread");
            free(film);
            continue;
        }

        if (thread_count >= 1000) {
            for (int i = 0; i < thread_count; i++) {
                pthread_join(threads[i], NULL);
            }
            thread_count = 0;
        }
    }

    for (int i = 0; i < thread_count; i++) {
        pthread_join(threads[i], NULL);
    }

    fclose(csv);
}

// ==================== MENU 3 ====================

typedef struct {
    char negara[100];
    int before_2000;
    int after_2000;
} StatFilm;

StatFilm statistik[MAX_NEGARA];
int negara_count = 0;

void write_log_stat(const char* message, const char* filename) {
    struct stat st = {0};
    if (stat(EXTRACT_FOLDER, &st) == -1) {
        mkdir(EXTRACT_FOLDER, 0700);
    }

    char fullpath[256];
    sprintf(fullpath, "%s/%s", EXTRACT_FOLDER, filename);
    
    FILE *log = fopen(fullpath, "a");
    if (!log) {
        printf("Error: Gagal membuka file log '%s' (Error: %s)\n", fullpath, strerror(errno));
        return;
    }
    fprintf(log, "%s\n", message);
    fclose(log);
}

int find_negara_index(const char *negara) {
    for (int i = 0; i < negara_count; i++) {
        if (strcmp(statistik[i].negara, negara) == 0) {
            return i;
        }
    }
    return -1;
}

void* process_statistik(void *arg) {
    FILE *csv = fopen(CSV_FILE, "r");
    if (!csv) {
        printf("Gagal membuka file CSV! (Error: %s)\n", strerror(errno));
        pthread_exit(NULL);
    }

    char line[512];
    if (!fgets(line, sizeof(line), csv)) {
        printf("File CSV kosong atau format salah!\n");
        fclose(csv);
        pthread_exit(NULL);
    } // skip header

    char *saveptr;
    while (fgets(line, sizeof(line), csv)) {
        char *token;
        char negara[100] = "Unknown";
        int year = 0;

        token = strtok_r(line, ",", &saveptr); // title
        token = strtok_r(NULL, ",", &saveptr); // director
        token = strtok_r(NULL, ",", &saveptr); // country
        if (token) {
            strncpy(negara, token, sizeof(negara)-1);
            negara[sizeof(negara)-1] = '\0';
        }
        token = strtok_r(NULL, ",\n", &saveptr); // release_year
        if (token) {
            year = atoi(token);
        }

        pthread_mutex_lock(&lock);
        int idx = find_negara_index(negara);
        if (idx == -1) {
            if (negara_count >= MAX_NEGARA) {
                printf("Warning: Batas negara tercapai\n");
                pthread_mutex_unlock(&lock);
                continue;
            }
            idx = negara_count++;
            strncpy(statistik[idx].negara, negara, sizeof(statistik[idx].negara)-1);
            statistik[idx].before_2000 = 0;
            statistik[idx].after_2000 = 0;
        }

        if (year < 2000) statistik[idx].before_2000++;
        else statistik[idx].after_2000++;

        pthread_mutex_unlock(&lock);
    }

    fclose(csv);
    pthread_exit(NULL);
}

void menu3() {
    pthread_t tid;
    time_t t = time(NULL);
    struct tm tm = *localtime(&t);
    char filename[100];
    sprintf(filename, "report_%02d%02d%04d.txt", tm.tm_mday, tm.tm_mon + 1, tm.tm_year + 1900);

    negara_count = 0;
    memset(statistik, 0, sizeof(statistik));

    pthread_mutex_init(&lock, NULL);
    pthread_create(&tid, NULL, process_statistik, NULL);
    pthread_join(tid, NULL);
    pthread_mutex_destroy(&lock);

    if (negara_count == 0) {
        write_log_stat("Tidak ada data yang diproses (file CSV tidak ditemukan atau kosong)", filename);
        printf("Tidak ada data yang diproses. File report dibuat tetapi kosong.\n");
    } else {
        for (int i = 0; i < negara_count; i++) {
            char log_message[256];
            sprintf(log_message, "%d. Negara: %s\nFilm sebelum 2000: %d\nFilm setelah 2000: %d",
                    i + 1, statistik[i].negara, statistik[i].before_2000, statistik[i].after_2000);
            write_log_stat(log_message, filename);
        }
        printf("Statistik film selesai dihitung! File: %s/%s\n", EXTRACT_FOLDER, filename);
    }
}

// ==================== MAIN ====================

int main() {
    int pilihan;
    while (1) {
        printf("\n=== Menu ===\n");
        printf("1. Download & Extract\n");
        printf("2. Kelompokkan Film\n");
        printf("3. Statistik Film\n");
        printf("0. Exit\n");
        printf("Pilihan: ");
        scanf("%d", &pilihan);

        if (pilihan == 0) return 0;
        else if (pilihan == 1) menu1();
        else if (pilihan == 2) menu2();
        else if (pilihan == 3) menu3();
    }
    return 0;
}
