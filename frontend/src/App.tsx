import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';
import GameOver from './components/GameOver';
import './styles/App.css';

interface LeaderboardEntry {
    name: string;
    points: number;
}

const App: React.FC = () => {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
        { name: 'Alice', points: 100 },
        { name: 'Bob', points: 80 },
    ]);

    const handleStart = () => {
        setScore(0);
        setGameState('playing');
    };

    const handleGameOver = () => {
        setGameState('gameOver');
    };

    const handleRestart = () => {
        setScore(0);
        setGameState('start');
    };

    return (
        <div>
            {gameState === 'start' && (
                <div className="start-screen">
                    <h1>Welcome to DeadKeys</h1>
                    <button onClick={handleStart}>Start Game</button>
                </div>
            )}
            {gameState === 'playing' && (
                <GameCanvas
                    onGameOver={handleGameOver}
                    onScoreUpdate={(points: number) => setScore((prev) => prev + points)}
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