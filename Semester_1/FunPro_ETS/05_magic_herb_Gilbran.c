#include <stdio.h>
int main()
{
    int tes = 0;
    int n[15] = {94, 222, 221, 186, 181, 208, 207, 110, 187, 185, 17, 212, 115, 215, 100};
    for (int i = 14; i > 0; i--)
    {
        int temp1;
        int temp2;
        int tempN;

        temp1 = n[i - 1];
        temp2 = n[i];
        temp1 += temp2;
        if (temp1 >= 65 && temp1 <= 122)
        {
            tes = 1;
            tempN = temp1;
        }

        temp1 = n[i - 1];
        temp2 = n[i];
        temp1 -= temp2;
        if (temp1 >= 65 && temp1 <= 122)
        {
            tes = 1;
            tempN = temp1;
        }

        temp1 = n[i - 1];
        temp2 = n[i];
        temp1 = (temp1 * 2) - temp2;
        if (temp1 >= 65 && temp1 <= 122)
        {
            tes = 1;
            tempN = temp1;
        }

        temp1 = n[i - 1];
        temp2 = n[i];
        temp1 = ((temp1 - 3) * 2) + temp2;
        if (temp1 >= 65 && temp1 <= 122)
        {
            tes = 1;
            tempN = temp1;
        }

        if (tes == 1)
        {
            n[i - 1] = tempN;
        }
    }

    for (int i = 0; i < 14; i++)
    {
        printf("%c\n", n[i]);
    }
}