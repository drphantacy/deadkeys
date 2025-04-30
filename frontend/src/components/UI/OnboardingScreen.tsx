import React, { useState, useEffect, useRef } from 'react';

interface OnboardingScreenProps {
  onStart: () => void;
  disabled?: boolean;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart, disabled }) => {
  const [showNudge, setShowNudge] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const targetWord = 'gmicrochains';
  const completed = inputValue.toLowerCase() === targetWord;
  // Reference to existing audio element for gunshot
  const gunSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowNudge(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const audio = gunSoundRef.current;
    if (audio) {
      audio.addEventListener('canplaythrough', () => console.log('Gunshot audio loaded'));
      audio.addEventListener('error', (e) => console.error('Gunshot audio error', e));
      audio.load();
    }
  }, []);

  // Handle keystroke input and play sound
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const audio = gunSoundRef.current;
    if (audio) {
      console.log('OnboardingScreen: playing gunshot');
      audio.currentTime = 0;
      void audio.play().catch((err) => console.error('Gunshot play failed', err));
    }
  };

  // Compute matched prefix length for health bar deduction
  const matchedLength = (() => {
    let m = 0;
    for (let i = 0; i < inputValue.length && i < targetWord.length; i++) {
      if (inputValue[i].toLowerCase() === targetWord[i]) m++;
      else break;
    }
    return m;
  })();

  return (
    <div
      className="onboarding-screen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '"Press Start 2P", monospace',
        textAlign: 'center',
      }}
    >
      <style>
        {`
          .onboarding-screen input::placeholder {
            color: rgba(0,0,0,0.3);
          }
        `}
      </style>
      <h1 style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '36px',
        margin: '20px 0',
        textShadow: '2px 4px 8px #000'
      }}>How to Play</h1>
      <ul style={{
        textAlign: 'left',
        maxWidth: 600,
        fontWeight: 300,
        lineHeight: 2,
        fontSize: '14px',
      }}>
        <li>Type the word at each zombie to eliminate it.</li>
        <li>Faster typing == higher score.</li>
        <li>You have 3 lives. Zombies reaching your base cost you a life.</li>
      </ul>
      <p style={{
        width: '100%',
        textAlign: 'center',
        color: 'yellow',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        textShadow: '2px 2px 4px #000',
        margin: '20px 0'
      }}>
        Try typing below!
      </p>
      <div
        className="demo-zombie"
        style={{
          margin: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Health bar */}
        <div style={{
          width: '100px', height: '12px', backgroundColor: 'red',
          borderRadius: '4px', marginBottom: '8px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${((targetWord.length - matchedLength) / targetWord.length) * 100}%`,
            height: '100%', backgroundColor: 'green', transition: 'width 0.2s',
          }} />
        </div>
        <div style={{ fontSize: '48px' }}>🧟‍♂️</div>
        <div style={{
          fontFamily: 'monospace',
          fontSize: '16px',
          backgroundColor: '#000',
          color: '#0f0',
          border: '2px solid #0f0',
          padding: '2px 6px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}>
          {targetWord}
        </div>
      </div>
      {/* Audio and input or Start button */}
      { !completed ? (
        <>
          <audio ref={gunSoundRef} src="/sounds/gunshot.mp3" preload="auto" />
          <input
            type="text"
            placeholder={targetWord}
            value={inputValue}
            autoFocus
            onChange={handleInputChange}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '24px',
              padding: '12px',
              background: 'rgba(0,0,0,0.6)',
              borderWidth: '3px',
              borderStyle: 'solid',
              borderColor: 'yellow #FFD600 #FFEA00 #FFFF00',
              color: 'yellow',
              textAlign: 'center',
              imageRendering: 'pixelated',
              outline: 'none',
              width: '40vw',
              maxWidth: '350px',
            }}
          />
        </>
      ) : (
        <button
          onClick={onStart}
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px',
            padding: '10px 20px',
            color: 'yellow',
            background: 'transparent',
            border: '2px solid yellow',
            cursor: 'pointer',
            opacity: 1,
            marginTop: '10px',
            imageRendering: 'pixelated',
            outline: 'none',
          }}
        >
          Let's Go!
        </button>
      )}
    </div>
  );
};

export default OnboardingScreen;
