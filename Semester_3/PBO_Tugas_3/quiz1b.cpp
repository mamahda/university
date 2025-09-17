#include <stdio.h>
#include <string.h>
using namespace std;

#define MAXT 1000
#define MAXN 1000
#define MAXID 1000000

int studentID[MAXID + 1];
int teamMember[MAXT + 1][MAXN + 5];
int head[MAXT + 1], tail[MAXT + 1];
int tQueue[MAXT + 5];
int tqHead = 0, tqTail = 0;
char inQueue[MAXT + 1];

int main()
{
    int t;
    scanf("%d", &t);

    for (int i = 1; i <= t; i++)
    {
        int n;
        scanf("%d", &n);
        for (int j = 0; j < n; j++)
        {
            int s;
            scanf("%d", &s);
            studentID[s] = i;
        }
        head[i] = tail[i] = 0;
        inQueue[i] = 0;
    }

    char cmd[10];
    while (scanf("%s", cmd) != EOF)
    {
        if (strcmp(cmd, "ENQUEUE") == 0)
        {
            int ID;
            scanf("%d", &ID);
            int tid = studentID[ID];
            if (!inQueue[tid])
            {
                tQueue[tqTail++] = tid;
                inQueue[tid] = 1;
            }
            teamMember[tid][tail[tid]++] = ID;
        }
        else
        {
            int tid = tQueue[tqHead];
            int student = teamMember[tid][head[tid]++];
            printf("%d\n", student);
            if (head[tid] == tail[tid])
            {
                tqHead++;
                inQueue[tid] = 0;
                head[tid] = tail[tid] = 0;
            }
        }
    }
    return 0;
}
