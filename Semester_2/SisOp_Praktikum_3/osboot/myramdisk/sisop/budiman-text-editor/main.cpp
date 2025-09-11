#include <iostream>
#include <fstream>
#include <termios.h>
#include <unistd.h>
#include <sys/ioctl.h>
#include <vector>
#include <string>
#include "TextEditor.h"

#define CTRL_S 19
#define CTRL_X 24

TextEditor editor;
int cursorPos = 0;
std::vector<std::string> prevLines;
int prevCursorRow = 1, prevCursorCol = 1;

void enableRawMode() {
    termios raw;
    tcgetattr(STDIN_FILENO, &raw);
    raw.c_lflag &= ~(ICANON | ECHO);
    raw.c_iflag &= ~(IXON);
    tcsetattr(STDIN_FILENO, TCSAFLUSH, &raw);
}

void disableRawMode() {
    termios normal;
    tcgetattr(STDIN_FILENO, &normal);
    normal.c_lflag |= (ICANON | ECHO);
    normal.c_iflag |= (IXON);
    tcsetattr(STDIN_FILENO, TCSAFLUSH, &normal);
}

int getTerminalWidth() {
    winsize w;
    ioctl(STDOUT_FILENO, TIOCGWINSZ, &w);
    return w.ws_col;
}

int getTerminalHeight() {
    winsize w;
    ioctl(STDOUT_FILENO, TIOCGWINSZ, &w);
    return w.ws_row;
}

void drawHeader() {
    int width = getTerminalWidth();
    std::string title = " Budiman Text Editor ";
    int padding = (width - title.length()) / 2;
    
    printf("\033[1;%dH\033[47;30m%s\033[0m", 
           padding > 0 ? padding : 1, 
           title.c_str());
}

void drawFooter() {
    int height = getTerminalHeight();
    int width = getTerminalWidth();
    
    std::string left = "Ctrl+S";
    std::string middle = " = Save | ";
    std::string right = "Ctrl+X";
    std::string rest = " = Exit";
    std::string full = left + middle + right + rest;
    
    int padding = (width - full.length()) / 2;
    
    printf("\033[%d;%dH%s\033[47;30m%s\033[0m%s\033[47;30m%s\033[0m%s",
           height, 
           padding > 0 ? padding : 1,
           "",
           left.c_str(),
           middle.c_str(),
           right.c_str(),
           rest.c_str());
}

