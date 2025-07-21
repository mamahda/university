#include <stdio.h>
// 5025241134 Gilbran Mahdavikia Raja
int main()
{
    int answer;
    int guess;
    printf("Input your Answer: ");
    scanf("%d", &answer);
    while (answer != guess)
    {
        printf("Input your Guess: ");
        scanf("%d", &guess);
        if (guess > answer)
        {
            printf("Your guess is too high!\n");
        }
        else if (guess < answer)
        {
            printf("Your guess is too low!\n");
        }
        else if (guess == answer)
        {
            printf("Congratulations! Your guess is correct!\n");
        }
    }
}