#include <stdio.h>
#include <vector>
#include <algorithm>
using namespace std;


typedef struct Struct_Jobs{
  int t1, t2;
} jobs;

bool comp(jobs a, jobs b){
  return min(a.t1, b.t2) < min(a.t2, b.t1);
}

int main(){
  int i, n, temp1[305], temp2[305], packing, res;
  vector<jobs> v_jobs;

  scanf("%d", &n);
  for(i = 0; i < n; i++) scanf("%d", &temp1[i]);
  for(i = 0; i < n; i++) scanf("%d", &temp2[i]);
  for(i = 0; i < n; i++) {
    jobs temp;
    temp.t1 = temp1[i];
    temp.t2 = temp2[i];
    v_jobs.push_back(temp);
  }
  packing = 0; res = 0;
  sort(v_jobs.begin(), v_jobs.end(), comp);
  for(i = 0; i < n; i++){
    packing += v_jobs[i].t1;
    if(packing > res) res = packing;
    res += v_jobs[i].t2;
  } 

  printf("%d\n", res);

  return 0;
}
