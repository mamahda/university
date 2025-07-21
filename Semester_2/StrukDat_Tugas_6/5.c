#include <stdio.h>
#include <stdlib.h>

typedef struct TreeNode {
  int val;
  struct TreeNode* left;
  struct TreeNode* right;
} TreeNode;

TreeNode* create(int val) {
  TreeNode* new = (TreeNode*) malloc(sizeof(TreeNode));
  new->val = val;
  new->left = NULL;
  new->right = NULL;
  return new;
}

TreeNode* insert(TreeNode* root, int val) {
  if (root == NULL) return create(val);

  if (val < root->val) {
    root->left = insert(root->left, val);
  } else {
    root->right = insert(root->right, val);
  }
  return root;
}

void preorderTraversal(TreeNode* root) {
  if (root == NULL) return;
  printf("%d ", root->val);
  preorderTraversal(root->left);
  preorderTraversal(root->right);
}

TreeNode* findMin(TreeNode* node) {
  while (node != NULL && node->left != NULL) {
    node = node->left;
  }
  return node;
}

TreeNode* findMax(TreeNode* node) {
  while (node != NULL && node->right != NULL) {
    node = node->right;
  }
  return node;
}

TreeNode* deleteNode(TreeNode* root, int key) {
  if (root == NULL) return NULL;

  if (key < root->val) {
    root->left = deleteNode(root->left, key);
  } else if (key > root->val) {
    root->right = deleteNode(root->right, key);
  } else {
    if (root->left == NULL) {
      TreeNode* temp = root->right;
      free(root);
      return temp;
    } else if (root->right == NULL) {
      TreeNode* temp = root->left;
      free(root);
      return temp;
    } else {
      TreeNode* temp = findMin(root->right);
      root->val = temp->val;
      root->right = deleteNode(root->right, temp->val);
    }
  }
  return root;
}


TreeNode* deleteRootWithSuccessor(TreeNode* root) {
  if (root == NULL) return NULL;

  if (root->left == NULL) {
    TreeNode* temp = root->right;
    free(root);
    return temp;
  } else if (root->right == NULL) {
    TreeNode* temp = root->left;
    free(root);
    return temp;
  } else {
    TreeNode* successor = findMin(root->right);
    root->val = successor->val;
    root->right = deleteNode(root->right, successor->val);
    return root;
  }
}

TreeNode* deleteRootWithPredecessor(TreeNode* root) {
  if (root == NULL) return NULL;

  if (root->left == NULL) {
    TreeNode* temp = root->right;
    free(root);
    return temp;
  } else if (root->right == NULL) {
    TreeNode* temp = root->left;
    free(root);
    return temp;
  } else {
    TreeNode* predecessor = findMax(root->left);
    root->val = predecessor->val;
    root->left = deleteNode(root->left, predecessor->val);
    return root;
  }
}

int main() {
  TreeNode* root = NULL;

  // Membuat contoh tree:
  //         40
  //        /  \
  //      20    60
  //     / \    / \
  //    10 30  50 70
  root = insert(root, 40);
  insert(root, 20);
  insert(root, 60);
  insert(root, 10);
  insert(root, 30);
  insert(root, 50);
  insert(root, 70);

  printf("Pre-order traversal sebelum delete root:\n");
  preorderTraversal(root);
  printf("\n");

  // root = deleteRootWithSuccessor(root);

  root = deleteRootWithPredecessor(root);

  printf("Pre-order traversal setelah delete root:\n");
  preorderTraversal(root);
  printf("\n");

  return 0;
}

