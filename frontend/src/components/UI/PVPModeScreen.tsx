import React, { useState, useEffect } from 'react';
import { useLinera } from '../../linera/LineraProvider';

interface PVPModeScreenProps {
  chainId: string;
  onClose: () => void;
  incomingMessage: string;
  incomingType: number;
  onStart: (friendChainId: string) => void;
}

const PVPModeScreen: React.FC<PVPModeScreenProps> = ({ chainId, onClose, incomingMessage, incomingType, onStart }) => {
  const { application } = useLinera();
  const [mode, setMode] = useState<'initial' | 'hosting' | 'joining'>('initial');
  const [friendId, setFriendId] = useState<string>('');
  const [dots, setDots] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [canStart, setCanStart] = useState<boolean>(false);

  useEffect(() => {
    if (mode === 'hosting' || (mode === 'joining' && isJoining)) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setDots('');
    }
  }, [mode, isJoining]);

  // Handle inbound PVP messages for host and join
  useEffect(() => {
    if (mode === 'hosting' && incomingType === 0 && incomingMessage) {
      setFriendId(incomingMessage);
      setCanStart(true);
    }
    if (mode === 'joining' && incomingType === 5) {
      onStart(friendId);
    }
  }, [incomingType, mode, incomingMessage, friendId, onStart]);

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      width: '500px',
      maxWidth: '100%',
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
          margin: '40px 0 64px 0', 
          fontSize: 48, 
          textShadow: '2px 4px 8px #000, 0 2px 0 #222',
      }}>PVP Mode</h1>
      
      <p style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#FFD600',
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        Each zombie you kill will be sent to your opponent, highest score wins!
        Opponent's Zombie word will be in Purple colour.
      </p>

      {mode === 'initial' && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <button onClick={() => setMode('hosting')} style={buttonStyle}>Host</button>
          <button onClick={() => setMode('joining')} style={buttonStyle}>Join</button>
        </div>
      )}

      {mode === 'hosting' && (
        <>
        
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            color: 'white',
            marginBottom: '8px',
          }}>
            {canStart ? 'Friend has joined. Let\'s start!' : 'Share your chain id with your friend:'}
          </div>
          <div style={{
            fontFamily: '"Press Start 2P", monospace',
            color: '#FFD600',
            marginBottom: '16px',
          }}>
            {chainId}
          </div>
          {incomingType === 0 && (
            <div style={{ fontFamily: '"Press Start 2P", monospace', color: 'purple', marginBottom: '12px' }}>
              {incomingMessage}
            </div>
          )}
          
          <button
            onClick={async () => {
              if (!application) return console.error('Linera app not ready');
              try {
                await application.query(
                  JSON.stringify({ query: `mutation { sendMessage(targetChain:"${friendId}", word:"${chainId}", msgType:"5") }` })
                );
              } catch (err) {
                console.error('sendMessage error', err);
              }
              onStart(friendId);
            }}
            style={buttonStyle}
            disabled={!canStart}
          >
            Start Game
          </button>
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
            disabled={isJoining}
          />
          {isJoining ? (
            <>
             {incomingType === 0 && incomingMessage && (
              <div style={{ fontFamily: '"Press Start 2P", monospace', color: 'white', marginBottom: '8px' }}>
                Waiting for Host{dots}
              </div>
            )}
              <button onClick={() => setIsJoining(false)} style={buttonStyle}>Cancel</button>
            </>
          ) : (
            <>
              <button onClick={async () => {
                setIsJoining(true);
                if (!application) {
                  console.error('Linera application not ready');
                  return;
                }
                try {
                  await application.query(
                    JSON.stringify({ query: `mutation { sendMessage(targetChain:"${friendId}", word:"${chainId}", msgType:"0") }` })
                  );
                } catch (err) {
                  console.error('sendMessage error', err);
                }
              }} style={buttonStyle}>Enter</button>
              <button onClick={() => setMode('initial')} style={buttonStyle}>Back</button>
            </>
          )}
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