void smartRender() {
    int termWidth = getTerminalWidth();
    int termHeight = getTerminalHeight();

    std::string text = editor.getText();
    std::vector<std::string> lines;
    std::string line;

    for (char c : text) {
        if (c == '\n') {
            lines.push_back(line);
            line.clear();
        } else {
            line += c;
        }
    }
    lines.push_back(line);

    int contentHeight = termHeight - 4;

    int cursorRow = 0, cursorCol = 0;
    int pos = 0;
    for (int i = 0; i < (int)lines.size(); i++) {
        if (cursorPos <= pos + (int)lines[i].size()) {
            cursorRow = i;
            cursorCol = cursorPos - pos;
            break;
        }
        pos += (int)lines[i].size() + 1;
    }

    static int scrollOffset = 0;

    if (cursorRow < scrollOffset) scrollOffset = cursorRow;
    else if (cursorRow >= scrollOffset + contentHeight) scrollOffset = cursorRow - contentHeight + 1;

    printf("\033[2J");
    printf("\033[H");

    printf("\033[47;30m");
    for (int i = 0; i < termWidth; i++) putchar(' ');
    printf("\r");
    std::string title = " Budiman ";
    int padding = (termWidth - (int)title.size()) / 2;
    printf("\033[%dC%s", padding, title.c_str());
    printf("\033[0m\n");

    for (int i = 0; i < contentHeight; i++) {
        int lineIndex = scrollOffset + i;
        printf("\033[K");
        if (lineIndex < (int)lines.size()) {
            std::string &l = lines[lineIndex];
            if ((int)l.size() > termWidth) {
                printf("%.*s", termWidth, l.c_str());
            } else {
                printf("%s", l.c_str());
            }
        }
        printf("\n");
    }

    std::string welcome = "[ Welcome to Budiman, your friendly text editor! ]";
    int wpad = (termWidth - (int)welcome.size()) / 2;
    printf("\033[%d;1H", termHeight - 2);
    printf("\033[47;30m");
    for (int i = 0; i < wpad; i++) putchar(' ');
    printf("%s", welcome.c_str());
    for (int i = wpad + (int)welcome.size(); i < termWidth; i++) putchar(' ');
    printf("\033[0m");

    std::string ctrlS = "Ctrl+S";
    std::string mid = " = Save | ";
    std::string ctrlX = "Ctrl+X";
    std::string rest = " = Exit";

    int fullLen = (int)(ctrlS.size() + mid.size() + ctrlX.size() + rest.size());
    int padCmd = (termWidth - fullLen) / 2;

    printf("\033[%d;1H", termHeight - 1);
    for (int i = 0; i < padCmd; i++) putchar(' ');
    printf("\033[47;30m%s\033[0m", ctrlS.c_str());
    printf("%s", mid.c_str());
    printf("\033[47;30m%s\033[0m", ctrlX.c_str());
    printf("%s", rest.c_str());
    for (int i = padCmd + fullLen; i < termWidth; i++) putchar(' ');

    printf("\033[%d;1H", termHeight);
    printf("\033[K");

    int cursorScreenRow = cursorRow - scrollOffset + 2;
    int cursorScreenCol = cursorCol + 1;

    if (cursorScreenRow < 2) cursorScreenRow = 2;
    if (cursorScreenRow > termHeight - 3) cursorScreenRow = termHeight - 3;
    if (cursorScreenCol < 1) cursorScreenCol = 1;
    if (cursorScreenCol > termWidth) cursorScreenCol = termWidth;

    printf("\033[%d;%dH", cursorScreenRow, cursorScreenCol);
    fflush(stdout);
}

void saveFile() {
    std::ofstream file("output.txt");
    std::string text = editor.getText();
    if (text.empty() || text.back() != '\n')
        text += '\n';
    file << text;
    file.close();
    
    int height = getTerminalHeight();
    printf("\033[%d;1H\033[47;30m Saved to output.txt \033[0m", height - 1);
    fflush(stdout);
    usleep(1000000);
    smartRender();
}

int main() {
    printf("\033[?1049h");
    fflush(stdout);

    enableRawMode();
    smartRender();

    char c;
    while (read(STDIN_FILENO, &c, 1) == 1) {
        bool needRedraw = false;

        if (c == CTRL_S) {
            saveFile();
            continue;
        } else if (c == CTRL_X) {
            break;
        } else if (c == 27) {
            char seq[2];
            if (read(STDIN_FILENO, &seq[0], 1) != 1) continue;
            if (read(STDIN_FILENO, &seq[1], 1) != 1) continue;
            if (seq[0] == '[') {
                if (seq[1] == 'D' && cursorPos > 0) {
                    cursorPos--;
                    needRedraw = true;
                }
                else if (seq[1] == 'C' && cursorPos < editor.getLength()) {
                    cursorPos++;
                    needRedraw = true;
                }
            }
        } else if (c == 127) {
            if (cursorPos > 0) {
                editor.remove(cursorPos - 1);
                cursorPos--;
                needRedraw = true;
            }
        } else if (c == '\r' || c == '\n') {
            editor.insert('\n', cursorPos);
            cursorPos++;
            needRedraw = true;
        } else if (c >= 32 && c <= 126) {
            editor.insert(c, cursorPos);
            cursorPos++;
            needRedraw = true;
        }

        if (needRedraw) {
            smartRender();
        }
    }

    disableRawMode();

    printf("\033[?1049l");
    printf("\033[2J\033[H");
    fflush(stdout);

    return 0;
}
