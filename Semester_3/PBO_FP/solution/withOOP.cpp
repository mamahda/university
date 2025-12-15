#include <cstdio>
#include <cstring>
#include <cmath>
#include <algorithm>
using namespace std;

const double EPS = 1e-12;
const int MAXN = 2505;
double A[MAXN][MAXN]; // Matriks augmented (A + kolom b)

// ======================================================
// Kelas untuk menyelesaikan sistem persamaan linear
// ======================================================
// Idenya: kita simpan matriks augmented (A|b) dan pakai
// Gaussian Elimination buat nyari nilai variabel x.
// ======================================================
class LinearSystem {
private:
  int size;             // Ukuran sistem (jumlah variabel)
  
public:
  LinearSystem() : size(0) {}
  
  // Inisialisasi matriks ukuran n x (n+1)
  void initialize(int n) {
    size = n;
    for (int i = 0; i < n; ++i)
      for (int j = 0; j <= n; ++j)
        A[i][j] = 0;
  }
  
  // Set satu elemen koefisien di posisi (row, col)
  void setCoefficient(int row, int col, double value) {
    A[row][col] = value;
  }
  
  // Tambahkan nilai ke elemen tertentu
  void addCoefficient(int row, int col, double value) {
    A[row][col] += value;
  }
  
  // Set nilai di sisi kanan persamaan (RHS)
  void setRHS(int row, double value) {
    A[row][size] = value;
  }
  
  // Ambil nilai koefisien tertentu (opsional)
  double getCoefficient(int row, int col) {
    return A[row][col];
  }
  
  // ------------------------------------------------------
  // Fungsi utama: menyelesaikan sistem persamaan linear
  // dengan metode Gaussian Elimination + partial pivoting
  // ------------------------------------------------------
  double solve(int targetVariable) {
    for (int col = 0; col < size; ++col) {
      // Cari baris pivot dengan nilai terbesar di kolom ini
      int piv = col;
      double maxv = fabs(A[col][col]);
      for (int r = col + 1; r < size; ++r) {
        double v = fabs(A[r][col]);
        if (v > maxv) { 
          maxv = v; 
          piv = r; 
        }
      }

      // Kalau kolomnya nol semua -> sistem singular (nggak bisa diselesaikan)
      if (maxv < EPS) return -1;

      // Tukar baris pivot ke posisi saat ini
      if (piv != col) {
        for (int c = col; c <= size; ++c)
          swap(A[col][c], A[piv][c]);
      }

      // Proses eliminasi maju (forward elimination)
      double inv_pivot = 1.0 / A[col][col];
      for (int r = col + 1; r < size; ++r) {
        double fac = A[r][col] * inv_pivot;
        if (fabs(fac) < 1e-15) continue;
        for (int c = col; c <= size; ++c)
          A[r][c] -= fac * A[col][c];
      }
    }

    // Substitusi mundur (back substitution)
    double x[MAXN];
    for (int i = size - 1; i >= 0; --i) {
      x[i] = A[i][size];
      for (int j = i + 1; j < size; ++j)
        x[i] -= A[i][j] * x[j];
      x[i] /= A[i][i];
    }

    // Hasil akhir: nilai variabel yang diminta
    return x[targetVariable];
  }
};

// ======================================================
// Kelas Graph
// ======================================================
// Representasi peta/grid tempat "T" (start) dan "W" (goal)
// Di sini, kita mau cari expected steps dari T ke W
// kalau tiap langkah jalan random ke arah yang bisa.
// ======================================================
class Graph {
private:
  int m, n;           // Ukuran grid (baris x kolom)
  int si, sj;         // Posisi start (T)
  int gi, gj;         // Posisi goal (W)
  int cellCnt;        // Jumlah sel yang bisa dikunjungi
  
  char g[55][55];     // Isi grid
  int idx[55][55];    // Mapping posisi (i,j) -> index variabel
  int vis[55][55];    // Penanda sudah dikunjungi saat BFS
  int deg[55][55];    // Degree (jumlah arah jalan dari sel ini)
  int cells[MAXN][2]; // List semua sel yang bisa diakses
  
  // Arah gerak (atas, bawah, kiri, kanan)
  const int di[4] = {-1, 1,  0, 0};
  const int dj[4] = { 0, 0, -1, 1};
  
public:
  Graph(int rows, int cols) : m(rows), n(cols), si(-1), sj(-1), gi(-1), gj(-1), cellCnt(0) {
    memset(vis, 0, sizeof(vis));
    memset(idx, -1, sizeof(idx));
    memset(deg, 0, sizeof(deg));
  }
  
  // Baca grid dari input
  void readGrid() {
    for (int i = 0; i < m; ++i)
      scanf("%s", g[i]);
    
    // Cari posisi T (start) dan W (goal)
    for (int i = 0; i < m; ++i)
      for (int j = 0; j < n; ++j) {
        if (g[i][j] == 'T') { si = i; sj = j; }
        if (g[i][j] == 'W') { gi = i; gj = j; }
      }
  }
  
  // Cek apakah T dan W ada di peta
  bool isValid() {
    return si != -1 && gi != -1;
  }
  
