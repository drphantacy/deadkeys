import React from 'react';

interface StartScreenProps {
    onStart: () => void;
    onHowTo: () => void;
    onViewLeaderboard: () => void;
    disabled?: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onHowTo, onViewLeaderboard, disabled }) => {
    return (
        <div className="start-screen" style={{ position: 'relative', fontFamily: 'monospace', textAlign: 'center' }}>
            <button onClick={onHowTo} style={{ position: 'absolute', top: 10, right: 10, fontSize: '12px', cursor: 'pointer' }}>
                How to Play
            </button>
            <h1 style={{ margin: '40px 0' }}>Welcome to DeadKeys</h1>
            <button
                onClick={onStart}
                disabled={disabled}
                style={{ fontSize: '20px', padding: '10px 20px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
            >
                Start Game
            </button>
            <div style={{ marginTop: '20px' }}>
                <button onClick={onViewLeaderboard} style={{ fontSize: '14px', cursor: 'pointer' }}>
                    View Leaderboard
                </button>
            </div>
        </div>
    );
};

export default StartScreen;
