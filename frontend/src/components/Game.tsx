import React, { useEffect, useState } from 'react';
import usePlayerState from '../hooks/usePlayerState';

const Game: React.FC = () => {
    const { playerState, savePlayerState } = usePlayerState('playerId');
    const [zombies, setZombies] = useState<string[]>([]);
    const [score, setScore] = useState<number>(0);
    const [lives, setLives] = useState<number>(3);
    const [gameOver, setGameOver] = useState<boolean>(false);

    useEffect(() => {
        const spawnZombies = () => {
            const newZombies = Array.from({ length: 5 }, (_, index) => index.toString());
            setZombies(newZombies);
        };

        spawnZombies();
    }, []);

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (gameOver) return;

        const key = event.key.toLowerCase();
        if (zombies.includes(key)) {
            setScore(score + 1);
            setZombies(zombies.filter(z => z !== key));
        } else {
            setLives(lives - 1);
            if (lives <= 1) {
                setGameOver(true);
                savePlayerState({ highScore: score, totalGames: 1 });
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keypress', handleKeyPress as any);
        return () => {
            window.removeEventListener('keypress', handleKeyPress as any);
        };
    }, [zombies, score, lives, gameOver]);

    return (
        <div className="game-container">
            <h1>DeadKeys</h1>
            <div className="game-info">
                <p>Score: {score}</p>
                <p>Lives: {lives}</p>
            </div>
            <div className="zombie-container">
                {zombies.map(zombie => (
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