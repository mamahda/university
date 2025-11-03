#include <cstdio>
#include <cstring>
#include <cmath>
#include <queue>
#include <vector>
using namespace std;

const int MAX_CELLS = 2505;
const int MAX_SIZE = 55;

char maze[MAX_SIZE][MAX_SIZE];
int rows, cols, startRow, startCol, goalRow, goalCol;
int cellIndex[MAX_SIZE][MAX_SIZE];
bool visited[MAX_SIZE][MAX_SIZE];
int numNeighbors[MAX_SIZE][MAX_SIZE];
pair<int, int> cellList[MAX_CELLS];
int totalCells;

const int dirX[] = {-1, 1, 0, 0};
const int dirY[] = {0, 0, -1, 1};

void exploreMaze()
{
  queue<pair<int, int>> bfsQueue;
  bfsQueue.push({startRow, startCol});
  visited[startRow][startCol] = true;
  totalCells = 0;

  int cnt = 0;
  for (int d = 0; d < 4; ++d)
  {
    int newR = startRow + dirX[d];
    int newC = startCol + dirY[d];
    if (newR >= 0 && newR < rows && newC >= 0 && newC < cols && maze[newR][newC] != '#')
      cnt++;
  }
  numNeighbors[startRow][startCol] = cnt;

  while (!bfsQueue.empty())
  {
    int currR = bfsQueue.front().first;
    int currC = bfsQueue.front().second;
    bfsQueue.pop();
    cellList[totalCells++] = {currR, currC};

    for (int d = 0; d < 4; ++d)
    {
      int newR = currR + dirX[d];
      int newC = currC + dirY[d];
      if (newR >= 0 && newR < rows && newC >= 0 && newC < cols &&
        !visited[newR][newC] && maze[newR][newC] != '#')
      {
        visited[newR][newC] = true;
        bfsQueue.push({newR, newC});

        int neighborCnt = 0;
        for (int dir = 0; dir < 4; ++dir)
        {
          int nextR = newR + dirX[dir];
          int nextC = newC + dirY[dir];
          if (nextR >= 0 && nextR < rows && nextC >= 0 && nextC < cols &&
            maze[nextR][nextC] != '#')
            neighborCnt++;
        }
        numNeighbors[newR][newC] = neighborCnt;
      }
    }
  }
}

static inline void matVecMult(int n, const vector<int> adj[], const double deg[], const double x[], double y[])
{
  for (int i = 0; i < n; ++i)
  {
    double sum = deg[i] * x[i];
    const vector<int> &neis = adj[i];
    for (int k = 0, sz = (int)neis.size(); k < sz; ++k)
      sum -= x[neis[k]];
    y[i] = sum;
  }
}

bool conjugateGradient(int n, const vector<int> adj[], const double deg[], const double b[], double x[], int maxIter = 0, double tol = 1e-10)
{
  if (maxIter <= 0)
    maxIter = n;

  vector<double> r(n), z(n), p(n), Ap(n);
  vector<double> invDiag(n);

  for (int i = 0; i < n; ++i)
    invDiag[i] = 1.0 / deg[i];

  for (int i = 0; i < n; ++i)
    x[i] = 0.0;

  matVecMult(n, adj, deg, x, Ap.data());
  for (int i = 0; i < n; ++i)
  {
    r[i] = b[i] - Ap[i];
    z[i] = invDiag[i] * r[i];
    p[i] = z[i];
  }

  double rzold = 0.0;
  for (int i = 0; i < n; ++i)
    rzold += r[i] * z[i];
  if (rzold == 0.0)
    return true;

  double bnorm = 0.0;
  for (int i = 0; i < n; ++i)
    bnorm += b[i] * b[i];
  if (bnorm == 0.0)
    bnorm = 1.0;

  for (int iter = 0; iter < maxIter; ++iter)
  {
    matVecMult(n, adj, deg, p.data(), Ap.data());

    double pAp = 0.0;
    for (int i = 0; i < n; ++i)
      pAp += p[i] * Ap[i];
    if (fabs(pAp) < 1e-18)
      break;

    double alpha = rzold / pAp;

    for (int i = 0; i < n; ++i)
      x[i] += alpha * p[i];
    for (int i = 0; i < n; ++i)
      r[i] -= alpha * Ap[i];

    double resnorm = 0.0;
    for (int i = 0; i < n; ++i)
      resnorm += r[i] * r[i];

    if (sqrt(resnorm) <= tol * sqrt(bnorm))
      return true;

    for (int i = 0; i < n; ++i)
      z[i] = invDiag[i] * r[i];

    double rznew = 0.0;
    for (int i = 0; i < n; ++i)
      rznew += r[i] * z[i];

    double beta = rznew / rzold;
    for (int i = 0; i < n; ++i)
      p[i] = z[i] + beta * p[i];
    rzold = rznew;
  }

  double residual = 0.0;
  matVecMult(n, adj, deg, x, Ap.data());
  for (int i = 0; i < n; ++i)
    residual += (Ap[i] - b[i]) * (Ap[i] - b[i]);
  return sqrt(residual) <= tol * sqrt(bnorm);
}

