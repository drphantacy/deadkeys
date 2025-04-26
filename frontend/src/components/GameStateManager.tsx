import React, { useState, useEffect } from 'react';
import { useLinera } from '../linera/LineraProvider';
import GameCanvas from './Game/GameCanvas';
import Leaderboard from './Leaderboard/Leaderboard';
import GameOver from './Game/GameOver';
import StartScreen from './UI/StartScreen';
import OnboardingScreen from './UI/OnboardingScreen';
import { useLeaderboard } from '../hooks/useLeaderboard';

const GameStateManager: React.FC = () => {
    const [gameState, setGameState] = useState<'onboarding' | 'start' | 'playing' | 'gameOver' | 'leaderboard'>(() =>
        localStorage.getItem('seenOnboarding') ? 'start' : 'onboarding'
    );
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useLeaderboard();
    const [screenEffect, setScreenEffect] = useState(false); // Track screen flash and shake effect
    const [lastPage, setLastPage] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [debugScore, setDebugScore] = useState<number>(0);
    const [debugError, setDebugError] = useState<string | null>(null);
    // New state for per-game tracking
    const [gameId, setGameId] = useState<string>(() => globalThis.crypto.randomUUID());
    const [chainScore, setChainScore] = useState<number>(0);
    const { client, application, chainId, loading: lineraLoading, status, error: lineraError } = useLinera();

    useEffect(() => {
        console.log('GameStateManager - chainId from context:', chainId);
    }, [chainId]);

    useEffect(() => {
        if (!lineraLoading && application && client && gameId) {
            client.onNotification(async (note: any) => {
                if (note.reason.NewBlock) {
                    try {
                        console.log('Subscription NewBlock received, querying score');
                        const resp = await application.query(
                            JSON.stringify({ query: `query { score(gameId:"${gameId}") }` })
                        );
                        console.log('Subscription response:', resp);
                        const { data } = JSON.parse(resp);
                        console.log('Subscription new score for', gameId, ':', data.score);
                        setChainScore(data.score);
                    } catch (err) {
                        console.error('subscription error', err);
                        setDebugError(err instanceof Error ? err.message : String(err));
                    }
                }
            });
        }
    }, [lineraLoading, application, client, gameId]);

    const handleStart = () => {
        // Begin game session with existing gameId
        setScore(0);
        setChainScore(0);
        setGameState('playing');
    };

    const handleGameOver = async () => {
        // Update score logic needs to be implemented using Linera client
        setGameState('gameOver');
    };

    const handleRestart = () => {
        // Assign new gameId on restart
        const newGameId = globalThis.crypto.randomUUID();
        setGameId(newGameId);
        setScore(0);
        setChainScore(0);
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
        // Immediately start the game without extra click
        handleStart();
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
            {/* Render current screen via lookup */}
            {(() => {
                const screens: Record<typeof gameState, React.ReactNode> = {
                    onboarding: <OnboardingScreen onStart={handleOnboardingStart} disabled={!chainId || lineraLoading} />, // Onboarding
                    start: (
                        <div>
                            <StartScreen
                                onStart={handleStart}
                                onHowTo={handleHowTo}
                                onViewLeaderboard={handleViewLeaderboard}
                                disabled={!chainId || lineraLoading}
                            />
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={async () => {
                                    if (!application || !gameId) return;
                                    try {
                                        console.log('Sending updateScore', { gameId, value: 1 });
                                        const resp = await application.query(
                                            JSON.stringify({ query: `mutation { updateScore(gameId:"${gameId}", value:1) }` })
                                        );
                                        console.log('updateScore mutation response:', resp);
                                        const result = JSON.parse(resp).data.updateScore;
                                        console.log('updateScore result:', result);
                                    } catch (err) {
                                        console.error('mutation error', err);
                                    }
                                }}>Test Update Score</button>
                                <button
                                    style={{ marginLeft: '10px' }}
                                    onClick={async () => {
                                        if (!application || !gameId) return;
                                        try {
                                            console.log('Sending fetchScore', { gameId });
                                            const resp = await application.query(
                                                JSON.stringify({ query: `query { score(gameId:"${gameId}") }` })
                                            );
                                            console.log('fetchScore response:', resp);
                                            const { data } = JSON.parse(resp);
                                            console.log('fetchScore result:', data.score);
                                            setChainScore(data.score);
                                        } catch (err) {
                                            console.error('fetch score error', err);
                                            setDebugError(err instanceof Error ? err.message : String(err));
                                        }
                                    }}
                                >
                                    Fetch Score
                                </button>
                                <span style={{ marginLeft: '10px' }}>Chain Score: {chainScore}</span>
                                <span style={{ marginLeft: '10px' }}>Test Score: {debugScore}</span>
                                {debugError && (
                                    <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                        Error fetching score: {debugError}
                                    </div>
                                )}
                            </div>
                        </div>
                    ),
                    playing: (
                        <GameCanvas
                            onGameOver={handleGameOver}
                            onScoreUpdate={async (points: number) => {
                                setScore((prev) => prev + points);
                                if (!application || !gameId) return;
                                try {
                                    console.log('Sending updateScore', { gameId, value: points });
                                    const resp = await application.query(
                                        JSON.stringify({ query: `mutation { updateScore(gameId:"${gameId}", value:${points}) }` })
                                    );
                                    console.log('updateScore mutation response:', resp);
                                    const result = JSON.parse(resp).data.updateScore;
                                    console.log('updateScore result:', result);
                                } catch (err) {
                                    console.error('updateScore error', err);
                                }
                            }}
                            onZombieReachBottom={triggerScreenEffect}
                        />
                    ),
                    gameOver: (
                        <div>
                            <GameOver score={chainScore} onRestart={handleRestart} />
                            <button onClick={handleViewLeaderboard} style={{ marginTop: '10px' }}>
                                View Leaderboard
                            </button>
                        </div>
                    ),
                    leaderboard: (
                        <div className="leaderboard-screen">
                            <Leaderboard scores={leaderboard} />
                            <button onClick={() => setGameState(lastPage)} style={{ marginTop: '10px' }}>
                                Close
                            </button>
                        </div>
                    ),
                };
                return screens[gameState];
            })()}
        </div>
    );
};

export default GameStateManager;
