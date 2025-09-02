#include "std_lib.h"
#include "kernel.h"

// Insert global variables and function prototypes here

int main() {
    char buf[128];

    clearScreen();
    printString("LilHabOS - [[PUT YOUR TEAM CODE HERE]]\n");

    while (true) {
        printString("$> ");
        readString(buf);
        printString("\n");

        if (strlen(buf) > 0) {
            // Insert your functions here, you may not need to modify the rest of the main() function
        }
    }
}

// Insert function here