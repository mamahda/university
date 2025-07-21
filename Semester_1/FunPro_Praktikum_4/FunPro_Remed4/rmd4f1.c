#include <stdio.h>

typedef struct
{
    char name[100];
    int *link;
} person;

int main()
{
    int n;
    scanf("%d", &n);
    person p[n];
    for (int i = 0; i < n; i++)
    {
        char name[101], relation[101];
        scanf("%s %s", name, relation);
        strcpy(p[i].name, name);
        for (int j = 0; j < n; j++)
        {
            if (strcmp(relation, p[j].name) == 0)
            {
                p[i].link = &p[j].name;
            }
        }
    }
}