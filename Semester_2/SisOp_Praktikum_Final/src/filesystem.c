#include "kernel.h"
#include "std_lib.h"
#include "filesystem.h"

void fsInit() {
  struct map_fs map_fs_buf;
  int i = 0;

  readSector(&map_fs_buf, FS_MAP_SECTOR_NUMBER);
  for (i = 0; i < 16; i++) map_fs_buf.is_used[i] = true;
  for (i = 256; i < 512; i++) map_fs_buf.is_used[i] = true;
  writeSector(&map_fs_buf, FS_MAP_SECTOR_NUMBER);
}

// TODO: 2. Implement fsRead function
void fsRead(struct file_metadata* metadata, enum fs_return* status) {
  struct node_fs node_fs_buf;
  struct data_fs data_fs_buf;

  // add local variable here
  int i, j;
  byte sector;
  bool found = false;
  //

  readSector(&data_fs_buf, FS_DATA_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

  // add your code here
  for (i = 0; i < FS_MAX_NODE; ++i) {
    if (strcmp(node_fs_buf.nodes[i].node_name, metadata->node_name) && node_fs_buf.nodes[i].parent_index == metadata->parent_index) {
        found = true;

        if (node_fs_buf.nodes[i].data_index != FS_NODE_D_DIR) {
          metadata->filesize = 0;
          
          for (j = 0; j < FS_MAX_SECTOR; ++j) {
            sector = data_fs_buf.datas[node_fs_buf.nodes[i].data_index].sectors[j];
            if (sector == 0x00) break;
            readSector(metadata->buffer + j * SECTOR_SIZE, sector);
            metadata->filesize += SECTOR_SIZE;
          }

          *status = FS_R_SUCCESS;
          return;
        }

        *status = FS_R_TYPE_IS_DIRECTORY;
        break;
      }
  }

  if (!found) {
    *status = FS_R_NODE_NOT_FOUND;
    return;
  }
  //
}

// TODO: 3. Implement fsWrite function
void fsWrite(struct file_metadata* metadata, enum fs_return* status) {
  struct map_fs map_fs_buf;
  struct node_fs node_fs_buf;
  struct data_fs data_fs_buf;

  int i, j, n_idx = -1, d_idx = -1, blocks_rq = 0, blocks_fr = 0;
  byte sector;

  readSector(&map_fs_buf, FS_MAP_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  readSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);
  readSector(&data_fs_buf, FS_DATA_SECTOR_NUMBER);

  for (i = 0; i < FS_MAX_NODE; ++i) {
    if (strcmp(node_fs_buf.nodes[i].node_name, metadata->node_name) && node_fs_buf.nodes[i].parent_index == metadata->parent_index) {
      *status = FS_W_NODE_ALREADY_EXISTS;
      return;
    }
  }

  for (i = 0; i < FS_MAX_NODE; ++i) {
    if (node_fs_buf.nodes[i].node_name[0] == '\0') {
      n_idx = i;
      break;
    }
  }

  if (n_idx == -1) {
    *status = FS_W_NO_FREE_NODE;
    return;
  }

  if (metadata->filesize == 0) {
    node_fs_buf.nodes[n_idx].parent_index = metadata->parent_index;
    node_fs_buf.nodes[n_idx].data_index = FS_NODE_D_DIR;
    strncpy(node_fs_buf.nodes[n_idx].node_name, metadata->node_name, MAX_FILENAME);

    writeSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
    writeSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);

    *status = FS_W_SUCCESS;
    return;
  }

  for (i = 0; i < FS_MAX_DATA; i++) {
    if (data_fs_buf.datas[i].sectors[0] == 0x00) {
      d_idx = i;
      break;
    }
  }
  
  if (d_idx == -1) {
    *status = FS_W_NO_FREE_DATA;
    return;
  }

  blocks_rq = metadata->filesize / SECTOR_SIZE;
  if (mod(metadata->filesize, SECTOR_SIZE) != 0) blocks_rq++;

  for (i = 0; i < SECTOR_SIZE; i++) if (!map_fs_buf.is_used[i]) blocks_fr++;

  if (blocks_fr < blocks_rq) {
    *status = FS_W_NOT_ENOUGH_SPACE;
    return;
  }

  node_fs_buf.nodes[n_idx].parent_index = metadata->parent_index;
  node_fs_buf.nodes[n_idx].data_index = d_idx;
  strncpy(node_fs_buf.nodes[n_idx].node_name, metadata->node_name, MAX_FILENAME);

  for (i = 0, j = 0; i < SECTOR_SIZE && j < blocks_rq; ++i) {
    if (!map_fs_buf.is_used[i]) {
      map_fs_buf.is_used[i] = true;
      data_fs_buf.datas[d_idx].sectors[j] = i;

      writeSector(metadata->buffer + j * SECTOR_SIZE, i);
      ++j;
    }
  }

  for (; j < FS_MAX_SECTOR; ++j) data_fs_buf.datas[d_idx].sectors[j] = 0x00;

  writeSector(&map_fs_buf, FS_MAP_SECTOR_NUMBER);
  writeSector(&(node_fs_buf.nodes[0]), FS_NODE_SECTOR_NUMBER);
  writeSector(&(node_fs_buf.nodes[32]), FS_NODE_SECTOR_NUMBER + 1);
  writeSector(&data_fs_buf, FS_DATA_SECTOR_NUMBER);

  *status = FS_W_SUCCESS;
}