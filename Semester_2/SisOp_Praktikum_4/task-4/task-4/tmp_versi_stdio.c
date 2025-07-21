#include <stdio.h>
#include <string.h>
#include <stdbool.h>
#include <stdlib.h>

#define MAX_COMMAND 16
#define MAX_BUFFERS 128

enum CommandType { CMD_ECHO, CMD_GREP, CMD_WC, CMD_ERR };

void echo(char *arg);
char *grep(char *buf, char *arg);
void wc(char *str);
void runCommand(char *buf);
int parseString(char *str, char *commands[]);
bool prefix(char *cmd, char *type);
enum CommandType getCmdType(char *cmd);

int main() {
    char buf[128];
    
    printf("LilHabOS - C07\n");
    
    while (1) {
        printf("$> ");
        fgets(buf, sizeof(buf), stdin);
        if (buf[strlen(buf) - 1] == '\n') buf[strlen(buf) - 1] = 0;
        if (strlen(buf) > 0) {
            runCommand(buf);
        }
    }
}

void echo(char *arg) {
    printf("%s\n", arg);
}

char *grep(char *buf, char *arg) {
    if (strstr(buf, arg)) return buf;
    return NULL;
}

void wc(char *str) {
    int countChar = 0, countWord = 0, countLine = 0;
    bool inWord = 0;
    char *p = str;
    if (!*p) {
        printf("NULL\n");
        return;
    }
    while (*p) {
        countChar++;
        if (*p == '\n') countLine++;
        if (*p != ' ' && *p != '\n') {
            if (!inWord) {
                inWord = 1;
                countWord++;
            }
        } else inWord = 0;
        p++;
    }
    if (countChar > 0 && str[countChar - 1] != '\n') countLine++;
    printf("Lines: %d, Words: %d, Chars: %d\n", countLine, countWord, countChar);
}

void runCommand(char *buf) {
    char *commands[MAX_COMMAND];
    int cmdCount = parseString(buf, commands);
    
    char pipeBuf[MAX_BUFFERS] = {0};

    for (int i = 0; i < cmdCount; i++) {
        enum CommandType type = getCmdType(commands[i]);
        if (type == CMD_ECHO) {
            if (strlen(commands[i]) <= 5) {
                printf("Error: missing argument for echo\n");
                break;
            }
            strcpy(pipeBuf, commands[i] + 5);
            if (cmdCount == 1) echo(pipeBuf);
        } else if (type == CMD_GREP) {
            if (strlen(commands[i]) <= 5) {
                printf("Error: missing argument for grep\n");
                break;
            }
            char *res = grep(pipeBuf, commands[i] + 5);
            if (!res) {
                printf("NULL\n");
                break;
            } else {
                strcpy(pipeBuf, res);
                if (i == cmdCount - 1) printf("%s\n", pipeBuf);
            }
            
        } else if (type == CMD_WC) wc(pipeBuf);
        else {
            printf("Error: command '%s' not found\n", commands[i]);
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
        } else stringIndex++;
    }
    // printf("cmd counter: %d", cmdCounter);
    return cmdCounter;
}

bool prefix(char *cmd, char *type) {
    while (*type) if (*cmd++ != *type++) return 0;
    return 1;
}

enum CommandType getCmdType(char *cmd) {
    if (prefix(cmd, "echo")) return CMD_ECHO;
    if (prefix(cmd, "grep")) return CMD_GREP;
    if (strcmp(cmd, "wc") == 0) return CMD_WC;
    return CMD_ERR;
}

char *strstr(const char *str, const char *substring) {
    const char *a;
    const char *b = substring;

    if (*b == 0) return (char *)str;

    for (; *str != 0; str++) {
        if (*str != *b) continue;

        a = str;
        while (1) {
            if (*b == 0) return (char *)str;
            if (*a++ != *b++) break;
        }
        b = substring;
    }
    return NULL;
}