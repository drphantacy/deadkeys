import React, { useState, useEffect } from 'react';
import { generateUniqueWord, resetUsedWords } from '../utils/wordUtils';
import { Enemy } from '../types'; // Import Enemy type

const useZombies = (
    onGameOver: () => void,
    onZombieReachBottom: () => void,
    setHealth: React.Dispatch<React.SetStateAction<number>>,
    restartSignal: boolean // Add restartSignal as a dependency
) => {
    const [zombies, setZombies] = useState<Enemy[]>([]);
    const zombieKillCountRef = React.useRef(0);
    // Helper to spawn a zombie immediately
    const spawnZombie = () => {
        const newWord = generateUniqueWord();
        if (newWord) {
            const now = Date.now();
            const DISPLAY_WIDTH = Math.round(128/3);
            const PADDING = 60;
            let left, valid, tries = 0;
            setZombies((prev) => {
                do {
                    left = 10 + Math.random() * 80;
                    valid = true;
                    for (const z of prev) {
                        const dx = Math.abs(z.left - left);
                        if (dx * window.innerWidth / 100 < DISPLAY_WIDTH + PADDING) {
                            valid = false;
                            break;
                        }
                    }
                    tries++;
                } while (!valid && tries < 30);
                if (valid) {
                    return [
                        ...prev,
                        (() => {
                            // Only spawn zombies initially, then include mummies and bats
                            if (zombieKillCountRef.current < 5) {
                                return {
                                    id: now,
                                    word: newWord,
                                    position: 0,
                                    left,
                                    health: 100,
                                    spawnTime: now,
                                    type: 'zombie',
                                    speed: 1, // slow
                                };
                            } else {
                                const rand = Math.random();
                                if (rand < 0.4) {
                                    // spawn another zombie
                                    return {
                                        id: now,
                                        word: newWord,
                                        position: 0,
                                        left,
                                        health: 100,
                                        spawnTime: now,
                                        type: 'zombie',
                                        speed: 1,
                                    };
                                } else if (rand < 0.85) {
                                    // spawn a mummy
                                    return {
                                        id: now,
                                        word: newWord,
                                        position: 0,
                                        left,
                                        health: 100,
                                        spawnTime: now,
                                        type: 'mummy',
                                        speed: 2, // fast
                                    };
                                } else {
                                    // spawn a bat
                                    return {
                                        id: now,
                                        word: newWord,
                                        position: 0,
                                        left,
                                        health: 100,
                                        spawnTime: now,
                                        type: 'bat',
                                        speed: 3, // faster than mummy
                                    };
                                }
                            }
                        })(),
                    ];
                }
                return prev;
            });
        }
    };

    useEffect(() => {
        // Reset zombies, used words, and spawn interval on restart
        setZombies([]);
        resetUsedWords();
        zombieKillCountRef.current = 0;

        const spawnIntervalId = setInterval(() => {
            spawnZombie();
        }, 2000); // Fixed spawn interval of 2 seconds

        return () => clearInterval(spawnIntervalId); // Cleanup interval on unmount or restart
    }, [restartSignal]);

    useEffect(() => {
        const moveInterval = setInterval(() => {
            setZombies((prev) =>
                prev
                    .map((z) => ({ ...z, position: z.position + z.speed })) // Move each enemy by its speed
                    .filter((z) => {
                        const threshold = window.innerHeight - 90; // canons height (100px) minus 10px
                        if (z.position >= threshold) {
                            // Zombie reaches the top of input field
                            setHealth((prevHealth) => {
                                const newHealth = prevHealth - 1;
                                if (newHealth <= 0) {
                                    setTimeout(onGameOver, 0);
                                    setZombies([]); // Clear zombies on game over
                                    resetUsedWords(); // Reset used words on game over
                                }
                                return newHealth;
                            });
                            setTimeout(onZombieReachBottom, 0);
                            return false;
                        }
                        return true;
                    })
            );
        }, 50); // Update every 50ms

        return () => clearInterval(moveInterval); // Cleanup interval on unmount
    }, [onGameOver, onZombieReachBottom, setHealth]);

    const handleZombieHit = (input: string, resetInput: () => void, onScoreUpdate: (points: number) => void, onWpmUpdate?: (wpm: number) => void): string | void => {
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
                // Zombie is killed, compute score and WPM bonus
                const now = Date.now();
                const elapsedSec = (now - matchingZombie.spawnTime) / 1000;
                const chars = matchingZombie.word.length;
                const wpm = Math.round((chars * 60) / (5 * elapsedSec));
                const basePoints = matchingZombie.type === 'zombie'
                    ? 100
                    : matchingZombie.type === 'mummy'
                        ? 300
                        : matchingZombie.type === 'bat'
                            ? 500
                            : 0;
                const points = basePoints + wpm;
                // Remove zombie
                setZombies((prev) => prev.filter((z) => z.id !== matchingZombie.id));
                // Track zombie kills for mummy unlock
                if (matchingZombie.type === 'zombie') {
                    zombieKillCountRef.current += 1;
                }
                // Log zombie kill and defer score update to avoid setState-in-render
                console.log('zombie kill', { id: matchingZombie.id, word: matchingZombie.word, points });
                setTimeout(() => onScoreUpdate(points), 0);
                // Defer WPM update if provided
                if (onWpmUpdate) setTimeout(() => onWpmUpdate(wpm), 0);
                resetInput();
                return matchingZombie.type;
            }
        }
    };

    return { zombies, handleZombieHit };
};

export default useZombies;
