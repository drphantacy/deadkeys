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
    const [score, setScore] = useState(0); // Add score state
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
        setPlayerInput(e.target.value);
        handleZombieHit(e.target.value, () => setPlayerInput(''), (points) => setScore((prev) => prev + points)); // Update score

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>Score: {score}</div> {/* Show score on the left */}
                <div style={{ textAlign: 'center', flex: 1 }}>Time Left: {timeLeft}s</div> {/* Timer in the middle */}
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
            <div style={{ position: 'relative', height: '400px', border: '1px solid black', overflow: 'hidden' }}>
                {zombies.map((zombie) => (
                    <Zombie key={zombie.id} zombie={zombie} />
                ))}
            </div>
            <input
                ref={inputRef} // Attach the ref to the input box
                type="text"
                value={playerInput}
                onChange={handleInputChange}
                placeholder="Type here..."
            />
        </div>
    );
};

export default GameCanvas;
