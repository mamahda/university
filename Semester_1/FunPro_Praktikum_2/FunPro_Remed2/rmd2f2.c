#include <stdio.h>
#include <string.h>

int main()
{
    char s[100001];
    gets(s);
    int freq[123];
    for (int i = 0; i < strlen(s); i++)
    {
        if (s[i] == 32)
        {
            continue;
        }
        freq[s[i]]++;
    }
    int modus = freq[97];
    char index = 'a';
    for (int i = 97; i <= 122; i++)
    {
        char temp = i;
        if (freq[i] != 0)
        {
            printf("%c: %d\n", temp, freq[i]);
        }

        if (modus < freq[i])
        {
            modus = freq[i];
            index = i;
        }
    }
    if (modus > 0)
    {
        printf("Most frequent character: %c with count: %d", index, modus);
    }
    else
    {
        printf("hmmm, i don't have anything to show");
    }
}