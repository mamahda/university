#include <iostream>
#define ll long long
using namespace std;

struct node
{
  ll key;
  int dup;
  node *left, *right;

  // constructor
  node(ll value)
  {
    key = value;
    dup = 1;
    left = right = nullptr;
  }
};

struct bst
{
  node *_root;
  unsigned int size;

  // constructor
  bst()
  {
    _root = nullptr;
    size = 0u;
  }

  bool isEmpty()
  {
    return _root == nullptr;
  }

  void insert()
  {
    ll value;
    cin >> value;

    _root = _insert(_root, value);
    size++;
  }

  void remove()
  {
    ll value;
    cin >> value;

    if (find(value))
    {
      _root = _remove(_root, value);
      size--;
    }
  }

  bool find(ll value)
  {
    node *temp = _search(_root, value);

    if (!temp)
      return false;
    else
      return true;
  }

  void inorderTraversal()
  {
    _inorder(_root);
  }
  void postorderTraversal()
  {
    _postorder(_root);
  }
  void preorderTraversal()
  {
    _preorder(_root);
  }

private:
  node *_insert(node *_root, ll value)
  {
    if (_root == nullptr)
      return new node(value);

    if (_root->key > value)
      _root->left = _insert(_root->left, value);
    else if (_root->key < value)
      _root->right = _insert(_root->right, value);
    else if (_root->key == value)
      _root->dup++;

    return _root;
  }

  node *_findMinNode(node *_root)
  {
    node *currentNode = _root;
    while (currentNode && currentNode->left != nullptr)
      currentNode = currentNode->left;

    return currentNode;
  }

  node *_remove(node *_root, ll value)
  {
    if (_root == nullptr)
      return nullptr;

    if (_root->key > value)
      _root->left = _remove(_root->left, value);
    else if (_root->key < value)
      _root->right = _remove(_root->right, value);
    else
    {
      if (_root->dup > 1)
        _root->dup--;
      else if (_root->dup == 1)
      {
        if (_root->left == nullptr)
        {
          node *rightChild = _root->right;
          free(_root);
          return rightChild;
        }
        else if (_root->right == nullptr)
        {
          node *leftChild = _root->left;
          free(_root);
          return leftChild;
        }
      

        node *temp = _findMinNode(_root->right);
        _root->key = temp->key;
        _root->right = _remove(_root->right, temp->key);
      }
    }
    return _root;
  }

  node *_search(node *_root, ll value)
  {
    while (_root != nullptr)
    {
      if (_root->key > value)
        _root = _root->left;
      else if (_root->key < value)
        _root = _root->right;
      else
        return _root;
    }

    return _root;
  }

  void _inorder(node *_root)
  {
    if (_root)
    {
      _inorder(_root->left);
      cout << _root->key << "(" << _root->dup << ")" << " ";
      _inorder(_root->right);
    }
  }

  void _preorder(node *_root)
  {
    if (_root)
    {
      cout << _root->key << "(" << _root->dup << ")" << " ";
      _preorder(_root->left);
      _preorder(_root->right);
    }
  }

  void _postorder(node *_root)
  {
    if (_root)
    {
      _postorder(_root->left);
      _postorder(_root->right);
      cout << _root->key << "(" << _root->dup << ")" << " ";
    }
  }
};

int main()
{
  bst set;

  int n;
  cin >> n;
  for (int i = 0; i < n; i++)
  {
    string cmd;
    cin >> cmd;

    if (cmd == "insert")
      set.insert();
    else if (cmd == "remove")
      set.remove();
    else if (cmd == "inorder")
    {
      set.inorderTraversal();
      puts("");
    }
    else if (cmd == "postorder")
    {
      set.postorderTraversal();
      puts("");
    }
    else if (cmd == "preorder")
    {
      set.preorderTraversal();
      puts("");
    }
  }
}