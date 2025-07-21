#include <stdlib.h>
#include <stdbool.h>
#include <stdio.h>

typedef struct AVLNode_t
{
  int data;
  struct AVLNode_t *left,*right;
  int height;
}AVLNode;

typedef struct AVL_t
{
  AVLNode *_root;
  unsigned int _size;

  AVLNode* _avl_createNode(int value) {
    AVLNode *newNode = (AVLNode*) malloc(sizeof(AVLNode));
    newNode->data = value;
    newNode->height=1;
    newNode->left = newNode->right = NULL;
    return newNode;
  }

  AVLNode* _search(AVLNode *root, int value) {
    while (root != NULL) {
      if (value < root->data)
        root = root->left;
      else if (value > root->data)
        root = root->right;
      else
        return root;
    }
    return root;
  }

  int _getHeight(AVLNode* node){
    if(node==NULL)
      return 0; 
    return node->height;
  }

  int _max(int a,int b){
    return (a > b)? a : b;
  }

  AVLNode* _rightRotate(AVLNode* pivotNode) {

    AVLNode* newParrent=pivotNode->left;
    pivotNode->left=newParrent->right;
    newParrent->right=pivotNode;

    pivotNode->height=_max(_getHeight(pivotNode->left),
                           _getHeight(pivotNode->right))+1;
    newParrent->height=_max(_getHeight(newParrent->left),
                            _getHeight(newParrent->right))+1;

    return newParrent;
  }

  AVLNode* _leftRotate(AVLNode* pivotNode) {

    AVLNode* newParrent=pivotNode->right;
    pivotNode->right=newParrent->left;
    newParrent->left=pivotNode;

    pivotNode->height=_max(_getHeight(pivotNode->left),
                           _getHeight(pivotNode->right))+1;
    newParrent->height=_max(_getHeight(newParrent->left),
                            _getHeight(newParrent->right))+1;

    return newParrent;
  }

  AVLNode* _leftCaseRotate(AVLNode* node){
    printf("Left Case\n");
    printf("PivotNode: %d\n", node->data);
    printf("PivotNode->left: %d\n", (node->left ? node->left->data : -1));
    printf("PivotNode->left->left: %d\n", (node->left && node->left->left ? node->left->left->data : -1));
    printf("\n");
    AVLNode* hasil = _rightRotate(node);
    printf("result:\n");
    printf("NewNode: %d\n", hasil->data);
    printf("NewNode->left: %d\n", (hasil->left ? hasil->left->data : -1));
    printf("NewNode->right: %d\n", (hasil->right ? hasil->right->data : -1));
    printf("\n");
    return hasil;
  }


  AVLNode* _rightCaseRotate(AVLNode* node){
    printf("Right Case\n");
    printf("PivotNode: %d\n", node->data);
    printf("PivotNode->right: %d\n", (node->right ? node->right->data : -1));
    printf("PivotNode->right->right: %d\n", (node->right && node->right->right ? node->right->right->data : -1));
    printf("\n");
    AVLNode* hasil = _leftRotate(node);
    printf("result:\n");
    printf("NewNode: %d\n", hasil->data);
    printf("NewNode->left: %d\n", (hasil->left ? hasil->left->data : -1));
    printf("NewNode->right: %d\n", (hasil->right ? hasil->right->data : -1));
    printf("\n");
    return hasil;

  }

  AVLNode* _leftRightCaseRotate(AVLNode* node){
    printf("Left Right Case\n");
    printf("PivotNode: %d\n", node->data);
    printf("PivotNode->left: %d\n", (node->left ? node->left->data : -1));
    printf("PivotNode->left->right: %d\n", (node->left && node->left->right ? node->left->right->data : -1));
    node->left=_leftRotate(node->left);
    AVLNode* hasil = _rightRotate(node);
    printf("result:\n");
    printf("NewNode: %d\n", hasil->data);
    printf("NewNode->left: %d\n", (hasil->left ? hasil->left->data : -1));
    printf("NewNode->right: %d\n", (hasil->right ? hasil->right->data : -1));
    printf("\n");
    return hasil;
  }

  AVLNode* _rightLeftCaseRotate(AVLNode* node){
    printf("Right Left Case\n");
    printf("PivotNode: %d\n", node->data);
    printf("PivotNode->right: %d\n", (node->right ? node->right->data : -1));
    printf("PivotNode->right->left: %d\n", (node->right && node->right->left ? node->right->left->data : -1));
    printf("\n");
    node->right=_rightRotate(node->right);
    AVLNode* hasil = _leftRotate(node);
    printf("result:\n");
    printf("NewNode: %d\n", hasil->data);
    printf("NewNode->left: %d\n", (hasil->left ? hasil->left->data : -1));
    printf("NewNode->right: %d\n", (hasil->right ? hasil->right->data : -1));
    printf("\n");
    return hasil;
  }

  int _getBalanceFactor(AVLNode* node){
    if(node==NULL)
      return 0;
    return _getHeight(node->left)-_getHeight(node->right);
  }

  AVLNode* _insert_AVL(AVLNode* node,int value) {

    if(node==NULL)
      return _avl_createNode(value);
    if(value < node->data)
      node->left = _insert_AVL(node->left,value);
    else if(value > node->data)
      node->right = _insert_AVL(node->right,value);

    node->height= 1 + _max(_getHeight(node->left),_getHeight(node->right)); 

    int balanceFactor=_getBalanceFactor(node);

    if(balanceFactor > 1 && value < node->left->data)
      return _leftCaseRotate(node);
    if(balanceFactor > 1 && value > node->left->data) 
      return _leftRightCaseRotate(node);
    if(balanceFactor < -1 && value > node->right->data)
      return _rightCaseRotate(node);
    if(balanceFactor < -1 && value < node->right->data)
      return _rightLeftCaseRotate(node);

    return node;
  }

  AVLNode* _findMinNode(AVLNode *node) {
    AVLNode *currNode = node;
    while (currNode && currNode->left != NULL)
      currNode = currNode->left;
    return currNode;
  }

  AVLNode* _remove_AVL(AVLNode* node,int value){
    if(node==NULL)
      return node;
    if(value > node->data)
      node->right=_remove_AVL(node->right,value);
    else if(value < node->data)
      node->left=_remove_AVL(node->left,value);
    else{
      AVLNode *temp;
      if((node->left==NULL)||(node->right==NULL)){
        temp=NULL;
        if(node->left==NULL) temp=node->right;  
        else if(node->right==NULL) temp=node->left;

        if(temp==NULL){
          temp=node;
          node=NULL;
        }
        else
        *node=*temp;   

        free(temp);
      }
      else{
        temp = _findMinNode(node->right);
        node->data=temp->data;
        node->right=_remove_AVL(node->right,temp->data);
      }    
    }

    if(node==NULL) return node;

    node->height=_max(_getHeight(node->left),_getHeight(node->right))+1;

    int balanceFactor= _getBalanceFactor(node);

    if(balanceFactor>1 && _getBalanceFactor(node->left)>=0) 
      return _leftCaseRotate(node);

    if(balanceFactor>1 && _getBalanceFactor(node->left)<0) 
      return _leftRightCaseRotate(node);

    if(balanceFactor < -1 && _getBalanceFactor(node->right)<=0) 
      return _rightCaseRotate(node);

    if(balanceFactor < -1 && _getBalanceFactor(node->right)>0) 
      return _rightLeftCaseRotate(node);

    return node;
  }

  void init() {
    _root = NULL;
    _size = 0u;
  }

  bool isEmpty() {
    return _root == NULL;
  }

  bool find(int value) {
    AVLNode *temp = _search(_root, value);
    if (temp == NULL)
      return false;

    if (temp->data == value)
      return true;
    else
      return false;
  }

  void insert(int value){
    if(!find(value)){
      _root=_insert_AVL(_root,value);
      _size++;
    }

  }

  void remove(int value){
    if(find(value)){
      _root=_remove_AVL(_root,value);
      _size--;
    }

  }

  void preorder(AVLNode *root) {
    if (root) {
      preorder(root->left);
      printf("%d ", root->data);
      preorder(root->right);
    }
  }
}AVL;

int main(){
  AVL root;
  root.init();
  int n, value;
  scanf("%d", &n);
  for (int i = 0; i < n; i++) {
    scanf("%d", &value);
    root.insert(value);
  }

}
