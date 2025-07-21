#include <stdio.h>
#include <stdbool.h>

int matrix[7][7];
bool visited[7][7];
int n, m, count = 0;

int dx[] = {-1, 1, 0, 0};
int dy[] = {0, 0, -1, 1};

void dfs(int x, int y)
{
    if (matrix[x][y] == 1)
    {
        count++;
        return;
    }

    visited[x][y] = true;

    for (int i = 0; i < 4; i++)
    {
        int nx = x + dx[i];
        int ny = y + dy[i];

        if (nx >= 0 && nx < n && ny >= 0 && ny < m)
        {
            if (!visited[nx][ny] && matrix[nx][ny] % 2 == 1)
            {   
                dfs(nx, ny);
            }
        }
    }

    visited[x][y] = false;
}

int main()
{
    scanf("%d %d", &n, &m);

    int startx = -1, starty = -1;
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < m; j++)
        {
            scanf("%d", &matrix[i][j]);
            if (matrix[i][j] == 0)
            {
                startx = i;
                starty = j;
            }
        }
    }

    if (startx == -1 || starty == -1)
    {
        printf("Kucing oren tidak bisa pulang ke rumah :(\n");
        return 0;
    }

    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < m; j++)
        {
            visited[i][j] = false;
        }
    }

    dfs(startx, starty);

    if (count > 0)
    {
        printf("Terdapat %d jalan untuk kucing oren pulang\n", count);
    }
    else
    {
        printf("Kucing oren tidak bisa pulang ke rumah :(\n");
    }

    return 0;
}
