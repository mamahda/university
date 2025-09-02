#include <bits/stdc++.h>
using namespace std;

struct Graph {
    vector<vector<pair<int, int>>> adjList; 
    long vertexCount, edgeCount;

    void init(long v) {
        vertexCount = v;
        edgeCount = 0;
        adjList.clear();
        for (int i = 0; i < vertexCount; i++) {
            adjList.push_back({});
        }
    }

    void addEdge(int u, int v, int w) {
        adjList[u].push_back({v, w});
        adjList[v].push_back({u, w});
    }

    bool dfs(int node, int target, int sum, set<pair<int, int>> &visitedEdge) {
        if (sum == target) return true;
        if (sum > target) return false;

        for (auto it : adjList[node]) {
            int v = it.first;
            int w = it.second;
            pair<int, int> edge1 = {node, v};
            pair<int, int> edge2 = {v, node};

            if (visitedEdge.count(edge1) == 0 && visitedEdge.count(edge2) == 0) {
                visitedEdge.insert(edge1);
                visitedEdge.insert(edge2);
                if (dfs(v, target, sum + w, visitedEdge)) return true;
                visitedEdge.erase(edge1);
                visitedEdge.erase(edge2);
            }
        }

        return false;
    }
};

int main() {
    int T;
    cin >> T;

    while (T--) {
        Graph g;
        int v, u, w;
        g.init(100);

        while (true) {
            cin >> u >> v >> w;
            if (u == 0 && w == 0) break;
            g.addEdge(u, v, w);
        }

        int target_weight;
        cin >> target_weight;

        bool found = false;
        for (int i = 0; i < 100; i++) {
            set<pair<int, int>> visitedEdge;
            if (g.dfs(i, target_weight, 0, visitedEdge)) {
                found = true;
                break;
            }
        }

        cout << (found ? "YES" : "NO") << endl;
    }

    return 0;
}