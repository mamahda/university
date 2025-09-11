#include <iostream>
#include <unordered_map>
using namespace std;

int main()
{
  int t, index = 1;
  bool found = false;
  unordered_map<int, int> umap;
  scanf("%d", &t);
  while (t--)
  {
    int temp;
    scanf("%d", &temp);
    if (umap.find(100-temp) == umap.end())
    {
      umap[temp] = index;
    }
    else
    {
      printf("%d\n%d\n", umap[100-temp], index);
      found = true;
    }
    index++;
  }
  return 0;
}