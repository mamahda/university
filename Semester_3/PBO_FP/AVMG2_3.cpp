#include <cstdio>
#include <cstring>
#include <queue>
#include <cmath>
using namespace std;

const double EPS = 1e-12;
const int di[] = {-1, 1, 0, 0};
const int dj[] = {0, 0, -1, 1};

char g[55][55];
int m, n, si, sj, gi, gj;
int idx[55][55];
double A[2505][2505];

int countDeg(int i, int j) {
  int d = 0;
  for (int k = 0; k < 4; ++k) {
    int ni = i + di[k], nj = j + dj[k];
    if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] != '#') d++;
  }
  return d;
}

double solve(int N) {
  for (int col = 0; col < N; ++col) {
    int piv = col;
    for (int r = col + 1; r < N; ++r)
      if (fabs(A[r][col]) > fabs(A[piv][col])) piv = r;

    if (fabs(A[piv][col]) < EPS) return -1;

    if (piv != col) {
      for (int c = col; c <= N; ++c)
        swap(A[col][c], A[piv][c]);
    }

    double pivot = A[col][col];
    for (int r = col + 1; r < N; ++r) {
      double fac = A[r][col] / pivot;
      for (int c = col; c <= N; ++c)
        A[r][c] -= fac * A[col][c];
    }
  }

  double x[2505];
  for (int i = N - 1; i >= 0; --i) {
    x[i] = A[i][N];
    for (int j = i + 1; j < N; ++j)
      x[i] -= A[i][j] * x[j];
    x[i] /= A[i][i];
  }

  return x[idx[si][sj]];
}

int main() {
  int tc;
  scanf("%d", &tc);

  while (tc--) {
    scanf("%d %d", &m, &n);
    for (int i = 0; i < m; ++i) scanf("%s", g[i]);

    si = sj = gi = gj = -1;
    for (int i = 0; i < m; ++i) {
      for (int j = 0; j < n; ++j) {
        if (g[i][j] == 'T') { si = i; sj = j; }
        if (g[i][j] == 'W') { gi = i; gj = j; }
      }
    }

    if (si == -1 || gi == -1) {
      printf("Mission Failed!\n");
      continue;
    }

    if (si == gi && sj == gj) {
      printf("0.000000000000\n");
      continue;
    }

    bool vis[55][55];
    memset(vis, 0, sizeof(vis));
    queue<pair<int,int>> q;
    q.push({si, sj});
    vis[si][sj] = true;

    pair<int,int> cells[2505];
    int cellCnt = 0;

    while (!q.empty()) {
      int i = q.front().first, j = q.front().second;
      q.pop();
      cells[cellCnt++] = {i, j};

      for (int d = 0; d < 4; ++d) {
        int ni = i + di[d], nj = j + dj[d];
        if (ni >= 0 && ni < m && nj >= 0 && nj < n &&
          !vis[ni][nj] && g[ni][nj] != '#') {
          vis[ni][nj] = true;
          q.push({ni, nj});
        }
      }
    }

    if (!vis[gi][gj]) {
      printf("Mission Failed!\n");
      continue;
    }

    memset(idx, -1, sizeof(idx));
    int k = 0;
    for (int c = 0; c < cellCnt; ++c) {
      int i = cells[c].first, j = cells[c].second;
      if (i == gi && j == gj) continue;
      idx[i][j] = k++;
    }

    if (k == 0) {
      printf("0.000000000000\n");
      continue;
    }

    for (int i = 0; i < k; ++i)
      for (int j = 0; j <= k; ++j)
        A[i][j] = 0;

    for (int c = 0; c < cellCnt; ++c) {
      int i = cells[c].first, j = cells[c].second;
      if (i == gi && j == gj) continue;

      int row = idx[i][j];
      int deg = countDeg(i, j);

      A[row][row] = deg;
      A[row][k] = deg;

      for (int d = 0; d < 4; ++d) {
        int ni = i + di[d], nj = j + dj[d];
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] != '#') {
          if (idx[ni][nj] != -1) {
            A[row][idx[ni][nj]] -= 1.0;
          }
        }
      }
    }

    double ans = solve(k);
    if (ans < 0) {
      printf("Mission Failed!\n");
    } else {
      printf("%.12f\n", ans);
    }
  }

  return 0;
}
