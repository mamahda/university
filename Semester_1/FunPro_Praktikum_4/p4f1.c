#include <stdio.h>

typedef struct
{
    char name[100];
    char trainer[100];
    int hp;
    int attack;
    int defense;
    int speed;
} monster;

int main()
{
    int n, power, max = 0, ans;
    scanf("%d", &n);
    monster pokemon[n];
    for (int i = 0; i < n; i++)
    {
        scanf("%s %s %d %d %d %d", pokemon[i].trainer, pokemon[i].name, &pokemon[i].hp, &pokemon[i].attack, &pokemon[i].defense, &pokemon[i].speed);
        power = (pokemon[i].hp + pokemon[i].attack + pokemon[i].defense + pokemon[i].speed) / 4;
        // printf("%d\n", power);
        if (power > max)
        {
            max = power;
            ans = i;
        }
    }
    printf("%s wins! %s said ez", pokemon[ans].name, pokemon[ans].trainer);
}