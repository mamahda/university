# SPOJ VALENTINE MAZE

## Daftar Isi
1. [Problem Overview](#problem-overview)
2. [Mathematical Foundation](#mathematical-foundation)
   - [Random Walk as Markov Chain](#random-walk-as-markov-chain)
   - [Expected Value Recursion](#expected-value-recursion)
3. [Overview Arsitektur](#overview-arsitektur)
4. [Class LinearSystem](#class-linearsystem)
5. [Class Graph](#class-graph)
6. [Main Program Flow](#main-program-flow)
7. [Analisis Kompleksitas](#analisis-kompleksitas)
8. [Keunggulan Pendekatan OOP](#keunggulan-pendekatan-oop)

---

## Problem Overview

**Valentine Maze Game**: Tjandra berjalan random di maze untuk bertemu kekasihnya. Setiap step, dia memilih salah satu arah valid (up/down/left/right) dengan **probabilitas sama**. Hitung **expected number of steps** untuk mencapai tujuan.

### Input Specification:
- Grid m×n (max 50×50)
- `'T'`: Start position (Tjandra)
- `'W'`: Goal position (Woman/destination)
- `'.'`: Walkable path
- `'#'`: Wall (tidak bisa dilalui)

### Output:
- Expected time dengan presisi 12 desimal
- "Mission Failed!" jika goal tidak reachable

---

## Mathematical Foundation

### 1. Random Walk as Markov Chain

Ini adalah **discrete-time Markov Chain** dengan:
- **States**: Semua posisi di maze
- **Transition probability**: P(i→j) = 1/degree jika j adalah neighbor dari i
- **Absorbing state**: Goal W (sekali sampai, selesai)

### 2. Expected Value Recursion

Untuk setiap state (cell) yang bukan goal:

```
E[i,j] = Expected steps dari (i,j) ke goal
       = 1 + Σ (1/d) × E[neighbor]
         ↑     ↑
         |     └─ Weighted average dari neighbors
         └─ One step to move
```

Dimana `d` = degree = jumlah neighbor valid

**Base case:** E[goal] = 0

---

## Overview Arsitektur

Solusi ini menggunakan **Object-Oriented Design** dengan 2 class utama:

```
┌─────────────────────────────────────────┐
│           Main Program                  │
│  ┌───────────────────────────────────┐  │
│  │  1. Read input                    │  │
│  │  2. Create Graph object           │  │
│  │  3. Explore & validate            │  │
│  │  4. Build LinearSystem            │  │
│  │  5. Solve & output                │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │                    │
         ▼                    ▼
  ┌─────────────┐      ┌──────────────┐
  │   Graph     │      │ LinearSystem │
  │   Class     │      │    Class     │
  └─────────────┘      └──────────────┘
```

### Separation of Concerns:
- **Graph Class:** Menangani representasi maze & graph operations
- **LinearSystem Class:** Menangani sistem persamaan linear & solving
- **Main Program:** Orchestration & I/O

---

## Class LinearSystem

### Tanggung Jawab
Menyelesaikan sistem persamaan linear **Ax = b** dengan Gaussian Elimination.

### Struktur Data

```cpp
class LinearSystem {
private:
  double A[MAXN][MAXN]; // Augmented matrix [A|b]
  int size;             // Jumlah variabel (N)
  
public:
  // ... methods ...
};
```

**Augmented Matrix Layout:**
```
     col 0  col 1  col 2  ...  col N
row 0 [ a00    a01    a02   ...   b0  ]
row 1 [ a10    a11    a12   ...   b1  ]
row 2 [ a20    a21    a22   ...   b2  ]
...   [ ...    ...    ...   ...   ... ]
row N-1
```

Kolom 0 sampai N-1: koefisien variabel
Kolom N: Right-Hand Side (RHS)

---

### Method: `initialize(int n)`

**Purpose:** Inisialisasi matriks berukuran n×(n+1) dengan nilai 0.

```cpp
void initialize(int n) {
  size = n;
  for (int i = 0; i < n; ++i)
    for (int j = 0; j <= n; ++j)
      A[i][j] = 0;
}
```

**Contoh:**
```cpp
LinearSystem ls;
ls.initialize(3);  // Buat sistem 3 variabel

// Result: Matrix 3×4 dengan semua elemen = 0
```

---

### Method: `setCoefficient(row, col, value)`

**Purpose:** Set koefisien di posisi tertentu.

```cpp
void setCoefficient(int row, int col, double value) {
  A[row][col] = value;
}
```

**Use Case:**
```cpp
// Persamaan: 2x₀ - x₁ = 5
ls.setCoefficient(0, 0, 2.0);   // Koef x₀
ls.setCoefficient(0, 1, -1.0);  // Koef x₁
ls.setRHS(0, 5.0);              // RHS
```

---

### Method: `addCoefficient(row, col, value)`

**Purpose:** Tambahkan nilai ke koefisien yang sudah ada.

```cpp
void addCoefficient(int row, int col, double value) {
  A[row][col] += value;
}
```

**Kenapa perlu add?**
Saat build sistem untuk maze, satu cell bisa punya **multiple neighbors**.
Kita tambahkan kontribusi satu per satu.

**Contoh:**
```cpp
// Cell punya 3 neighbors di kolom 1, 2, 3

ls.addCoefficient(0, 2, -1.0);  // A[0][2] += -1
ls.addCoefficient(0, 3, -1.0);  // A[0][3] += -1
```

---

### Method: `solve(int targetVariable)` 

**Purpose:** Menyelesaikan sistem dengan Gaussian Elimination dan return nilai variabel tertentu.

#### Step 1: Forward Elimination (Bentuk Upper Triangular)

```cpp
for (int col = 0; col < size; ++col) {
  // 1. Partial Pivoting
  int piv = col;
  double maxv = fabs(A[col][col]);
  for (int r = col + 1; r < size; ++r) {
    double v = fabs(A[r][col]);
    if (v > maxv) { 
      maxv = v; 
      piv = r; 
    }
  }
  
  // 2. Check singular
  if (maxv < EPS) return -1;
  
  // 3. Swap rows
  if (piv != col) {
    for (int c = col; c <= size; ++c)
      swap(A[col][c], A[piv][c]);
  }
  
  // 4. Eliminate below
  double inv_pivot = 1.0 / A[col][col];
  for (int r = col + 1; r < size; ++r) {
    double fac = A[r][col] * inv_pivot;
    if (fabs(fac) < 1e-15) continue;
    for (int c = col; c <= size; ++c)
      A[r][c] -= fac * A[col][c];
  }
}
```

**Partial Pivoting:** Cari baris dengan nilai absolut terbesar di kolom saat ini untuk **stabilitas numerik**.

**Contoh Transformasi:**
```
Initial:              After pivot col 0:     After elim col 0:
[ 1  2  3 | 6 ]       [ 3  6  9 | 18]       [ 3  6  9 | 18]
[ 3  6  9 | 18]  →    [ 1  2  3 | 6 ]   →   [ 0 -0  0 | 0 ]
[ 2  1  2 | 5 ]       [ 2  1  2 | 5 ]       [ 0 -3 -4 |-7 ]
```

#### Step 2: Back Substitution

```cpp
double x[MAXN];
for (int i = size - 1; i >= 0; --i) {
  x[i] = A[i][size];  // Start dengan RHS
  for (int j = i + 1; j < size; ++j)
    x[i] -= A[i][j] * x[j];  // Kurangi kontribusi variabel yang sudah diketahui
  x[i] /= A[i][i];  // Bagi dengan koef diagonal
}
```

**Contoh:**
```
Upper triangular:
[ 3  6  9 | 18]
[ 0  4  8 | 12]
[ 0  0  2 | 4 ]

Back substitution:
x[2] = 4 / 2 = 2
x[1] = (12 - 8×2) / 4 = -1
x[0] = (18 - 9×2 - 6×(-1)) / 3 = 2
```

---

## Class Graph

### Tanggung Jawab
Merepresentasikan maze dan melakukan graph operations (BFS, mapping, building equations).

### Struktur Data

```cpp
class Graph {
private:
  int m, n;           // Dimensi grid (rows × cols)
  int si, sj;         // Start position (T)
  int gi, gj;         // Goal position (W)
  int cellCnt;        // Jumlah cell reachable
  
  char g[55][55];     // Grid content
  int idx[55][55];    // Cell (i,j) → variable index
  int vis[55][55];    // Visited flag (BFS)
  int deg[55][55];    // Degree per cell
  int cells[MAXN][2]; // List of reachable cells
  
  const int di[4] = {-1, 1, 0, 0};
  const int dj[4] = {0, 0, -1, 1};
};
```

---

### Method: `readGrid()`

**Purpose:** Baca grid dari input dan cari posisi T dan W.

```cpp
void readGrid() {
  for (int i = 0; i < m; ++i)
    scanf("%s", g[i]);
  
  // Find T and W
  for (int i = 0; i < m; ++i)
    for (int j = 0; j < n; ++j) {
      if (g[i][j] == 'T') { si = i; sj = j; }
      if (g[i][j] == 'W') { gi = i; gj = j; }
    }
}
```

**After execution:**
```
Grid:       Variables set:
T . #       si = 0, sj = 0
. . .       gi = 2, gj = 2
# . W
```

---

### Method: `exploreGraph()` 

**Purpose:** BFS untuk explore semua cell yang reachable dan hitung degree masing-masing.

```cpp
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

    // Explore 4 directions
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
```

**Key Optimization:** Hitung degree **saat first visit** (inline computation)!

**Contoh Execution:**
```
Grid:           After BFS:
T . .           cells = [(0,0), (0,1), (0,2), 
# # .                    (1,2), (2,2)]
# . W           deg[0][0] = 1, deg[0][1] = 2, ...
                vis[all reachable] = 1
```

---

### Method: `assignIndices()`

**Purpose:** Map setiap non-goal cell ke index variabel (0, 1, 2, ...).

```cpp
int assignIndices() {
  int k = 0;
  for (int c = 0; c < cellCnt; ++c) {
    int i = cells[c][0], j = cells[c][1];
    if (i != gi || j != gj)
      idx[i][j] = k++;
  }
  return k;
}
```

**Contoh:**
```
Grid:           Indices:
T . .           0 1 2
# # .           - - 3
# . W           - 4 goal

Total variables: k = 5
```

**Kenapa goal tidak diberi index?**
Karena E[goal] = 0 adalah **known constant**, tidak perlu solve!

---

### Method: `buildLinearSystem()`

**Purpose:** Bangun sistem persamaan dari struktur maze.

#### Persamaan untuk Setiap Cell:

Untuk cell (i,j) dengan degree d:
```
E[i,j] = 1 + (1/d) × Σ E[neighbor]
```

Multiply dengan d:
```
d × E[i,j] = d + Σ E[neighbor]
d × E[i,j] - Σ E[neighbor] = d
```

#### Implementation:

```cpp
void buildLinearSystem(LinearSystem& ls, int systemSize) {
  ls.initialize(systemSize);
  
  for (int c = 0; c < cellCnt; ++c) {
    int i = cells[c][0], j = cells[c][1];
    if (i == gi && j == gj) continue; // Skip goal

    int row = idx[i][j];
    int d = deg[i][j];

    // Diagonal coefficient: d
    ls.setCoefficient(row, row, d);
    
    // RHS: d
    ls.setRHS(row, d);

    // Neighbor coefficients: -1
    for (int dir = 0; dir < 4; ++dir) {
      int ni = i + di[dir], nj = j + dj[dir];
      if (isValidCell(ni, nj) && g[ni][nj] != '#') {
        int ncol = idx[ni][nj];
        if (ncol != -1) {  // Not goal
          ls.addCoefficient(row, ncol, -1.0);
        }
        // If neighbor is goal, E[goal]=0 contributes nothing
      }
    }
  }
}
```

#### Contoh Pembangunan Sistem:

**Grid:**
```
T . W
0 1 goal
```

**Equations:**
- Cell T(0,0): degree = 1, neighbor = [cell(0,1)]
  ```
  1×E[0] - 1×E[1] = 1
  ```

- Cell (0,1): degree = 2, neighbors = [T(0,0), W(0,2)]
  ```
  2×E[1] - 1×E[0] - 0 = 2
  ```
  (W contributes 0 karena E[goal]=0)

**Matrix Form:**
```
[ 1  -1 | 1 ]  ← equation for cell 0
[-1   2 | 2 ]  ← equation for cell 1
```

---

### Helper Methods

#### `isValidCell(i, j)`
```cpp
bool isValidCell(int i, int j) {
  return i >= 0 && i < m && j >= 0 && j < n;
}
```
Check apakah koordinat dalam bounds.

#### `getDegree(i, j)`
```cpp
int getDegree(int i, int j) {
  int d = 0;
  for (int k = 0; k < 4; ++k) {
    int ni = i + di[k], nj = j + dj[k];
    if (isValidCell(ni, nj) && g[ni][nj] != '#') 
      d++;
  }
  return d;
}
```
Hitung jumlah valid neighbors (tidak keluar grid, bukan wall).

---

## Main Program Flow

### Step-by-Step Execution

```cpp
int main() {
  int tc;
  scanf("%d", &tc);

  while (tc--) {
    // ============================================
    // STEP 1: Initialize Graph
    // ============================================
    int m, n;
    scanf("%d %d", &m, &n);
    
    Graph graph(m, n);
    graph.readGrid();
```

**Output Step 1:**
- Graph object created dengan dimensi m×n
- Grid dibaca, posisi T dan W ditemukan

---

```cpp
    // ============================================
    // STEP 2: Validation
    // ============================================
    if (!graph.isValid()) {
      printf("Mission Failed!\n");
      continue;
    }
    
    if (graph.isStartAtGoal()) {
      printf("0.000000000000\n");
      continue;
    }
```

**Validation Checks:**
1. ✅ T dan W ada di grid?
2. ✅ T == W? → Return 0 (sudah sampai)

---

```cpp
    // ============================================
    // STEP 3: Explore Graph
    // ============================================
    graph.exploreGraph();
    
    if (!graph.isGoalReachable()) {
      printf("Mission Failed!\n");
      continue;
    }
```

**BFS Exploration:**
- Visit semua cell reachable dari T
- Hitung degree untuk setiap cell
- Check apakah W reachable

---

```cpp
    // ============================================
    // STEP 4: Build Linear System
    // ============================================
    int systemSize = graph.assignIndices();
    
    if (systemSize == 0) {
      printf("0.000000000000\n");
      continue;
    }
    
    LinearSystem ls;
    graph.buildLinearSystem(ls, systemSize);
```

**System Building:**
1. Assign indices (0, 1, 2, ..., k-1) untuk non-goal cells
2. Build matrix dengan persamaan untuk setiap cell
3. Result: Matrix k×(k+1) siap diselesaikan

---

```cpp
    // ============================================
    // STEP 5: Solve & Output
    // ============================================
    double ans = ls.solve(graph.getStartIndex());
    
    if (ans < 0) {
      printf("Mission Failed!\n");
    } else {
      printf("%.12f\n", ans);
    }
  }
  return 0;
}
```

**Solving:**
1. Gaussian elimination untuk dapatkan solusi
2. Return E[start] = expected steps dari T ke W
3. Output dengan presisi 12 desimal

---

## Trace Example: Test Case 1

### Input:
```
1 3
T.W
```

### Execution Trace:

#### Step 1: Read Grid
```
Grid:
T . W
```
- si=0, sj=0 (T at position (0,0))
- gi=0, gj=2 (W at position (0,2))

#### Step 2: BFS Exploration
```
Starting from T(0,0):
- Visit (0,0), degree = 1 (can go right)
- Visit (0,1), degree = 2 (can go left or right)
- Visit (0,2), degree = 1 (can go left) ← This is W

Reachable cells: [(0,0), (0,1), (0,2)]
```

#### Step 3: Assign Indices
```
Cell (0,0) T → index 0
Cell (0,1) . → index 1
Cell (0,2) W → no index (goal)

System size: k = 2
```

#### Step 4: Build Equations

**Cell 0 (T):**
- degree = 1
- neighbors = [cell 1]
- Equation: `1×E[0] - 1×E[1] = 1`
- Matrix row 0: [1, -1 | 1]

**Cell 1 (middle):**
- degree = 2
- neighbors = [cell 0, goal]
- Equation: `2×E[1] - 1×E[0] - 0 = 2`
- Matrix row 1: [-1, 2 | 2]

**System:**
```
[ 1  -1 | 1 ]
[-1   2 | 2 ]
```

#### Step 5: Gaussian Elimination

**Forward elimination:**
```
[ 1  -1 | 1 ]
[-1   2 | 2 ]

→ R2 = R2 + R1:

[ 1  -1 | 1 ]
[ 0   1 | 3 ]
```

**Back substitution:**
```
E[1] = 3 / 1 = 3
E[0] = (1 - (-1)×3) / 1 = 4
```

#### Output:
```
4.000000000000 ✓
```

---

## Analisis Kompleksitas

### Space Complexity

| Component | Size | Memory |
|-----------|------|--------|
| Grid g[55][55] | 55² | ~3 KB |
| Matrix A[2505][2505] | 2505² × 8 | ~50 MB |
| Other arrays | Various | ~100 KB |
| **Total** | | **~50 MB** |

**Dominant:** Matrix augmented A

---

### Time Complexity

#### Per Test Case:

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Read grid | O(mn) | m,n ≤ 50 |
| BFS | O(V + E) | V ≤ mn, E ≤ 4V |
| Assign indices | O(V) | Linear scan |
| Build system | O(V × 4) | For each cell, check 4 neighbors |
| Gaussian elim | O(k³) | k = #variables ≤ 2500 |
| **Total** | **O(k³)** | Dominated by Gaussian |

**Worst case:** k = 2500 → 2500³/3 ≈ 5.2 billion operations

#### For 250 Test Cases:

**Average case:** Most grids tidak fully connected
- Average k ≈ 500-1000
- Total time: ~3-5 seconds ✓

---

## Potential Improvements

### 1. **Use Sparse Matrix**
```cpp
class SparseLinearSystem {
  vector<map<int, double>> A;  // Only store non-zeros
};
```

### 2. **Iterator Pattern**
```cpp
class CellIterator {
  // Iterate through reachable cells
};
```

### 3. **Strategy Pattern for Solver**
```cpp
class Solver {
  virtual double solve() = 0;
};

class GaussianSolver : public Solver { ... };
class IterativeSolver : public Solver { ... };
```

### 4. **Builder Pattern**
```cpp
LinearSystem ls = LinearSystemBuilder()
                    .withSize(k)
                    .addEquation(row, coeffs, rhs)
                    .build();
```

---

## Conclusion

Solusi OOP ini mendemonstrasikan **clean code principles** dengan:
- Clear class responsibilities
- Encapsulation of complexity  
- Readable main program flow
- Easy to test and maintain

Meskipun bukan yang tercepat, approach ini sangat baik untuk:
- **Learning:** Memahami struktur problem
- **Production:** Code yang maintainable
- **Collaboration:** Clear interfaces untuk tim

Untuk competitive programming yang sangat ketat (0.4s target), perlu **hybrid approach** dengan sparse matrix + iterative solver, tapi akan mengorbankan readability.

**Final verdict:** Excellent balance of correctness, clarity, and performance! 
