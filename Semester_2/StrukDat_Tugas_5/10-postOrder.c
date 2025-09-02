#include <stdio.h>

void postOrder(int num[], int index, int size) {
    if (index > size) {
        return;
    }
    
    postOrder(num, 2 * index, size);
    postOrder(num, 2 * index + 1, size);
    printf("%d ", num[index]);
}

int main() {
    int num[14] = {39, 21, 61, 18, 30, 56, 73, 13, 26, 35, 47, 64, 75}; 
    
    printf("Post-order: ");
    postOrder(num, 1, 13);
    printf("\n");
    
    return 0;
}
