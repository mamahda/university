#include <stdio.h>
#include <string.h>

char status[3][20] = {"Baik", "Rusak", "Tidak_Berfungsi"};

typedef struct
{
    int id;
    char nama[11];
    int status_id;
}
robot;

int cari(robot robot_list[], int input_id, int n)
{
    for(int i = 0; i < n; ++i){
        if(robot_list[i].id == input_id)
            return i;
    }
    return -1;
}

int main()
{
    int n, m;
    scanf("%d", &n);
    robot robot_list[n];

    for(int i = 0; i < n; ++i){
        char input_status[20];
        scanf("%d %s %s", &robot_list[i].id, robot_list[i].nama, input_status);

        for(int j = 0; j < 3; ++j){
            if(strcmp(input_status, status[j]) == 0){
                robot_list[i].status_id = j;
                break;
            }
        }
    }
    scanf("%d", &m);

    for(int i = 0; i < m; ++i)
    {
        char cmd[11];
        int input_id;
        scanf(" %s %d", cmd, &input_id);

        int index = cari(robot_list, input_id, n);

        if(index == -1)
            printf("Robot %d tidak ditemukan\n", input_id);
        else {
            int cur_status = robot_list[index].status_id;
            char cur_nama[11];
            strcpy(cur_nama, robot_list[index].nama);

            if(strcmp(cmd, "CEK") == 0){
                printf("Robot %s berstatus %s\n", cur_nama, status[cur_status]);
            }
            else if(strcmp(cmd, "PERBAIKI") == 0){
                if(cur_status == 0){ // Baik
                    printf("Robot %s dalam kondisi baik\n", cur_nama);
                }
                else if(cur_status == 1){ // Rusak
                    printf("Robot %s berhasil diperbaiki\n", cur_nama);
                    robot_list[index].status_id = 0;
                }
                else { // Tidak_Berfungsi
                    printf("Robot %s sudah tidak dapat diperbaiki\n", cur_nama);
                }
            }
            else { // BUANG
                if(cur_status == 0){ // Baik
                    printf("Robot %s dalam kondisi baik\n", cur_nama);
                }
                else if(cur_status == 1){ // Rusak
                    printf("Robot %s masih dapat diperbaiki\n", cur_nama);
                }
                else { // Tidak_Berfungsi
                    printf("Robot %s berhasil dibuang\n", cur_nama);
                    robot_list[index].id = -1;
                }
            }
        }
    }
    int ct[3] = {0, 0, 0};

    for(int i = 0; i < n; ++i){
        if(robot_list[i].id != -1)
            ct[robot_list[i].status_id]++;
    }
    for(int i = 0; i < 3; ++i){
        printf("%s: %d\n", status[i], ct[i]);
    }
    return 0;
}
