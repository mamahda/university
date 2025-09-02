#include "std_lib.h"

int div(int a, int b) {
  int res = 0;
  while (a >= b) {
    a -= b;
    res++;
  }
  return res;
}

int mod(int a, int b) {
  while (a >= b) a -= b;
  return a;
}

void memcpy(byte* dst, byte* src, unsigned int size) {
  unsigned int i;
  for (i = 0; i < size; i++) dst[i] = src[i];
}

unsigned int strlen(char* str) {
  unsigned int len = 0;
  while (str[len] != '\0') len++;
  return len;
}

bool strcmp(char* str1, char* str2) {
  unsigned int i = 0;
  while (str1[i] != '\0' && str2[i] != '\0') {
    if (str1[i] != str2[i]) return false;
    i++;
  }
  return str1[i] == str2[i];
}

void strcpy(char* dst, char* src) {
  unsigned int i = 0;
  while (src[i] != '\0') {
    dst[i] = src[i];
    i++;
  }
  dst[i] = '\0';
}

void clear(byte* buf, unsigned int size) {
  unsigned int i;
  for (i = 0; i < size; i++) buf[i] = 0;
}

void memset(byte *dst, int val, unsigned int size) {
  unsigned int i;
  for (i = 0; i < size; ++i) dst[i] = val;
}

void strncpy(char *str1, char *str2, unsigned int size) {
  unsigned int i;
  for (i = 0 ; i < size; ++i) {
    str1[i] = str2[i]; 
    if (str1[i] == '\0' || str2[i] == '\0') break;
  }
}

bool strncmp(char* str1, char* str2, unsigned int size) {
  unsigned int i = 0;
  while (i < size && str1[i] != '\0' && str2[i] != '\0') {
    if (str1[i] != str2[i]) return 0;
    i++;
  }
  return (i == size || (str1[i] == '\0' && str2[i] == '\0'));
}

char *strchr(char* str, char c) {
  while (*str != '\0') {
    if (*str == c) {
      return (char*)str;
    }
    str++;
  }
  return 0;
}

// buat debugging
// void byteToHexString(byte bt, char *output) {
//   char *hexDigits = "0123456789ABCDEF";

//   output[0] = hexDigits[(bt >> 4) & 0x0F];
//   output[1] = hexDigits[bt & 0x0F];
//   output[2] = '\0';
// }

int parsePath(char* path, char directories[][MAX_FILENAME]) {
  int i = 0, j = 0, k = 0;
  while (path[i] != '\0') {
    if (path[i] == '/') {
      directories[k++][j] = '\0';
      j = 0;
    } else directories[k][j++] = path[i];
    i++;
  }
  directories[k][j] = '\0';
  return k + 1;
}

bool resolvePathAndName( struct node_fs* node_fs_buf, byte cwd, char* path, byte* out_parent, char* out_name) {
  int i, j, depth;
  char dirs[4][MAX_FILENAME];
  *out_parent = cwd;

  if (strncmp(path, "/", 1)) {
    *out_parent = FS_NODE_P_ROOT;
    strcpy(out_name, path + 1);
    return true;
  } else if (strncmp(path, "../", 3)) {
    *out_parent = node_fs_buf->nodes[cwd].parent_index;
    strcpy(out_name, path + 3);
    return true;
  } else {
    depth = parsePath(path, dirs);

    if (depth == 1) {
      strcpy(out_name, dirs[0]);
      return true;
    } else {
      for (i = 0; i < depth - 1; i++) {
        bool found = false;
        for (j = 0; j < FS_MAX_NODE; j++) {
          if (strcmp(node_fs_buf->nodes[j].node_name, dirs[i]) &&
              node_fs_buf->nodes[j].parent_index == *out_parent &&
              node_fs_buf->nodes[j].data_index == FS_NODE_D_DIR) {
            *out_parent = j;
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      strcpy(out_name, dirs[depth - 1]);
      return true;
    }
  }
}