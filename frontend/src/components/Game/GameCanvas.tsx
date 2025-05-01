import React, { useState, useEffect, useRef } from 'react';
import { useLinera } from '../../linera/LineraProvider';
import useTimer from './hooks/useTimer';
import useZombies from './hooks/useZombies';
import Zombie from './Zombie';
import HealthDisplay from './HealthDisplay';
import { resetUsedWords, initializeWordLibrary } from './utils/wordUtils';

interface GameCanvasProps {
    onGameOver: () => void;
    onScoreUpdate: (points: number) => void;
    onZombieReachBottom: () => void; // Callback to trigger screen effect
    onWpmUpdate?: (wpm: number) => void;
    screenEffect: boolean;
    pvpMode: boolean;
    /** opponent's chain id */
    friendChainId?: string;
    /** remote spawn word */
    remoteWord?: string;
    /** remote spawn type */
    remoteType?: number | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate, onZombieReachBottom, onWpmUpdate, screenEffect, pvpMode, friendChainId, remoteWord, remoteType }) => {
    const { application } = useLinera();
    const [playerInput, setPlayerInput] = useState('');
    const [health, setHealth] = useState(3);
    const [score, setScore] = useState(0); // Score state
    const [flashScore, setFlashScore] = useState(false);
    // Track best WPM for kills
    const [bestWpm, setBestWpm] = useState(0);
    const [flashWpm, setFlashWpm] = useState(false);
    const [restartSignal, setRestartSignal] = useState(false); // Add restart signal
    const gunSoundRef = useRef<HTMLAudioElement | null>(null);
    const batDieRef = useRef<HTMLAudioElement | null>(null);
    const mummyDieRef = useRef<HTMLAudioElement | null>(null);
    const zombieDieRef = useRef<HTMLAudioElement | null>(null);
    const attackRef = useRef<HTMLAudioElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input box
    const spawnedRemoteWords = useRef<Set<string>>(new Set()); // track already spawned remote words

    const { timeLeft } = useTimer(60, onGameOver); // Use timeLeft from the hook
    // Dynamic timer color based on remaining time
    const timerColor = timeLeft > 40 ? 'lime' : timeLeft > 15 ? 'yellow' : 'red';
    const { zombies, handleZombieHit, spawnRemote } = useZombies(onGameOver, onZombieReachBottom, setHealth, restartSignal); // Use zombies from the hook

    useEffect(() => {
        initializeWordLibrary(); // Initialize the word library before the game starts
    }, []);

    useEffect(() => {
        // Autofocus the input box whenever the game restarts
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [restartSignal]); // Triggered when restartSignal changes

    // Flash score when updated
    useEffect(() => {
        if (score > 0) {
            setFlashScore(true);
            const t = setTimeout(() => setFlashScore(false), 300);
            return () => clearTimeout(t);
        }
    }, [score]);

    // Flash WPM on new high
    useEffect(() => {
        if (bestWpm > 0) {
            setFlashWpm(true);
            const t = setTimeout(() => setFlashWpm(false), 300);
            return () => clearTimeout(t);
        }
    }, [bestWpm]);

    useEffect(() => {
        if (screenEffect && attackRef.current) {
            attackRef.current.currentTime = 0;
            attackRef.current.play();
        }
    }, [screenEffect]);

    // spawn remote zombies on incoming PVP messages
    useEffect(() => {
        if (pvpMode && remoteWord && (remoteType === 1 || remoteType === 2 || remoteType === 3)) {
            if (!spawnedRemoteWords.current.has(remoteWord)) {
                spawnedRemoteWords.current.add(remoteWord);
                const typeMap: Record<number, 'zombie'|'mummy'|'bat'> = {1:'zombie',2:'mummy',3:'bat'};
                spawnRemote(remoteWord, typeMap[remoteType]);
            }
        }
    }, [pvpMode, remoteWord, remoteType, spawnRemote]);

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setPlayerInput(input);
        const killed = handleZombieHit(
            input,
            () => setPlayerInput(''),
            (points) => {
                setScore((prev) => prev + points);
                console.log('Local onScoreUpdate triggered with points:', points);
                onScoreUpdate(points);
            },
            (wpm: number) => {
                setBestWpm((prev) => Math.max(prev, wpm));
                if (onWpmUpdate) onWpmUpdate(wpm);
            }
        );

        // Play gun sound
        if (gunSoundRef.current) {
            gunSoundRef.current.currentTime = 0;
            gunSoundRef.current.play();
        }

        // send kill to opponent if in PVP mode and local kill
        if (killed && !killed.remote && pvpMode && application && friendChainId) {
            const typeNum = killed.type === 'zombie' ? 1 : killed.type === 'mummy' ? 2 : 3;
            try {
                await application.query(
                    JSON.stringify({ query: `mutation { sendMessage(targetChain:"${friendChainId}", word:"${killed.word}", msgType:"${typeNum}") }` })
                );
            } catch (err) {
                console.error('sendMessage error', err);
            }
        }

        // play kill animation sound
        if (killed?.type === 'bat') batDieRef.current?.play();
        else if (killed?.type === 'mummy') mummyDieRef.current?.play();
        else if (killed?.type === 'zombie') zombieDieRef.current?.play();
    };

    const restartGame = () => {
        setPlayerInput(''); // Reset player input
        setHealth(3); // Reset health to 3
        setScore(0); // Reset score
        setBestWpm(0); // Reset best WPM
        resetUsedWords(); // Reset used words
        setRestartSignal((prev) => !prev); // Toggle restart signal to trigger useEffect

        // Autofocus the input box
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                animation: screenEffect ? 'shake 0.2s' : 'none',
                transformOrigin: 'top left',
            }}>
                {screenEffect && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%',
                        backgroundColor: 'rgba(255, 0, 0, 0.2)',
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}/>
                )}
                <audio ref={gunSoundRef} src="/sounds/gunshot.mp3" preload="auto"></audio>
                <audio ref={batDieRef} src="/sounds/bat-die.mp3" preload="auto"></audio>
                <audio ref={mummyDieRef} src="/sounds/mummy-die.mp3" preload="auto"></audio>
                <audio ref={zombieDieRef} src="/sounds/zombie-die.mp3" preload="auto"></audio>
                <audio ref={attackRef} src="/sounds/zomb-attack.mp3" preload="auto"></audio>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 10px', gap: '10px' }}>
                        <div style={{
                            fontFamily: '"Press Start 2P", monospace',
                            fontSize: '18px',
                            color: flashScore ? 'lime' : 'yellow',
                            textShadow: '2px 4px 8px #000, 0 2px 0 #222',
                            transition: 'color 0.3s',
                        }}>
                            Score: {score}
                        </div>
                        <div style={{
                            fontFamily: '"Press Start 2P", monospace',
                            fontSize: '14px',
                            color: flashWpm ? 'lime' : 'yellow',
                            textShadow: '2px 4px 8px #000, 0 2px 0 #222',
                            transition: 'color 0.3s',
                            opacity: 0.7,
                        }}>
                            Typing Speed: {bestWpm} WPM
                        </div>
                    </div>
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '34px',
                        color: timerColor,
                        textShadow: '2px 4px 8px #000, 0 2px 0 #222',
                    }}>
                        {timeLeft}s
                    </div>
                    {pvpMode && (
                        <div style={{
                            position: 'absolute',
                            top: '60px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontFamily: '"Press Start 2P", monospace',
                            fontSize: '16px',
                            color: 'red',
                            textShadow: '2px 4px 8px #000, 0 2px 0 #222',
                        }}>
                            PVP Mode
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '5px', marginTop: '-15px', marginRight: '10px' }}>
                        {Array.from({ length: health }).map((_, index) => (
                            <img
                                key={index}
                                src="/images/heart.png"
                                alt="Life"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    imageRendering: 'pixelated',
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 1,
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        backgroundImage: 'url("/images/background.png")',
                        backgroundRepeat: 'repeat',
                        backgroundSize: 'auto',
                        backgroundPosition: 'top left',
                    }}
                >
                    {zombies.map((zombie) => (
                        <Zombie
                            key={zombie.id}
                            zombie={zombie}
                            isAttacked={playerInput.length > 0 && zombie.word.startsWith(playerInput)}
                        />
                    ))}
                </div>
                {/* Canon at bottom center */}
                <img
                    src="/images/canons.png"
                    alt="Canon"
                    style={{
                        position: 'fixed',
                        left: 0,
                        bottom: 0,
                        width: '100%',
                        height: 'auto',
                        zIndex: 100,
                        pointerEvents: 'none',
                        imageRendering: 'pixelated',
                    }}
                />
            </div>
            <input
                ref={inputRef}
                type="text"
                value={playerInput}
                onChange={handleInputChange}
                placeholder="Type here..."
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60vw',
                    maxWidth: '600px',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '24px',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    borderWidth: '6px',
                    borderStyle: 'solid',
                    borderColor: 'yellow #FFD600 #FFEA00 #FFFF00',
                    color: 'yellow',
                    textAlign: 'center',
                    imageRendering: 'pixelated',
                    outline: 'none',
                    zIndex: 102,
                }}
            />
        </div>
    );
};

export default GameCanvas;
