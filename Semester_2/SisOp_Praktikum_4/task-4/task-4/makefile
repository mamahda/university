SRC=src
BIN=bin
INCLUDE=include

build: prepare bootloader stdlib kernel link

prepare:
	dd if=/dev/zero of=$(BIN)/floppy.img bs=512 count=2880

bootloader:
	nasm -f bin $(SRC)/bootloader.asm -o $(BIN)/bootloader.bin
	dd if=$(BIN)/bootloader.bin of=$(BIN)/floppy.img bs=512 count=1 conv=notrunc

stdlib:
	bcc -ansi -c $(SRC)/std_lib.c -I$(INCLUDE) -o $(BIN)/std_lib.o

kernel:
	nasm -f as86 $(SRC)/kernel.asm -o $(BIN)/kernel-asm.o
	bcc -ansi -c $(SRC)/kernel.c -I$(INCLUDE) -o $(BIN)/kernel.o
	ld86 -o $(BIN)/kernel.bin -d $(BIN)/kernel.o $(BIN)/kernel-asm.o $(BIN)/std_lib.o
	dd if=$(BIN)/kernel.bin of=$(BIN)/floppy.img bs=512 seek=1 count=5 conv=notrunc

link:
	@echo "Linking done via kernel target"

run:
	bochs -f bochsrc.txt

clean:
	rm -f $(BIN)/floppy.img \
	      $(BIN)/bootloader.bin \
	      $(BIN)/kernel.bin \
	      $(BIN)/kernel-asm.o \
	      $(BIN)/kernel.o \
	      $(BIN)/std_lib.o