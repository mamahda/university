#include <cstdio>
#include <cstring>
#include <deque>
using namespace std;

int getNum(){
  int res = 0, b = 0;
  char c;

  while(1){
    c=getchar_unlocked();
    if(c == '-') b = 1;
    if(c == ' ' || c == '\n') continue;
    else break;
  }

  if(c!='-') res = c - '0';
  while(1){
    c=getchar_unlocked();
    if(c >= '0' && c <= '9') res = 10 * res + c - '0';
    else break;
  }

  if(b == 1) res *= -1;
  return res;
}

int main(){
  int t, n, k;
  int arr[10001];
  int ans[10001];

  t = getNum();
  while (t--) {
    int n, k;
    n = getNum();
    k = getNum();

    for (int i = 0; i < n; i++) arr[i] = getNum();

    deque<int> dq;  
    int idx = 0;   

    for (int i = 0; i < n; i++) {
      while (!dq.empty() && arr[dq.back()] <= arr[i])
        dq.pop_back();

      dq.push_back(i);

      if (dq.front() <= i - k)
        dq.pop_front();

      if (i >= k - 1) {
        ans[idx++] = arr[dq.front()];
      }
    }

    for (int i = 0; i < idx; i++) {
      printf("%d ", ans[i]);
    }
    printf("\n");
  }
  return 0;
}
