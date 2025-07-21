#include <bits/stdc++.h>
using namespace std;

struct Graph
{
  long vertexCount, edgeCount;
  vector<vector<long>> adjList;

  void init(long v)
  {
    vertexCount = v;
    edgeCount = 0;
    for (int i = 0; i < vertexCount; i++)
    {
      adjList.push_back({}); // inserts V ammount of empty vector
    }
  }

  void add_edge(long u, long v)
  {
    adjList[u].push_back(v);
    adjList[v].push_back(u);
    edgeCount++;
  }

  int bfs(long source, long target)
  {
    vector<int> distance(vertexCount, -1);
    queue<long> q;

    q.push(source);
    distance[source] = 0;

    while (!q.empty())
    {
      long curr = q.front();
      q.pop();

      for (auto neighbor : adjList[curr])
      {
        if (distance[neighbor] == -1)
        {
          distance[neighbor] = distance[curr] + 1;
          q.push(neighbor);
        }
      }
    }

    return distance[target];
  }
};

int main()
{
  long N, M, S, T;
  cin >> N >> M >> S >> T;

  Graph g;
  g.init(N);

  for (int i = 0; i < M; i++)
  {
    long u, v;
    cin >> u >> v;
    g.add_edge(u, v);
  }

  cout << g.bfs(S, T) << endl;
  return 0;
}
