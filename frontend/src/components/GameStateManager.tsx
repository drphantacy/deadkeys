import React, { useState, useEffect } from 'react';
import { useLinera } from '../linera/LineraProvider';
import GameCanvas from './Game/GameCanvas';
import Leaderboard from './Leaderboard/Leaderboard';
import GameOver from './Game/GameOver';
import StartScreen from './UI/StartScreen';
import OnboardingScreen from './UI/OnboardingScreen';
import { useLeaderboard } from '../hooks/useLeaderboard';

const GameStateManager: React.FC = () => {
    // Always start at the start-screen first
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'leaderboard'>('start');

    // Overlay flag for onboarding tutorial
    const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(
        !Boolean(localStorage.getItem('seenOnboarding'))
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
    const [bestWpm, setBestWpm] = useState<number>(0);
    const [isSplitting, setIsSplitting] = useState<boolean>(false);
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
        setIsSplitting(true);
        setTimeout(() => {
            setIsSplitting(false);
            setGameState('playing');
            setScore(0);
            setChainScore(0);
            setBestWpm(0);
        }, 2000);
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
        setBestWpm(0);
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
        setShowOnboardingOverlay(false);
        handleStart();
    };

    const handleHowTo = () => {
        setShowOnboardingOverlay(true);
    };

    // DEBUG: reset onboarding state
    const handleResetOnboarding = () => {
        localStorage.removeItem('seenOnboarding');
        setShowOnboardingOverlay(true);
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                animation: screenEffect ? 'shake 0.2s' : 'none',
                backgroundImage: `url("/images/background.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {screenEffect && (
                <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                    pointerEvents: 'none',
                    zIndex: 3000
                }}/>
            )}
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
                    zIndex: 2000,  // ensure it's above overlays
                }}
            >
                Reset Onboarding
            </button>
            {/* Overlay onboarding panel (no extra dim layer) */}
            {showOnboardingOverlay && (
                <div style={{
                    position: 'fixed', top: 0, left: 0,
                    width: '100vw', height: '100vh',
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url("/images/startscreen.png")',
                    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                    zIndex: 1002, pointerEvents: 'auto',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <button onClick={() => {
                        localStorage.setItem('seenOnboarding', 'true');
                        setShowOnboardingOverlay(false);
                    }} style={{
                        position: 'absolute', top: 16, right: 16,
                        width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontFamily: 'monospace', color: 'rgb(222, 42, 2)',
                        border: '2px solid rgb(222, 42, 2)', borderRadius: '8px', background: 'transparent',
                        padding: 0, lineHeight: 1, cursor: 'pointer', zIndex: 1003
                    }}>X</button>
                    <OnboardingScreen onStart={handleOnboardingStart} disabled={!chainId || lineraLoading} />
                </div>
            )}
            {/* Render current screen via lookup */}
            {(() => {
                const screens: Record<typeof gameState, React.ReactNode> = {
                    start: (
                        <>
                          {!isSplitting && (
                            <div style={{
                                position: 'fixed', top: 0, left: 0,
                                width: '100vw', height: '100vh',
                                backgroundImage: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("/images/startscreen.png")',
                                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                                zIndex: 1001,
                                display: 'flex', justifyContent: 'center', alignItems: 'center'
                            }}>
                                <StartScreen
                                    onStart={handleStart}
                                    onHowTo={handleHowTo}
                                    onViewLeaderboard={handleViewLeaderboard}
                                    disabled={!chainId || lineraLoading}
                                    statusText={
                                        lineraLoading ? 'Connecting...'
                                        : status === 'CreatingWallet' ? 'Creating Wallet...'
                                        : status === 'RequestingChain' ? 'Requesting Chain...'
                                        : status === 'Ready' ? 'Start Game'
                                        : 'Start Game'
                                    }
                                    chainId={chainId}
                                />
                            </div>
                          )}
                          {isSplitting && (
                            <>
                              <style>{`
                                @keyframes openLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } }
                                @keyframes openRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
                              `}</style>
                              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 1002 }}>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '100vw', height: '100vh',
                                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("/images/startscreen.png")',
                                    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                                    clipPath: 'inset(0 50% 0 0)',
                                    animation: 'openLeft 2s forwards'
                                }}>
                                  <StartScreen
                                      onStart={handleStart}
                                      onHowTo={handleHowTo}
                                      onViewLeaderboard={handleViewLeaderboard}
                                      disabled={!chainId || lineraLoading}
                                  />
                                </div>
                                <div style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '100vw', height: '100vh',
                                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("/images/startscreen.png")',
                                    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                                    clipPath: 'inset(0 0 0 50%)',
                                    animation: 'openRight 2s forwards'
                                }}>
                                  <StartScreen
                                      onStart={handleStart}
                                      onHowTo={handleHowTo}
                                      onViewLeaderboard={handleViewLeaderboard}
                                      disabled={!chainId || lineraLoading}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </>
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
                            onWpmUpdate={setBestWpm}
                        />
                    ),
                    gameOver: (
                        <GameOver score={chainScore} wpm={bestWpm} onRestart={handleRestart} />
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
