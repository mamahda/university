#include <iostream>
#include <math.h>
using namespace std;

int jumlah_faktor(int n){
  if(n == 1) return 0;
  int sr = sqrt(n), sum = 1, other;
  for (int i = 2; i < sr; i++)
  {
    if(n % i == 0){
      sum += i;
      other = n / i;
      if(sum != i) sum += other;   
    }
  }
  return sum;
}

int main() {
  ios_base::sync_with_stdio(0);
  cin.tie(0);
  cout.tie(0);

  int a, b, m, n;
  cin >> m >> n;

  bool found = 0;
  for (int i = m; i <= n; i++)
  {
    b = jumlah_faktor(i);
    if(b > i && b >= m && b <= n)
    { 
      if(jumlah_faktor(b) == i){
        cout << i << " " << b << endl;
        found = 1;
      }
    }
    
  }

  if(!found) cout << "Absent" << endl; 
  
  return 0;
}