import { useState, useEffect } from 'react';
import { generateUniqueWord, resetUsedWords } from '../utils/wordUtils';
import { Zombie } from '../types'; // Import Zombie type

const useZombies = (
    onGameOver: () => void,
    onZombieReachBottom: () => void,
    setHealth: React.Dispatch<React.SetStateAction<number>>,
    restartSignal: boolean // Add restartSignal as a dependency
) => {
    const [zombies, setZombies] = useState<Zombie[]>([]);

    useEffect(() => {
        // Reset zombies, used words, and spawn interval on restart
        setZombies([]);
        resetUsedWords();

        const spawnIntervalId = setInterval(() => {
            const newWord = generateUniqueWord();
            if (newWord) {
                setZombies((prev) => [
                    ...prev,
                    {
                        id: Date.now(),
                        word: newWord,
                        position: 0,
                        left: Math.random() * 90,
                        health: 100,
                    },
                ]);
            }
        }, 2000); // Fixed spawn interval of 2 seconds

        return () => clearInterval(spawnIntervalId); // Cleanup interval on unmount or restart
    }, [restartSignal]);

    useEffect(() => {
        const moveInterval = setInterval(() => {
            setZombies((prev) =>
                prev
                    .map((z) => ({ ...z, position: z.position + 2 })) // Move zombies down
                    .filter((z) => {
                        if (z.position >= 400) {
                            // Zombie reaches the bottom
                            setHealth((prevHealth) => {
                                const newHealth = prevHealth - 1;
                                if (newHealth <= 0) {
                                    onGameOver();
                                    setZombies([]); // Clear zombies on game over
                                    resetUsedWords(); // Reset used words on game over
                                }
                                return newHealth;
                            });
                            onZombieReachBottom();
                            return false; // Remove zombie that reaches the bottom
                        }
                        return true; // Keep zombie if it hasn't reached the bottom
                    })
            );
        }, 50); // Update every 50ms

        return () => clearInterval(moveInterval); // Cleanup interval on unmount
    }, [onGameOver, onZombieReachBottom, setHealth]);

    const handleZombieHit = (input: string, resetInput: () => void, onScoreUpdate: (points: number) => void) => {
        const matchingZombie = zombies.find((z) => z.word.startsWith(input)); // Compare input including spaces
        if (matchingZombie) {
            const progress = (input.length / matchingZombie.word.length) * 100;

            setZombies((prev) =>
                prev.map((z) =>
                    z.id === matchingZombie.id
                        ? { ...z, health: 100 - progress }
                        : z
                )
            );

            if (input === matchingZombie.word) {
                // Zombie is killed
                setZombies((prev) => prev.filter((z) => z.id !== matchingZombie.id));
                onScoreUpdate(10); // Award 10 points for each zombie killed
                resetInput();
            }
        }
    };

    return { zombies, handleZombieHit };
};

export default useZombies;
