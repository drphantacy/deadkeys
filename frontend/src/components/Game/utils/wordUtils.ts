const usedWords: string[] = [];

export const generateUniqueWord = () => {
    const words = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
    const availableWords = words.filter((word) => !usedWords.includes(word));
    if (availableWords.length === 0) return null;
    const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(newWord);
    return newWord;
};
