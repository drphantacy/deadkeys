import React from 'react';
import { useLinera } from '../../linera/LineraProvider';

interface StartScreenProps {
    onStart: () => void;
    onHowTo: () => void;
    onViewLeaderboard: () => void;
    onPVP: () => void;
    disabled?: boolean;
    statusText?: string;
    chainId?: string;
    incomingMessage?: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onHowTo, onViewLeaderboard, onPVP, disabled, statusText, chainId, incomingMessage }) => {
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

    const { application } = useLinera();
    const [showWelcome, setShowWelcome] = React.useState<boolean>(() => !localStorage.getItem('seenWelcome'));
    const [testMessage, setTestMessage] = React.useState<string>('');
    const [targetChainInput, setTargetChainInput] = React.useState<string>('');
    const [messageInput, setMessageInput] = React.useState<string>('');
    const [refreshMessage, setRefreshMessage] = React.useState<string>('');

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
            <style>{`
                @keyframes glowPulse {
                    0% { text-shadow: 0 0 5px rgba(222,42,2,0.5); }
                    100% { text-shadow: 0 0 20px rgba(222,42,2,0.8); }
                }
                .start-btn {
                    transition: color 0.5s ease-in-out, border-color 0.5s ease-in-out;
                }
                .start-btn:hover {
                    color: rgb(222,42,2) !important;
                    border-color: rgb(222,42,2) !important;
                    animation: glowPulse 1s infinite alternate;
                }
            `}</style>
            <audio ref={mouseOverRef} src="/sounds/mouse-over.mp3" preload="auto" />
            <audio ref={welcomeAudioRef} src="/sounds/start.mp3" preload="auto" />
            <div className="start-screen" style={{ position: 'relative', fontFamily: '"Press Start 2P", monospace', textAlign: 'center' }}>
                <h1 style={{ 
                    margin: '40px 0 64px 0', 
                    fontSize: 48, 
                    textShadow: '2px 4px 8px #000, 0 2px 0 #222' 
                }}>DeadKeys</h1>
                <button
                    className="start-btn"
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
                        outline: 'none',
                        margin: '10px',
                    }}
                >
                    {statusText || 'Start Game'}
                </button>
                <button
                    className="start-btn"
                    onClick={onPVP}
                    // disabled={disabled}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: '20px',
                        color: 'yellow',
                        background: 'transparent',
                        border: '2px solid yellow',
                        padding: '10px 20px',
                        imageRendering: 'pixelated',
                        outline: 'none',
                        margin: '10px',
                    }}
                >
                    PVP Mode
                </button>
                <div style={{ marginTop: '10px' }}>
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
                    <button
                        disabled={disabled}
                        onClick={async () => {
                            if (!application || !targetChainInput) {
                                setTestMessage('Target chain not set');
                                return;
                            }
                            try {
                                const resp = await application.query(
                                    JSON.stringify({
                                        query: `mutation { sendMessage(targetChain:"${targetChainInput}", word:"${messageInput}", msgType:"send") }`,
                                    })
                                );
                                console.log('sendMessage response:', resp);
                                const parsed = JSON.parse(resp) as any;
                                if (parsed.errors && parsed.errors.length) {
                                    setTestMessage(parsed.errors.map((e: any) => e.message).join(', '));
                                } else if (parsed.data?.sendMessage != null) {
                                    setTestMessage(parsed.data.sendMessage);
                                } else {
                                    setTestMessage('No response from sendMessage');
                                }
                            } catch (err: any) {
                                console.error('sendMessage error', err);
                                setTestMessage(err.message || 'Send error');
                            }
                        }}
                        style={{
                            fontFamily: '"Press Start 2P", monospace',
                            background: 'transparent',
                            border: '2px solid cyan',
                            color: 'cyan',
                            padding: '6px 12px',
                            cursor: 'pointer',
                            imageRendering: 'pixelated',
                            marginLeft: '10px'
                        }}
                    >
                        Test Message
                    </button>
                    <input
                        type="text"
                        value={targetChainInput}
                        onChange={e => setTargetChainInput(e.target.value)}
                        placeholder="Target Chain ID"
                        style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#aaa', background: 'transparent', border: '1px solid #555', padding: '4px', marginLeft: '10px', width: '200px' }}
                    />
                    <input
                        type="text"
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        placeholder="Your message"
                        style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '12px', color: '#aaa', background: 'transparent', border: '1px solid #555', padding: '4px', marginLeft: '10px', width: '200px' }}
                    />
                    {incomingMessage && (
                        <div style={{ marginTop: '8px', color: 'magenta', fontSize: '14px' }}>
                            Incoming: {incomingMessage}
                        </div>
                    )}
                    {testMessage && (
                        <div style={{ marginTop: '8px', color: 'cyan', fontSize: '14px' }}>
                            {testMessage}
                        </div>
                    )}
                    {refreshMessage && (
                        <div style={{ marginTop: '8px', color: 'lime', fontSize: '14px' }}>
                            {refreshMessage}
                        </div>
                    )}
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
