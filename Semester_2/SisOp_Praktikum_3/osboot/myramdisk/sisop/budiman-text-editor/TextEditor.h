#ifndef TEXTEDITOR_H
#define TEXTEDITOR_H

#include <string>

class TextEditor {
private:
    struct Node {
        char ch;
        Node* next;
        Node(char c) : ch(c), next(nullptr) {}
    };

    Node* head = nullptr;
    Node* tail = nullptr;
    int length = 0;

public:
    ~TextEditor() {
        while (head) {
            Node* temp = head;
            head = head->next;
            delete temp;
        }
    }

    void insert(char c, int pos) {
        if (pos < 0 || pos > length) return;

        Node* newNode = new Node(c);
        if (pos == 0) {
            newNode->next = head;
            head = newNode;
            if (!tail) tail = newNode;
        } else {
            Node* tmp = head;
            for (int i = 0; i < pos - 1; ++i) tmp = tmp->next;
            newNode->next = tmp->next;
            tmp->next = newNode;
            if (!newNode->next) tail = newNode;
        }
        length++;
    }

    void remove(int pos) {
        if (pos < 0 || pos >= length) return;

        Node* toDelete;
        if (pos == 0) {
            toDelete = head;
            head = head->next;
            if (!head) tail = nullptr;
        } else {
            Node* tmp = head;
            for (int i = 0; i < pos - 1; ++i) tmp = tmp->next;
            toDelete = tmp->next;
            tmp->next = toDelete->next;
            if (!tmp->next) tail = tmp;
        }
        delete toDelete;
        length--;
    }

    std::string getText() {
        std::string text;
        Node* curr = head;
        while (curr) {
            text += curr->ch;
            curr = curr->next;
        }
        return text;
    }

    int getLength() { return length; }
};

#endif
