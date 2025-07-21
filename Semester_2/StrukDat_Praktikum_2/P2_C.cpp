#include <bits/stdc++.h>
using namespace std;

int main(){
  map<int, int> m;

  int n, x;
  cin >> n >> x;
  for (int i = 0; i < x; i++)
  {
    int temp;
    cin >> temp;
    m[temp]++;
  }
  int max = m[1], maxi = 1;
  for (int i = 2; i <= n; i++)
  {
    if(max < m[i]){
      max = m[i];
      maxi = i;
    }
  }

  int index = 0;
  if(x % 2 == 1) index = x/2;
  else index = x/2-1;
  int tengah = 0;
  while(index >= 0){
    tengah++;
    index -= m[tengah];
  }

  cout << maxi << " " << tengah;
  if(tengah == maxi) cout << endl << "Tidak ada yang menang" << endl;
  else cout << endl << "Distrik " << maxi << " menang";
}