#include <stdio.h>
#include <string.h>

typedef struct{
  char huruf[10001];
  int top;
} stack;

void init(stack *s){
  s->top = -1;
}

void push(stack *s, char c){
  s->top++;
  s->huruf[s->top] = c;
}

void pop(stack *s){
  s->top--;
}

void printstack(stack *s){
  for (int i = 0; i <= s->top; i++)
  {
    printf("%c", s->huruf[i]);
  }
}

int main(){
  stack s;
  init(&s);

  char perintah[101]; 
  do{
    scanf("%s", perintah);
    if (strcmp(perintah, "WRITE") == 0)
    {
      char temp[10];
      scanf("%s", &temp);
      push(&s, temp[0]);
    }
    else if (strcmp(perintah, "BACKSPACE") == 0)
    {
      pop(&s);
    }
    else if (strcmp(perintah, "PRINT") == 0)
    {
      printstack(&s);
    }
  } while(strcmp(perintah, "PRINT") != 0);
}