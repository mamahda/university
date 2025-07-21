#include <stdio.h>
#include <string.h>

int getPrecedence(char key)
{
    switch (key)
    {
    case 'q':
        return 1;
    case 'w':
        return 2;
    case 'e':
        return 3;
    case 'r':
        return 4;
    case 't':
        return 5;
    case 'y':
        return 6;
    case 'u':
        return 7;
    case 'i':
        return 8;
    case 'o':
        return 9;
    case 'p':
        return 10;
    case 'a':
        return 11;
    case 's':
        return 12;
    case 'd':
        return 13;
    case 'f':
        return 14;
    case 'g':
        return 15;
    case 'h':
        return 16;
    case 'j':
        return 17;
    case 'k':
        return 18;
    case 'l':
        return 19;
    case 'z':
        return 20;
    case 'x':
        return 21;
    case 'c':
        return 22;
    case 'v':
        return 23;
    case 'b':
        return 24;
    case 'n':
        return 25;
    case 'm':
        return 26;
    default:
        return -1;
    }
}

void swap(char *a, char *b)
{
    char temp = *a;
    *a = *b;
    *b = temp;
}

int main()
{
    char str[100001];
    scanf("%s", str);
    long long i = strlen(str) - 2;

    while (i >= 0 && getPrecedence(str[i]) >= getPrecedence(str[i + 1]))
    {
        i--;
    }

    if (i < 0)
    {
        for (long long i = 0; i < strlen(str) / 2; i++)
        {
            swap(&str[i], &str[strlen(str) - i - 1]);
        }
    }
    else
    {
        long long j = strlen(str) - 1;
        while (getPrecedence(str[j]) <= getPrecedence(str[i]))
        {
            j--;
        }

        swap(&str[i], &str[j]);

        int left = i + 1;
        int right = strlen(str) - 1;
        while (left < right)
        {
            swap(&str[left], &str[right]);
            left++;
            right--;
        }
    }
    printf("%s", str);
}