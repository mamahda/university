#include <stdio.h>

int determinan(int matriks[3][3])
{
    return matriks[0][0] * (matriks[1][1] * matriks[2][2] - matriks[1][2] * matriks[2][1]) - matriks[0][1] * (matriks[1][0] * matriks[2][2] - matriks[1][2] * matriks[2][0]) + matriks[0][2] * (matriks[1][0] * matriks[2][1] - matriks[1][1] * matriks[2][0]);
}

int main()
{
    int matriks[3][3];
    printf("Enter the matrix\n");

    for (int i = 0; i < 3; i++)
    {
        for (int j = 0; j < 3; j++)
        {
            scanf("%d", &matriks[i][j]);
        }
    }

    printf("The matrix:\n");
    for (int i = 0; i < 3; i++)
    {
        for (int j = 0; j < 3; j++)
        {
            printf("%d ", matriks[i][j]);
        }
        printf("\n");
    }

    int d = determinan(matriks);
    printf("Matrix determinant: %d\n", d);

    if (d == 0)
    {
        printf("Matrix is not invertible");
    }
    else
    {
        printf("Matrix is invertible");
    }
}