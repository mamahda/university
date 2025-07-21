#include <stdio.h>

int main()
{
    int boyHP = 200;
    int boyA;
    int goblin1 = 165;
    int goblin2 = 165;
    int goblin3 = 165;
    int turn = 1;

    while (goblin1 > 0 || goblin2 > 0 || goblin3 > 0 && boyHP > 0)
    {
        if (turn % 3 == 0)
        {
            boyA = 20;
        }
        else
        {
            boyA = 10;
        }
        printf("turn %d\n", turn);
        if (goblin1 > 0)
        {
            goblin1 -= boyA;
            printf("boy attacked goblin 1 for %d damage; goblin 1 hp: %d\n", boyA, goblin1);
        }
        else if (goblin2 > 0)
        {
            goblin2 -= boyA;
            printf("boy attacked goblin 2 for %d damage; goblin 2 hp: %d\n", boyA, goblin2);
        }
        else if (goblin3 > 0)
        {
            goblin3 -= boyA;
            printf("boy attacked goblin 3 for %d damage; goblin 3 hp: %d\n", boyA, goblin3);
        }
        if (goblin1 > 0)
        {

            boyHP -= 3;
            printf("goblin 1 attacked boy for 3 damage; boy hp: %d\n", boyHP);
            boyHP -= 4;
            printf("goblin 2 attacked boy for 4 damage; boy hp: %d\n", boyHP);
            boyHP -= 1;
            printf("goblin 3 attacked boy for 1 damage; boy hp: %d\n", boyHP);
        }
        else if (goblin2 > 0)
        {

            boyHP -= 4;
            printf("goblin 2 attacked boy for 4 damage; boy hp: %d\n", boyHP);
            boyHP -= 1;
            printf("goblin 3 attacked boy for 1 damage; boy hp: %d\n", boyHP);
        }
        else if (goblin3 > 0)
        {

            boyHP -= 1;
            printf("goblin 3 attacked boy for 1 damage; boy hp: %d\n", boyHP);
        }
        turn++;
    }
}