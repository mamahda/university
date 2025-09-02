#include <stdio.h>
#include <ctype.h>

typedef struct {
  int stack[100];
  int top;
} stack;

stack s1;
stack s2;

int precedence(char op) {
  if (op == '+' || op == '-') return 1;
  else if (op == '*' || op == '/') return 2;
  return 0;
}

void infixtopostfix(char *infix, char *postfix) {
  int j = 0;
  for (int i = 0; infix[i]; i++) {
    if (isdigit(infix[i])) {
      postfix[j++] = infix[i];
    } else if (infix[i] == '(') {
      s1.stack[++s1.top] = infix[i];
    } else if (infix[i] == ')') {
      while (s1.stack[s1.top] != '(') 
        postfix[j++] = s1.stack[s1.top--];
      s1.top--;
    } else {
      while (s1.top != -1 && precedence(s1.stack[s1.top]) >= precedence(infix[i])) 
        postfix[j++] = s1.stack[s1.top--];
      s1.stack[++s1.top] = infix[i];
    }
  }
  
  while (s1.top != -1) postfix[j++] = s1.stack[s1.top--];
  postfix[j] = '\0';
}

int evaluate(char *postfix) {
  for (int i = 0; postfix[i]; i++) {
    if (isdigit(postfix[i])) {
      s2.stack[++s2.top] = postfix[i] - '0';
    } else {
      int b = s2.stack[s2.top--];
      int a = s2.stack[s2.top--];

      if (postfix[i] == '+') s2.stack[++s2.top] = a + b;
      else if (postfix[i] == '-') s2.stack[++s2.top] = a - b;
      else if (postfix[i] == '*') s2.stack[++s2.top] = a * b;
      else if (postfix[i] == '/') s2.stack[++s2.top] = a / b;
    }
  }
  return s2.stack[s2.top];
}

int main() {
  s1.top = -1;
  s2.top = -1;
  char infix[] = "(2+3)*(8/4)-6", postfix[100];
  printf("Infix: %s\n", infix);
  infixtopostfix(infix, postfix);
  printf("Postfix: %s\nResult: %d\n", postfix, evaluate(postfix));
  return 0;
}

