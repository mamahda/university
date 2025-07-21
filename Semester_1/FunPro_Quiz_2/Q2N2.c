#include <stdio.h>
#include <stdlib.h>
#include <string.h>
struct treeNode {
struct treeNode *left; /* treeNode pointer */
int data; /* define data as an int */
struct treeNode *right; /* treeNode pointer */
struct treeNode *parent; /* treeNode pointer */
}; /* end structure treeNode */
typedef struct treeNode TreeNode;
typedef TreeNode *TreeNodePtr;
void preOrder(TreeNodePtr treePtr, int sum) {
/* if tree is not empty then traverse */
if ( treePtr->left != NULL || treePtr->right != NULL )
{ //is a node

printf( "node: %3d\n", treePtr->data );
if (treePtr->left != NULL) {
    preOrder(treePtr->left, sum + treePtr->data);
}

if (treePtr->right != NULL) {
    preOrder(treePtr->right, sum + treePtr->data);
}
} /* end if */
else { //is a leaf
printf("leaf : %d\n", sum + treePtr->data);
}
} /* end function preOrder */


TreeNodePtr insertLeft(TreeNodePtr from, int data) {
TreeNodePtr d = malloc(sizeof(TreeNode));
d->data = data;
d->left = NULL;
d->right = NULL;
d->parent = from;
from->left = d;
return d;
}
TreeNodePtr insertRight(TreeNodePtr from, int data) {
TreeNodePtr d = malloc(sizeof(TreeNode));
d->data = data;
d->left = NULL;
d->right = NULL;
d->parent = from;
from->right = d;
return d;
}
TreeNodePtr parseFile(char* filename, TreeNodePtr cur) {
FILE *fptr;
TreeNodePtr root = NULL;
if ((fptr = fopen(filename,"r")) == NULL) {
printf("Error! opening file");
// Program exits if the file pointer returns NULL.
exit(1);
}
char c[100] ;
while (fgets(c, 100, (FILE*)fptr)) {
printf("%s", c );
char digit[5];
fgets(digit, 5, (FILE*)fptr);
for (int x = 0; x<5; x++) {
if (digit[x]=='\n') digit[x] = '\0';
}
int data = atoi(digit);
int count, cur2;
if (c[0]=='l') {
count = 0;
cur2 = 2;
while (1) { /* While (true) */
if (c[cur2] = '\n') {
break;
}
cur2+=1;
count+=1;
}
//get the digit here
printf("left - data: %d\n",data);
cur = insertLeft(cur, data);
} else if (c[0]=='u') {
cur2 = 1;
while (c[cur2]=='u') {
cur2+=1;
}
for (int x = 0; x<cur2; x++) {
cur = cur->parent;
}
//get the digit here
cur = insertRight(cur, data);
//get the digit here
printf("right - data: %d\n",data);
} else if (c[0] == '0') {
cur = malloc(sizeof(TreeNode));
cur->parent = NULL;
cur->left = NULL;
cur->right = NULL;
cur->parent = NULL;
cur->data = data;
count = 0;
cur2 = 2;
while (1) { /* while (true) */
if (c[cur2] = '\n') {
break;
}
cur2+=1;
count+=1;
}
//get the digit here
root = cur;
printf("root - data: %d\n",data);
}
}
fclose(fptr);
return root;
}
int main() {
TreeNodePtr root = NULL;
root = parseFile("02_file_input.txt", root);
preOrder(root, 0);
return 0;
}