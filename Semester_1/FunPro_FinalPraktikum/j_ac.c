#include <stdio.h>
#include <stdlib.h>

typedef struct
{
    int value;
    int i;
    int j;
} Element;

int compare(const void *a, const void *b)
{
    return ((Element *)a)->value - ((Element *)b)->value;
}

int main()
{
    int x, y, target;
    scanf("%d %d", &x, &y);
    int array[x][y];
    Element arr[x * y];
    int k = 0;
    for (int i = 0; i < x; i++)
    {
        for (int j = 0; j < y; j++)
        {
            scanf("%d", &array[i][j]);
            arr[k].value = array[i][j];
            arr[k].i = i;
            arr[k].j = j;
            k++;
        }
    }
    scanf("%d", &target);
    qsort(arr, x * y, sizeof(Element), compare);
    int left = 0, right = x * y - 1;
    int found = 0;
    while (left <= right)
    {
        int mid = left + (right - left) / 2;
        if (arr[mid].value == target)
        {
            printf("Element %d found at position: (%d, %d).\n", target, arr[mid].i + 1, arr[mid].j + 1);
            found = 1;
            break;
        }
        else if (arr[mid].value < target)
        {
            left = mid + 1;
        }
        else
        {
            right = mid - 1;
        }
    }
    if (!found)
    {
        printf("Element %d not found.\n", target);
    }
}