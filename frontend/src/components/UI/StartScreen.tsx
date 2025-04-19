import React from 'react';

interface StartScreenProps {
    onStart: () => void;
    onViewLeaderboard: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onViewLeaderboard }) => {
    return (
        <div className="start-screen">
            <h1>Welcome to DeadKeys</h1>
            <button onClick={onStart}>Start Game</button> {/* Calls onStart */}
            <button onClick={onViewLeaderboard} style={{ marginTop: '10px' }}>
                View Leaderboard
            </button>
        </div>
    );
};

export default StartScreen;
