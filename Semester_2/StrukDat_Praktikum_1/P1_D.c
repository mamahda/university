#include <stdio.h>
#include <string.h>

typedef struct {
    int data[100001];
    int top;
} stack;

void init(stack *s) {
    s->top = -1;
}

void push(stack *s, int val) {
  s->top++;
  s->data[s->top] = val;
}

void pop(stack *s, int idx) {
    for (int j = idx; j < s->top; j++) {
        s->data[j] = s->data[j + 1];
    }
    s->top--;
}

int check(stack *s, int *m) {
    int jual = 0;

    while (1) {
        int found = 0;
        for (int i = 0; i <= s->top; i++) {
            if (s->data[i] == *m) {
                printf("%d ", *m);
                pop(s, i);
                (*m)--;
                jual++;
                found = 1;
                break;
            }
        }
        if (!found) break;
    }

    return jual;
}

int decrypt(char c) {
    switch(c) {
        case ')': return 0;
        case '!': return 1;
        case '@': return 2;
        case '#': return 3;
        case '$': return 4;
        case '%': return 5;
        case '^': return 6;
        case '&': return 7;
        case '*': return 8;
        case '(': return 9;
        default: return -1;
    }
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);

    stack s;
    init(&s);

    for (int i = 0; i < n; i++) {
        char kode[6];
        scanf("%s", kode);

        int berat = 0;
        for (int j = 0; j < strlen(kode); j++) {
            berat = berat * 10 + decrypt(kode[j]);
        }

        push(&s, berat);

        int sold = check(&s, &m);
        printf("\n");
    }

    return 0;
}

