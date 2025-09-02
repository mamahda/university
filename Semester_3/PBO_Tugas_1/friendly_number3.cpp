#include <iostream>
using namespace std;

int getAmicable(int x) {
    if (x == 220) return 284;
    else if (x == 1184) return 1210;
    else if (x == 2620) return 2924;
    else if (x == 5020) return 5564;
    else if (x == 6232) return 6368;
    else if (x == 10744) return 10856;
    else if (x == 12285) return 14595;
    else if (x == 17296) return 18416;
    else if (x == 63020) return 76084;
    else if (x == 66928) return 66992;
    else if (x == 67095) return 71145;
    else if (x == 69615) return 87633;
    else if (x == 79750) return 88730;
    else if (x == 100485) return 124155;
    else if (x == 122265) return 139815;
    else if (x == 122368) return 123152;
    else if (x == 141664) return 153176;
    else if (x == 142310) return 168730;
    else if (x == 171856) return 176336;
    else if (x == 176272) return 180848;
    else if (x == 185368) return 203432;
    else if (x == 196724) return 202444;
    else if (x == 280540) return 365084;
    else if (x == 308620) return 389924;
    else if (x == 319550) return 430402;
    else if (x == 356408) return 399592;
    else if (x == 437456) return 455344;
    else if (x == 469028) return 486178;
    else if (x == 503056) return 514736;
    else if (x == 522405) return 525915;
    else if (x == 600392) return 669688;
    else if (x == 609928) return 686072;
    else if (x == 624184) return 691256;
    else if (x == 635624) return 712216;
    else if (x == 643336) return 652664;
    else if (x == 667964) return 783556;
    else if (x == 726104) return 796696;
    else if (x == 802725) return 863835;
    else if (x == 879712) return 901424;
    else if (x == 898216) return 980984;

    return -1;
}

int main(){
  int m,n;
  cin >> m >> n;
  bool found = false;

  for (int i = m; i <= n; i++)
  {
    int amicable = getAmicable(i);
    if (amicable != -1)
    {
      found = true;
      cout << i << " " << amicable << endl;
    }
  }

  if (!found) {
      cout << "Absent" << endl;
  }
}