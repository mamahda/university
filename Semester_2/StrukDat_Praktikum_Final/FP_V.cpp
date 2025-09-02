#include <bits/stdc++.h>
using namespace std;

struct BSTNode
{
  BSTNode *left, *right;
  int key;
};

struct BST
{
  // Member
  BSTNode *_root;
  unsigned int _size;

  // Function
  void init()
  {
    _root = NULL;
    _size = 0u;
  }

  bool isEmpty()
  {
    return _root == NULL;
  }

  int findDepth(int value)
    {
        int depth = 0; 
        BSTNode *temp = _root;
        while (temp != NULL)
        {
            depth++; 
            if (value < temp->key)
                temp = temp->left;
            else if (value > temp->key)
                temp = temp->right;
            else
                return depth; 
        }
        return -1; 
    }

  bool find(int value)
  {
    BSTNode *temp = __search(_root, value);
    if (!temp)
      return false;

    if (temp->key == value)
      return true;
    else
      return false;
  }

  void insert(int value)
  {
    if (!find(value))
    {
      _root = __insert(_root, value);
      _size++;
    }
  }

  void remove(int value)
  {
    if (find(value))
    {
      _root = __remove(_root, value);
      _size++;
    }
  }

  void traverseInorder()
  {
    __inorder(_root);
  }

private:
  BSTNode *__createNode(int value)
  {
    BSTNode *newNode = (BSTNode *)malloc(sizeof(BSTNode));
    newNode->key = value;
    newNode->left = newNode->right = NULL;
    return newNode;
  }

  BSTNode *__search(BSTNode *root, int value)
  {
    while (root != NULL)
    {
      if (value < root->key)
        root = root->left;
      else if (value > root->key)
        root = root->right;
      else
        return root;
    }
    return root;
  }

  BSTNode *__insert(BSTNode *root, int value)
  {
    if (root == NULL)
      return __createNode(value);

    if (value < root->key)
      root->left = __insert(root->left, value);
    else if (value > root->key)
      root->right = __insert(root->right, value);

    return root;
  }

  BSTNode *__findMinNode(BSTNode *node)
  {
    BSTNode *currNode = node;
    while (currNode && currNode->left != NULL)
      currNode = currNode->left;

    return currNode;
  }

  BSTNode *__remove(BSTNode *root, int value)
  {
    if (root == NULL)
      return NULL;

    if (value > root->key)
      root->right = __remove(root->right, value);
    else if (value < root->key)
      root->left = __remove(root->left, value);
    else
    {

      if (root->left == NULL)
      {
        BSTNode *rightChild = root->right;
        free(root);
        return rightChild;
      }
      else if (root->right == NULL)
      {
        BSTNode *leftChild = root->left;
        free(root);
        return leftChild;
      }

      BSTNode *temp = __findMinNode(root->right);
      root->key = temp->key;
      root->right = __remove(root->right, temp->key);
    }
    return root;
  }

  void __inorder(BSTNode *root)
  {
    if (root)
    {
      __inorder(root->left);
      printf("%d ", root->key);
      __inorder(root->right);
    }
  }
};

int main(int argc, char const *argv[])
{
  int n;
  cin >> n;

  BST tree;
  tree.init();

  for (int i = 0; i < n; i++)
  {
    string cmd;
    cin >> cmd;
    if (cmd == "INSERT")
    {
      int value;
      cin >> value;
      tree.insert(value);
    }
    else if (cmd == "DELETE")
    {
      int value;
      cin >> value;
      tree.remove(value);
    }
    else if (cmd == "SEARCH")
    {
      int value;
      cin >> value;
      cout << tree.findDepth(value) << endl;
    }
    else if (cmd == "PRINT")
    {
      if (tree.isEmpty())
      {
        cout << "EMPTY" << endl;
        continue;
      }
      tree.traverseInorder();
      cout << endl;
    }
  }
  

  return 0;
}