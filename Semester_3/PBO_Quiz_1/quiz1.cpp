#include <stdio.h>
#include <queue>
#include <unordered_map>
using namespace std;

int main(){
  int t;
  scanf("%d", &t);

  unordered_map<int, int> team;
  unordered_map<int, queue<int>> members;
  queue<int> torder;
  unordered_map<int, bool> inqueue;

  for (int i = 1; i <= t; i++){
    int n;
    scanf("%d", &n);
    for (int j = 0; j < n; j++){
      int student;
      scanf("%d", &student);
      team[student] = i;
    }
  }

  char cmd[10];
  while (scanf("%s", cmd) != EOF){
    if (cmd[0] == 'E'){
      int ID;
      scanf("%d", &ID);
      int tid = team[ID];
      if (!inqueue[tid]){
        torder.push(tid);
        inqueue[tid] = true;
      }
      members[tid].push(ID);
    }
    else{
      int tid = torder.front();
      int student = members[tid].front();
      members[tid].pop();

      printf("%d\n", student);

      if (members[tid].empty()){
        torder.pop();
        inqueue[tid] = false;
      }
    }
  }
  return 0;
}
