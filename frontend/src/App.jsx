import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import GameOver from './components/GameOver';

const App = () => {
    const [gameState, setGameState] = useState('playing'); // 'playing', 'gameOver'
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState([
        { name: 'Alice', points: 100 },
        { name: 'Bob', points: 80 },
    ]);

    const handleGameOver = () => {
        setGameState('gameOver');
    };

    const handleScoreUpdate = (points) => {
        setScore((prev) => prev + points);
    };

    const handleRestart = () => {
        setScore(0);
        setGameState('playing');
    };

    return (
        <div>
            {gameState === 'playing' && (
                <GameCanvas
                    onGameOver={handleGameOver}
                    onScoreUpdate={handleScoreUpdate}
                />
            )}
            {gameState === 'gameOver' && (
                <GameOver score={score} onRestart={handleRestart} />
            )}
            <Leaderboard scores={leaderboard} />
        </div>
    );
};

export default App;
