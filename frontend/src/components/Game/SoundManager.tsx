import React, { useEffect, useRef } from 'react';

interface SoundManagerProps {
  gameState: 'start' | 'playing' | 'gameOver' | 'leaderboard';
}

const SoundManager: React.FC<SoundManagerProps> = ({ gameState }) => {
  const startRef = useRef<HTMLAudioElement>(null);
  const inGameRef = useRef<HTMLAudioElement>(null);
  const endRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Pause all sounds first
    [startRef, inGameRef, endRef].forEach(ref => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });

    if (gameState === 'start') {
      startRef.current?.play();
      if (startRef.current) startRef.current.loop = true;
    } else if (gameState === 'playing') {
      inGameRef.current?.play();
      if (inGameRef.current) inGameRef.current.loop = true;
    } else if (gameState === 'gameOver') {
      endRef.current?.play();
      if (endRef.current) endRef.current.loop = true;
    }
  }, [gameState]);

  return (
    <>
      <audio ref={startRef} src="/sounds/start.mp3" preload="auto" />
      <audio ref={inGameRef} src="/sounds/in-game.mp3" preload="auto" />
      {/* moan sound removed */}
      <audio ref={endRef} src="/sounds/end.mp3" preload="auto" />
    </>
  );
};

export default SoundManager;
