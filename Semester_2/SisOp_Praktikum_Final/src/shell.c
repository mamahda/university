#include "shell.h"
#include "kernel.h"
#include "std_lib.h"
#include "filesystem.h"

void shell() {
  char buf[64];
  char cmd[64];
  char arg[2][64];

  byte cwd = FS_NODE_P_ROOT;

  while (true) {
    printString("MengOS:");
    printCWD(cwd);
    printString("$ ");
    readString(buf);
    parseCommand(buf, cmd, arg);

    if (strcmp(cmd, "cd")) cd(&cwd, arg[0]);
    else if (strcmp(cmd, "ls")) ls(cwd, arg[0]);
    else if (strcmp(cmd, "mv")) mv(cwd, arg[0], arg[1]);
    else if (strcmp(cmd, "cp")) cp(cwd, arg[0], arg[1]);
    else if (strcmp(cmd, "cat")) cat(cwd, arg[0]);
    else if (strcmp(cmd, "mkdir")) mkdir(cwd, arg[0]);
    else if (strcmp(cmd, "clear")) clearScreen();
    else printString("Invalid command\n");
  }
}

// TODO: 4. Implement printCWD function
void printCWD(byte cwd) {
  struct node_fs node_fs_buf;
  char path[64][MAX_FILENAME];
  int depth = 0, i;

  readSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

  if (cwd == FS_NODE_P_ROOT) {
    printString("/");
    return;
  }

  while (cwd != FS_NODE_P_ROOT) {
    strncpy(path[depth++], node_fs_buf.nodes[cwd].node_name, MAX_FILENAME);
    cwd = node_fs_buf.nodes[cwd].parent_index;
  }

  printString("/");
  for (i = depth - 1; i >= 0; --i) {
    printString(path[i]);
    if (i > 0) printString("/");
  }
}

// TODO: 5. Implement parseCommand function
void parseCommand(char* buf, char* cmd, char arg[2][64]) {
  int i = 0, j = 0, k = 0;

  memset(cmd, 0, 64);
  memset(arg[0], 0, 64);
  memset(arg[1], 0, 64);
  
  while (buf[i] == ' ') i++; //* ignore space

  while (buf[i] != ' ' && buf[i] != '\0') cmd[j++] = buf[i++];
  cmd[j] = '\0';

  if (buf[i] == '\0') return;

  for (k = 0; k < 2; k++) {
    while (buf[i] == ' ') i++; //* ignore space

    j = 0;
    while (buf[i] != ' ' && buf[i] != '\0') arg[k][j++] = buf[i++];
    
    arg[k][j] = '\0';
  }
}

// TODO: 6. Implement cd function
void cd(byte* cwd, char* dirname) {
  struct node_fs node_fs_buf;
  int i;

  readSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

  if (strcmp(dirname, "/")) {
    *cwd = FS_NODE_P_ROOT;
    return;
  }

  if (strcmp(dirname, "..")) {
    if (*cwd != FS_NODE_P_ROOT) *cwd = node_fs_buf.nodes[*cwd].parent_index;
    return;
  }

  for (i = 0; i < FS_MAX_NODE; ++i) {
    if (strcmp(node_fs_buf.nodes[i].node_name, dirname) && node_fs_buf.nodes[i].parent_index == *cwd) {
      if (node_fs_buf.nodes[i].data_index == FS_NODE_D_DIR) *cwd = i;
      else {
        printString("cd: "); printString("not a directory: "); printString(dirname); printString("\n");
      }
      return;
    }
  }

  printString("cd: "); printString("no such file or directory: "); printString(dirname); printString("\n");
}

// TODO: 7. Implement ls function
void ls(byte cwd, char* dirname) {
  struct node_fs node_fs_buf;
  int i, j, dir_count = 0;
  bool found = false;
  byte dir_idx = cwd;
  char dirs[4][MAX_FILENAME];

  
  readSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);
  
  if (strlen(dirname) == 0 || strcmp(dirname, ".")) found = true;
  else {
    dir_count = parsePath(dirname, dirs);

    if (strlen(dirname) == 0 || strcmp(dirname, ".")) {
      // do nothing
    } else {
      dir_count = parsePath(dirname, dirs);
      for (i = 0; i < dir_count; i++) {
        found = false;
        for (j = 0; j < FS_MAX_NODE; j++) {
          if (strcmp(node_fs_buf.nodes[j].node_name, dirs[i]) && node_fs_buf.nodes[j].parent_index == dir_idx && node_fs_buf.nodes[j].data_index == FS_NODE_D_DIR) {
            dir_idx = j;
            found = true;
            break;
          }
        }
        if (!found) break;
      }
    }
  }

  if (!found) {
    printString("ls: cannot access '"); printString(dirname); printString("': no such file or directory\n");
    return;
  }

  for (i = 0; i < FS_MAX_NODE; ++i) {
    if (node_fs_buf.nodes[i].parent_index == dir_idx && strlen(node_fs_buf.nodes[i].node_name) > 0) {
      printString(node_fs_buf.nodes[i].node_name); printString(" ");
    }
  }
  
  printString("\n");
}

