#include <iostream>
#include <fstream>
#include <vector>
#include <string>

using namespace std;

// Структура для зберігання метасимволу
struct MetaSymbol {
    int position;
    string option1;
    string option2;
};

// Функція для парсингу шаблону та витягування метасимволів
bool parsePattern(const string& pattern, string& basePattern, vector<MetaSymbol>& metaSymbols) {
    basePattern = "";
    int i = 0;

    while (i < pattern.length()) {
        if (pattern[i] == '(') {
            // Знайшли початок метасимволу
            int start = i;
            i++;
            string option1 = "";
            string option2 = "";
            bool foundSlash = false;

            // Читаємо перший ланцюжок до /
            while (i < pattern.length() && pattern[i] != '/' && pattern[i] != ')') {
                option1 += pattern[i];
                i++;
            }

            if (i >= pattern.length()) {
                cout << "Помилка: незакритий метасимвол" << endl;
                return false;
            }

            if (pattern[i] == '/') {
                foundSlash = true;
                i++;
                // Читаємо другий ланцюжок до )
                while (i < pattern.length() && pattern[i] != ')') {
                    option2 += pattern[i];
                    i++;
                }
            }

            if (i >= pattern.length() || pattern[i] != ')') {
                cout << "Помилка: незакритий метасимвол" << endl;
                return false;
            }

            if (!foundSlash) {
                cout << "Помилка: відсутній роздільник /" << endl;
                return false;
            }

            // Зберігаємо метасимвол
            MetaSymbol ms;
            ms.position = basePattern.length();
            ms.option1 = option1;
            ms.option2 = option2;
            metaSymbols.push_back(ms);

            // Додаємо маркер в базовий шаблон
            basePattern += '\x01'; // Спеціальний символ-маркер

            i++;
        } else {
            basePattern += pattern[i];
            i++;
        }
    }

    return true;
}

// Функція для перевірки відповідності слова шаблону
bool matchWord(const string& word, const string& basePattern, const vector<MetaSymbol>& metaSymbols) {
    int wordPos = 0;
    int patternPos = 0;
    int metaIndex = 0;

    while (patternPos < basePattern.length()) {
        if (basePattern[patternPos] == '\x01') {
            // Це метасимвол
            if (metaIndex >= metaSymbols.size()) {
                return false;
            }

            const MetaSymbol& ms = metaSymbols[metaIndex];
            bool matched = false;

            // Перевіряємо перший варіант
            if (wordPos + ms.option1.length() <= word.length()) {
                bool match1 = true;
                for (int i = 0; i < ms.option1.length(); i++) {
                    if (word[wordPos + i] != ms.option1[i]) {
                        match1 = false;
                        break;
                    }
                }
                if (match1) {
                    wordPos += ms.option1.length();
                    matched = true;
                }
            }

            // Якщо перший не підійшов, перевіряємо другий варіант
            if (!matched) {
                if (wordPos + ms.option2.length() <= word.length()) {
                    bool match2 = true;
                    for (int i = 0; i < ms.option2.length(); i++) {
                        if (word[wordPos + i] != ms.option2[i]) {
                            match2 = false;
                            break;
                        }
                    }
                    if (match2) {
                        wordPos += ms.option2.length();
                        matched = true;
                    }
                }
            }

            if (!matched) {
                return false;
            }

            metaIndex++;
            patternPos++;
        } else {
            // Звичайний символ
            if (wordPos >= word.length() || word[wordPos] != basePattern[patternPos]) {
                return false;
            }
            wordPos++;
            patternPos++;
        }
    }

    // Слово повинно повністю співпадати
    return wordPos == word.length();
}

// Функція для перевірки, чи починається слово з великої літери
bool startsWithUpperCase(const string& word) {
    if (word.empty()) return false;
    return (word[0] >= 'A' && word[0] <= 'Z') ||
           (word[0] >= 0xC0 && word[0] <= 0xDF); // Українські великі літери в Windows-1251
}

int main() {
    string inputFileName, outputFileName, pattern;

    cout << "Введіть ім'я вхідного файлу: ";
    cin >> inputFileName;

    cout << "Введіть ім'я вихідного файлу: ";
    cin >> outputFileName;

    cout << "Введіть шаблон (метасимвол: (ланцюжок1/ланцюжок2)): ";
    cin >> pattern;

    // Парсимо шаблон
    string basePattern;
    vector<MetaSymbol> metaSymbols;

    if (!parsePattern(pattern, basePattern, metaSymbols)) {
        return 1;
    }

    // Читаємо вхідний файл
    ifstream inputFile(inputFileName);
    if (!inputFile.is_open()) {
        cout << "Помилка відкриття вхідного файлу!" << endl;
        return 1;
    }

    vector<string> allWords;
    string word;
    while (inputFile >> word) {
        allWords.push_back(word);
    }
    inputFile.close();

    // Знаходимо слова, що відповідають шаблону
    vector<string> matchedWords;
    for (int i = 0; i < allWords.size(); i++) {
        if (matchWord(allWords[i], basePattern, metaSymbols)) {
            matchedWords.push_back(allWords[i]);
        }
    }

    // Фільтруємо слова, що починаються з великої літери
    vector<string> resultWords;
    for (int i = 0; i < matchedWords.size(); i++) {
        if (startsWithUpperCase(matchedWords[i])) {
            resultWords.push_back(matchedWords[i]);
        }
    }

    // Виводимо результати на консоль
    cout << "\n=== ВМІСТ ВХІДНОГО ФАЙЛУ ===" << endl;
    for (int i = 0; i < allWords.size(); i++) {
        cout << allWords[i];
        if (i < allWords.size() - 1) cout << " ";
    }
    cout << endl;

    cout << "\n=== МАСКА ===" << endl;
    cout << pattern << endl;

    cout << "\n=== СЛОВА, ЯКІ ПІДХОДЯТЬ ПІД МАСКУ ===" << endl;
    if (matchedWords.empty()) {
        cout << "Не знайдено жодного слова" << endl;
    } else {
        for (int i = 0; i < matchedWords.size(); i++) {
            cout << matchedWords[i];
            if (i < matchedWords.size() - 1) cout << " ";
        }
        cout << endl;
    }

    cout << "\n=== ВМІСТ РЕЗУЛЬТУЮЧОГО ФАЙЛУ ===" << endl;
    if (resultWords.empty()) {
        cout << "Порожньо (немає слів, які починаються з великої літери)" << endl;
    } else {
        for (int i = 0; i < resultWords.size(); i++) {
            cout << resultWords[i];
            if (i < resultWords.size() - 1) cout << " ";
        }
        cout << endl;
    }

    // Записуємо результат у файл
    ofstream outputFile(outputFileName);
    if (!outputFile.is_open()) {
        cout << "Помилка відкриття вихідного файлу!" << endl;
        return 1;
    }

    for (int i = 0; i < resultWords.size(); i++) {
        outputFile << resultWords[i];
        if (i < resultWords.size() - 1) outputFile << " ";
    }
    outputFile.close();

    cout << "\nРезультат записано у файл: " << outputFileName << endl;

    return 0;
}
