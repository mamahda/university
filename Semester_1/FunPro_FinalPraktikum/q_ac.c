#include <stdio.h>
#include <math.h>
typedef long long ll;

int main()
{
    ll Ax, Ay, Az, Bx, By, Bz, Cx, Cy, Cz, rA, rB, rD;

    scanf("%lld %lld %lld", &Ax, &Ay, &Az);
    scanf("%lld %lld %lld", &Bx, &By, &Bz);
    scanf("%lld %lld %lld", &Cx, &Cy, &Cz);
    scanf("%lld %lld %lld", &rA, &rB, &rD);

    double jarakAC = sqrt((Cx - Ax) * (Cx - Ax) + (Cy - Ay) * (Cy - Ay) + (Cz - Az) * (Cz - Az));
    double jarakAB = sqrt((Bx - Ax) * (Bx - Ax) + (By - Ay) * (By - Ay) + (Bz - Az) * (Bz - Az));
    double jarakBC = sqrt((Cx - Bx) * (Cx - Bx) + (Cy - By) * (Cy - By) + (Cz - Bz) * (Cz - Bz));

    double jarakABC = jarakAB + jarakBC;

    if (rA * rD >= jarakAC)
    {
        printf("NAH ID WIN, NO NEED TO STOP\n");
    }
    else
    {
        if ((rA + rB) * rD >= jarakABC)
        {
            printf("HHM BETTER TAKE ROCKET, STILL CAN WIN\n");
        }
        else
        {
            printf("GIVE UP ALREADY, MINING BETTER\n");
        }
    }

    return 0;
}