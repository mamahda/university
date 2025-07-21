extern void _putInMemory(int segment, int address, char character);
extern int _interrupt(int number, int AX, int BX, int CX, int DX);

void printString(char* str);
void readString(char* buf);
void clearScreen();