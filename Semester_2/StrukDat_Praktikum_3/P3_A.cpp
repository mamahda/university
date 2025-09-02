#include <bits/stdc++.h>
using namespace std;

struct graph
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

  void add_edge(long vertex1, long vertex2)
  {
    adjList[vertex1].push_back(vertex2);
    adjList[vertex2].push_back(vertex1);
    edgeCount++;
  }

  void bfs_distance(vector<long> &result, long start, long targetLevel)
  {
    vector<bool> visited(vertexCount, false);
    vector<long> distance(vertexCount, -1);
    queue<long> q;

    q.push(start);
    visited[start] = true;
    distance[start] = 0;

    while (!q.empty())
    {
      long current = q.front();
      q.pop();

      for (auto vertex : adjList[current])
      {
        long next = vertex;
        if (!visited[next])
        {
          visited[next] = true;
          distance[next] = distance[current] + 1;
          q.push(next);
        }
      }
    }
    for (long i = 0; i < vertexCount; i++)
    {
      if (distance[i] == targetLevel)
        result.push_back(i);
    }
  }
};

int main()
{
  long N, M, L;
  cin >> N >> M >> L;

  long S;
  cin >> S;

  graph g;
  g.init(N);

  for (int i = 0; i < M; ++i)
  {
    long u, v;
    cin >> u >> v;
    g.add_edge(u, v);
  }

  vector<long> result;
  g.bfs_distance(result, S, L);

  if (result.empty())
  {
    cout << "Not Found" << endl;
  }
  else
  {
    for (auto node : result)
    {
      cout << node << endl;
    }
  }

  return 0;
}
