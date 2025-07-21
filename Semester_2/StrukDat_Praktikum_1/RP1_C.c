#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
  long long data;
  struct node *next;
} node;

typedef struct
{
  node *first;
} head;

void init(head *head)
{
  head->first = NULL;
}

void insertlast(head *head, long long data)
{
  node *newNode = (node *)malloc(sizeof(node));
  newNode->data = data;
  newNode->next = NULL;

  if (head->first == NULL)
  {
    head->first = newNode;
  }
  else
  {
    node *current = head->first;
    while (current->next != NULL)
    {
      current = current->next;
    }
    current->next = newNode;
  }
}

void balik(head *head)
{
  node *prev = NULL;
  node *current = head->first;
  node *next = NULL;

  while (current != NULL)
  {
    next = current->next;
    current->next = prev;
    prev = current;
    current = next;
  }
  head->first = prev;
}

void llprint(head *head)
{
  node *current = head->first;
  while (current != NULL)
  {
    printf("%lld ", current->data);
    current = current->next;
  }
}

int main()
{
  head head;
  init(&head);

  int n;
  scanf("%d", &n);
  for (int i = 0; i < n; i++)
  {
    long long temp;
    scanf("%lld", &temp);
    insertlast(&head, temp);
  }

  balik(&head);
  llprint(&head);

  return 0;
}