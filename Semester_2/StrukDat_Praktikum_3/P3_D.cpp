#include <bits/stdc++.h>
using namespace std;

struct graph
{
  vector<vector<long>> adjList;
  long vertexCount, edgeCount;

  void init(long v)
  {
    vertexCount = v;
    edgeCount = 0;
    adjList.clear();
    for (int i = 0; i < vertexCount; i++)
    {
      adjList.push_back({});
    }
  }

  void addEdge(int u, int v)
  {
    adjList[u].push_back(v);
    adjList[v].push_back(u);
  }

  bool cycleUtil(int node, int parent, vector<bool> &visited, vector<int> &parentTrack, int &startNode, int &endNode)
  {
    visited[node] = true;

    for (int neighbor : adjList[node])
    {
      if (!visited[neighbor])
      {
        parentTrack[neighbor] = node;
        if (cycleUtil(neighbor, node, visited, parentTrack, startNode, endNode))
        {
          return true;
        }
      }
      else if (neighbor != parent)
      {
        startNode = neighbor;
        endNode = node;
        return true;
      }
    }
    return false;
  }

  bool isCycle(int v, vector<bool> &visited, vector<int> &cycle_path)
  {
    vector<int> parentTrack(v, -1);
    int start = -1, end = -1;

    for (int i = 0; i < v; i++)
    {
      if (!visited[i])
      {
        if (cycleUtil(i, -1, visited, parentTrack, start, end))
        {
          int current = end;
          while (current != start)
          {
            cycle_path.push_back(current);
            current = parentTrack[current];
          }
          cycle_path.push_back(start);
          reverse(cycle_path.begin(), cycle_path.end());
          return true;
        }
      }
    }
    return false;
  }
};

int main()
{
  int t;
  cin >> t;
  while (t--)
  {
    int n, v;
    graph g;
    cin >> n >> v;
    g.init(n);

    for (int i = 0; i < v; i++)
    {
      int u, w;
      cin >> u >> w;
      g.addEdge(u, w);
    }

    vector<bool> visited(n, false);
    vector<int> cycle_path;

    if (g.isCycle(n, visited, cycle_path))
    {
      cout << "VOCALOID CYCLE PROGRAM (VCP) : CYCLE DETECTED ";
      for (int node : cycle_path)
      {
        cout << node << " ";
      }
      cout << endl;
    }
    else
    {
      cout << "VOCALOID CYCLE PROGRAM (VCP) : NO CYCLE DETECTED" << endl;
    }
  }

  return 0;
}