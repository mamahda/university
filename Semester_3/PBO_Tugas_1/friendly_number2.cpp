#include <iostream>
#include <vector>
using namespace std;

int main() {
  ios_base::sync_with_stdio(0);
  cin.tie(0);
  cout.tie(0);

  int m, n;
  cin >> m >> n;
  vector<int> jumlah_faktor(n + 1, 0);

  for (int i = 1; i <= n / 2; i++){
    for (int j = 2 * i; j <= n; j += i){
      jumlah_faktor[j] += i;
    }
  }

  bool found = false;
  for (int a = m; a <= n; a++)  {
    int b = jumlah_faktor[a];
    if (b > a && b <= n && b >= m){
      if (jumlah_faktor[b] == a){
        cout << a << " " << b << endl;
        found = true;
      }
    }
  }

  if (!found) cout << "Absent" << endl;
  return 0;
}
