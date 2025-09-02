#include <bits/stdc++.h>
using namespace std;

struct graph {
  map<string, vector<string>> adjList;
  map<string, string> parent;

  void add_edge(string vertex1, string vertex2) {
    if (parent.find(vertex1) == parent.end()) {
      parent[vertex1] = vertex1;
    }
    if (parent.find(vertex2) == parent.end()) {
      parent[vertex2] = vertex2;
    }

    adjList[vertex1].push_back(vertex2);
    adjList[vertex2].push_back(vertex1);

    union_set(vertex1, vertex2);
  }

  string find_parent(string v) {
    if (v == parent[v])
      return v;
    return parent[v] = find_parent(parent[v]);
  }

  void union_set(string vertex1, string vertex2) {
    string parent1 = find_parent(vertex1);
    string parent2 = find_parent(vertex2);

    if (parent1 != parent2)
      parent[parent2] = parent1;
  }

  bool isAlly(string vertex1, string vertex2) {
    if (parent.find(vertex1) == parent.end() || parent.find(vertex2) == parent.end()) {
      return false;
    }
    return find_parent(vertex1) == find_parent(vertex2);
  }
};

int main() {
  graph g;
  int n;
  cin >> n;

  for (int i = 0; i < n; i++) {
    string cmd, name1, name2;
    cin >> cmd >> name1 >> name2;

    if (cmd == "RECRUIT") {
      g.add_edge(name1, name2);
    }
    else if (cmd == "CHECK") {
      if (g.isAlly(name1, name2)) {
        cout << "YES" << endl;
      } 
      else {
        cout << "NO" << endl;
      }
    }
    else if (cmd == "ALLY") {
      if (g.parent.find(name1) == g.parent.end()) {
        g.parent[name1] = name1;
      }
      if (g.parent.find(name2) == g.parent.end()) {
        g.parent[name2] = name2;
      }
      g.union_set(name1, name2);
    }
  }

  return 0;
}
