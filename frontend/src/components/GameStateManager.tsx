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
    const [screenEffect, setScreenEffect] = useState(false); // Track screen flash and shake effect

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

    const triggerScreenEffect = () => {
        setScreenEffect(true);
        setTimeout(() => setScreenEffect(false), 200); // Reset effect after 0.2 seconds
    };

    return (
        <div
            style={{
                position: 'relative',
                overflow: 'hidden',
                animation: screenEffect ? 'shake 0.2s' : 'none',
                backgroundColor: screenEffect ? 'rgba(255, 0, 0, 0.5)' : 'transparent',
            }}
        >
            <style>
                {`
                @keyframes shake {
                    0% { transform: translate(0, 0); }
                    25% { transform: translate(-5px, 5px); }
                    50% { transform: translate(5px, -5px); }
                    75% { transform: translate(-5px, -5px); }
                    100% { transform: translate(0, 0); }
                }
                `}
            </style>
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
                    onZombieReachBottom={triggerScreenEffect} // Trigger screen effect when zombie reaches bottom
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
