#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <unordered_set>
using namespace std;

int sumOfDiv(int x)
{
    if (x == 1) return 0;
    
    int sum = 1;
    int sr = sqrt(x);
    for (int i = 2; i <= sr; i++)
    {
        if (x % i == 0)
        {
            sum += i;
            if (x / i != i)
                sum += x / i;
        }
    }
    return sum;
}

bool pasangan(int a, int b)
{
    return (a != b) && (sumOfDiv(a) == b) && (sumOfDiv(b) == a);
}

int main()
{
    int m, n;
    cin >> m >> n;
    
    vector<pair<int, int>> pairs;
    unordered_set<int> processed;
    
    for (int i = m; i <= n; i++)
    {
        if (processed.find(i) != processed.end())
            continue;
            
        int sum_i = sumOfDiv(i);
        
        if (sum_i >= m && sum_i <= n && sum_i != i)
        {
            int sum_sum_i = sumOfDiv(sum_i);
            if (sum_sum_i == i && pasangan(i, sum_i))
            {
                int first = min(i, sum_i);
                int second = max(i, sum_i);
                
                pairs.push_back({first, second});
                processed.insert(i);
                processed.insert(sum_i);
            }
        }
    }
    
    sort(pairs.begin(), pairs.end());
    if (pairs.empty())
    {
        cout << "Absent" << endl;
    }
    else
    {
        for (const auto& p : pairs)
        {
            cout << p.first << " " << p.second << endl;
        }
    }
    
    return 0;
}