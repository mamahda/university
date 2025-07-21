#include <stdio.h>
#include <string.h>
#include <stdbool.h>

int main()
{
    char word[99999];
    printf("Enter a word or sentence: ");
    gets(word);

    bool palindrome = 1;
    for (int i = 0; i < (strlen(word) / 2); i++)
    {
        if (word[i] ^ word[strlen(word) - i - 1])
        {
            printf("It is not a palindrome");
            return 0;
        }
    }
    printf("It is a palindrome");
}