#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main()
{
    char word[21];
    char biner[6][6][10];
    char ascii[6][6];

    // Read binary strings and convert to ASCII characters
    for (int i = 0; i < 5; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            scanf("%s", biner[i][j]);
            ascii[i][j] = (char)strtol(biner[i][j], NULL, 2); // Convert binary to char
        }
    }

    for (int i = 0; i < 5; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            printf("%c ", ascii[i][j]);
        }
        printf("\n");
    }

    return 0;
}