#include <bits/stdc++.h>
using namespace std;

struct graph {
  long H, W;
  vector<string> grid;
  vector<vector<bool>> visited;

  int dx[4] = {-1, 1, 0, 0};
  int dy[4] = {0, 0, -1, 1};

  void init(long h, long w) {
    H = h;
    W = w;
    for(int i=0; i<H; i++){
      grid.push_back({}); // inserts V ammount of empty vector
    }

    visited.assign(H, vector<bool>(W, false));
  }

  int bfs(int x, int y) {
    int size = 1;
    queue<pair<int, int>> q;
    q.push({x, y});
    visited[x][y] = true;

    while (!q.empty()) {
      auto [cx, cy] = q.front(); 
      q.pop();

      for (int d = 0; d < 4; d++) {
        int nx = cx + dx[d];
        int ny = cy + dy[d];
        if (nx >= 0 && nx < H && ny >= 0 && ny < W &&
          !visited[nx][ny] && grid[nx][ny] == '+') {
          visited[nx][ny] = true;
          q.push({nx, ny});
          size++;
        }
      }
    }

    return size;
  }
};

int main() {
  int H, W;
  int C = 0, S = 0, E = 0;
  cin >> H >> W;

  graph g;
  g.init(H, W);

  for (int i = 0; i < H; i++) {
    cin >> g.grid[i];
  }

  for (int i = 0; i < H; i++) {
    for (int j = 0; j < W; j++) {
      if (g.grid[i][j] == '+' && !g.visited[i][j]) {
        int koloni = g.bfs(i, j);
        C++;
        S = max(S, koloni);
        if (koloni % 2 == 0) E++;
      }
    }
  }

  cout << C << " " << S << " " << E << endl;

  return 0;
}

