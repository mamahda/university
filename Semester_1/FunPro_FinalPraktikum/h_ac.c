#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

int blocked(char temp[], char wk[], char wq[], char bk[], char bq[])
{
    return (strcmp(temp, wk) == 0 || strcmp(temp, wq) == 0 || strcmp(temp, bk) == 0 || strcmp(temp, bq) == 0);
}

int checkpath(char king[], char queen[], char wk[], char wq[], char bk[], char bq[])
{
    char temp[3];
    int vx, vy;

    if (king[0] > queen[0])
    {
        vx = 1;
    }
    else if (king[0] < queen[0])
    {
        vx = -1;
    }
    else
    {
        vx = 0;
    }

    if (king[1] > queen[1])
    {
        vy = 1;
    }
    else if (king[1] < queen[1])
    {
        vy = -1;
    }
    else
    {
        vy = 0;
    }

    for (char qx = queen[0] + vx, qy = queen[1] + vy; qx != king[0] || qy != king[1]; qx += vx, qy += vy)
    {
        temp[0] = qx;
        temp[1] = qy;

        if (blocked(temp, wk, wq, bk, bq))
        {
            return 0;
        }
    }
    return 1;
}

int checked(char king[], char queen[], char wk[], char wq[], char bk[], char bq[])
{
    if ((king[0] == queen[0]) || (king[1] == queen[1]) || (abs(king[0] - queen[0]) == abs(king[1] - queen[1])))
    {
        return checkpath(king, queen, wk, wq, bk, bq);
    }
    return 0;
}

void chessChecker(char wk[], char wq[], char bk[], char bq[], char x)
{
    if (x == 'w')
    {
        if (checked(bk, wq, wk, wq, bk, bq))
        {
            printf("White checked Black!\n");
        }
        else
        {
            printf("Game is still going!\n");
        }
    }
    else if (x == 'b')
    {
        if (checked(wk, bq, wk, wq, bk, bq))
        {
            printf("Black checked White!\n");
        }
        else
        {
            printf("Game is still going!\n");
        }
    }
}

int main()
{
    char wk[3], wq[3], bk[3], bq[3], x;

    scanf("%s %s", wk, wq);
    scanf("%s %s", bk, bq);
    scanf(" %c", &x);

    chessChecker(wk, wq, bk, bq, x);

    return 0;
}
