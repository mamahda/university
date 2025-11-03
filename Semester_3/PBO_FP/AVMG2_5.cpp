#include <cstdio>
#include <cstring>
#include <cmath>
#include <algorithm>
using namespace std;

const double EPS = 1e-12;
const int di[] = {-1, 1, 0, 0};
const int dj[] = {0, 0, -1, 1};

char g[55][55];
int m, n, si, sj, gi, gj;
int idx[55][55], vis[55][55], deg[55][55];

double A[2505 * 2506];

inline double& at(int i, int j, int cols) {
    return A[i * cols + j];
}

void bfs(int cells[][2], int& cnt) {
    int q[2505][2], h = 0, t = 0;
    q[t][0] = si; q[t][1] = sj; t++;
    vis[si][sj] = 1;
    cnt = 0;
    
    deg[si][sj] = 0;
    for (int k = 0; k < 4; ++k) {
        int ni = si + di[k], nj = sj + dj[k];
        if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] != '#') 
            deg[si][sj]++;
    }
    
    while (h < t) {
        int i = q[h][0], j = q[h][1]; h++;
        cells[cnt][0] = i; cells[cnt][1] = j; cnt++;
        
        for (int k = 0; k < 4; ++k) {
            int ni = i + di[k], nj = j + dj[k];
            if (ni >= 0 && ni < m && nj >= 0 && nj < n && 
                !vis[ni][nj] && g[ni][nj] != '#') {
                vis[ni][nj] = 1;
                q[t][0] = ni; q[t][1] = nj; t++;
                
                deg[ni][nj] = 0;
                for (int dir = 0; dir < 4; ++dir) {
                    int nni = ni + di[dir], nnj = nj + dj[dir];
                    if (nni >= 0 && nni < m && nnj >= 0 && nnj < n && 
                        g[nni][nnj] != '#') deg[ni][nj]++;
                }
            }
        }
    }
}

double solve(int N, int cells[][2], int cnt) {
    int cols = N + 1;
    
    memset(A, 0, N * cols * sizeof(double));
    for (int c = 0; c < cnt; ++c) {
        int i = cells[c][0], j = cells[c][1];
        if (i == gi && j == gj) continue;
        
        int row = idx[i][j];
        int d = deg[i][j];
        
        at(row, row, cols) = d;
        at(row, N, cols) = d;
        
        for (int dir = 0; dir < 4; ++dir) {
            int ni = i + di[dir], nj = j + dj[dir];
            if (ni >= 0 && ni < m && nj >= 0 && nj < n && g[ni][nj] != '#') {
                int col = idx[ni][nj];
                if (col != -1) at(row, col, cols) -= 1.0;
            }
        }
    }
    
    for (int col = 0; col < N; ++col) {
        int piv = col;
        double maxv = fabs(at(col, col, cols));
        for (int r = col + 1; r < N; ++r) {
            double v = fabs(at(r, col, cols));
            if (v > maxv) { maxv = v; piv = r; }
        }
        
        if (maxv < EPS) return -1;
        
        if (piv != col) {
            for (int c = col; c < cols; ++c)
                swap(at(col, c, cols), at(piv, c, cols));
        }
        
        double inv = 1.0 / at(col, col, cols);
        for (int r = col + 1; r < N; ++r) {
            double fac = at(r, col, cols) * inv;
            if (fabs(fac) < 1e-15) continue;
            
            at(r, col, cols) = 0;
            for (int c = col + 1; c < cols; ++c)
                at(r, c, cols) -= fac * at(col, c, cols);
        }
    }
    
    double x[2505];
    for (int i = N - 1; i >= 0; --i) {
        x[i] = at(i, N, cols);
        for (int j = i + 1; j < N; ++j)
            x[i] -= at(i, j, cols) * x[j];
        x[i] /= at(i, i, cols);
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
        
        if (si == -1 || gi == -1) {
            printf("Mission Failed!\n");
            continue;
        }
        
        if (si == gi && sj == gj) {
            printf("0.000000000000\n");
            continue;
        }
        
        memset(vis, 0, sizeof(vis));
        
        int cells[2505][2], cellCnt;
        bfs(cells, cellCnt);
        
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
        
        double ans = solve(k, cells, cellCnt);
        if (ans < 0) printf("Mission Failed!\n");
        else printf("%.12f\n", ans);
    }
    
    return 0;
}
