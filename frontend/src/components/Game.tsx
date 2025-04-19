import React, { useEffect, useState } from 'react';
import usePlayerState from '../hooks/usePlayerState';

const Game: React.FC = () => {
    const { playerState, savePlayerState } = usePlayerState('playerId');
    const [zombies, setZombies] = useState<string[]>([]);
    const [score, setScore] = useState<number>(0);
    const [lives, setLives] = useState<number>(1); // Initial lives set to 5
    const [gameOver, setGameOver] = useState<boolean>(false);

    useEffect(() => {
        const spawnZombies = () => {
            const newZombies = Array.from({ length: 5 }, (_, index) => index.toString());
            setZombies(newZombies);
        };

        spawnZombies();
    }, []);

    const handleZombieCrossBase = (zombie: string) => {
        setLives((prevLives) => {
            const newLives = prevLives - 1; // Deduct 1 life
            console.log(`Lives updated: ${newLives}`); // Debugging log
            if (newLives <= 0) {
                setGameOver(true); // Trigger game over if lives reach 0
                savePlayerState({ highScore: score, totalGames: 1 }); // Save player state
            }
            return newLives; // Update lives
        });
        setZombies((prevZombies) => prevZombies.filter((z) => z !== zombie)); // Remove zombie
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (gameOver) return;

        const key = event.key.toLowerCase();
        if (zombies.includes(key)) {
            setScore((prevScore) => prevScore + 1); // Increment score
            setZombies((prevZombies) => prevZombies.filter((z) => z !== key)); // Remove zombie
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (zombies.length > 0) {
                const zombieToCross = zombies[0]; // Simulate the first zombie crossing the base
                handleZombieCrossBase(zombieToCross); // Call the function for the first zombie
            }
        }, 2000); // Simulate zombies crossing every 2 seconds

        return () => clearInterval(interval);
    }, [zombies]);

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
            <div className="zombie-container">
                {zombies.map((zombie) => (
                    <div key={zombie} className="zombie">
                        Zombie {zombie}
                    </div>
                ))}
            </div>
            {gameOver && <div className="game-over">Game Over!</div>}
            <input type="text" onKeyDown={handleKeyPress} />
        </div>
    );
};

export default Game;