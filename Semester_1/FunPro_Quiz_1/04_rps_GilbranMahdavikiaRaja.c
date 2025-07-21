#include <stdio.h>
// 5025241134 Gilbran Mahdavikia Raja
int main()
{
    int player1 = 0, player2 = 0;
    while (player1 != 1 && player1 != 2 && player1 != 3)
    {
        printf("Input player 1 move: ");
        scanf("%d", &player1);
    }
    while (player2 != 1 && player2 != 2 && player2 != 3)
    {
        printf("Input player 2 move: ");
        scanf("%d", &player2);
    }

    if (player1 == 1)
    {
        if (player2 == 2)
        {
            printf("Player 2 win!");
        }
        else if (player2 == 3)
        {
            printf("Player 1 win!");
        }
        else
        {
            printf("Draw!");
        }
    }
    if (player1 == 2)
    {
        if (player2 == 3)
        {
            printf("Player 2 win!");
        }
        else if (player2 == 1)
        {
            printf("Player 1 win!");
        }
        else
        {
            printf("Draw!");
        }
    }
    if (player1 == 3)
    {
        if (player2 == 1)
        {
            printf("Player 2 win!");
        }
        else if (player2 == 2)
        {
            printf("Player 1 win!");
        }
        else
        {
            printf("Draw!");
        }
    }
}