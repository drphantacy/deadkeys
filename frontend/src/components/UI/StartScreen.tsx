import React from 'react';

interface StartScreenProps {
    onStart: () => void;
    onHowTo: () => void;
    onViewLeaderboard: () => void;
    disabled?: boolean;
    statusText?: string;
    chainId?: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onHowTo, onViewLeaderboard, disabled, statusText, chainId }) => {
    const mouseOverRef = React.useRef<HTMLAudioElement>(null);
    const welcomeAudioRef = React.useRef<HTMLAudioElement>(null);

    const handleMouseEnter = () => {
        const audio = mouseOverRef.current;
        if (audio) {
            audio.currentTime = 0;
            audio.play();
        }
    };
    const handleMouseLeave = () => {
        const audio = mouseOverRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    const [showWelcome, setShowWelcome] = React.useState<boolean>(() => !localStorage.getItem('seenWelcome'));

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
            <audio ref={mouseOverRef} src="/sounds/mouse-over.mp3" preload="auto" />
            <audio ref={welcomeAudioRef} src="/sounds/start.mp3" preload="auto" />
            <div className="start-screen" style={{ position: 'relative', fontFamily: '"Press Start 2P", monospace', textAlign: 'center' }}>
                <h1 style={{ 
                    margin: '40px 0 64px 0', 
                    fontSize: 48, 
                    textShadow: '2px 4px 8px #000, 0 2px 0 #222' 
                }}>DeadKeys</h1>
                <button
                    onClick={onStart}
                    disabled={disabled}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
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
            {showWelcome && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '550px',
                        height: '400px',
                        backgroundImage: 'url("/images/gameover.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        padding: '20px',
                        borderRadius: '8px',
                        color: '#fff',
                        textAlign: 'center',
                        fontFamily: '"Press Start 2P", monospace',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        lineHeight: '1.5',
                    }}>
                        <h1 style={{ margin: '0 0 10px', fontSize: '24px', color: 'yellow' }}>DeadKeys</h1>
                        <p style={{ margin: '0 0 8px', fontSize: '16px', lineHeight: '1.4' }}>
                            The On-Chain Zombie Apocalypse Starts Now.
                        </p>
                        <p style={{ margin: '0 0 16px', fontSize: '16px', lineHeight: '1.4' }}>
                            Are you ready?
                        </p>
                        <button
                            onClick={() => {
                                welcomeAudioRef.current?.play();
                                localStorage.setItem('seenWelcome', 'true');
                                setShowWelcome(false);
                            }}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            disabled={false}
                            style={{
                                fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: 'yellow',
                                background: 'transparent', border: '2px solid yellow', padding: '10px 20px',
                                cursor: 'pointer',
                                marginTop: '20px'
                            }}
                        >
                            Let's Go
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default StartScreen;
