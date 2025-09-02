#include <bits/stdc++.h>
using namespace std;

int trapped(vector<int> &tumpukan)
{
  if (tumpukan.size() <= 2)
    return 0;
  int n = tumpukan.size(), maxLeft = tumpukan[0], maxRight = tumpukan[n - 1];
  int left = 1, right = n - 2, ans = 0;
  while (left <= right)
  {
    if (maxLeft < maxRight)
    {
      if (tumpukan[left] > maxLeft)
        maxLeft = tumpukan[left];
      else
        ans += maxLeft - tumpukan[left];
      left += 1;
    }
    else
    {
      if (tumpukan[right] > maxRight)
        maxRight = tumpukan[right];
      else
        ans += maxRight - tumpukan[right];
      right -= 1;
    }
  }
  return ans;
}

int main()
{
  vector<int> tumpukan;
  int n;
  cin >> n;
  for (int i = 0; i < n; i++)
  {
    int temp;
    cin >> temp;
    tumpukan.push_back(temp);
  }

  int ans = trapped(tumpukan);
  
  cout << ans << endl;

  return 0;
}