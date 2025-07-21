#include <stdio.h>
#include <string.h>

int main()
{
    char str1[100];
    char str2[100];
    int t, n = 0, temp = 1;
    scanf("%d", &t);
    scanf("%s", str1);
    int len = strlen(str1);
    for (int i = 0; i < len; i++)
    {
        if (str1[i] == '_')
        {
            str2[n] = ' ';
        }
        else
        {
        }

        str2[n] = str1[i];
        n += t;
        if (n >= len)
        {
            n = temp;
            temp++;
        }
    }
    for (int i = 0; i < len; i++)
    {
        printf("%c", str2[i]);
    }
}