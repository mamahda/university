#include <stdio.h>
#include <stdlib.h>

typedef struct TreeNode {
  int val;
  struct TreeNode* left;
  struct TreeNode* right;
} TreeNode;

TreeNode* create(int key) {
  TreeNode* node = (TreeNode*)malloc(sizeof(TreeNode));
  node->val = key;
  node->left = NULL;
  node->right = NULL;
  return node;
}

TreeNode* insert(TreeNode* root, int key) {
  if (root == NULL) return create(key);
  
  if (key < root->val) {
    root->left = insert(root->left, key);
  } else {
    root->right = insert(root->right, key);
  }
  return root;
}

TreeNode* search_pre_order(TreeNode* root, int key) {
  if (root == NULL) {
    return NULL;
  }
  if (root->val == key) {
    return root;
  }
  TreeNode* left_search = search_pre_order(root->left, key);
  if (left_search) {
    return left_search;
  }
  return search_pre_order(root->right, key);
}

TreeNode* search_in_order(TreeNode* root, int key) {
  if (root == NULL) {
    return NULL;
  }
  TreeNode* left_search = search_in_order(root->left, key);
  if (left_search) {
    return left_search;
  }
  if (root->val == key) {
    return root;
  }
  return search_in_order(root->right, key);
}

TreeNode* search_post_order(TreeNode* root, int key) {
  if (root == NULL) {
    return NULL;
  }
  TreeNode* left_search = search_post_order(root->left, key);
  if (left_search) {
    return left_search;
  }
  TreeNode* right_search = search_post_order(root->right, key);
  if (right_search) {
    return right_search;
  }
  if (root->val == key) {
    return root;
  }
  return NULL;
}

int main() {
  TreeNode* root = NULL;

  // Membuat contoh tree:
  //         50
  //        /  \
  //      30    70
  //     / \    / \
  //    20 40  60 80
  root = insert(root, 50);
  insert(root, 30);
  insert(root, 70);
  insert(root, 20);
  insert(root, 40);
  insert(root, 60);
  insert(root, 80);

  int key = 40;

  TreeNode* result = search_pre_order(root, key);
  if (result != NULL) {
    printf("Pre-order search: key %d ditemukan\n", result->val);
  } else {
    printf("Pre-order search: Key %d tidak ditemukan\n", key);
  }

  result = search_in_order(root, key);
  if (result != NULL) {
    printf("In-order search: key %d ditemukan\n", result->val);
  } else {
    printf("In-order search: key %d tidak ditemukan\n", key);
  }

  result = search_post_order(root, key);
  if (result != NULL) {
    printf("Post-order search: key %d ditemukan\n", result->val);
  } else {
    printf("Post-order search: Key %d tidak ditemukan\n", key);
  }

  return 0;
}

