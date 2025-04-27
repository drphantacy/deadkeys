import React from 'react';

interface StartScreenProps {
    onStart: () => void;
    onHowTo: () => void;
    onViewLeaderboard: () => void;
    disabled?: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onHowTo, onViewLeaderboard, disabled }) => {
    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
            <div className="start-screen" style={{ position: 'relative', fontFamily: '"Press Start 2P", monospace', textAlign: 'center' }}>
                <h1 style={{ margin: '40px 0' }}>Welcome to DeadKeys</h1>
                <button
                    onClick={onStart}
                    disabled={disabled}
                    style={{
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '20px',
                        color: 'yellow',
                        background: 'transparent',
                        border: '2px solid yellow',
                        padding: '10px 20px',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        imageRendering: 'pixelated',
                        outline: 'none'
                    }}
                >
                    Start Game
                </button>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={onHowTo} style={{
                        fontFamily: '"Press Start 2P", monospace',
                        background: 'transparent',
                        border: 'none',
                        color: 'yellow',
                        textDecoration: 'underline',
                        fontSize: '14px',
                        cursor: 'pointer',
                        imageRendering: 'pixelated'
                    }}>
                        How to Play
                    </button>
                </div>
            </div>
        </>
    );
};

export default StartScreen;
