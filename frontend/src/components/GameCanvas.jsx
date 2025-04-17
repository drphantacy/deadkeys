import React, { useState, useEffect } from 'react';

const GameCanvas = ({ onGameOver, onScoreUpdate }) => {
    const [zombies, setZombies] = useState([]);
    const [playerInput, setPlayerInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [usedWords, setUsedWords] = useState([]); // Track used words

    useEffect(() => {
        // Timer countdown
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onGameOver]);

    useEffect(() => {
        // Spawn zombies periodically
        const interval = setInterval(() => {
            const newWord = generateUniqueWord();
            if (newWord) {
                setZombies((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        word: newWord,
                        position: 0,
                        left: Math.random() * 90,
                        health: 100, // Start with full health
                    },
                ]);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [usedWords]);

    useEffect(() => {
        // Check if player input matches any zombie word
        const matchingZombie = zombies.find((z) => z.word.startsWith(playerInput));
        if (matchingZombie) {
            const progress = (playerInput.length / matchingZombie.word.length) * 100;

            setZombies((prev) =>
                prev.map((z) =>
                    z.id === matchingZombie.id
                        ? { ...z, health: 100 - progress } // Update health
                        : z
                )
            );

            if (playerInput === matchingZombie.word) {
                // Zombie is killed
                setZombies((prev) => prev.filter((z) => z.id !== matchingZombie.id));
                onScoreUpdate(10); // Award 10 points for each zombie killed
                setPlayerInput('');
            }
        } else {
            setPlayerInput(''); // Reset input if no match
        }
    }, [playerInput, zombies, onScoreUpdate]);

    useEffect(() => {
        // Move zombies down slowly
        const interval = setInterval(() => {
            setZombies((prev) =>
                prev
                    .map((z) => ({ ...z, position: z.position + 1 })) // Increment position slowly
                    .filter((z) => z.position < 400) // Remove zombies that reach the bottom
            );
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const generateUniqueWord = () => {
        const words = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
        const availableWords = words.filter((word) => !usedWords.includes(word));
        if (availableWords.length === 0) return null; // No more unique words available
        const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        setUsedWords((prev) => [...prev, newWord]); // Add new word to used list
        return newWord;
    };

    return (
        <div>
            <div>Time Left: {timeLeft}s</div>
            <div style={{ position: 'relative', height: '400px', border: '1px solid black', overflow: 'hidden' }}>
                {zombies.map((zombie) => (
                    <div
                        key={zombie.id}
                        style={{
                            position: 'absolute',
                            top: `${zombie.position}px`,
                            left: `${zombie.left}%`,
                            width: '30px',
                            height: '30px',
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            textAlign: 'center',
                            color: 'white',
                            lineHeight: '30px',
                        }}
                    >
                        {zombie.word}
                        <div
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                left: '0',
                                width: '100%',
                                height: '5px',
                                backgroundColor: 'gray',
                            }}
                        >
                            <div
                                style={{
                                    width: `${zombie.health}%`,
                                    height: '100%',
                                    backgroundColor: 'green',
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                placeholder="Type here..."
            />
        </div>
    );
};

export default GameCanvas;
