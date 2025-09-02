#ifndef __STD_LIB_H__
#define __STD_LIB_H__

#include "std_type.h"

int div(int a, int b);
int mod(int a, int b);

void memcpy(byte* src, byte* dst, unsigned int size);
unsigned int strlen(char* str);
bool strcmp(char* str1, char* str2);
void strcpy(char* src, char* dst);
void clear(byte* buf, unsigned int size);

#endif // __STD_LIB_H__
