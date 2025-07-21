#include <stdio.h>
#include <string.h>

int main()
{
    char str[512];
    scanf("%s", str);
    int len = strlen(str);
    int tes = 1;
    for (int i = 0, j = len - 1; i < len, j >= 0; i++, j--)
    {
        if (str[i] != str[j])
            tes = 0;
    }
    if (tes)
        printf("PALINDROME");
    else
        printf("BUKAN PALINDROME");
}