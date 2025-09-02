#include <stdio.h>
#include <string.h>

typedef struct {
  char c[202];
  int top;  
} stack;

void init(stack *s) {
  s->top = -1;
}

void push(stack *s, char c) {
  s->top++;
  s->c[s->top] = c;
}

void print(stack *s) {
  for (int i = s->top; i >= 0; i--) {
    printf("%c", s->c[i]);
  }
  printf("\n");
}

int main() {
  char word[101];
  stack s;
  init(&s);

  scanf("%s", word);
  for(int i = 0; i < strlen(word); i++) {
    if (word[i] == 'A' || word[i] == 'I' || word[i] == 'U' || word[i] == 'E' || word[i] == 'O' || word[i] == 'a' || word[i] == 'i' || word[i] == 'u' || word[i] == 'e' || word[i] == 'o'){
      push(&s, word[i]);
      push(&s, word[i]);
    } 
    else {
      push(&s, word[i]);
    }
  }
  print(&s);
}
