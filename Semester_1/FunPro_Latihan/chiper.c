#include <stdio.h>
#include <string.h>

int main()
{
    int k;
    char word[10001];
    scanf("%s", &word);
    scanf("%d", &k);
    for (int i = 0; i < strlen(word); i++)
    {
        if (word[i] > 64 && word[i] < 91)
        {
            if (word[i] + k > 91)
            {
                word[i] = word[i] + k - 26;
            }
            word[i] = word[i] + k;
        }
        else if (word[i] > 96 && word[i] < 123)
        {
            if (word[i] + k > 122)
            {
                word[i] = word[i] - 26;
            }
            word[i] = word[i] + k;
        }
    }
    printf("%s", word);
}