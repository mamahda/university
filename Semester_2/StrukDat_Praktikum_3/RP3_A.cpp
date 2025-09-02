#include <bits/stdc++.h>
using namespace std;

struct graph
{
  long vertexCount, edgeCount;
  vector<vector<pair<long, long>>> adjList;
  vector<pair<long, pair<long, long>>> edgeList;

  void init(long v)
  {
    vertexCount = v;
    edgeCount = 0;
    for (int i = 0; i < vertexCount; i++)
    {
      adjList.push_back({}); // inserts V ammount of empty vector
    }
  }

  void add_edge(long vertex1, long vertex2, long weight)
  {
    vertex1--; 
    vertex2--;
    adjList[vertex1].push_back({vertex2, weight});
    adjList[vertex2].push_back({vertex1, weight});
    edgeList.push_back({weight, {vertex1, vertex2}});
    edgeCount++;
  }

  long find_parent(vector<long> &parent, long v)
  {
    if (v == parent[v])
      return v;
    return parent[v] = find_parent(parent, parent[v]);
  }

  void union_set(vector<long> &parent, long vertex1, long vertex2)
  {
    int parent1 = find_parent(parent, vertex1);
    int parent2 = find_parent(parent, vertex2);
    if (parent1 != parent2)
      parent[parent2] = parent1;
  }

  long kruskal()
  {
    vector<long> parent(vertexCount);
    for (int i = 0; i < vertexCount; i++)
      parent[i] = i;

    sort(edgeList.begin(), edgeList.end());

    long total_cost = 0;
    int edges_taken = 0;

    for (auto edge : edgeList)
    {
      long weight = edge.first;
      long u = edge.second.first;
      long v = edge.second.second;

      if (find_parent(parent, u) != find_parent(parent, v))
      {
        total_cost += weight;
        union_set(parent, u, v);
        edges_taken++;
        if (edges_taken == vertexCount - 1)
          break;
      }
    }
    return total_cost;
  }
};

int main()
{
  long v, e;
  cin >> v >> e;

  graph g;
  g.init(v);

  for (int i = 0; i < e; i++)
  {
    long a, b, w;
    cin >> a >> b >> w;
    g.add_edge(a, b, w);
  }

  long budget;
  cin >> budget;

  long total_cost = g.kruskal();

  if (total_cost <= budget)
    cout << "Budgetnya cukup Bos! Ada sisa " << (budget - total_cost) << endl;
  else
    cout << "Waduh budgetnya kurang bos" << endl;

  return 0;
}