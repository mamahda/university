#include <bits/stdc++.h>
#define ll long long
using namespace std;

int main()
{
  stack<ll> s;
  ll total = 0;
  while (true)
  {
    string cmd;
    cin >> cmd;
    if (cmd.empty())
      break;

    if (cmd == "+")
    {
      ll n = s.top();
      s.pop();
      ll m = s.top();
      s.pop();
      s.push(m);
      s.push(n);
      s.push(n + m);
    }
    else if (cmd == "C")
    {
      s.pop();
    }
    else if (cmd == "D")
    {
      ll temp = s.top();
      temp = temp * 2;
      s.push(temp);
    }
    else
    {
      ll n = stoi(cmd);
      s.push(n);
    }
  }

  while (!s.empty())
  {
    total += s.top();
    s.pop();
  }
  cout << total << endl;
}