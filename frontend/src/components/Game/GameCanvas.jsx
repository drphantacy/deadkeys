import React, { useState, useEffect, useRef } from 'react';

const GameCanvas = ({ onGameOver, onScoreUpdate }) => {
    const [playerInput, setPlayerInput] = useState('');
    const gunSoundRef = useRef(null); // Reference to the gun sound

    const handleInputChange = (e) => {
        setPlayerInput(e.target.value);

        // Play gun sound
        if (gunSoundRef.current) {
            console.log('Playing gun sound'); // Debugging log
            gunSoundRef.current.currentTime = 0; // Reset sound to the beginning
            gunSoundRef.current.play().catch((err) => console.error('Audio play error:', err)); // Catch errors
        }
    };

    return (
        <div>
            <audio ref={gunSoundRef} src="/sounds/gunshot.mp3" preload="auto"></audio>
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
