#include <cstdio>
#include <queue>
#include <map>
#include <algorithm>
using namespace std;

queue<int> team, each_team[1001];
map<int, int> on_team;

int main() {
  int t;
  scanf("%d", &t);
  for (int i = 0; i < t; i++) {
    int n;
    scanf("%d", &n);
    for (int j = 0; j < n; j++) {
      int m;
      scanf("%d", &m);
      on_team[m] = i;
    }
  }
  char cmd[10];
  while (scanf("%s", cmd) != EOF) {
    if (cmd[0] == 'D') {
      int can_team = team.front();
      printf("%d\n", each_team[can_team].front());
      each_team[can_team].pop();
      if (each_team[can_team].empty()) {
        team.pop();
      }
    }
    else {
      int id;
      scanf("%d", &id);
      int id_team = on_team[id];
      if (each_team[id_team].empty()) {
        team.push(id_team);
      }  
      each_team[id_team].push(id);
    }
  }
  return 0;
}
