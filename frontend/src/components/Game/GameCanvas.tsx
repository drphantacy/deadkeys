import React, { useState, useRef } from 'react';
import useTimer from './hooks/useTimer';
import useZombies from './hooks/useZombies';
import Zombie from './Zombie';
import HealthDisplay from './HealthDisplay';
import { resetUsedWords } from './utils/wordUtils';

interface GameCanvasProps {
    onGameOver: () => void;
    onScoreUpdate: (points: number) => void;
    onZombieReachBottom: () => void; // Callback to trigger screen effect
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate, onZombieReachBottom }) => {
    const [playerInput, setPlayerInput] = useState('');
    const [health, setHealth] = useState(3);
    const [restartSignal, setRestartSignal] = useState(false); // Add restart signal
    const gunSoundRef = useRef<HTMLAudioElement | null>(null);

    const { timeLeft } = useTimer(60, onGameOver); // Use timeLeft from the hook
    const { zombies, handleZombieHit } = useZombies(onGameOver, onZombieReachBottom, setHealth, restartSignal); // Use zombies from the hook

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerInput(e.target.value);
        handleZombieHit(e.target.value, () => setPlayerInput(''), onScoreUpdate);

        // Play gun sound
        if (gunSoundRef.current) {
            gunSoundRef.current.currentTime = 0;
            gunSoundRef.current.play();
        }
    };

    const restartGame = () => {
        setPlayerInput(''); // Reset player input
        setHealth(3); // Reset health
        resetUsedWords(); // Reset used words
        setRestartSignal((prev) => !prev); // Toggle restart signal to trigger useEffect
    };

    return (
        <div>
            <audio ref={gunSoundRef} src="/sounds/gunshot.mp3" preload="auto"></audio>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>Time Left: {timeLeft}s</div>
                <HealthDisplay health={health} />
            </div>
            <div style={{ position: 'relative', height: '400px', border: '1px solid black', overflow: 'hidden' }}>
                {zombies.map((zombie) => (
                    <Zombie key={zombie.id} zombie={zombie} />
                ))}
            </div>
            <input
                type="text"
                value={playerInput}
                onChange={handleInputChange}
                placeholder="Type here..."
            />
        </div>
    );
};

export default GameCanvas;
