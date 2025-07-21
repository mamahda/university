#include <bits/stdc++.h>
using namespace std;

void print(queue<int>& q)
{
  queue<int> temp = q;
    while (!temp.empty()) {
        cout << temp.front() << " ";
        temp.pop();
    }
}

void reverse(queue<int> &q)
{
  stack<int> s;
  while (!q.empty())
  {
    s.push(q.front());
    q.pop();
  }
  while (!s.empty())
  {
    q.push(s.top());
    s.pop();
  }
}

int main()
{
  queue<int> q;
  int n;
  cin >> n;
  for (int i = 0; i < n; i++)
  {
    string cmd;
    cin >> cmd;
    if (cmd == "depan")
    {
      if (q.empty())
      {
        cout << endl;
        continue;
      }
      int x = q.front();
      cout << x << endl;
      q.pop();
    }
    else if (cmd == "belakang")
    {
      if (q.empty())
      {
        cout << endl;
        continue;
      }
      int x = q.back();
      cout << x << endl;
      reverse(q);
      q.pop();
      reverse(q);
      
    }
    else if (cmd == "tambahDepan")
    {
      int x;
      cin >> x;
      reverse(q);
      q.push(x);
      reverse(q);
    }
    else if (cmd == "tambahBelakang")
    {
      int x;
      cin >> x;
      q.push(x);
    }
    else if (cmd == "balik")
    {
      reverse(q);
    }
  }
}