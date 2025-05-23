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
    const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(false);

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
    const [friendChainId, setFriendChainId] = useState<string>('');
    const [friendScore, setFriendScore] = useState<number | null>(null);

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

    useEffect(() => {
        if (incomingMessageType === 6) {
            const fs = parseInt(incomingMessage, 10);
            setFriendScore(isNaN(fs) ? 0 : fs);
            // Opponent ended game; if we're still playing, end our game and send final score
            if (isPVPGame && gameState === 'playing') {
                handleGameOver();
            }
        }
    }, [incomingMessageType, incomingMessage, isPVPGame, gameState]);

    // Common start logic (called by normal or PVP start)
    const _startGame = (isPVP: boolean, friendId?: string) => {
        setFriendScore(null);
        setIsPVPGame(isPVP);
        setFriendChainId(friendId || '');
        setIsSplitting(true);
        setTimeout(() => {
            setIsSplitting(false);
            setGameState('playing');
            setScore(0);
            setChainScore(0);
            setBestWpm(0);
        }, 2000);
    };

    // Normal start
    const handleStart = () => _startGame(false);

    // PVP start with friend chain id
    const handleStartPVP = (friendId: string) => _startGame(true, friendId);

    const handleGameOver = async () => {
        // send final score to opponent in PVP
        if (isPVPGame && application && friendChainId) {
            try {
                await application.query(
                    JSON.stringify({ query: `mutation { sendMessage(targetChain:"${friendChainId}", word:"${score}", msgType:"6") }` })
                );
            } catch (err) {
                console.error('sendMessage error', err);
            }
        }
        setGameState('gameOver');
    };

    const handleRestart = () => {
        // Assign new gameId on restart
        const newGameId = globalThis.crypto.randomUUID();
        setGameId(newGameId);
        setScore(0);
        setChainScore(0);
        setFriendScore(null);
        setBestWpm(0);
        setGameState('start');
    };

    const handlePVPRematch = () => {
        setGameState('pvp');
        setScore(0);
        setChainScore(0);
        setBestWpm(0);
        setFriendScore(null);
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
        Ready: 'Solo Game',
    };
    const statusTextToDisplay = statusMap[status] || 'Solo Game';

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
                            onWpmUpdate={(wpm) => setBestWpm(prev => Math.max(prev, wpm))}
                            screenEffect={screenEffect}
                            pvpMode={isPVPGame}
                            friendChainId={friendChainId}
                            remoteWord={incomingMessage}
                            remoteType={incomingMessageType}
                        />
                    ),
                    gameOver: isPVPGame ? (
                        <div style={{
                            position: 'fixed', top: 0, left: 0,
                            width: '100vw', height: '100vh',
                            backgroundImage: 'url("/images/gameover.png")',
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            fontFamily: '"Press Start 2P", monospace', color: 'yellow', textAlign: 'center', zIndex: 4000
                        }}>
                            {friendScore === null ? (
                                <>
                                    <h1 style={{ fontSize: '48px', margin: '20px' }}>Game Over</h1>
                                    <p style={{ fontSize: '24px', margin: '10px' }}>Your Score: {score}</p>
                                    <p style={{ fontSize: '24px', margin: '10px', color: 'white' }}>Waiting for opponent...</p>
                                </>
                            ) : (
                                <>
                                    <h1 style={{ fontSize: '48px', margin: '20px' }}>
                                        {friendScore > score ? 'You Lose!' : 'You Win!'}
                                    </h1>
                                    <p style={{ fontSize: '24px', margin: '10px' }}>Your Score: {score}</p>
                                </>
                            )}
                            <button onClick={handlePVPRematch} style={{
                                fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: 'yellow',
                                background: 'transparent', border: '2px solid yellow', padding: '10px 20px', cursor: 'pointer',
                                imageRendering: 'pixelated', outline: 'none', marginTop: '20px'
                            }}>
                                Rematch
                            </button>
                        </div>
                    ) : (
                        <GameOver score={score} wpm={bestWpm} onRestart={handleRestart} />
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
                              onStart={handleStartPVP}
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
