#define FUSE_USE_VERSION 28
#include <fuse.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <dirent.h>
#include <errno.h>
#include <sys/time.h>

#ifndef S_IFDIR
#define S_IFDIR        0040000
#endif

#ifndef S_IFREG
#define S_IFREG        0100000
#endif


#define MAX_STR 1024

static const char *xmp_path = "/hello.txt";
static char file_content[MAX_STR] = "hello World!\n";
static size_t file_size = 14;

static int xmp_getattr(const char *path, struct stat *stbuf) {
    memset(stbuf, 0, sizeof(struct stat));
    if (strcmp(path, "/") == 0) {
        stbuf->st_mode = S_IFDIR | 0755;
        stbuf->st_nlink = 2;
    } else if (strcmp(path, xmp_path) == 0) {
        stbuf->st_mode = S_IFREG | 0666;
        stbuf->st_nlink = 1;
        stbuf->st_size = file_size;
    } else
        return -ENOENT;
    return 0;
}

static int xmp_readdir(const char *path, void *buf, fuse_fill_dir_t filler, off_t offset, struct fuse_file_info *fi) {
    if (strcmp(path, "/") != 0)
        return -ENOENT;

    filler(buf, ".", NULL, 0);
    filler(buf, "..", NULL, 0);
    filler(buf, "hello.txt", NULL, 0);

    return 0;
}

static int xmp_open(const char *path, struct fuse_file_info *fi) {
    if (strcmp(path, xmp_path) != 0)
        return -ENOENT;

    return 0;
}

static int xmp_read(const char *path, char *buf, size_t size, off_t offset, struct fuse_file_info *fi) {
    if (strcmp(path, xmp_path) != 0)
        return -ENOENT;

    if (offset < file_size) {
        if (offset + size > file_size)
            size = file_size - offset;
        memcpy(buf, file_content + offset, size);
    } else
        size = 0;

    return size;
}

static int xmp_write(const char *path, const char *buf, size_t size, off_t offset, struct fuse_file_info *fi) {
    if (strcmp(path, xmp_path) != 0)
        return -ENOENT;

    if (offset + size > MAX_STR)
        size = MAX_STR - offset;

    memcpy(file_content + offset, buf, size);
    file_size = offset + size;
    return size;
}

static int xmp_truncate(const char *path, off_t size) {
    if (strcmp(path, xmp_path) != 0)
        return -ENOENT;

    if (size < file_size)
        memset(file_content + size, 0, file_size - size);
    file_size = size;

    return 0;
}

static struct fuse_operations xmp_oper = {
    .getattr = xmp_getattr,
    .readdir = xmp_readdir,
    .open = xmp_open,
    .read = xmp_read,
    .write = xmp_write,
    .truncate = xmp_truncate,
};

int main(int argc, char *argv[]) {
    return fuse_main(argc, argv, &xmp_oper, NULL);
}

/*
gcc -Wall `pkg-config fuse --cflags` fuse.c -o fuse `pkg-config fuse --libs`
*/