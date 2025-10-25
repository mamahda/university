#include <iostream>
#include <string>
using namespace std;

class BrailleDecoder
{
private:
  // Mode pembacaan
  bool isNumberMode;
  bool isCapsLock;
  bool isNextCap;

  // Fungsi untuk mengubah sel Braille 3x2 menjadi kode angka
  int getCode(string row1, string row2, string row3, int pos)
  {
    int code = 0;
    if (row1[pos] == '1')
      code += 1; // dot 1
    if (row2[pos] == '1')
      code += 2; // dot 2
    if (row3[pos] == '1')
      code += 4; // dot 3
    if (row1[pos + 1] == '1')
      code += 8; // dot 4
    if (row2[pos + 1] == '1')
      code += 16; // dot 5
    if (row3[pos + 1] == '1')
      code += 32; // dot 6
    return code;
  }

  // Fungsi untuk mengubah kode menjadi huruf (a-z)
  char codeToletter(int code)
  {
    // Mapping kode Braille ke huruf a-z (1-26)
    if (code >= 1 && code <= 26)
    {
      return 'a' + (code - 1);
    }
    return '?';
  }

  // Fungsi untuk membuat huruf jadi kapital
  char makeCapital(char ch)
  {
    if (ch >= 'a' && ch <= 'z')
    {
      return ch - 'a' + 'A';
    }
    return ch;
  }

  // Fungsi untuk mengubah kode menjadi angka
  char codeToNumber(int code)
  {
    if (code == 0)
      return '0';
    if (code >= 1 && code <= 9)
      return '0' + code;
    return '?';
  }

public:
  BrailleDecoder()
  {
    isNumberMode = false;
    isCapsLock = false;
    isNextCap = false;
  }

  string decode(string row1, string row2, string row3)
  {
    // Reset state untuk setiap decode baru
    isNumberMode = false;
    isCapsLock = false;
    isNextCap = false;

    // Validasi input
    if (row1.length() != row2.length() || row2.length() != row3.length())
    {
      return "?";
    }
    if (row1.length() % 2 != 0)
    {
      return "?";
    }

    string result = "";

    // Proses setiap sel Braille (2 kolom)
    for (int i = 0; i < row1.length(); i += 2)
    {
      int code = getCode(row1, row2, row3, i);

      // Kode khusus
      if (code == 0)
      {
        // Spasi atau angka 0
        if (isNumberMode)
        {
          result += '0';
        }
        else
        {
          result += ' ';
          isNextCap = false; // Capital tidak menembus spasi
        }
      }
      else if (code == 32)
      {
        // Capital sign (dot 6)
        if (isNextCap)
        {
          // Double capital = CAPS LOCK
          isCapsLock = true;
          isNextCap = false;
        }
        else
        {
          isNextCap = true;
        }
      }
      else if (code == 48)
      {
        // Letter sign (dot 5-6) atau tion part 1
        // Cek apakah ini kontraksi 'tion'
        if (i + 2 < row1.length())
        {
          int nextCode = getCode(row1, row2, row3, i + 2);
          if (nextCode == 29)
          {
            // Ini kontraksi 'tion'
            string word = "tion";
            if (isNextCap)
            {
              word[0] = makeCapital(word[0]);
              isNextCap = false;
            }
            else if (isCapsLock)
            {
              for (int j = 0; j < word.length(); j++)
              {
                word[j] = makeCapital(word[j]);
              }
            }
            result += word;
            i += 2; // Skip sel berikutnya
            continue;
          }
        }

        // Letter sign biasa
        if (isNumberMode)
        {
          // Kembali ke mode huruf
          isNumberMode = false;
          isCapsLock = false;
        }
        else if (isCapsLock && !isNextCap)
        {
          // Matikan CAPS LOCK
          isCapsLock = false;
        }
      }
      else if (code == 60)
      {
        // Number sign (dot 3-4-5-6)
        isNumberMode = true;
      }
      else if (code == 57)
      {
        // Kontraksi 'th' (dot 1-4-5-6)
        if (!isNumberMode)
        {
          string word = "th";
          if (isNextCap)
          {
            word[0] = makeCapital(word[0]);
            isNextCap = false;
          }
          else if (isCapsLock)
          {
            for (int j = 0; j < word.length(); j++)
            {
              word[j] = makeCapital(word[j]);
            }
          }
          result += word;
        }
        else
        {
          return "?";
        }
      }
      else
      {
        // Huruf atau angka biasa
        if (isNumberMode)
        {
          char digit = codeToNumber(code);
          if (digit == '?')
            return "?";
          result += digit;
        }
        else
        {
          char letter = codeToletter(code);
          if (letter == '?')
            return "?";

          if (isNextCap)
          {
            letter = makeCapital(letter);
            isNextCap = false;
          }
          else if (isCapsLock)
          {
            letter = makeCapital(letter);
          }

          result += letter;
        }
      }
    }

    return result;
  }
};

int main()
{
  BrailleDecoder decoder;

  string row1, row2, row3;

  while (cin >> row1)
  {
    if (row1 == "0")
      break;

    cin >> row2 >> row3;

    if (row2 == "0" || row3 == "0")
    {
      cout << "?" << endl;
      break;
    }

    string result = decoder.decode(row1, row2, row3);
    cout << result << endl;
  }

  return 0;
}
