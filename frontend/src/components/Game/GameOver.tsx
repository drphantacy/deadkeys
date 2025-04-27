import React from 'react';

interface GameOverProps {
  score: number;
  wpm: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, wpm, onRestart }) => {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: 'url("/images/gameover.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Press Start 2P", monospace',
          color: 'yellow',
          textAlign: 'center',
          zIndex: 4000,
        }}
      >
        <h1 style={{ fontSize: '48px', margin: '20px' }}>Game Over</h1>
        <p style={{ fontSize: '24px', margin: '10px' }}>Score: {score}</p>
        <p style={{ fontSize: '24px', margin: '10px' }}>WPM: {wpm}</p>
        <button
          onClick={onRestart}
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px',
            color: 'yellow',
            background: 'transparent',
            border: '2px solid yellow',
            padding: '10px 20px',
            cursor: 'pointer',
            imageRendering: 'pixelated',
            outline: 'none',
            marginTop: '20px',
          }}
        >
          Try Again
        </button>
      </div>
    </>
  );
};

export default GameOver;
