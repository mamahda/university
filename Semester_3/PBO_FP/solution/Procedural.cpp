#include <cstdio>
#include <cstring>
#include <cmath>
#include <algorithm>
using namespace std;

const double EPS = 1e-12;
const int MAXN = 2505;

char g[55][55];
int m, n, si, sj, gi, gj;
int idx[55][55], vis[55][55];
int deg[55][55];  // Store degree untuk setiap cell
double A[MAXN][MAXN];
int cells[MAXN][2];
int cellCnt;

const int di[] = {-1, 1, 0, 0};
const int dj[] = {1, 0, -1, 1};

void bfs() {
  int q[MAXN][2], head = 0, tail = 0;
  q[tail][0] = si; q[tail][1] = sj; tail++;
  vis[si][sj] = 1;
  cellCnt = 0;

  // Hitung degree untuk start cell
  int d = 0;
  for (int k = 0; k < 4; ++k) {
    int ni = si + di[k], nj = sj + dj[k];
    if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] != '#') d++;
  }
  deg[si][sj] = d;

  while (head < tail) {
    int i = q[head][0], j = q[head][1]; head++;
    cells[cellCnt][0] = i; cells[cellCnt][1] = j; cellCnt++;

    for (int k = 0; k < 4; ++k) {
      int ni = i + di[k], nj = j + dj[k];
      if (ni >= 0 && ni < m && nj >= 0 && nj < n && 
        !vis[ni][nj] && g[ni][nj] != '#') {
        vis[ni][nj] = 1;
        q[tail][0] = ni; q[tail][1] = nj; tail++;

        int nd = 0;
        for (int dir = 0; dir < 4; ++dir) {
          int nni = ni + di[dir], nnj = nj + dj[dir];
          if (nni >= 0 && nni < m && nnj >= 0 && nnj < n && 
            g[nni][nnj] != '#') nd++;
        }
        deg[ni][nj] = nd;
      }
    }
  }
}

double solve(int N) {
  for (int col = 0; col < N; ++col) {
    int piv = col;
    double maxv = fabs(A[col][col]);
    for (int r = col + 1; r < N; ++r) {
      double v = fabs(A[r][col]);
      if (v > maxv) { maxv = v; piv = r; }
    }

    if (maxv < EPS) return -1;

    if (piv != col) {
      for (int c = col; c <= N; ++c)
        swap(A[col][c], A[piv][c]);
    }

    double inv_pivot = 1.0 / A[col][col];
    for (int r = col + 1; r < N; ++r) {
      double fac = A[r][col] * inv_pivot;
      if (fabs(fac) < 1e-15) continue;
      for (int c = col; c <= N; ++c)
        A[r][c] -= fac * A[col][c];
    }
  }

  double x[MAXN];
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

    memset(vis, 0, sizeof(vis));
    bfs();  // BFS + hitung degree sekaligus

    if (!vis[gi][gj]) {
      printf("Mission Failed!\n");
      continue;
    }

    memset(idx, -1, sizeof(idx));
    int k = 0;
    for (int c = 0; c < cellCnt; ++c) {
      int i = cells[c][0], j = cells[c][1];
      if (i != gi || j != gj)
        idx[i][j] = k++;
    }

    if (k == 0) {
      printf("0.000000000000\n");
      continue;
    }

    // Initialize only needed parts
    for (int i = 0; i < k; ++i) {
      for (int j = 0; j < k; ++j) A[i][j] = 0;
      A[i][k] = 0;
    }

    // Build system - TANPA hitung degree lagi!
    for (int c = 0; c < cellCnt; ++c) {
      int i = cells[c][0], j = cells[c][1];
      if (i == gi && j == gj) continue;

      int row = idx[i][j];
      int d = deg[i][j];  // ← Langsung ambil dari array!

      A[row][row] = d;
      A[row][k] = d;

      for (int dir = 0; dir < 4; ++dir) {
        int ni = i + di[dir], nj = j + dj[dir];
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] != '#') {
          int ncol = idx[ni][nj];
          if (ncol != -1) A[row][ncol] -= 1.0;
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
