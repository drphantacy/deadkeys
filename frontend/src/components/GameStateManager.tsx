import React, { useState, useEffect } from 'react';
import { useLinera } from '../linera/LineraProvider';
import GameCanvas from './Game/GameCanvas';
import SoundManager from './Game/SoundManager';
import Leaderboard from './Leaderboard/Leaderboard';
import GameOver from './Game/GameOver';
import StartScreen from './UI/StartScreen';
import OnboardingScreen from './UI/OnboardingScreen';
import PVPModeScreen from './UI/PVPModeScreen';
import { useLeaderboard } from '../hooks/useLeaderboard';

const GameStateManager: React.FC = () => {
    // Always start at the start-screen first
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver' | 'leaderboard' | 'pvp'>('start');

    // Overlay flag for onboarding tutorial
    const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(
        !Boolean(localStorage.getItem('seenOnboarding'))
    );

    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useLeaderboard();
    const [screenEffect, setScreenEffect] = useState(false); // Track screen flash and shake effect
    const [lastPage, setLastPage] = useState<'start' | 'playing' | 'gameOver'>('start');
    const [debugError, setDebugError] = useState<string | null>(null);
    // New state for per-game tracking
    const [gameId, setGameId] = useState<string>(() => globalThis.crypto.randomUUID());
    const [chainScore, setChainScore] = useState<number>(0);
    const [bestWpm, setBestWpm] = useState<number>(0);
    const [isSplitting, setIsSplitting] = useState<boolean>(false);
    const { client, application, chainId, loading: lineraLoading, status, error: lineraError } = useLinera();
    const [incomingMessage, setIncomingMessage] = useState<string>('');
    const [incomingMessageType, setIncomingMessageType] = useState<number | null>(null);
    const [isPVPGame, setIsPVPGame] = useState<boolean>(false);

    useEffect(() => {
        console.log('GameStateManager - chainId from context:', chainId);
    }, [chainId]);

    useEffect(() => {
        if (!lineraLoading && application && client && gameId) {
            client.onNotification(async (note: any) => {
                console.log('🔔 Notification:', note);
                console.log("🔔  Reason keys:", Object.keys(note.reason));
                console.log("🔔  Payload:", note.reason);
                const reason = note.reason || {} as Record<string, any>;
                if (reason.NewBlock) {
                    try {
                        const respMsg = await application.query(
                            JSON.stringify({ query: `query { zombie { word type } }` })
                        );
                        console.log('🔔 message response:', respMsg);
                        const parsedMsg = JSON.parse(respMsg) as any;
                        if (parsedMsg.data?.zombie) {
                            setIncomingMessage(parsedMsg.data.zombie.word);
                            setIncomingMessageType(parsedMsg.data.zombie.type);
                            console.log('🔔 Last message payload:', parsedMsg.data.zombie);
                        } else {
                            console.log('🔔 No last zombie');
                        }
                    } catch (err) {
                        console.error('🔔 Zombie error', err);
                    }
                }
                if (note.reason.NewBlock) {
                    try {
                        console.log('Subscription NewBlock received, querying score');
                        const resp = await application.query(
                            JSON.stringify({ query: `query { score(gameId:"${gameId}") }` })
                        );
                        console.log('🔔 Subscription response:', resp);
                        const { data } = JSON.parse(resp);
                        console.log('🔔 Subscription new score for', gameId, ':', data.score);
                        setChainScore(data.score);
                    } catch (err) {
                        console.error('🔔 subscription error', err);
                        setDebugError(err instanceof Error ? err.message : String(err));
                    }
                }
            });
        }
    }, [lineraLoading, application, client, gameId]);

    // useEffect(() => {
    //     if (!client) return;
    //     client.onNotification((note: any) => {
    //         console.log('🔔 Notification:', note);
    //         if (note.reason.NewBlock) {
    //             console.log('🔔 Notification:', note.reason.NewBlock);
    //         }
    //         // Extract and inspect the reason object
    //         const reason = (note.reason ?? {}) as Record<string, any>;
    //         console.log('🔔 Reason keys:', Object.keys(reason));
    //         // Iterate through each variant payload
    //         Object.keys(reason).forEach(key => {
    //             const payload = reason[key];
    //             console.log(`🔔 reason[${key}]:`, payload);
    //             if (Array.isArray(payload)) {
    //                 payload.forEach((entry: any) => {
    //                     if (entry && entry.data != null) {
    //                         console.log(`✨ Data in ${key}:`, entry.data);
    //                         setIncomingMessage(entry.data as string);
    //                     }
    //                 });
    //             } else if (payload && payload.data != null) {
    //                 console.log(`✨ Data in ${key}:`, payload.data);
    //                 setIncomingMessage(payload.data as string);
    //             }
    //         });
    //     });
    // }, [client]);

    const handleStart = (pvp: boolean = false) => {
        setIsPVPGame(pvp);
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

    const handlePVPMode = () => setGameState('pvp');

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

    // Compute display text for StartScreen button based on Linera status
    const statusMap: Record<string, string> = {
        Loading: 'Connecting...',
        'Creating Wallet': 'Creating Wallet...',
        'Creating Client': 'Creating Client...',
        'Creating Chain': 'Requesting Chain...',
        Ready: 'Start Game',
    };
    const statusTextToDisplay = statusMap[status] || 'Start Game';

    return (
        <>
            <SoundManager gameState={gameState} />
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
            {/* <button
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
            </button> */}
        </div>
        {showOnboardingOverlay && (
            <div style={{
                position: 'fixed', top: 0, left: 0,
                    width: '100vw', height: '100vh',
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/images/startscreen.png")',
                    backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                    zIndex: 1002, pointerEvents: 'auto',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
                <button onClick={() => {
                    localStorage.setItem('seenOnboarding', 'true');
                    setShowOnboardingOverlay(false);
                }} style={{
                    position: 'absolute', top: '16px', right: '16px',
                    marginTop: '10px',
                    marginRight: '10px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '8px 10px',
                    fontSize: '12.5px',
                    fontFamily: '"Press Start 2P", monospace',
                    color: 'yellow',
                    background: 'transparent',
                    border: '1px solid yellow',
                    outline: 'none',
                    imageRendering: 'pixelated',
                    cursor: 'pointer',
                    zIndex: 1003
                }}>Close</button>
                <OnboardingScreen onStart={handleOnboardingStart} disabled={!chainId || lineraLoading} />
            </div>
        )}
        {/* Render current screen via lookup */}
            {(() => {
                const screens = {
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
                                    onPVP={handlePVPMode}
                                    disabled={!chainId || lineraLoading}
                                    statusText={statusTextToDisplay}
                                    chainId={chainId}
                                    incomingMessage={incomingMessage}
                                    gameId={gameId}
                                />
                                {/* Linera branding on start screen */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 10,
                                    left: 10,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    color: 'white',
                                    textAlign: 'left',
                                }}>
                                    <span style={{ fontSize: '12px' }}>
                                        Powered by:
                                    </span>
                                    <img
                                        src="/images/Linera_Red_White_H.png"
                                        alt="Linera Logo"
                                        style={{ width: '100px', height: 'auto', marginTop: '4px' }}
                                    />
                                </div>
                            </div>
                          )}
                          {isSplitting && (
                            <>
                              <style>{`
                                @keyframes openLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } }
                                @keyframes openRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
                                @keyframes riseCanons { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
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
                                      onPVP={handlePVPMode}
                                      disabled={!chainId || lineraLoading}
                                      incomingMessage={incomingMessage}
                                      gameId={gameId}
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
                                      onPVP={handlePVPMode}
                                      disabled={!chainId || lineraLoading}
                                      incomingMessage={incomingMessage}
                                      gameId={gameId}
                                  />
                                </div>
                                <img
                                  src="/images/canons.png"
                                  alt="Canon"
                                  style={{
                                    position: 'fixed',
                                    left: 0,
                                    bottom: 0,
                                    width: '100%',
                                    height: 'auto',
                                    zIndex: 1001,
                                    pointerEvents: 'none',
                                    imageRendering: 'pixelated',
                                    transform: 'translateY(100%)',
                                    animation: 'riseCanons 2s ease-out forwards',
                                  }}
                                />
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
                            screenEffect={screenEffect}
                            pvpMode={isPVPGame}
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
                    pvp: (
                        <div style={{
                            position: 'fixed', top: 0, left: 0,
                            width: '100vw', height: '100vh',
                            backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/images/startscreen.png")',
                            backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                            zIndex: 1002, display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <PVPModeScreen
                              chainId={chainId || ''}
                              onClose={() => setGameState('start')}
                              incomingMessage={incomingMessage}
                              incomingType={incomingMessageType ?? -1}
                              onStart={() => handleStart(true)}
                            />
                        </div>
                    ),
                };
                return screens[gameState];
            })()}
        </>
    );
};

export default GameStateManager;
