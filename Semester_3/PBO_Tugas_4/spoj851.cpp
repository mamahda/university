#include <stdio.h>
#include <cstdio>
#include <queue>
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
  int t, p, num, res, kth;

  t = getNum();
  while(t--){
    priority_queue<int> list;

    p = getNum();
    kth = getNum();

    for(int i = 0; i < p; i++){
      num = getNum();

      if(num == 0){
        if(list.size() < kth) res = -1;
        else res = list.top();
        printf("%d\n", res);
      }
      else {
        if(list.size() < kth) list.push(num);
        else if(list.size() == kth && num < list.top()){
          list.pop();
          list.push(num);
        }
      }
    }
  }

  return 0;
}
