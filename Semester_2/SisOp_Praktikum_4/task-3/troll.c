#define FUSE_USE_VERSION 26
#include <fuse.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <errno.h>
#include <pwd.h>
#include <stdlib.h>

int jebakanAktif();
int akhirannyaTxt(const char *path);
int iniDainTontas();
void nyalakanJebakan();

int jebakanSudahAktif = 0;

#define JEBAKAN_FILE "/tmp/jebakan_aktif.flag"

// Mengecek apakah jebakan sudah aktif
int jebakanAktif() {
    return access(JEBAKAN_FILE, F_OK) == 0;
}

// Menyalakan jebakan dan simpan flag ke file
void nyalakanJebakan() {
    FILE *f = fopen(JEBAKAN_FILE, "w");
    if (f) {
        fputs("KEJEBAK\n", f);
        fclose(f);
    }
}

// Mengecek apakah user sekarang adalah DainTontas
int iniDainTontas() {
    struct fuse_context *ctx = fuse_get_context();
    struct passwd *pw = getpwuid(ctx->uid);
    return pw && strcmp(pw->pw_name, "DainTontas") == 0;
}

// Mengecek apakah path berakhiran .txt
int akhirannyaTxt(const char *path) {
    const char *dot = strrchr(path, '.');
    return dot && strcmp(dot, ".txt") == 0;
}

static int trollfs_getattr(const char *path, struct stat *stbuf) {
    memset(stbuf, 0, sizeof(struct stat));
    if (strcmp(path, "/") == 0) {
        stbuf->st_mode = S_IFDIR | 0755;
        stbuf->st_nlink = 2;
        return 0;
    }

    if (strcmp(path, "/very_spicy_info.txt") == 0 || strcmp(path, "/upload.txt") == 0) {
        stbuf->st_mode = S_IFREG | 0644;
        stbuf->st_nlink = 1;
        stbuf->st_size = 1024;
        return 0;
    }

    return -ENOENT;
}

static int trollfs_readdir(const char *path, void *buf, fuse_fill_dir_t filler, off_t offset, struct fuse_file_info *fi) {
    if (strcmp(path, "/") != 0) return -ENOENT;

    filler(buf, ".", NULL, 0);
    filler(buf, "..", NULL, 0);
    filler(buf, "very_spicy_info.txt", NULL, 0);
    filler(buf, "upload.txt", NULL, 0);
    return 0;
}

static int trollfs_open(const char *path, struct fuse_file_info *fi) {
    if (strcmp(path, "/very_spicy_info.txt") == 0 || strcmp(path, "/upload.txt") == 0) return 0;
    return -ENOENT;
}

static int trollfs_read(const char *path, char *buf, size_t size, off_t offset, struct fuse_file_info *fi) {
    const char *konten = "";

    if (strcmp(path, "/very_spicy_info.txt") == 0) {
        if (iniDainTontas())
            konten = "Very spicy internal developer information: leaked roadmap.docx\n";
        else if (jebakanAktif())
            konten = "\nFell for it again reward\n";
        else
            konten = "DainTontas' personal secret!!.txt\n";
    } else if (strcmp(path, "/upload.txt") == 0) {
        if (iniDainTontas()) nyalakanJebakan();
        konten = "";
    } else {
        return -ENOENT;
    }

    size_t len = strlen(konten);
    if (offset >= len) return 0;
    if (offset + size > len) size = len - offset;
    memcpy(buf, konten + offset, size);
    return size;
}

static struct fuse_operations trollfs_ops = {
    .getattr = trollfs_getattr,
    .readdir = trollfs_readdir,
    .open = trollfs_open,
    .read = trollfs_read,
};

int main(int argc, char *argv[]) {
    umask(0);
    return fuse_main(argc, argv, &trollfs_ops, NULL);
}
