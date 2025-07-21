#include <iostream>
#include <algorithm>

using namespace std;

int main()
{
    int a, sizepattern;
    string input;
    string pattern;

    cout << "String: ";
    cin >> input;
    cout << "Pattern: ";
    cin >> pattern;

    sizepattern = pattern.size();

    cout << "Anagram: " << endl;

    // Loop through the input string to get all substrings of size equal to pattern
    for (a = 0; a <= input.size() - sizepattern; a++)
    {
        string substring = input.substr(a, sizepattern);

        // Check if the substring is a permutation of the pattern
        if (is_permutation(substring.begin(), substring.end(), pattern.begin()))
        {
            cout << substring << " at index " << a << endl;
        }
    }

    return 0;
}
