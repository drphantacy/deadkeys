import React, { useState, useEffect } from 'react';

interface PVPModeScreenProps {
  chainId: string;
  onClose: () => void;
}

const PVPModeScreen: React.FC<PVPModeScreenProps> = ({ chainId, onClose }) => {
  const [mode, setMode] = useState<'initial' | 'hosting' | 'joining'>('initial');
  const [friendId, setFriendId] = useState<string>('');
  const [dots, setDots] = useState<string>('');

  useEffect(() => {
    if (mode === 'hosting') {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [mode]);

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      width: '400px',
      maxWidth: '90%',
      background: 'transparent',
      borderRadius: '8px',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: '16px', right: '16px',
        padding: '8px 10px', fontSize: '12.5px',
        fontFamily: '"Press Start 2P", monospace',
        color: 'yellow', background: 'transparent', border: '1px solid yellow',
        outline: 'none', imageRendering: 'pixelated', cursor: 'pointer', zIndex: 1003
      }}>Close</button>
      <h1 style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '32px',
        color: 'yellow',
        marginBottom: '16px',
      }}>PVP Mode</h1>
      <p style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#FFD600',
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        Each zombie you kill will be sent to your opponent, highest score wins!
      </p>

      {mode === 'initial' && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <button onClick={() => setMode('hosting')} style={buttonStyle}>Host</button>
          <button onClick={() => setMode('joining')} style={buttonStyle}>Join</button>
        </div>
      )}

      {mode === 'hosting' && (
        <>
          <div style={{ fontFamily: '"Press Start 2P", monospace', color: 'white', marginBottom: '8px' }}>
            Waiting{dots}
          </div>
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            color: 'white',
            marginBottom: '8px',
          }}>
            Share your chain id with your friend:
          </div>
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            color: '#FFD600',
            marginBottom: '16px',
          }}>
            {chainId}
          </div>
          <button onClick={() => setMode('initial')} style={buttonStyle}>Back</button>
        </>
      )}

      {mode === 'joining' && (
        <>
          <input
            type="text"
            placeholder="Friend's chain id"
            value={friendId}
            onChange={e => setFriendId(e.target.value)}
            style={inputStyle}
          />
          <button onClick={() => { /* join logic */ }} style={buttonStyle}>Enter</button>
          <button onClick={() => setMode('initial')} style={buttonStyle}>Back</button>
        </>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '16px',
  color: 'yellow',
  background: 'transparent',
  border: '2px solid yellow',
  padding: '8px 16px',
  cursor: 'pointer',
  imageRendering: 'pixelated',
  outline: 'none',
};

const inputStyle: React.CSSProperties = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '16px',
  padding: '8px',
  background: 'rgba(0,0,0,0.6)',
  border: '2px solid yellow',
  color: 'yellow',
  textAlign: 'center',
  imageRendering: 'pixelated',
  outline: 'none',
  width: '100%',
  marginBottom: '8px',
};

export default PVPModeScreen;
