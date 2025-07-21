#include <stdio.h>
#include <stdbool.h>
#include <string.h>

bool isStrong = true;

// MULAI NGODING DARI SINI
// YOUR CODE STARTS HERE

bool CheckNumber(char password[])
{
    for (int i = 0; i < strlen(password); i++)
    {
        if (password[i] > 47 && password[i] < 58)
        {
            return 1;
        }
    }
    isStrong = 0;
    return 0;
}

bool CheckUppercase(char password[])
{
    for (int i = 0; i < strlen(password); i++)
    {
        if (password[i] < 91 && password[i] > 64)
        {
            return 1;
        }
    }
    isStrong = 0;
    return 0;
}

bool CheckKey(char password[], int key)
{
    int sum = 0;
    for (int i = 0; i < strlen(password); i++)
    {
        if (password[i] > 47 && password[i] < 58)
        {
            if (password[i] == '0')
            {
                sum += 0;
            }
            else if (password[i] == '1')
            {
                sum += 1;
            }
            else if (password[i] == '2')
            {
                sum += 2;
            }
            else if (password[i] == '3')
            {
                sum += 3;
            }
            else if (password[i] == '4')
            {
                sum += 4;
            }
            else if (password[i] == '5')
            {
                sum += 5;
            }
            else if (password[i] == '6')
            {
                sum += 6;
            }
            else if (password[i] == '7')
            {
                sum += 7;
            }
            else if (password[i] == '8')
            {
                sum += 8;
            }
            else if (password[i] == '9')
            {
                sum += 9;
            }
        }
    }
    if (sum == key)
    {
        return 1;
    }

    isStrong = 0;
    return 0;
}
// NGODING SAMPE SINI, mengedit kode di bawah adalah tindakan ilegal
// YOUR CODE ENDS HERE, editing codes below is illegal

int main()
{
    char password[128];
    int key;
    scanf("%s %d", password, &key);
    if (!CheckNumber(password))
        printf("Password needs number\n");
    if (!CheckUppercase(password))
        printf("Password requires at least one uppercase letter\n");
    if (!CheckKey(password, key))
        printf("Digits in password not equal to key\n");
    if (isStrong)
        printf("Password is strong, just like you\n");
    else
        printf("Weak password, fix your mistakes\n");
}