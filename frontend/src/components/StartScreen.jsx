import React from 'react';
import { useNavigate } from 'react-router-dom';

const StartScreen = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Welcome to DeadKeys</h1>
            <button onClick={() => navigate('/game')}>Start Game</button>
            <button onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
        </div>
    );
};

export default StartScreen;