#define FUSE_USE_VERSION 28

#include <fuse.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <fcntl.h>
#include <stdlib.h>
#include <dirent.h>
#include <sys/stat.h>
#include <unistd.h>
#include <time.h>
#include <ctype.h>
#include <stdint.h>

#define MAX_FILTER_WORDS 100
#define PATH_MAX 4096
#define LOG_PATH "/home/blackcurrent/Kuliah_Semester_2/SisOp_Praktikum_4/task-2/lawakfs.log"

static const char *source_dir = NULL;
static char *remove_extension(const char *name);

// ------------------------ E -----------------------------------------------
typedef struct {
  char *filter_words[MAX_FILTER_WORDS];
  int filter_count;
  char secret_file_basename[256];
  int access_start_hour, access_start_min;
  int access_end_hour, access_end_min;
} lawak_config;

lawak_config config;

void parsing_config(const char *config_path) {
  FILE *fp = fopen(config_path, "r");
  if (!fp) {
    perror("Gagal membuka file konfigurasi");
    exit(EXIT_FAILURE);
  }

  char line[1024];
  while (fgets(line, sizeof(line), fp)) {
    line[strcspn(line, "\r\n")] = '\0';

    if (strncmp(line, "FILTER_WORDS=", 13) == 0) {
      char *words = line + 13;
      char *token = strtok(words, ",");
      config.filter_count = 0;
      while (token && config.filter_count < MAX_FILTER_WORDS) {
        config.filter_words[config.filter_count++] = strdup(token);
        token = strtok(NULL, ",");
      }
    } else if (strncmp(line, "SECRET_FILE_BASENAME=", 21) == 0) {
      strcpy(config.secret_file_basename, line + 21);
    } else if (strncmp(line, "ACCESS_START=", 13) == 0) {
      sscanf(line + 13, "%d:%d", &config.access_start_hour, &config.access_start_min);
    } else if (strncmp(line, "ACCESS_END=", 11) == 0) {
      sscanf(line + 11, "%d:%d", &config.access_end_hour, &config.access_end_min);
    }
  }
  fclose(fp);
}
// ------------------------ E -----------------------------------------------

// ------------------------ D -----------------------------------------------
void log_action(const char *action, const char *path) {
  //if (strcmp(action, "ACCESS") == 0 || strcmp(action, "GETATTR") == 0 || strcmp(action, "READDIR") == 0) return;

  FILE *log_file = fopen(LOG_PATH, "a");
  if (!log_file) return;

  time_t now = time(NULL);
  struct tm *t = localtime(&now);
  char time_str[20];
  strftime(time_str, sizeof(time_str), "%F %T", t);

  fprintf(log_file, "[%s] [%d] [%s] %s\n", time_str, getuid(), action, path);
  fclose(log_file);
}
// ------------------------ D -----------------------------------------------

// ------------------------ C -----------------------------------------------
int is_text_file(const char *buffer, size_t size) {
  for (size_t i = 0; i < size; i++) {
    if (!isprint(buffer[i]) && !isspace(buffer[i])) return 0;
  }
  return 1;
}

