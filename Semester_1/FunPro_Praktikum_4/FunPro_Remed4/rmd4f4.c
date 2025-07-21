#include <stdio.h>
#include <string.h>
#include <stdbool.h>

typedef struct
{
    char name[33];
    int rate;
} Farm;

typedef struct
{
    char name[33];
    int x, z;
    int farmcount;
    Farm farms[5];
} Island;

Island islands[50];
int islandcount = 0;

void add_island(char name[], int x, int z)
{
    if (islandcount >= 50)
    {
        printf("CANNOT ADD MORE ISLAND\n");
        return;
    }
    strcpy(islands[islandcount].name, name);
    islands[islandcount].x = x;
    islands[islandcount].z = z;
    islands[islandcount].farmcount = 0;
    islandcount++;
    printf("ISLAND ADDED\n");
}

void add_farm(char farm_name[], char island_name[], int rate)
{
    for (int i = 0; i < islandcount; i++)
    {
        if (strcmp(islands[i].name, island_name) == 0)
        {
            if (islands[i].farmcount >= 5)
            {
                printf("ISLAND IS FULL CANNOT ADD FARM\n");
                return;
            }
            Farm *farm = &islands[i].farms[islands[i].farmcount];
            strcpy(farm->name, farm_name);
            farm->rate = rate;
            islands[i].farmcount++;
            printf("FARM ADDED\n");
            return;
        }
    }
    printf("ISLAND NOT FOUND CANNOT ADD FARM\n");
}

void view_all()
{
    for (int i = 0; i < islandcount; i++)
    {
        Island *island = &islands[i];
        printf("ISLAND %s has %d farms:\n", island->name, island->farmcount);
        for (int j = 0; j < island->farmcount; j++)
        {
            printf("FARM %s %d\n", island->farms[j].name, island->farms[j].rate);
        }
    }
}

int main()
{
    bool input = true;
    char cmd[17];
    while (input)
    {
        scanf("%s", cmd);
        if (strcmp(cmd, "ADD_ISLAND") == 0)
        {
            char name[33];
            int x, z;
            scanf("%s %d %d", name, &x, &z);
            add_island(name, x, z);
        }
        else if (strcmp(cmd, "ADD_FARM") == 0)
        {
            char farm_name[33], island_name[33];
            int rate;
            scanf("%s %s %d", farm_name, island_name, &rate);
            add_farm(farm_name, island_name, rate);
        }
        else if (strcmp(cmd, "VIEW_ALL") == 0)
        {
            view_all();
        }
        else
        {
            printf("INVALID COMMAND, BYE!\n");
            input = false;
        }
    }
    return 0;
}
