#define FUSE_USE_VERSION 28

#include <fuse.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/stat.h>
#include <dirent.h>
#include <limits.h>
#include <pwd.h>

#ifndef PATH_MAX
#define PATH_MAX 4096
#endif

static const char *source_dir = NULL;
static const char *users[] = {"yuadi", "irwandi"};
static const char *users_dir[] = {"private_yuadi", "private_irwandi"};
static const int usrcnt = 2;

static void fullpath(char fpath[PATH_MAX], const char *path) {
    snprintf(fpath, PATH_MAX, "%s%s", source_dir, path);
}

int check_access(const char *path) {
    struct fuse_context *context = fuse_get_context();
    struct passwd *pw = getpwuid(context->uid);
    const char *username = pw ? pw->pw_name : "";

    if (strstr(path, "public") != NULL) return 0;

    for (int i = 0; i < usrcnt; i++) if (strstr(path, users_dir[i]) != NULL && strcmp(username, users[i]) != 0) return -EACCES;
    
    return 0;
}

static int scr_getattr(const char *path, struct stat *statbuf) {
    char fpath[PATH_MAX];
    fullpath(fpath, path);
    
    if (check_access(path) != 0) return -EACCES;
    
    if (lstat(fpath, statbuf) == -1) return -errno;
    
    return 0;
}

static int scr_readdir(const char *path, void *buf, fuse_fill_dir_t filler, off_t offset, struct fuse_file_info *fi) {
    char fpath[PATH_MAX];
    fullpath(fpath, path);
    
    DIR *dp = opendir(fpath);
    if (dp == NULL) return -errno;
    
    struct fuse_context *context = fuse_get_context();
    struct passwd *pw = getpwuid(context->uid);
    const char *username = pw ? pw->pw_name : "";
    
    struct dirent *de;
    filler(buf, ".", NULL, 0);
    filler(buf, "..", NULL, 0);
    
    while ((de = readdir(dp)) != NULL) {
        const char *name = de->d_name;
        int has_access = 0;
        
        if (strcmp(name, "public") == 0) {
            has_access = 1;
        } else {
            for (int i = 0; i < usrcnt; i++) {
                if (strcmp(name, users_dir[i]) == 0 && strcmp(username, users[i]) == 0) {
                    has_access = 1;
                    break;
                }
            }
        }
        if (has_access) filler(buf, name, NULL, 0);
    }

    closedir(dp);
    return 0;
}

static int scr_open(const char *path, struct fuse_file_info *fi) {
    char fpath[PATH_MAX];
    fullpath(fpath, path);

    if (check_access(path) != 0) return -EACCES;

    if ((fi->flags & O_WRONLY) || (fi->flags & O_RDWR)) return -EACCES;

    int fd = open(fpath, fi->flags);
    if (fd == -1) return -errno;

    close(fd);
    return 0;
}

static int scr_read(const char *path, char *buf, size_t size, off_t offset, struct fuse_file_info *fi) {
    char fpath[PATH_MAX];
    fullpath(fpath, path);

    if (check_access(path) != 0) return -EACCES;

    int fd = open(fpath, O_RDONLY);
    if (fd == -1) return -errno;

    int res = pread(fd, buf, size, offset);
    if (res == -1) res = -errno;

    close(fd);
    return res;
}

static struct fuse_operations scr_oper = {
    .getattr = scr_getattr,
    .readdir = scr_readdir,
    .open    = scr_open,
    .read    = scr_read,    
};

int main(int argc, char *argv[]) {
    source_dir = realpath(argv[argc - 2], NULL);
    if (!source_dir) {
        perror("Invalid source_dir");
        exit(1);
    }

    argv[argc - 2] = argv[argc - 1];
    argc--;

    return fuse_main(argc, argv, &scr_oper, NULL);
}