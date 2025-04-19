import React, { useState, useEffect, useRef } from 'react';

interface GameCanvasProps {
    onGameOver: () => void;
    onScoreUpdate: (points: number) => void;
    onZombieReachBottom: () => void; // Callback to trigger screen effect
}

interface Zombie {
    id: number;
    word: string;
    position: number; // Vertical position of the zombie
    left: number; // Horizontal position of the zombie
    health: number; 
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate, onZombieReachBottom }) => {
    const [zombies, setZombies] = useState<Zombie[]>([]);
    const [playerInput, setPlayerInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [health, setHealth] = useState(3); 
    const [usedWords, setUsedWords] = useState<string[]>([]); 
    const gunSoundRef = useRef<HTMLAudioElement | null>(null); 

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
                        position: 0, // Start at the top
                        left: Math.random() * 90, // Random horizontal position
                        health: 100, 
                    },
                ]);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [usedWords]);

    useEffect(() => {
        // Move zombies down slowly
        const interval = setInterval(() => {
            setZombies((prev) =>
                prev
                    .map((z) => ({ ...z, position: z.position + 2 })) // Increment position by 2 pixels
                    .filter((z) => {
                        if (z.position >= 400) {
                            setHealth((prevHealth) => {
                                const newHealth = prevHealth - 1;
                                if (newHealth <= 0) {
                                    onGameOver(); // Trigger game over when health reaches 0
                                }
                                return newHealth;
                            });
                            onZombieReachBottom(); // Trigger screen effect
                            return false; // Remove zombie that reaches the bottom
                        }
                        return true;
                    })
            );
        }, 50); // Update every 50ms

        return () => clearInterval(interval);
    }, [onGameOver, onZombieReachBottom]);

    useEffect(() => {
        // Check if player input matches any zombie word
        const matchingZombie = zombies.find((z) => z.word.startsWith(playerInput));
        if (matchingZombie) {
            const progress = (playerInput.length / matchingZombie.word.length) * 100;

            setZombies((prev) =>
                prev.map((z) =>
                    z.id === matchingZombie.id
                        ? { ...z, health: 100 - progress } // Update health only
                        : z
                )
            );

            if (playerInput === matchingZombie.word) {
                // Zombie is killed
                setZombies((prev) => prev.filter((z) => z.id !== matchingZombie.id));
                setUsedWords((prev) => prev.filter((word) => word !== matchingZombie.word)); // Remove word from used list
                onScoreUpdate(10); // Award 10 points for each zombie killed
                setPlayerInput('');
            }
        }
    }, [playerInput, zombies, onScoreUpdate]);

    const generateUniqueWord = () => {
        const words = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
        const availableWords = words.filter((word) => !usedWords.includes(word));
        if (availableWords.length === 0) return null; // No more unique words available
        const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        setUsedWords((prev) => [...prev, newWord]); // Add new word to used list
        return newWord;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerInput(e.target.value);

        // Play gun sound
        if (gunSoundRef.current) {
            gunSoundRef.current.currentTime = 0; // Reset sound to the beginning
            gunSoundRef.current.play();
        }
    };

    return (
        <div>
            <audio ref={gunSoundRef} src="/sounds/gunshot.mp3" preload="auto"></audio> {/* Gun sound */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>Time Left: {timeLeft}s</div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {Array.from({ length: health }).map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'red',
                                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                            }}
                        ></div>
                    ))}
                </div>
            </div>
            <div style={{ position: 'relative', height: '400px', border: '1px solid black', overflow: 'hidden' }}>
                {zombies.map((zombie) => (
                    <div
                        key={zombie.id}
                        style={{
                            position: 'absolute',
                            top: `${zombie.position}px`, // Use position for vertical movement
                            left: `${zombie.left}%`, // Use left for horizontal position
                            width: '30px',
                            height: '30px',
                            backgroundColor: 'purple',
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
                onChange={handleInputChange}
                placeholder="Type here..."
            />
        </div>
    );
};

export default GameCanvas;
