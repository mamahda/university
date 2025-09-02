#include <bits/stdc++.h>
using namespace std;

int main()
{
  map<string, int> buah;
  int n;
  cin >> n;
  for (int i = 0; i < n; i++)
  {
    string cmd, nama;
    int stock;
    cin >> cmd >> nama >> stock;
    bool found = false;
    if (cmd == "ADD")
    {
      buah[nama] += stock;
    }
    else if (cmd == "SELL"){
      for (auto item : buah){
        if (item.first == nama)
        {
          found = true;
          break;
        }
      }
      if (found)
      {
        if (buah[nama] >= stock)
        {
          buah[nama] -= stock;
          cout << "SUCCESS" << endl;
        }
        else
        {
          cout << "not enough stock" << endl;
        }
      }
      else
      {
        cout << "item not found" << endl;
      }
    }
  }
}