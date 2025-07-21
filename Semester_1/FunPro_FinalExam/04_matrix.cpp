#include <iostream>
#include <vector>

using namespace std;

int main()
{
    int m, n, p, q;

    // Input dimensions of the first matrix
    cout << "Enter the dimensions of the first matrix (rows columns): ";
    cin >> m >> n;

    vector<vector<int>> matrix1(m, vector<int>(n));

    // Input elements of the first matrix
    cout << "Enter the elements of the first matrix:" << endl;
    for (int i = 0; i < m; i++)
    {
        for (int j = 0; j < n; j++)
        {
            cin >> matrix1[i][j];
        }
    }

    // Input dimensions of the second matrix
    cout << "Enter the dimensions of the second matrix (rows columns): ";
    cin >> p >> q;

    vector<vector<int>> matrix2(p, vector<int>(q));

    // Input elements of the second matrix
    cout << "Enter the elements of the second matrix:" << endl;
    for (int i = 0; i < p; i++)
    {
        for (int j = 0; j < q; j++)
        {
            cin >> matrix2[i][j];
        }
    }

    // Check if the matrices can be multiplied
    if (n != p)
    {
        cout << "Error: The matrices cannot be multiplied. The number of columns of the first matrix must be equal to the number of rows of the second matrix." << endl;
        return 1;
    }

    // Initialize the result matrix with the correct size
    vector<vector<int>> result(m, vector<int>(q, 0));

    for (int i = 0; i < m; i++)
    {
        for (int j = 0; j < q; j++)
        {
            for (int k = 0; k < n; k++)
            {
                result[i][j] += matrix1[i][k] * matrix2[k][j];
            }
        }
    }

    // Output the result matrix
    cout << "Product of the matrices:" << endl;
    for (int i = 0; i < m; i++)
    {
        for (int j = 0; j < q; j++)
        {
            cout << result[i][j] << " ";
        }
        cout << endl;
    }

    return 0;
}
