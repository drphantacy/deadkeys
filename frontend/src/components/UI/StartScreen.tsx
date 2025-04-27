import React from 'react';

interface StartScreenProps {
    onStart: () => void;
    onHowTo: () => void;
    onViewLeaderboard: () => void;
    disabled?: boolean;
}

interface StartScreenProps {
    onStart: () => void;
    onHowTo: () => void;
    onViewLeaderboard: () => void;
    disabled?: boolean;
    statusText?: string;
    chainId?: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onHowTo, onViewLeaderboard, disabled, statusText, chainId }) => {
    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
            <div className="start-screen" style={{ position: 'relative', fontFamily: '"Press Start 2P", monospace', textAlign: 'center' }}>
                <h1 style={{ 
                    margin: '40px 0 64px 0', 
                    fontSize: 48, 
                    textShadow: '2px 4px 8px #000, 0 2px 0 #222' 
                }}>DeadKeys</h1>
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
                    {statusText || 'Start Game'}
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
                    {chainId && (
                        <div style={{
                            margin: '40px auto 0 auto',
                            fontSize: 12,
                            color: '#aaa',
                            letterSpacing: 1,
                            textAlign: 'center',
                            opacity: 0.85,
                            lineHeight: '1.8',
                            wordBreak: 'break-all',
                            maxWidth: 500,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.13)',
                            borderRadius: 8,
                            padding: '14px 20px',
                            boxSizing: 'border-box',
                        }}>
                            Chain ID: {chainId}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StartScreen;
