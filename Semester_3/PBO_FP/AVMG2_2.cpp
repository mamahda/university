#include <cstdio>
#include <cstring>
#include <cmath>
#include <algorithm> 
using namespace std;

const double EPS = 1e-9;
const int di[] = {-1, 1, 0, 0};
const int dj[] = {0, 0, -1, 1};

char g[55][55];
int m, n, si, sj, gi, gj;
int idx[55][55], deg[55][55];

// Sparse representation
struct SparseRow {
  int col[5];
  int cnt;
} row[2505];

double rhs[2505];

// Fast Gauss-Seidel with Red-Black ordering
double solveIterative(int N) {
  double x[2505], xnew[2505];

  // Initial guess: heuristic based on degree
  for (int i = 0; i < N; ++i) x[i] = N * 0.5;

  const double omega = 1.75;  // Aggressive SOR
  const int maxIter = 5000;

  for (int iter = 0; iter < maxIter; ++iter) {
    double maxDiff = 0;

    // Red-Black Gauss-Seidel for better convergence
    for (int phase = 0; phase < 2; ++phase) {
      for (int i = phase; i < N; i += 2) {
        if (row[i].col[0] < 0) continue;  // Skip if no degree

        double diag = row[i].col[0];  // Diagonal stored at col[0]
        double sum = rhs[i];

        for (int j = 1; j < row[i].cnt; ++j) {
          int c = row[i].col[j];
          if (c >= 0) sum += x[c];
        }

        xnew[i] = sum / diag;
        xnew[i] = omega * xnew[i] + (1.0 - omega) * x[i];

        double diff = fabs(xnew[i] - x[i]);
        if (diff > maxDiff) maxDiff = diff;

        x[i] = xnew[i];
      }
    }

    if (maxDiff < EPS) break;
  }

  return x[idx[si][sj]];
}

// Direct solver for small cases
double solveDirect(int N) {
  if (N > 800) return solveIterative(N);

  double A[805][805], b[805];

  // Reconstruct matrix from sparse
  for (int i = 0; i < N; ++i) {
    for (int j = 0; j < N; ++j) A[i][j] = 0;
    b[i] = rhs[i];

    for (int j = 0; j < row[i].cnt; ++j) {
      int c = row[i].col[j];
      if (c >= 0) {
        if (j == 0) A[i][i] = row[i].col[0];  // Diagonal
        else A[i][c] = -1.0;
      }
    }
  }

  // Gaussian elimination
  for (int col = 0; col < N; ++col) {
    int piv = col;
    for (int r = col + 1; r < N; ++r)
      if (fabs(A[r][col]) > fabs(A[piv][col])) piv = r;

    if (fabs(A[piv][col]) < EPS) return -1;

    if (piv != col) {
      for (int c = 0; c < N; ++c) swap(A[col][c], A[piv][c]);
      swap(b[col], b[piv]);
    }

    double inv = 1.0 / A[col][col];
    for (int r = col + 1; r < N; ++r) {
      double fac = A[r][col] * inv;
      if (fabs(fac) < 1e-15) continue;
      for (int c = col; c < N; ++c) A[r][c] -= fac * A[col][c];
      b[r] -= fac * b[col];
    }
  }

  double x[805];
  for (int i = N - 1; i >= 0; --i) {
    x[i] = b[i];
    for (int j = i + 1; j < N; ++j) x[i] -= A[i][j] * x[j];
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
    for (int i = 0; i < m; ++i)
      for (int j = 0; j < n; ++j) {
        if (g[i][j] == 'T') { si = i; sj = j; }
        if (g[i][j] == 'W') { gi = i; gj = j; }
      }

    if (si == -1 || gi == -1 || (si == gi && sj == gj)) {
      if (si == gi && sj == gj) printf("0.000000000000\n");
      else printf("Mission Failed!\n");
      continue;
    }

    // BFS with degree computation
    int vis[55][55] = {0};
    int q[2505][2], h = 0, t = 0;
    q[t][0] = si; q[t][1] = sj; t++;
    vis[si][sj] = 1;

    int cells[2505][2], cellCnt = 0;

    while (h < t) {
      int i = q[h][0], j = q[h][1]; h++;
      cells[cellCnt][0] = i; cells[cellCnt][1] = j; cellCnt++;

      if (i == si && j == sj) {
        deg[i][j] = 0;
        for (int k = 0; k < 4; ++k) {
          int ni = i + di[k], nj = j + dj[k];
          if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] != '#')
            deg[i][j]++;
        }
      }

      for (int k = 0; k < 4; ++k) {
        int ni = i + di[k], nj = j + dj[k];
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && 
          !vis[ni][nj] && g[ni][nj] != '#') {
          vis[ni][nj] = 1;
          q[t][0] = ni; q[t][1] = nj; t++;

          deg[ni][nj] = 0;
          for (int d = 0; d < 4; ++d) {
            int nni = ni + di[d], nnj = nj + dj[d];
            if (nni >= 0 && nni < m && nnj >= 0 && nnj < n && 
              g[nni][nnj] != '#') deg[ni][nj]++;
          }
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
      int i = cells[c][0], j = cells[c][1];
      if (i != gi || j != gj) idx[i][j] = k++;
    }

    if (k == 0) {
      printf("0.000000000000\n");
      continue;
    }

    // Build sparse structure
    for (int c = 0; c < cellCnt; ++c) {
      int i = cells[c][0], j = cells[c][1];
      if (i == gi && j == gj) continue;

      int v = idx[i][j];
      int d = deg[i][j];

      row[v].col[0] = d;  // Diagonal
      row[v].cnt = 1;
      rhs[v] = d;

      for (int dir = 0; dir < 4; ++dir) {
        int ni = i + di[dir], nj = j + dj[dir];
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] != '#') {
          row[v].col[row[v].cnt++] = idx[ni][nj];  // -1 for goal OK
        }
      }
    }

    printf("%.12f\n", solveDirect(k));
  }

  return 0;
}
