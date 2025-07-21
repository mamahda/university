#include <bits/stdc++.h>
using namespace std;

int main()
{
  string s;
  cin >> s;

  map<char, int> freq;
  
  for (char c : s)
  {
    freq[c]++;
  }

  for (int i = 0; i < s.length(); i++)
  {
    if (freq[s[i]] == 1)
    {
      cout << i << endl;
      return 0;
    }
  }

  cout << "-1" << endl;

  return 0;
}