#include "std_lib.h"

int div(int a, int b) {
    int sign, quotient;
    if (a == 0 || b == 0) return 0;

    sign = 1;
    if ((a < 0 && b >= 0) || (a >= 0 && b < 0)) sign = -1;

    if (a < 0) a = -a;
    if (b < 0) b = -b;

    quotient = 0;
    while (a >= b) {
        a -= b;
        quotient++;
    }

    return sign * quotient;
}

int mod(int a, int b) {
    int sign;
    if (a == 0 || b == 0) return 0;

    sign = 1;
    if (a < 0) {
        sign = -1;
        a = -a;
    }
    if (b < 0) b = -b;

    while (a >= b) {
        a -= b;
    }

    return sign * a;
}

void memcpy(byte* src, byte* dst, unsigned int size) {
    unsigned int i;
    for (i = 0; i < size; i++) {
        dst[i] = src[i];
    }
}

unsigned int strlen(char* str) {
    int len = 0;
    while (*str != 0) {
        len++;
        str++;
    }
    return len;
}

bool strcmp(char* str1, char* str2) {
    while (*str1 && *str2) {
        if (*str1 != *str2) return 1;
        str1++;
        str2++;
    }
    if (*str1 || *str2) return 1;
    return 0;
}

void strcpy(char* src, char* dst) {
    while (*src != 0) {
        *dst = *src;
        dst++;
        src++;
    }
    *dst = 0;
}

void clear(byte* buf, unsigned int size) {
    unsigned int i;
    for (i = 0; i < size; i++) {
        buf[i] = 0;
    }
}