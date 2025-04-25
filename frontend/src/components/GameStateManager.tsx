import React, { useState, useEffect } from 'react';
import { useLinera } from '../linera/LineraProvider';
import GameCanvas from './Game/GameCanvas';
import Leaderboard from './Leaderboard/Leaderboard';
import GameOver from './Game/GameOver';
import StartScreen from './UI/StartScreen';
import OnboardingScreen from './UI/OnboardingScreen';

interface LeaderboardEntry {
    name: string;
    points: number;
}

const GameStateManager: React.FC = () => {
    const [gameState, setGameState] = useState<'onboarding' | 'start' | 'playing' | 'gameOver' | 'leaderboard'>(() =>
        localStorage.getItem('seenOnboarding') ? 'start' : 'onboarding'
    );
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
        { name: 'Alice', points: 100 },
        { name: 'Bob', points: 80 },
    ]);
    const [screenEffect, setScreenEffect] = useState(false); // Track screen flash and shake effect
    const [lastPage, setLastPage] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [debugScore, setDebugScore] = useState<number>(0);
    const [debugError, setDebugError] = useState<string | null>(null);
    const { client, application, chainId, loading: lineraLoading, status, error: lineraError } = useLinera();

    useEffect(() => {
        console.log('GameStateManager - chainId from context:', chainId);
    }, [chainId]);

    useEffect(() => {
        if (!lineraLoading && application && client) {
            client.onNotification(async (note: any) => {
                if (note.reason.NewBlock) {
                    try {
                        const resp = await application.query('{ "query": "query { value }" }');
                        const { data } = JSON.parse(resp);
                        setDebugScore(data.value);
                    } catch (err) {
                        console.error('subscription debug error', err);
                        setDebugError(err instanceof Error ? err.message : String(err));
                    }
                }
            });
        }
    }, [lineraLoading, application, client]);

    const handleStart = () => {
        setScore(0); // Reset the score
        setGameState('playing'); // Transition to the 'playing' state
    };

    const handleGameOver = async () => {
        // Update score logic needs to be implemented using Linera client
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

    // Onboarding flow handlers
    const handleOnboardingStart = () => {
        localStorage.setItem('seenOnboarding', 'true');
        setGameState('start');
    };
    const handleHowTo = () => {
        setGameState('onboarding');
    };

    // DEBUG: reset onboarding state
    const handleResetOnboarding = () => {
        localStorage.removeItem('seenOnboarding');
        setGameState('onboarding');
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
                <div style={{ fontSize: '14px' }}>Chain ID: {chainId || 'Loading...'}</div>
                <div style={{ fontSize: '12px', color: lineraError ? 'red' : status === 'Ready' ? 'green' : 'orange' }}>
                    Status: {status === 'Ready' ? 'Ready To Kill' : status}
                </div>
                {/* Chain Value removed as not needed */}
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
            {/* DEBUG: reset onboarding for testing */}
            <button
                onClick={handleResetOnboarding}
                style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    fontSize: '12px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                }}
            >
                Reset Onboarding
            </button>
            {gameState === 'onboarding' && (
                <OnboardingScreen onStart={handleOnboardingStart} />
            )}
            {gameState === 'start' && (
                <div>
                    <StartScreen onStart={handleStart} onHowTo={handleHowTo} onViewLeaderboard={handleViewLeaderboard} />
                    <div style={{ marginTop: '10px' }}>
                        <button onClick={async () => {
                            if (!application) return;
                            try {
                                const resp = await application.query('{ "query": "mutation { updateScore(value: 1) }" }');
                                console.log('mutation result', resp);
                            } catch (err) {
                                console.error('mutation error', err);
                            }
                        }}>Test Update Score</button>
                        <button
                            style={{ marginLeft: '10px' }}
                            onClick={async () => {
                                if (!application) return;
                                try {
                                    const resp = await application.query('{ "query": "query { value }" }');
                                    console.log(resp);
                                    const { data } = JSON.parse(resp);
                                    setDebugScore(data.value);
                                } catch (err) {
                                    console.error('fetch value error', err);
                                    setDebugError(err instanceof Error ? err.message : String(err));
                                }
                            }}
                        >
                            Fetch Value
                        </button>
                        <span style={{ marginLeft: '10px' }}>Test Score: {debugScore}</span>
                        {debugError && (
                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                Error fetching score: {debugError}
                            </div>
                        )}
                    </div>
                </div>
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
