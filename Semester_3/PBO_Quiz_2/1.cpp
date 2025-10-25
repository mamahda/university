#include <iostream>
#include <string>
#include <cctype>
using namespace std;

class BrailleReader {
private:
    string row1, row2, row3;
    int pos;
    bool isNumberMode;
    int capsMode; // 0=none, 1=next char, 2=caps lock
    bool needLetterNext; // untuk handle single capital di number mode
    
    // Baca satu sel braille (2 kolom) dan return pattern sebagai bitmask
    int readCell() {
        if (pos + 1 >= row1.length()) return -1;
        
        int pattern = 0;
        if (row1[pos] == '1') pattern |= 1;      // dot 1
        if (row2[pos] == '1') pattern |= 2;      // dot 2
        if (row3[pos] == '1') pattern |= 4;      // dot 3
        if (row1[pos+1] == '1') pattern |= 8;    // dot 4
        if (row2[pos+1] == '1') pattern |= 16;   // dot 5
        if (row3[pos+1] == '1') pattern |= 32;   // dot 6
        
        pos += 2;
        return pattern;
    }
    
    char patternToLetter(int pattern) {
        if (pattern < 1 || pattern > 26) return '?';
        char ch = 'a' + pattern - 1;
        
        // Apply kapitalisasi
        if (capsMode == 1) {
            ch = toupper(ch);
            capsMode = 0;
        } else if (capsMode == 2) {
            ch = toupper(ch);
        }
        
        return ch;
    }
    
    // Apply caps ke string (untuk kontraksi)
    void applyCapsToString(string& s) {
        if (capsMode == 1) {
            s[0] = toupper(s[0]);
            capsMode = 0;
        } else if (capsMode == 2) {
            for (int i = 0; i < s.length(); i++) {
                s[i] = toupper(s[i]);
            }
        }
    }
    
public:
    string transcribe(string r1, string r2, string r3) {
        // Validasi input
        if (r1.length() != r2.length() || r2.length() != r3.length()) 
            return "?";
        if (r1.length() % 2 != 0) 
            return "?";
        
        for (char c : r1 + r2 + r3) {
            if (c != '0' && c != '1') return "?";
        }
        
        // Inisialisasi
        row1 = r1; row2 = r2; row3 = r3;
        pos = 0;
        isNumberMode = false;
        capsMode = 0;
        needLetterNext = false;
        
        string result = "";
        
        while (pos < row1.length()) {
            int pattern = readCell();
            if (pattern < 0) break;
            
            // Cek kontraksi 'tion' dulu (pattern 48 diikuti 29)
            if (pattern == 48 && pos < row1.length()) {
                int nextPattern = readCell();
                if (nextPattern == 29) {
                    string tion = "tion";
                    applyCapsToString(tion);
                    result += tion;
                    isNumberMode = false;
                    needLetterNext = false;
                    continue;
                } else {
                    // Bukan tion, mundur
                    pos -= 2;
                }
            }
            
            // Capital sign (dot 6 saja = 32)
            if (pattern == 32) {
                if (capsMode == 1) {
                    // Double capital sign = caps lock
                    capsMode = 2;
                    isNumberMode = false;
                    needLetterNext = false;
                } else {
                    capsMode = 1;
                    if (isNumberMode) {
                        needLetterNext = true;
                    }
                }
                continue;
            }
            
            // Letter sign (dots 5-6 = 48)
            if (pattern == 48) {
                if (isNumberMode && !needLetterNext) {
                    isNumberMode = false;
                    capsMode = 0;
                } else if (!isNumberMode) {
                    // Di alpha mode
                    if (capsMode == 2) {
                        // Matikan caps lock
                        capsMode = 0;
                    } else if (capsMode == 1) {
                        return "?"; // Capital sign harus diikuti huruf
                    }
                } else if (needLetterNext) {
                    return "?";
                }
                continue;
            }
            
            // Number sign (dots 3-4-5-6 = 60)
            if (pattern == 60) {
                if (capsMode == 1 && !isNumberMode) return "?";
                isNumberMode = true;
                continue;
            }
            
            // Space / zero (blank = 0)
            if (pattern == 0) {
                if (isNumberMode && !needLetterNext) {
                    result += '0';
                } else {
                    result += ' ';
                    if (needLetterNext) needLetterNext = false;
                }
                if (capsMode == 1) capsMode = 0; // Capital gak menembus spasi
                continue;
            }
            
            // Kontraksi 'th' (dots 1-4-5-6 = 57)
            if (pattern == 57 && (!isNumberMode || needLetterNext)) {
                string th = "th";
                applyCapsToString(th);
                result += th;
                if (needLetterNext) needLetterNext = false;
                continue;
            }
            
            // Huruf atau angka biasa
            if (!isNumberMode || needLetterNext) {
                // Mode huruf
                char ch = patternToLetter(pattern);
                if (ch == '?') return "?";
                result += ch;
                if (needLetterNext) {
                    needLetterNext = false;
                    // Tetap di number mode untuk karakter berikutnya
                }
            } else {
                // Mode angka (0-9 saja valid)
                if (pattern > 9) return "?";
                result += char('0' + pattern);
            }
        }
        
        return result;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    
    BrailleReader reader;
    string line1, line2, line3;
    
    while (cin >> line1) {
        if (line1 == "0") break;
        
        cin >> line2 >> line3;
        if (line2 == "0" || line3 == "0") {
            cout << "?\n";
            break;
        }
        
        cout << reader.transcribe(line1, line2, line3) << "\n";
    }
    
    return 0;
}
