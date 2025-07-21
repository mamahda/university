#include <bits/stdc++.h>
using namespace std;

bool isBST(vector<int>& preorder) {
  stack<int> s;
  int root = INT_MIN;

  for (int x : preorder) {
    if (x < root) {
      return false;
    }

    while (!s.empty() && s.top() < x) {
      root = s.top();
      s.pop();
    }

    s.push(x);
  }

  return true;
}

int main() {
  vector<int> preorder;
  int n;
  cin >> n;
  for (int i = 0; i < n; i++) {
    int temp;
    cin >> temp;
    preorder.push_back(temp);
  }

  if (isBST(preorder)) {
    cout << "ini pohon" << endl;
  } else {
    cout << "ini bukan pohon" << endl;
  }

}
