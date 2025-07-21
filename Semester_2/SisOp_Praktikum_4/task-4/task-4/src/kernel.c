#include "std_lib.h"
#include "kernel.h"

// Masukkan variabel global dan prototipe fungsi di sini
#define MAX_COMMAND 16
#define MAX_BUFFERS 128

enum CommandType { CMD_ECHO, CMD_GREP, CMD_WC, CMD_ERR };

char *grep(char *buf, char *arg);
void wc(char *str);
void runCommand(char *buf);
int parseString(char *str, char *commands[]);
bool prefix(char *cmd, char *type);
enum CommandType getCmdType(char *cmd);
char *strstr(char *str, char *substring);
void toString(int integer, char *out);

int main() {
    char buf[128];
    
    clearScreen();
    printString("LilHabOS - C07\n");
    
    while (1) {
        printString("$> ");
        readString(buf);
        printString("\n");
        
        if (strlen(buf) > 0) {
            runCommand(buf);
        }
    }
}

void printString(char* str) {
    while (*str != 0) {
        if (*str == '\n') {
            interrupt(0x10, 0x0E00 | '\r', 0, 0, 0);
            interrupt(0x10, 0x0E00 | '\n', 0, 0, 0);
        } else {
            interrupt(0x10, 0x0E00 | *str, 0, 0, 0);
        }
        str++;
    }
}

void readString(char* buf) {
    int index = 0, ch;
    char tostr[2];

    while (1) {
        ch = interrupt(0x16, 0x0000, 0, 0, 0) & 0xFF;
        if (ch == 0x0D) {
            buf[index] = 0;
            break;
        } else if (ch == 0x08) {
            if (index > 0) {
                index--;
                printString("\b \b");
            }
        } else {
            buf[index++] = ch;
            tostr[0] = ch; tostr[1] = 0;
            printString(tostr);
        }
    }
}

void clearScreen() {
    interrupt(0x10, 0x0006, 0x0000, 0x184F, 0x0007);
    interrupt(0x10, 0x0002, 0x0000, 0x0000, 0x0000);
}

char *grep(char *buf, char *arg) {
    if (strstr(buf, arg)) return buf;
    return 0;
}

void wc(char *str) {
    int countChar = 0;
    int countWord = 0;
    int countLine = 0;
    char buf[32];
    bool inWord = false;
    int i = 0;

    while (str[i]) {
        countChar++;
        if (str[i] == '\n') countLine++;
        if (str[i] != ' ' && str[i] != '\n') {
            if (!inWord) {
                inWord = true;
                countWord++;
            }
        } else {
            inWord = false;
        }
        i++;
    }

    if (countChar > 0 && str[i - 1] != '\n') countLine++;

    toString(countLine, buf); printString(buf); printString(" ");
    toString(countWord, buf); printString(buf); printString(" ");
    toString(countChar, buf); printString(buf); printString("\n");
}

void runCommand(char *buf) {
    int i;
    char *res;
    char *commands[MAX_COMMAND];
    int cmdCount = parseString(buf, commands);

    char pipeBuf[MAX_BUFFERS];
    clear((byte *)pipeBuf, MAX_BUFFERS);

    for (i = 0; i < cmdCount; i++) {
        enum CommandType type = getCmdType(commands[i]);

        if (type == CMD_ECHO) {
            strcpy(commands[i] + 5, pipeBuf); // echo[spasi]argumen
            if (cmdCount == 1) {
                printString(pipeBuf);
                printString("\n");
            }
        } else if (type == CMD_GREP) {
            if (strlen(commands[i]) <= 5) {
                printString("Error: missing argument for grep\n");
                break;
            }
            res = grep(pipeBuf, commands[i] + 5); // grep[spasi]argumen
            if (!res) {
                clear((byte *)pipeBuf, MAX_BUFFERS);
                printString("NULL\n");
                break;
            } else {
                strcpy(res, pipeBuf);
                if (i == cmdCount - 1) {
                    printString(pipeBuf);
                    printString("\n");
                }
            }
        } else if (type == CMD_WC) {
            wc(pipeBuf);
        } else {
            printString("Error: command '");
            printString(commands[i]);
            printString("' not found\n");
        }
    }
}

int parseString(char *str, char *commands[]) {
    int cmdCounter = 0;
    int stringIndex = 0;
    commands[cmdCounter++] = str;

    while (str[stringIndex] && cmdCounter < MAX_COMMAND) {
        if (str[stringIndex] == '|') {
            str[stringIndex++] = 0;
            while (str[stringIndex] == ' ') stringIndex++;
            commands[cmdCounter++] = &str[stringIndex];
        } else {
            stringIndex++;
        }
    }

    return cmdCounter;
}

bool prefix(char *cmd, char *type) {
    while (*type) {
        if (*cmd++ != *type++) return false;
    }
    return true;
}

enum CommandType getCmdType(char *cmd) {    
    if (prefix(cmd, "echo ")) return CMD_ECHO;
    if (prefix(cmd, "grep ")) return CMD_GREP;
    if (strcmp(cmd, "wc") == 0) return CMD_WC;
    return CMD_ERR;
}

char *strstr(char *str, char *substring) {
    char *a;
    char *b;

    b = substring;

    if (*b == 0) return (char *) str;

    for (; *str != 0; str++) {
        if (*str != *b) continue;

        a = str;
        while (1) {
            if (*b == 0) return (char *) str;
            if (*a++ != *b++) break;
        }
        b = substring;
    }

    return 0;
}

void toString(int integer, char *out) {
    int i; int j;
    char buf[32];
    clear((byte *)out, 32);
    i = 0; j = 0;

    if (integer == 0) {
        out[0] = '0';
        out[1] = 0;
        return;
    }

    while (integer > 0) {
        buf[i++] = '0' + mod(integer, 10);
        integer = div(integer, 10);
    }

    while (i > 0) {
        out[j++] = buf[--i];
    }
    out[j] = 0;
}