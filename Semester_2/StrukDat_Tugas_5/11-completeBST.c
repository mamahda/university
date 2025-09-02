#include <stdio.h>

void constructBST(int arr[], int bst[], int n, int low, int high, int pos) {
  if (low > high) return;

  int mid = low + (high - low) / 2;
  bst[pos] = arr[mid];

  constructBST(arr, bst, n, low, mid - 1, 2 * pos);
  constructBST(arr, bst, n, mid + 1, high, 2 * pos + 1);
}

int main() {
  int input[] = {34, 23, 45, 46, 37, 78, 90, 2, 40, 20, 87, 53, 12, 15, 91};
  int n = sizeof(input) / sizeof(input[0]);

  int sorted[n];
  for (int i = 0; i < n; i++) {
    sorted[i] = input[i];
  }

  // urutkan array terlebih dahulu
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (sorted[j] > sorted[j + 1]) {
        int temp = sorted[j];
        sorted[j] = sorted[j + 1];
        sorted[j + 1] = temp;
      }
    }
  }

  int bst[16];
  constructBST(sorted, bst, n, 0, n - 1, 1);

  printf("Complete BST array: ");
  for (int i = 1; i <= n; i++) {
    printf("%d ", bst[i]);
  }
  printf("\n");

  return 0;
}
