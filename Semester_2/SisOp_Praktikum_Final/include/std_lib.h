#ifndef __STD_LIB_H__
#define __STD_LIB_H__

#include "std_type.h"
#include "filesystem.h"

int div(int a, int b);
int mod(int a, int b);

void memcpy(byte* dst, byte* src, unsigned int size);
unsigned int strlen(char* str);
bool strcmp(char* str1, char* str2);
void strcpy(char* dst, char* src);
void clear(byte* buf, unsigned int size);

// TODO: Add your general helper function here
void memset(byte *dst, int val, unsigned int size);
void strncpy(char *str1, char *str2, unsigned int size);
bool strncmp(char *str1, char *str2, unsigned int size);
char* strchr(char* str, char c);
// void byteToHexString(byte bt, char* output);
int parsePath(char* path, char directories[][MAX_FILENAME]);
bool resolvePathAndName( struct node_fs* node_fs_buf, byte cwd, char* path, byte* out_parent, char* out_name);
//

#endif // __STD_LIB_H__
