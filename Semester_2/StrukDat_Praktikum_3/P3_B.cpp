#include <bits/stdc++.h>
using namespace std;

struct graph
{
  long vertexCount, edgeCount;
  vector<vector<pair<long, long>>> adjList;

  void init(long v)
  {
    vertexCount = v;
    edgeCount = 0;

    adjList.resize(vertexCount);
  }

  void add_edge(long vertex1, long vertex2, long weight)
  {
    adjList[vertex1].push_back(make_pair(vertex2, weight));
    edgeCount++;
  }

  void dijkstra(vector<long> &result, vector<long> &predecessor, long start)
  {
    vector<bool> visited(vertexCount, false);
    priority_queue<pair<long, long>, vector<pair<long, long>>, greater<>> pq;

    result = vector<long>(vertexCount, LONG_MAX);
    predecessor = vector<long>(vertexCount, -1); // predecessor is a vector to store the predecessor (pendahulu) of each node

    pq.push({0, start});
    result[start] = 0;

    while (!pq.empty())
    {
      auto [dist, u] = pq.top();
      pq.pop();

      if (visited[u])
        continue;
      visited[u] = true;

      for (auto [v, weight] : adjList[u])
      {
        if (!visited[v] && result[u] + weight < result[v])
        {
          result[v] = result[u] + weight;
          predecessor[v] = u;
          pq.push({result[v], v});
        }
      }
    }
  }

  vector<long> trace_path(long start, long end, const vector<long> &predecessor)
  {
    vector<long> path;
    for (long at = end; at != -1; at = predecessor[at])
    {
      path.push_back(at);
    }
    reverse(path.begin(), path.end());
    if (!path.empty() && path[0] == start)
      return path;
    return {};
  }
};

int main()
{
  long V, N;
  cin >> V >> N;

  graph g;
  g.init(V);

  for (int i = 0; i < N; ++i)
  {
    long a, b, c;
    cin >> a >> b >> c;
    g.add_edge(a, b, c);
  }

  long start, end;
  cin >> start >> end;

  vector<long> dijkstra_result;
  vector<long> predecessor;
  g.dijkstra(dijkstra_result, predecessor, start);
  vector<long> path = g.trace_path(start, end, predecessor);

  if (!path.empty())
  {
    cout << "Path found with cost " << dijkstra_result[end] << ": ";
    for (auto node : path)
    {
      cout << node << " ";
    }
    cout << endl;
  }
  else
  {
    cout << "Impossible to find the path" << endl;
  }

  return 0;
}