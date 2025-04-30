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
  const [isStarting, setIsStarting] = useState<boolean>(false);

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
      fontFamily: '"Press Start 2P", monospace',
      textAlign: 'center',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
      <button onClick={onClose} style={{
        position: 'fixed', top: '16px', right: '16px',
        padding: '8px 10px', fontSize: '12.5px',
        fontFamily: '"Press Start 2P", monospace',
        color: 'yellow', background: 'transparent', border: '1px solid yellow',
        outline: 'none', imageRendering: 'pixelated', cursor: 'pointer', zIndex: 1003
      }}>Close</button>
    
      <h1 style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '36px',
        margin: '20px 0',
        textShadow: '2px 4px 8px #000',
      }}>PVP Mode</h1>
      
      <p style={{
        width: '100%',
        textAlign: 'center',
        color: 'white',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        textShadow: '2px 2px 4px #000',
        margin: '20px 0',
      }}>
        Each zombie you kill will be sent to your opponent, highest score wins!
        
      </p>
      <p style={{
        width: '100%',
        textAlign: 'center',
        color: 'white',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        textShadow: '2px 2px 4px #000',
        margin: '0 0 60px',
      }}>Opponent's Zombie word will be in Purple colour.</p>

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
            color: 'yellow',
            marginBottom: '8px',
          }}>
            {canStart ? 'Friend has joined. Let\'s start!' : 'Share your chain id with your friend:'}
          </div>
          <div style={{
              margin: '0 auto 0 auto',
              fontSize: 14,
              color: '#aaa',
              letterSpacing: 1,
              textAlign: 'center',
              opacity: 0.85,
              lineHeight: '1.8',
              wordBreak: 'break-all',
              maxWidth: 600,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 8,
              padding: '14px 20px',
              boxSizing: 'border-box',
          }}>
              {chainId}

              {incomingType === 0 && (
            <div>
              <div style={{
              margin: '10px auto',
              fontSize: 16,
              color: 'yellow',
          }}>
              VS
            </div>

            <div>
              {incomingMessage}
            </div>
              </div>
          )}
          </div>
          
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '26px' }}>
            {canStart && (
              <button
              onClick={async () => {
                setIsStarting(true);
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
              disabled={!canStart || isStarting}
            >
              {isStarting ? `Starting${dots}` : 'Start Game'}
            </button>
            )}
            {!isStarting && (
              <button onClick={() => setMode('initial')} style={buttonStyle}>Back</button>
            )}
          </div>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '26px', alignItems: 'center' }}>
              
                <div style={{ fontFamily: '"Press Start 2P", monospace', color: 'white', opacity: 0.5, marginBottom: '16px' }}>
                  Waiting for Host{dots}
                </div>
             
              <button onClick={() => setIsJoining(false)} style={buttonStyle}>Cancel</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '16px', marginTop: '26px' }}>
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
            </div>
          )}
        </>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  fontFamily: '"Press Start 2P", monospace',
  fontSize: '20px',
  color: 'yellow',
  background: 'transparent',
  border: '2px solid yellow',
  padding: '10px 20px',
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