  // Cek apakah start langsung di goal
  bool isStartAtGoal() {
    return si == gi && sj == gj;
  }
  
  // ------------------------------------------------------
  // BFS untuk menjelajahi area yang bisa dikunjungi
  // dan menghitung derajat (jumlah jalan keluar tiap sel)
  // ------------------------------------------------------
  void exploreGraph() {
    int q[MAXN][2], head = 0, tail = 0;
    q[tail][0] = si; 
    q[tail][1] = sj; 
    tail++;
    vis[si][sj] = 1;
    cellCnt = 0;

    deg[si][sj] = getDegree(si, sj);

    while (head < tail) {
      int i = q[head][0], j = q[head][1]; 
      head++;
      cells[cellCnt][0] = i; 
      cells[cellCnt][1] = j; 
      cellCnt++;

      // Jelajahi tetangga (atas, bawah, kiri, kanan)
      for (int k = 0; k < 4; ++k) {
        int ni = i + di[k], nj = j + dj[k];
        if (isValidCell(ni, nj) && !vis[ni][nj] && g[ni][nj] != '#') {
          vis[ni][nj] = 1;
          q[tail][0] = ni; 
          q[tail][1] = nj; 
          tail++;
          deg[ni][nj] = getDegree(ni, nj);
        }
      }
    }
  }
  
  // Cek apakah goal bisa dicapai dari start
  bool isGoalReachable() {
    return vis[gi][gj];
  }
  
  // Assign index ke setiap cell (kecuali goal)
  // agar bisa dipetakan ke variabel dalam sistem persamaan
  int assignIndices() {
    int k = 0;
    for (int c = 0; c < cellCnt; ++c) {
      int i = cells[c][0], j = cells[c][1];
      if (i != gi || j != gj)
        idx[i][j] = k++;
    }
    return k;
  }
  
  // ------------------------------------------------------
  // Bangun sistem persamaan linear:
  // E[i][j] = 1 + (1/d) * Σ(E[neighbors])
  // → d*E[i][j] - Σ(E[neighbors]) = d
  // ------------------------------------------------------
  void buildLinearSystem(LinearSystem& ls, int systemSize) {
    ls.initialize(systemSize);
    
    for (int c = 0; c < cellCnt; ++c) {
      int i = cells[c][0], j = cells[c][1];
      if (i == gi && j == gj) continue; // Goal gak punya persamaan

      int row = idx[i][j];
      int d = deg[i][j];

      // Set koefisien utama (E[i][j] * d)
      ls.setCoefficient(row, row, d);
      ls.setRHS(row, d); // sisi kanan = d

      // Kurangi kontribusi dari tetangga
      for (int dir = 0; dir < 4; ++dir) {
        int ni = i + di[dir], nj = j + dj[dir];
        if (isValidCell(ni, nj) && g[ni][nj] != '#') {
          int ncol = idx[ni][nj];
          if (ncol != -1) {
            ls.addCoefficient(row, ncol, -1.0);
          }
        }
      }
    }
  }
  
  int getStartIndex() {
    return idx[si][sj];
  }
  
private:
  // Cek apakah koordinat masih di dalam grid
  bool isValidCell(int i, int j) {
    return i >= 0 && i < m && j >= 0 && j < n;
  }
  
  // Hitung berapa banyak arah jalan dari sel (i,j)
  int getDegree(int i, int j) {
    int d = 0;
    for (int k = 0; k < 4; ++k) {
      int ni = i + di[k], nj = j + dj[k];
      if (isValidCell(ni, nj) && g[ni][nj] != '#') 
        d++;
    }
    return d;
  }
};

// ======================================================
// MAIN PROGRAM
// ======================================================
// Buat beberapa test case:
//   - Baca peta
//   - Cek validitas
//   - Kalau bisa, bangun sistem persamaan dan hitung
//     expected steps dari T ke W.
// ======================================================
int main() {
  int tc;
  scanf("%d", &tc);

  while (tc--) {
    int m, n;
    scanf("%d %d", &m, &n);
    
    Graph graph(m, n);
    graph.readGrid();
    
    // Cek apakah T dan W ada
    if (!graph.isValid()) {
      printf("Mission Failed!\n");
      continue;
    }
    
    // Kalau start == goal -> langkahnya 0
    if (graph.isStartAtGoal()) {
      printf("0.000000000000\n");
      continue;
    }
    
    // Jalankan BFS untuk eksplor peta
    graph.exploreGraph();
    
    // Kalau goal gak bisa dicapai
    if (!graph.isGoalReachable()) {
      printf("Mission Failed!\n");
      continue;
    }
    
    // Buat sistem persamaan
    int systemSize = graph.assignIndices();
    
    if (systemSize == 0) {
      printf("0.000000000000\n");
      continue;
    }
    
    LinearSystem ls;
    graph.buildLinearSystem(ls, systemSize);
    
    // Selesaikan dan tampilkan hasil
    double ans = ls.solve(graph.getStartIndex());
    
    if (ans < 0) {
      printf("Mission Failed!\n");
    } else {
      printf("%.12f\n", ans);
    }
  }

  return 0;
}