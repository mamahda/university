#include <iostream>
#define ll long long
using namespace std;

struct AVLNode
{
  ll data;
  AVLNode *left, *right;
  int height;
};

struct AVL
{
private:
  AVLNode *_root;
  unsigned _size;

  AVLNode *_avl_createNode(ll value)
  {
    AVLNode *newNode = (AVLNode *)malloc(sizeof(AVLNode));
    newNode->data = value;
    newNode->height = 1;
    newNode->left = newNode->right = nullptr;
    return newNode;
  }

  AVLNode *_search(AVLNode *root, ll value)
  {
    while (root != nullptr)
    {
      if (value < root->data)
        root = root->left;
      else if (value > root->data)
        root = root->right;
      else
        return root;
    }
    return root;
  }

  int _getHeight(AVLNode *node)
  {
    if (node == nullptr)
      return 0;
    return node->height;
  }

  int _max(int a, int b)
  {
    return (a > b) ? a : b;
  }

  AVLNode *_rightRotate(AVLNode *pivotNode)
  {
    AVLNode *newParrent = pivotNode->left;
    pivotNode->left = newParrent->right;
    newParrent->right = pivotNode;

    pivotNode->height = _max(_getHeight(pivotNode->left),
                             _getHeight(pivotNode->right)) +
                        1;
    newParrent->height = _max(_getHeight(newParrent->left),
                              _getHeight(newParrent->right)) +
                         1;

    return newParrent;
  }

  AVLNode *_leftRotate(AVLNode *pivotNode)
  {
    AVLNode *newParrent = pivotNode->right;
    pivotNode->right = newParrent->left;
    newParrent->left = pivotNode;

    pivotNode->height = _max(_getHeight(pivotNode->left),
                             _getHeight(pivotNode->right)) +
                        1;
    newParrent->height = _max(_getHeight(newParrent->left),
                              _getHeight(newParrent->right)) +
                         1;

    return newParrent;
  }

  AVLNode *_leftCaseRotate(AVLNode *node)
  {
    return _rightRotate(node);
  }

  AVLNode *_rightCaseRotate(AVLNode *node)
  {
    return _leftRotate(node);
  }

  AVLNode *_leftRightCaseRotate(AVLNode *node)
  {
    node->left = _leftRotate(node->left);
    return _rightRotate(node);
  }

  AVLNode *_rightLeftCaseRotate(AVLNode *node)
  {
    node->right = _rightRotate(node->right);
    return _leftRotate(node);
  }

  int _getBalanceFactor(AVLNode *node)
  {
    if (node == nullptr)
      return 0;
    return _getHeight(node->left) - _getHeight(node->right);
  }

  AVLNode *_insert_AVL(AVLNode *node, ll value)
  {

    if (node == nullptr)
      return _avl_createNode(value);
    if (value < node->data)
      node->left = _insert_AVL(node->left, value);
    else if (value > node->data)
      node->right = _insert_AVL(node->right, value);

    node->height = 1 + _max(_getHeight(node->left), _getHeight(node->right));

    int balanceFactor = _getBalanceFactor(node);

    if (balanceFactor > 1 && value < node->left->data)
      return _leftCaseRotate(node);
    if (balanceFactor > 1 && value > node->left->data)
      return _leftRightCaseRotate(node);
    if (balanceFactor < -1 && value > node->right->data)
      return _rightCaseRotate(node);
    if (balanceFactor < -1 && value < node->right->data)
      return _rightLeftCaseRotate(node);

    return node;
  }

  AVLNode *_findMinNode(AVLNode *node)
  {
    AVLNode *currNode = node;
    while (currNode && currNode->left != nullptr)
      currNode = currNode->left;
    return currNode;
  }

  AVLNode *_remove_AVL(AVLNode *node, int value)
  {
    if (node == nullptr)
      return node;
    if (value > node->data)
      node->right = _remove_AVL(node->right, value);
    else if (value < node->data)
      node->left = _remove_AVL(node->left, value);
    else
    {
      AVLNode *temp;
      if ((node->left == nullptr) || (node->right == nullptr))
      {
        temp = nullptr;
        if (node->left == nullptr)
          temp = node->right;
        else if (node->right == nullptr)
          temp = node->left;

        if (temp == nullptr)
        {
          temp = node;
          node = nullptr;
        }
        else
          *node = *temp;

        free(temp);
      }
      else
      {
        temp = _findMinNode(node->right);
        node->data = temp->data;
        node->right = _remove_AVL(node->right, temp->data);
      }
    }

    if (node == nullptr)
      return node;

    node->height = _max(_getHeight(node->left), _getHeight(node->right)) + 1;

    int balanceFactor = _getBalanceFactor(node);

    if (balanceFactor > 1 && _getBalanceFactor(node->left) >= 0)
      return _leftCaseRotate(node);

    if (balanceFactor > 1 && _getBalanceFactor(node->left) < 0)
      return _leftRightCaseRotate(node);

    if (balanceFactor < -1 && _getBalanceFactor(node->right) <= 0)
      return _rightCaseRotate(node);

    if (balanceFactor < -1 && _getBalanceFactor(node->right) > 0)
      return _rightLeftCaseRotate(node);

    return node;
  }

public:
  void init()
  {
    _root = nullptr;
    _size = 0U;
  }

  bool isEmpty()
  {
    return _root == nullptr;
  }

  void find()
  {
    ll value;
    cin >> value;

    if (find2(value)){
      AVLNode *print = _root;
      cout << value << " found with path: " << print->data << " ";
      while(print->data != value){
        if(print->data > value){
          print = print->left;
        }
        else if(print->data < value){
          print = print->right;
        }
        cout << print->data << " ";
      }
      puts("");
    }
    else{
      cout << value << " not found" << endl;
    }
  }

  bool find2(int value) {
    AVLNode *temp = _search(_root, value);
    if (temp == nullptr)
        return false;
    
    if (temp->data == value) return true;
    else return false;
}


  void insert()
  {
    ll value;
    cin >> value;
    if (!find2(value))
    {
      _root = _insert_AVL(_root, value);
      _size++;
      cout << value << " inserted" << endl;
    }
  }

  void remove()
  {
    ll value;
    cin >> value; 

    if (find2(value))
    {
      _root = _remove_AVL(_root, value);
      _size--;
      cout << value << " deleted" << endl;
    }
  }
};

int main(int argc, char const *argv[])
{
  AVL set;
  set.init();

  int n;
  cin >> n;
  for (int i = 0; i < n; i++)
  {
    string cmd;
    cin >> cmd;

    if (cmd == "INSERT")
      set.insert();
    else if(cmd == "DELETE")
      set.remove();
    else if(cmd == "FIND")
      set.find();
  }
}