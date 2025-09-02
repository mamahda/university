#include <stdio.h>
#include <unistd.h>

int main() {
    char cmd[512];
    snprintf(cmd, sizeof(cmd), "find ./film -maxdepth 1 -type f | shuf -n 1 | awk -F'/' '{ print \"Film for Trabowo & Peddy: \" $3 }'");
    execlp("sh", "sh", "-c", cmd, NULL);

    return 0;
}