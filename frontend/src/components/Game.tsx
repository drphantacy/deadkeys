import React, { useEffect, useState, useCallback, useRef } from 'react';
import usePlayerState from '../hooks/usePlayerState';
import GameCanvas from './GameCanvas'; // Import GameCanvas

interface Zombie {
    id: string;
    position: number; // Vertical position of the zombie
}

const Game: React.FC = () => {
    const { playerState, savePlayerState } = usePlayerState('playerId');
    const [zombies, setZombies] = useState<Zombie[]>([]); // Update type to Zombie[]
    const [score, setScore] = useState<number>(0);
    const [lives, setLives] = useState<number>(5); // Initial lives set to 5
    const [gameOver, setGameOver] = useState<boolean>(false);

    // Use refs for values that change frequently to avoid adding them as dependencies.
    const gameOverRef = useRef(gameOver);
    useEffect(() => {
        gameOverRef.current = gameOver;
    }, [gameOver]);

    const scoreRef = useRef(score);
    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        const spawnZombies = () => {
            const newZombies = Array.from({ length: 5 }, (_, index) => ({
                id: index.toString(),
                position: 0, // Start at the top
            }));
            setZombies(newZombies);
        };

        spawnZombies();
    }, []);

    const handleZombieCrossBase = useCallback((zombie: Zombie) => {
        setLives((prevLives) => {
            const newLives = prevLives - 1; // Deduct 1 life
            console.log(`Lives updated: ${newLives}`); // Debugging log
            if (newLives <= 0) {
                setGameOver(true); // Trigger game over if lives reach 0
                savePlayerState({ highScore: scoreRef.current, totalGames: 1 }); // Save player state
            }
            return newLives; // Update lives
        });
        setZombies((prevZombies) => prevZombies.filter((z) => z.id !== zombie.id)); // Remove zombie
    }, [savePlayerState]); // Memoize with dependencies

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (gameOver) return;

        const key = event.key.toLowerCase();
        if (zombies.some((z) => z.id === key)) {
            setScore((prevScore) => prevScore + 1); // Increment score
            setZombies((prevZombies) => prevZombies.filter((z) => z.id !== key)); // Remove zombie
        }
    };

    useEffect(() => {
        // Move zombies down slowly; using empty dependency array along with refs
        const interval = setInterval(() => {
            setZombies((prevZombies) => {
                const updatedZombies = [];
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
                        if (newLives === 0 && !gameOverRef.current) {
                            setGameOver(true); // Trigger game over only once
                            savePlayerState({ highScore: scoreRef.current, totalGames: 1 });
                        }
                        return newLives;
                    });
                }

                return updatedZombies; // Remove zombies that crossed the baseline
            });
        }, 50); // Update every 50ms

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []); // empty dependency array

    return (
        <div className="game-container">
            <h1>DeadKeys</h1>
            <div className="game-info">
                <p>Score: {score}</p>
                {/* Display lives as a number */}
                <p style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold' }}>
                    Lives: {lives} 
                </p>
            </div>
            <GameCanvas
                zombies={zombies}
                setZombies={setZombies}
                lives={lives} // Pass lives as a prop
                setLives={setLives} // Pass setLives as a prop
                gameOver={gameOver}
                setGameOver={setGameOver}
                score={score}
                savePlayerState={savePlayerState}
            />
            {gameOver && <div className="game-over">Game Over!</div>}
            <input type="text" onKeyDown={handleKeyPress} />
        </div>
    );
};

export default Game;