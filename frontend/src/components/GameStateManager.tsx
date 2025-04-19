import React, { useState } from 'react';
import GameCanvas from './Game/GameCanvas';
import Leaderboard from './Leaderboard/Leaderboard';
import GameOver from './Game/GameOver';
import StartScreen from './UI/StartScreen';

interface LeaderboardEntry {
    name: string;
    points: number;
}

const GameStateManager: React.FC = () => {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'leaderboard'>('start');
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
        { name: 'Alice', points: 100 },
        { name: 'Bob', points: 80 },
    ]);

    const handleStart = () => {
        setScore(0); // Reset the score
        setGameState('playing'); // Transition to the 'playing' state
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
                <StartScreen
                    onStart={handleStart} // Pass handleStart to StartScreen
                    onViewLeaderboard={() => setGameState('leaderboard')}
                />
            )}
            {gameState === 'playing' && (
                <GameCanvas
                    onGameOver={handleGameOver}
                    onScoreUpdate={(points: number) => setScore((prev) => prev + points)}
                />
            )}
            {gameState === 'gameOver' && (
                <div>
                    <GameOver score={score} onRestart={handleRestart} />
                    <Leaderboard scores={leaderboard} /> {/* Show leaderboard */}
                </div>
            )}
            {gameState === 'leaderboard' && (
                <div className="leaderboard-screen">
                    <Leaderboard scores={leaderboard} />
                    <button
                        onClick={() => setGameState('start')}
                        style={{ marginTop: '10px' }}
                    >
                        Back to Start
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameStateManager;
