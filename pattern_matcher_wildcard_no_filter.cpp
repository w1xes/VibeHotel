#include <iostream>
#include <fstream>
#include <vector>
#include <string>

using namespace std;

// Функція для перевірки відповідності слова шаблону з wildcard *
// * означає будь-яку кількість будь-яких символів (включаючи 0 символів)
bool matchWordWildcard(const string& word, const string& pattern) {
    int wordLen = word.length();
    int patternLen = pattern.length();

    // Створюємо таблицю динамічного програмування
    // dp[i][j] = true, якщо перші i символів слова співпадають з першими j символами шаблону
    vector<vector<bool>> dp(wordLen + 1, vector<bool>(patternLen + 1, false));

    // Порожній рядок співпадає з порожнім шаблоном
    dp[0][0] = true;

    // Обробка шаблонів, які починаються з *
    for (int j = 1; j <= patternLen; j++) {
        if (pattern[j - 1] == '*') {
            dp[0][j] = dp[0][j - 1];
        }
    }

    // Заповнюємо таблицю
    for (int i = 1; i <= wordLen; i++) {
        for (int j = 1; j <= patternLen; j++) {
            if (pattern[j - 1] == '*') {
                // * може бути порожнім (dp[i][j-1]) або співпадати з одним чи більше символами (dp[i-1][j])
                dp[i][j] = dp[i][j - 1] || dp[i - 1][j];
            } else {
                // Звичайний символ - повинен співпадати
                if (word[i - 1] == pattern[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                }
            }
        }
    }

    return dp[wordLen][patternLen];
}

int main() {
    string inputFileName, outputFileName, pattern;

    cout << "Введіть ім'я вхідного файлу: ";
    cin >> inputFileName;

    cout << "Введіть ім'я вихідного файлу: ";
    cin >> outputFileName;

    cout << "Введіть шаблон (метасимвол: * = будь-яка кількість будь-яких символів): ";
    cin >> pattern;

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
        if (matchWordWildcard(allWords[i], pattern)) {
            matchedWords.push_back(allWords[i]);
        }
    }

    // БЕЗ ФІЛЬТРАЦІЇ ПО ВЕЛИКІЙ ЛІТЕРІ - всі знайдені слова йдуть у результат
    vector<string> resultWords = matchedWords;

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
        cout << "Порожньо (не знайдено жодного слова)" << endl;
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
