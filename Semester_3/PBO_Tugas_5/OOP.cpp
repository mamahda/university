#include <stdio.h>
#include <vector>
#include <algorithm>
using namespace std;

template<typename T>
T getNum(){
  T res = 0, b = 0;
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

class Jobs {
private:
  int t1, t2;

public:
  Jobs (int a, int b): t1(a), t2(b) {}
  int getPacking() { return t1; }
  int getDelivery() { return t2; }
  bool operator < (const Jobs &b) const {
    return min(t1, b.t2) < min(t2, b.t1);
  }
};

int main(){
  int i, n, temp1[305], temp2[305], packing, res;
  vector<Jobs> v_jobs;

  n = getNum<int>();
  for(i = 0; i < n; i++) temp1[i] = getNum<int>();
  for(i = 0; i < n; i++) temp2[i] = getNum<int>();
  for(i = 0; i < n; i++) {
    Jobs temp (temp1[i], temp2[i]);
    v_jobs.push_back(temp);
  }
  packing = 0; res = 0;
  sort(v_jobs.begin(), v_jobs.end());
  for(i = 0; i < n; i++){
    packing += v_jobs[i].getPacking();
    if(packing > res) res = packing;
    res += v_jobs[i].getDelivery();
  } 

  printf("%d\n", res);

  return 0;
}