// TODO: 8. Implement mv function
void mv(byte cwd, char* src, char* dst) {
  struct node_fs node_fs_buf;
  int i;
  byte src_idx = FS_NODE_P_ROOT;
  byte target_dir;
  char output_name[MAX_FILENAME];

  readSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

  for (i = 0; i < FS_MAX_NODE; i++) {
    if (strcmp(node_fs_buf.nodes[i].node_name, src) && node_fs_buf.nodes[i].parent_index == cwd && node_fs_buf.nodes[i].data_index != FS_NODE_D_DIR) {
      src_idx = i;
      break;
    }
  }

  if (src_idx == FS_NODE_P_ROOT) {
    printString("mv: cannot stat '"); printString(src); printString("': No such file\n");
    return;
  }

  if (!resolvePathAndName(&node_fs_buf, cwd, dst, &target_dir, output_name)) {
    printString("mv: destination path not found\n");
    return;
  }

  for (i = 0; i < FS_MAX_NODE; i++) {
    if (strcmp(node_fs_buf.nodes[i].node_name, output_name) && node_fs_buf.nodes[i].parent_index == target_dir) {
      printString("mv: file with same name already exists\n");
      return;
    }
  }

  if (strcmp(node_fs_buf.nodes[src_idx].node_name, output_name) && node_fs_buf.nodes[src_idx].parent_index == target_dir) {
    printString("mv: '"); printString(src);
    printString("' and '"); printString(dst);
    printString("' are the same file\n");
    return;
  }

  node_fs_buf.nodes[src_idx].parent_index = target_dir;
  strcpy(node_fs_buf.nodes[src_idx].node_name, output_name);

  writeSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  writeSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

  printString("mv: file moved successfully\n");
}

// TODO: 9. Implement cp function
void cp(byte cwd, char* src, char* dst) {
  struct node_fs node_fs_buf;
  struct file_metadata metadata;
  enum fs_return status;
  int i;
  byte target_dir;
  char output_name[MAX_FILENAME];

  readSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

  for (i = 0; i < FS_MAX_NODE; i++) {
    if (strcmp(node_fs_buf.nodes[i].node_name, src) &&
        node_fs_buf.nodes[i].parent_index == cwd &&
        node_fs_buf.nodes[i].data_index != FS_NODE_D_DIR) {
      break;
    }
  }

  if (i == FS_MAX_NODE) {
    printString("cp: source file not found\n");
    return;
  }

  metadata.parent_index = cwd;
  strncpy(metadata.node_name, src, MAX_FILENAME);
  fsRead(&metadata, &status);
  if (status != FS_R_SUCCESS) {
    printString("cp: error reading source file\n");
    return;
  }

  if (!resolvePathAndName(&node_fs_buf, cwd, dst, &target_dir, output_name)) {
    printString("cp: destination path not found\n");
    return;
  }

  for (i = 0; i < FS_MAX_NODE; i++) {
    if (strcmp(node_fs_buf.nodes[i].node_name, output_name) && node_fs_buf.nodes[i].parent_index == target_dir) {
      printString("cp: file with the same name already exists\n");
      return;
    }
  }

  metadata.parent_index = target_dir;
  strcpy(metadata.node_name, output_name);
  fsWrite(&metadata, &status);

  if (status != FS_W_SUCCESS) printString("cp: error writing copied file\n");
  else printString("cp: file copied successfully\n");
}


// TODO: 10. Implement cat function
void cat(byte cwd, char* filename) {
  struct file_metadata metadata;
  enum fs_return status;
  char test1[3];
  
  metadata.parent_index = cwd;
  strncpy(metadata.node_name, filename, MAX_FILENAME);
  memset(metadata.buffer, 0, FS_MAX_SECTOR * SECTOR_SIZE);
  metadata.filesize = 0;

  fsRead(&metadata, &status);

  // byteToHexString(metadata.parent_index, test1);
  // printString(test1);
  // printString("\n name : ");
  // printString(metadata.node_name);
  // printString("\n status : ");
  // printString(status);
  // printString("\n");
  if (status == FS_R_SUCCESS) {
    printString(metadata.buffer);
    printString("\n");
  } else if (status == FS_R_TYPE_IS_DIRECTORY) {
    printString("cat: "); printString(filename); printString(": Is a directory\n");
  } else if (status == FS_R_NODE_NOT_FOUND) {
    printString("cat: "); printString(filename); printString(": No such file or directory\n");
  }
}

// TODO: 11. Implement mkdir function
void mkdir(byte cwd, char* dirname) {
  struct node_fs node_fs_buf;
  int i, empty_node_idx = -1;

  readSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

  for (i = 0; i < FS_MAX_NODE; ++i) {
    if (strcmp(node_fs_buf.nodes[i].node_name, dirname) && node_fs_buf.nodes[i].parent_index == cwd) {
      printString("mkdir: directory or file already exists\n");
      return;
    }
  }

  for (i = 0; i < FS_MAX_NODE; ++i) {
    if (node_fs_buf.nodes[i].node_name[0] == '\0') {
      empty_node_idx = i;
      break;
    }
  }

  if (empty_node_idx == -1) {
    printString("mkdir: no space for new directory\n");
    return;
  }

  node_fs_buf.nodes[empty_node_idx].parent_index = cwd;
  node_fs_buf.nodes[empty_node_idx].data_index = FS_NODE_D_DIR;
  strncpy(node_fs_buf.nodes[empty_node_idx].node_name, dirname, MAX_FILENAME);

  writeSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  writeSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

  printString("mkdir: directory created successfully\n");
}