#include <iostream>
#include <string> // To handle string inputs for validation

using namespace std;

// Overloaded functions for summing different numbers of integers
int add(int a, int b)
{
    return a + b;
}

int main()
{
    int x[5] = {0}; // Initialize the array with zeros
    int i = 0;
    string input;

    cout << "Type a maximum of 5 integers or type 'done' to finish.\n";

    // Loop to accept input
    while (i < 5)
    {
        cin >> input;

        // Check if the input is "done"
        if (input == "done")
        {
            break;
        }

        // Try to convert input to an integer
        try
        {
            x[i] = stoi(input); // Convert string to integer
            i++;
        }
        catch (invalid_argument &)
        {
            cout << "Invalid input. Please enter an integer or 'done'.\n";
        }
    }

    // Calculate and print the sum based on the number of valid inputs
    if (i == 0)
    {
        cout << "The sum is 0" << endl;
    }
    else if (i == 1)
    {
        cout << "The sum is " << x[0] << endl;
    }
    else if (i == 2)
    {
        cout << "The sum is " << add(x[0], x[1]) << endl;
    }
    else if (i == 3)
    {
        cout << "The sum is " << add(add(x[0], x[1]), x[2]) << endl;
    }
    else if (i == 4)
    {
        cout << "The sum is " << add(add(add(x[0], x[1]), x[2]), x[3]) << endl;
    }
    else if (i == 5)
    {
        cout << "The sum is " << add(add(add(add(x[0], x[1]), x[2]), x[3]), x[4]) << endl;
    }

    return 0;
}
