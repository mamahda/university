#include <stdio.h>
#include <string.h>

int main()
{
    int n;
    char s[1001];
    scanf("%d\n", &n);
    gets(s);
    for (int i = 0; i < strlen(s); i++)
    {
        if (s[i] == 32)
        {
            continue;
        }
        if (s[i] + n > 96 && s[i] + n < 123)
        {
            s[i] = s[i] + n;
        }
        else if (s[i] + n < 97)
        {
            s[i] = s[i] + n + 26;
        }
        else if (s[i] + n > 122)
        {
            s[i] = s[i] + n - 26;
        }
    }
    printf("%s", s);
}