int main()
{
  int testCases;
  scanf("%d", &testCases);

  while (testCases--)
  {
    scanf("%d %d", &rows, &cols);
    for (int i = 0; i < rows; ++i)
      scanf("%s", maze[i]);

    startRow = startCol = goalRow = goalCol = -1;
    for (int i = 0; i < rows; ++i)
    {
      for (int j = 0; j < cols; ++j)
      {
        if (maze[i][j] == 'T')
        {
          startRow = i;
          startCol = j;
        }
        if (maze[i][j] == 'W')
        {
          goalRow = i;
          goalCol = j;
        }
      }
    }

    if (startRow == -1 || goalRow == -1)
    {
      printf("Mission Failed!\n");
      continue;
    }

    if (startRow == goalRow && startCol == goalCol)
    {
      printf("0.000000000000\n");
      continue;
    }

    memset(visited, false, sizeof(visited));
    exploreMaze();

    if (!visited[goalRow][goalCol])
    {
      printf("Mission Failed!\n");
      continue;
    }

    memset(cellIndex, -1, sizeof(cellIndex));
    int varCount = 0;
    for (int idx = 0; idx < totalCells; ++idx)
    {
      int r = cellList[idx].first;
      int c = cellList[idx].second;
      if (r != goalRow || c != goalCol)
        cellIndex[r][c] = varCount++;
    }

    if (varCount == 0)
    {
      printf("0.000000000000\n");
      continue;
    }

    static vector<int> adj[MAX_CELLS];
    static double deg[MAX_CELLS];
    static double b[MAX_CELLS];
    static double x[MAX_CELLS];

    for (int i = 0; i < varCount; ++i)
    {
      adj[i].clear();
      deg[i] = 0.0;
      b[i] = 0.0;
      x[i] = 0.0;
    }

    for (int idx = 0; idx < totalCells; ++idx)
    {
      int r = cellList[idx].first;
      int c = cellList[idx].second;
      if (r == goalRow && c == goalCol)
        continue;

      int rowIdx = cellIndex[r][c];
      int degree = numNeighbors[r][c];
      deg[rowIdx] = (double)degree;
      b[rowIdx] = (double)degree; 

      for (int d = 0; d < 4; ++d)
      {
        int adjR = r + dirX[d];
        int adjC = c + dirY[d];
        if (adjR >= 0 && adjR < rows && adjC >= 0 && adjC < cols &&
          maze[adjR][adjC] != '#')
        {
          int adjIdx = cellIndex[adjR][adjC];
          if (adjIdx != -1)
            adj[rowIdx].push_back(adjIdx);
        }
      }
    }

    double tol = 1e-9; 
    bool ok = conjugateGradient(varCount, adj, deg, b, x, varCount, tol);

    if (!ok)
    {
      printf("Mission Failed!\n");
    }
    else
  {
      int startIdx = cellIndex[startRow][startCol];
      printf("%.12f\n", x[startIdx]);
    }
  }

  return 0;
}
