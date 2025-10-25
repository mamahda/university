#include <string>
#include <vector>
#include <cctype>
#include <cstdio> 

#define B_SPACE 0
#define B_TION 29
#define B_CAPITAL 32
#define B_LETTER 48
#define B_TH 57
#define B_NUMBER 60

using namespace std;

string getLine() {
  string s;
  int c;
  while ((c = getchar_unlocked()) != '\n') {
    s.push_back((char)c);
  }
  if (s.back() == '\r') s.pop_back();

  return s;
}

class braille {
private:
  char toLetter(int code, int& caps) {
    if (code < 1 || code > 26) 
      return '?';

    char ch = 'a' + code - 1;

    if (caps == 1) 
    {
      ch = toupper(ch);
      caps = 0;
    } 
    else if (caps == 2) 
      ch = toupper(ch);

    return ch;
  }

  void applyCaps(string& s, int& caps) {
    if (caps == 1) 
    {
      s[0] = toupper(s[0]);
      caps = 0;
    } 
    else if (caps == 2) 
      for (char &c : s) c = toupper(c);
  }

public:
  string transcribe(const vector<int>& codes) {
    int number = 0, caps = 0, nextLetter = 0;
    string res = "";

    for (size_t i = 0; i < codes.size(); ++i) {
      int code = codes[i];

      if (code == B_LETTER && i + 1 < codes.size()) 
      {
        if (codes[i + 1] == B_TION) {
          string tion = "tion";
          
          applyCaps(tion, caps);
          
          res += tion;
          number = 0;
          nextLetter = 0;
          i++; 
          continue;
        }
      }

      if (code == B_CAPITAL) 
      {
        if (caps == 1) 
        {
          caps = 2;
          number = 0;
          nextLetter = 0;
        } 
        else 
        {
          caps = 1;
          if (number) 
            nextLetter = 1;
        }
        continue;
      }

      if (code == B_LETTER) 
      {
        if (number && !nextLetter) 
        {
          number = 0;
          caps = 0;
        } 
        else if (!number) 
        {
          if (caps == 2) 
            caps = 0;
          
          else if (caps == 1) 
            return "?";

        } 
        else if (nextLetter) 
          return "?";
  
        continue;
      }

      if (code == B_NUMBER) {
        if (caps == 1 && !number) 
          return "?";
        
        number = 1;
        continue;
      }

      if (code == B_SPACE) {
        if (number && !nextLetter) 
          res += '0';

        else {
          res += ' ';
          if (nextLetter) nextLetter = 0;
        }

        if (caps == 1) 
          caps = 0;
        
        continue;
      }

      if (code == B_TH && (!number || nextLetter)) {
        string th = "th";
        applyCaps(th, caps);

        res += th;
        if (nextLetter) 
          nextLetter = 0;

        continue;
      }

      if (!number || nextLetter) 
      {
        char ch = toLetter(code, caps);
        if (ch == '?') 
          return "?";

        res += ch;
        if (nextLetter) 
          nextLetter = 0;
      } 
      else 
      {
        if (code > 9) 
          return "?";

        res += char('0' + code);
      }
    }

    return res;
  }
};

int main() {
  braille transcriber;
  string line1, line2, line3;

  while (1) {
    line1 = getLine();
    if (line1 == "0" || line1.empty())
      break;

    line2 = getLine();
    line3 = getLine();

    if (line1.length() != line2.length() || line2.length() != line3.length() || line1.length() % 2 != 0) {
      printf("?\n");
      continue;
    }

    vector<int> codes;
    bool valid_chars = 1;

    for (size_t j = 0; j < line1.length(); j += 2) {
      int code = 0;

      if (line1[j] == '1') code += 1;
      if (line2[j] == '1') code += 2;
      if (line3[j] == '1') code += 4;
      if (line1[j+1] == '1') code += 8;
      if (line2[j+1] == '1') code += 16;
      if (line3[j+1] == '1') code += 32;

      codes.push_back(code);
    }

    if(!valid_chars) {
      printf("?\n");
      continue;
    }

    printf("%s\n", transcriber.transcribe(codes).c_str());
  }

  return 0;
}
