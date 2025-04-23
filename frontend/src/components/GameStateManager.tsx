import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_VALUE, UPDATE_SCORE, VALUE_SUBSCRIPTION } from '../graphql/queries';
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
    const [lastPage, setLastPage] = useState<'start' | 'playing' | 'gameOver'>('start'); // Track the last page

    const { data: queryData, refetch } = useQuery(GET_VALUE);
    const [updateScore] = useMutation(UPDATE_SCORE, { onCompleted: () => refetch() });
    const { data: subData, loading: subLoading, error: subError } = useSubscription(VALUE_SUBSCRIPTION);
    const chainValue = subData?.value ?? queryData?.value ?? 0;

    // derive a human-friendly connection status
    const connectionStatus = subError
        ? 'Disconnected'
        : subLoading
        ? 'Connecting...'
        : 'Connected';

    const handleStart = () => {
        setScore(0); // Reset the score
        setGameState('playing'); // Transition to the 'playing' state
    };

    const handleGameOver = async () => {
        await updateScore({ variables: { delta: score } });
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

    const handleViewLeaderboard = () => {
        if (gameState !== 'leaderboard') {
            setLastPage(gameState as 'start' | 'playing' | 'gameOver'); // Save the current page as the last page
        }
        setGameState('leaderboard');
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
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <div style={{ fontSize: '14px' }}>Chain Value: {chainValue}</div>
                <div style={{ fontSize: '12px', color: subError ? 'red' : subLoading ? 'orange' : 'green' }}>
                    Status: {connectionStatus}
                </div>
            </div>
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
                    onStart={handleStart}
                    onViewLeaderboard={handleViewLeaderboard}
                />
            )}
            {gameState === 'playing' && (
                <GameCanvas
                    onGameOver={handleGameOver}
                    onScoreUpdate={(points: number) => setScore((prev) => prev + points)}
                    onZombieReachBottom={triggerScreenEffect}
                />
            )}
            {gameState === 'gameOver' && (
                <div>
                    <GameOver score={score} onRestart={handleRestart} />
                    <button
                        onClick={handleViewLeaderboard}
                        style={{ marginTop: '10px' }}
                    >
                        View Leaderboard
                    </button>
                </div>
            )}
            {gameState === 'leaderboard' && (
                <div className="leaderboard-screen">
                    <Leaderboard scores={leaderboard} />
                    <button
                        onClick={() => setGameState(lastPage)} // Return to the last page
                        style={{ marginTop: '10px' }}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameStateManager;
