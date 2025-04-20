import React, { useEffect } from 'react';

interface Zombie {
    id: string;
    position: number;
}

interface GameCanvasProps {
    zombies: Zombie[];
    setZombies: React.Dispatch<React.SetStateAction<Zombie[]>>;
    lives: number; // Receive lives as a prop
    setLives: React.Dispatch<React.SetStateAction<number>>; // Receive setLives as a prop
    gameOver: boolean;
    setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
    score: number;
    savePlayerState: (state: { highScore: number; totalGames: number }) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    zombies,
    setZombies,
    lives,
    setLives,
    gameOver,
    setGameOver,
    score,
    savePlayerState,
}) => {
    useEffect(() => {
        const interval = setInterval(() => {
            if (gameOver) return; // Prevent updates if the game is over

            setZombies((prevZombies) => {
                const updatedZombies: Zombie[] = [];
                let zombiesCrossed = 0;

                for (const zombie of prevZombies) {
                    if (zombie.position >= 400) {
                        zombiesCrossed++; // Count zombies that crossed the baseline
                    } else {
                        updatedZombies.push({ ...zombie, position: zombie.position + 1 });
                    }
                }

                // Deduct lives for zombies that crossed the baseline
                if (zombiesCrossed > 0) {
                    setLives((prevLives) => {
                        const newLives = Math.max(prevLives - zombiesCrossed, 0); // Deduct lives but ensure they don't go below 0
                        if (newLives === 0 && !gameOver) {
                            setGameOver(true); // Trigger game over only once
                            savePlayerState({ highScore: score, totalGames: 1 });
                        }
                        return newLives;
                    });
                }

                return updatedZombies; // Remove zombies that crossed the baseline
            });
        }, 50);

        return () => clearInterval(interval);
    }, [setZombies, setLives, gameOver, setGameOver, savePlayerState, score]);

    return (
        <div style={{ position: 'relative', height: '400px', border: '1px solid black' }}>
            {zombies.map((zombie) => (
                <div
                    key={zombie.id}
                    style={{
                        position: 'absolute',
                        top: `${zombie.position}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '30px',
                        height: '30px',
                        backgroundColor: 'red',
                    }}
                >
                    {zombie.id}
                </div>
            ))}
        </div>
    );
};

export default GameCanvas;
