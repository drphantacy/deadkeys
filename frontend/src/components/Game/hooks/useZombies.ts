import { useState, useEffect } from 'react';
import { generateUniqueWord } from '../utils/wordUtils';
import { Zombie } from '../types'; // Import Zombie type

const useZombies = (onGameOver: () => void, onZombieReachBottom: () => void, setHealth: React.Dispatch<React.SetStateAction<number>>) => {
    const [zombies, setZombies] = useState<Zombie[]>([]);

    useEffect(() => {
        const spawnInterval = setInterval(() => {
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
        }, 2000);

        return () => clearInterval(spawnInterval);
    }, []);

    useEffect(() => {
        const moveInterval = setInterval(() => {
            setZombies((prev) =>
                prev
                    .map((z) => ({ ...z, position: z.position + 2 }))
                    .filter((z) => {
                        if (z.position >= 400) {
                            setHealth((prevHealth) => {
                                const newHealth = prevHealth - 1;
                                if (newHealth <= 0) {
                                    onGameOver();
                                }
                                return newHealth;
                            });
                            onZombieReachBottom();
                            return false;
                        }
                        return true;
                    })
            );
        }, 50);

        return () => clearInterval(moveInterval);
    }, [onGameOver, onZombieReachBottom, setHealth]);

    const handleZombieHit = (input: string, resetInput: () => void, onScoreUpdate: (points: number) => void) => {
        const matchingZombie = zombies.find((z) => z.word.startsWith(input));
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
                setZombies((prev) => prev.filter((z) => z.id !== matchingZombie.id));
                onScoreUpdate(10);
                resetInput();
            }
        }
    };

    return { zombies, handleZombieHit };
};

export default useZombies;