static const char base64_table[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

char *base64_encode(const unsigned char *src, size_t len, size_t *out_len) {
  size_t olen = 4 * ((len + 2) / 3);
  char *out = malloc(olen + 1);
  if (!out) return NULL;

  size_t j = 0;
  for (size_t i = 0; i < len; i += 3) {
    uint32_t triple = src[i] << 16;
    if (i+1 < len) triple |= src[i+1] << 8;
    if (i+2 < len) triple |= src[i+2];

    out[j++] = base64_table[(triple >> 18) & 0x3F];
    out[j++] = base64_table[(triple >> 12) & 0x3F];
    out[j++] = (i+1 < len) ? base64_table[(triple >> 6) & 0x3F] : '=';
    out[j++] = (i+2 < len) ? base64_table[triple & 0x3F] : '=';
  }
  out[j] = '\0';
  if (out_len) *out_len = j;
  return out;
}

char *filter_text(const char *content) {
  size_t len = strlen(content);
  char *result = malloc(len * 5 + 1);
  if (!result) return NULL;

  char *out = result;
  while (*content) {
    int replaced = 0;
    for (int i = 0; i < config.filter_count; i++) {
      size_t word_len = strlen(config.filter_words[i]);
      if (strncasecmp(content, config.filter_words[i], word_len) == 0) {
        memcpy(out, "lawak", 5);
        out += 5;
        content += word_len;
        replaced = 1;
        break;
      }
    }
    if (!replaced) *out++ = *content++;
  }
  *out = '\0';
  return result;
}
// ------------------------ C ----------------------------------------------

// ------------------------ B ----------------------------------------------- 
int is_within_access_time() {
  time_t now = time(NULL);
  struct tm *local = localtime(&now);
  int now_minutes = local->tm_hour * 60 + local->tm_min;
  int start_minutes = config.access_start_hour * 60 + config.access_start_min;
  int end_minutes = config.access_end_hour * 60 + config.access_end_min;
  return now_minutes >= start_minutes && now_minutes <= end_minutes;
}

int is_secret_file(const char *filename) {
  const char *base = strrchr(filename, '/');
  base = base ? base + 1 : filename;

  char *name = remove_extension(base);
  int result = name && strcmp(name, config.secret_file_basename) == 0;
  free(name);
  return result;
}
// ------------------------ B -----------------------------------------------

// ------------------------ A ----------------------------------------------- 
static char *map_path(const char *path) {
  const char *rel_path = (path[0] == '/') ? path + 1 : path;
  if (!rel_path[0]) rel_path = ".";

  char *full_path = malloc(strlen(source_dir) + strlen(rel_path) + 2);
  sprintf(full_path, "%s/%s", source_dir, rel_path);
  return full_path;
}

static char *remove_extension(const char *name) {
  char *dot = strrchr(name, '.');
  if (!dot) return strdup(name);

  size_t len = dot - name;
  char *res = malloc(len + 1);
  strncpy(res, name, len);
  res[len] = '\0';
  return res;
}

char *hidden_extension(const char *dir_path, const char *name) {
  DIR *dir = opendir(dir_path);
  if (!dir) return NULL;

  struct dirent *entry;
  char *result = NULL;

  while ((entry = readdir(dir))) {
    if (strcmp(entry->d_name, ".") == 0 || 
      strcmp(entry->d_name, "..") == 0) continue;

    if (strcmp(entry->d_name, name) == 0) {
      result = strdup(entry->d_name);
      break;
    }

    char *no_ext = remove_extension(entry->d_name);
    if (no_ext && strcmp(no_ext, name) == 0) {
      result = strdup(entry->d_name);
      free(no_ext);
      break;
    }
    free(no_ext);
  }

  closedir(dir);
  return result;
}
// ------------------------ A -----------------------------------------------

// ------------------------ MAIN --------------------------------------------
static int fs_access(const char *path, int mask) {
  const char *fuse_name = strrchr(path, '/');
  fuse_name = fuse_name ? fuse_name + 1 : path;

  char *dir_path = map_path("/");
  char *real_name = hidden_extension(dir_path, fuse_name);
  if (!real_name) {
    free(dir_path);
    return -ENOENT;
  }

  if (is_secret_file(real_name) && !is_within_access_time()) {
    free(dir_path);
    free(real_name);
    return -ENOENT;
  }

  char full_path[PATH_MAX];
  snprintf(full_path, sizeof(full_path), "%s/%s", dir_path, real_name);
  int res = access(full_path, mask) ? -errno : 0;

  free(dir_path);
  free(real_name);

  if (res == 0) log_action("ACCESS", path);
  return res;
}

static int fs_getattr(const char *path, struct stat *stbuf) {
  if (strcmp(path, "/") == 0)
    return stat(source_dir, stbuf) ? -errno : 0;

  const char *fuse_name = strrchr(path, '/');
  fuse_name = fuse_name ? fuse_name + 1 : path;

  char *real_name = hidden_extension(source_dir, fuse_name);
  if (!real_name) return -ENOENT;

  if (is_secret_file(real_name) && !is_within_access_time()) {
    free(real_name);
    return -ENOENT;
  }

  char *full_path = map_path(real_name);
  int res = stat(full_path, stbuf) ? -errno : 0;

  free(real_name);
  free(full_path);

  if (res == 0) log_action("GETATTR", path);
  return res;
}

static int fs_readdir(const char *path, void *buf, fuse_fill_dir_t filler, off_t offset, struct fuse_file_info *fi) {
  char *full_path = map_path(path);
  DIR *dir = opendir(full_path);
  if (!dir) {
    free(full_path);
    return -errno;
  }

  filler(buf, ".", NULL, 0);
  filler(buf, "..", NULL, 0);

  struct dirent *entry;
  while ((entry = readdir(dir))) {
    if (strcmp(entry->d_name, ".") == 0 || 
      strcmp(entry->d_name, "..") == 0) continue;

    if (is_secret_file(entry->d_name) && !is_within_access_time()) continue;

    char *name_no_ext = remove_extension(entry->d_name);
    if (name_no_ext) {
      filler(buf, name_no_ext, NULL, 0);
      free(name_no_ext);
    }
  }

  closedir(dir);
  free(full_path);
  return 0;
}

static int fs_read(const char *path, char *buf, size_t size, off_t offset, struct fuse_file_info *fi) {
  struct stat st;
  if (fstat(fi->fh, &st)) return -errno;

  char *content = malloc(st.st_size);
  if (!content) return -ENOMEM;

  ssize_t bytes_read = pread(fi->fh, content, st.st_size, 0);
  if (bytes_read != st.st_size) {
    free(content);
    return -EIO;
  }

  char *processed = NULL;
  size_t processed_len = 0;

  if (is_text_file(content, st.st_size)) {
    processed = filter_text(content);
    processed_len = processed ? strlen(processed) : 0;
  } else {
    processed = base64_encode((unsigned char *)content, st.st_size, &processed_len);
  }
  free(content);

  if (!processed) return -ENOMEM;

  if (offset >= processed_len) {
    free(processed);
    return 0;
  }

  size_t to_copy = processed_len - offset;
  if (to_copy > size) to_copy = size;

  memcpy(buf, processed + offset, to_copy);
  free(processed);

  log_action("READ", path);
  return to_copy;
}

static int fs_open(const char *path, struct fuse_file_info *fi) {
  const char *fuse_name = strrchr(path, '/');
  fuse_name = fuse_name ? fuse_name + 1 : path;

  char *real_name = hidden_extension(source_dir, fuse_name);
  if (!real_name) return -ENOENT;

  if (is_secret_file(real_name) && !is_within_access_time()) {
    free(real_name);
    return -ENOENT;
  }

  char *full_path = map_path(real_name);
  int fd = open(full_path, fi->flags);
  free(real_name);
  free(full_path);

  if (fd == -1) return -errno;

  fi->fh = fd;
  log_action("OPEN", path);
  return 0;
}

static int fs_release(const char *path, struct fuse_file_info *fi) {
  return close(fi->fh);
}

static int fs_write()    { return -EROFS; }
static int fs_truncate() { return -EROFS; }
static int fs_create()   { return -EROFS; }
static int fs_unlink()   { return -EROFS; }
static int fs_mkdir()    { return -EROFS; }
static int fs_rmdir()    { return -EROFS; }
static int fs_rename()   { return -EROFS; }

static struct fuse_operations hideext_oper = {
  .getattr = fs_getattr,
  .readdir = fs_readdir,
  .open    = fs_open,
  .read    = fs_read,
  .release = fs_release,
  .write   = fs_write,
  .truncate = fs_truncate,
  .create  = fs_create,
  .unlink  = fs_unlink,
  .mkdir   = fs_mkdir,
  .rmdir   = fs_rmdir,
  .rename  = fs_rename,
  .access  = fs_access,
};

int main(int argc, char *argv[]) {
  if (argc < 3) {
    fprintf(stderr, "Usage: %s <source_dir> <mountpoint>\n", argv[0]);
    return 1;
  }

  parsing_config("./lawak.conf");
  source_dir = realpath(argv[1], NULL);
  if (!source_dir) {
    perror("Invalid source directory");
    return 1;
  }

  char *fuse_argv[argc - 1];
  fuse_argv[0] = argv[0];
  for (int i = 2; i < argc; i++)
    fuse_argv[i - 1] = argv[i];

  return fuse_main(argc - 1, fuse_argv, &hideext_oper, NULL);
}
