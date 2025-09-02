CC = gcc
CFLAGS = -Wall `pkg-config fuse --cflags`
LDFLAGS = `pkg-config fuse --libs`
TARGET = FUSecure

SRC = FUSecure.c
SRC_DIR = /home/shared_files
MOUNT_DIR = /mnt/FUSecure

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) -o $(TARGET) $(SRC) $(LDFLAGS)


mount: $(TARGET)
	@mkdir -p $(MOUNT_DIR)
	sudo ./$(TARGET) -o allow_other $(SRC_DIR) $(MOUNT_DIR)

umount:
	sudo fusermount -u $(MOUNT_DIR)

clean:
	rm -f $(TARGET)
