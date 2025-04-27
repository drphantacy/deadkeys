import React, { useState, useRef, useEffect } from 'react';
import useTimer from './hooks/useTimer';
import useZombies from './hooks/useZombies';
import Zombie from './Zombie';
import HealthDisplay from './HealthDisplay';
import { resetUsedWords, initializeWordLibrary } from './utils/wordUtils';

interface GameCanvasProps {
    onGameOver: () => void;
    onScoreUpdate: (points: number) => void;
    onZombieReachBottom: () => void; // Callback to trigger screen effect
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate, onZombieReachBottom }) => {
    const [playerInput, setPlayerInput] = useState('');
    const [health, setHealth] = useState(3);
    const [score, setScore] = useState(0); // Score state
    // Track best WPM for kills
    const [bestWpm, setBestWpm] = useState(0);
    const [restartSignal, setRestartSignal] = useState(false); // Add restart signal
    const gunSoundRef = useRef<HTMLAudioElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null); // Ref for the input box

    const { timeLeft } = useTimer(60, onGameOver); // Use timeLeft from the hook
    const { zombies, handleZombieHit } = useZombies(onGameOver, onZombieReachBottom, setHealth, restartSignal); // Use zombies from the hook

    useEffect(() => {
        initializeWordLibrary(); // Initialize the word library before the game starts
    }, []);

    useEffect(() => {
        // Autofocus the input box whenever the game restarts
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [restartSignal]); // Triggered when restartSignal changes

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setPlayerInput(input);
        handleZombieHit(
            input,
            () => setPlayerInput(''),
            (points) => {
                setScore((prev) => prev + points);
                console.log('Local onScoreUpdate triggered with points:', points);
                onScoreUpdate(points);
            },
            (wpm: number) => setBestWpm((prev) => Math.max(prev, wpm))
        );

        // Play gun sound
        if (gunSoundRef.current) {
            gunSoundRef.current.currentTime = 0;
            gunSoundRef.current.play();
        }
    };

    const restartGame = () => {
        setPlayerInput(''); // Reset player input
        setHealth(3); // Reset health
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
        <div>
            <audio ref={gunSoundRef} src="/sounds/gunshot.mp3" preload="auto"></audio>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div>Score: {score}</div>
                    <div style={{ fontSize: '14px', opacity: 0.7 }}>
                        Typing Speed: {bestWpm} WPM
                    </div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>Time Left: {timeLeft}s</div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {Array.from({ length: health }).map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: 'red',
                                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                            }}
                        ></div>
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
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {zombies.map((zombie) => (
                    <Zombie key={zombie.id} zombie={zombie} />
                ))}
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
                    zIndex: 2,
                }}
            />
        </div>
    );
};

export default GameCanvas;
