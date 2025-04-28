import React, { useEffect, useState } from 'react';
import { Enemy } from './types';

interface ZombieProps {
    zombie: Enemy;
    isAttacked: boolean;
}

const FRAME_COUNT = 6;
const SPRITE_COLS = 3;
const SPRITE_ROWS = 2;
const SPRITE_WIDTH = 1024;
const SPRITE_HEIGHT = 1024;
const ZOMBIE_WIDTH = SPRITE_WIDTH / SPRITE_COLS; // = 341.33px (round to 341 or 342)
const ZOMBIE_HEIGHT = SPRITE_HEIGHT / SPRITE_ROWS; // = 512px
const DISPLAY_WIDTH = Math.round(128/3);
const DISPLAY_HEIGHT = Math.round(192/3); // Box is 3x smaller

const Zombie: React.FC<ZombieProps> = ({ zombie, isAttacked }) => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setFrame((prev) => (prev + 1) % FRAME_COUNT);
        }, 120); // ~8fps
        return () => clearInterval(interval);
    }, []);

    // Calculate sprite position
    const col = frame % SPRITE_COLS;
    const row = Math.floor(frame / SPRITE_COLS);
    const bgX = -col * (SPRITE_WIDTH / SPRITE_COLS);
    const bgY = -row * (SPRITE_HEIGHT / SPRITE_ROWS);

    return (
        <div
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                position: 'absolute',
                top: zombie.position,
                left: `${zombie.left}%`,
                width: DISPLAY_WIDTH,
                height: DISPLAY_HEIGHT + 30, // room for word
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none',
                background: 'none',
                border: 'none',
                boxSizing: 'border-box',
                overflow: 'visible',
            }}
        >
           
        {/* Health bar below feet (only if attacked) */}
        {isAttacked && (
            <div
                style={{
                    position: 'absolute',
                    top: -14,
                    width: DISPLAY_WIDTH,
                    height: 8,
                    background: '#444',
                    borderRadius: 3,
                    marginTop: 12,
                }}
            >
                <div
                    style={{
                        width: `${zombie.health}%`,
                        height: '100%',
                        background: 'limegreen',
                        borderRadius: 3,
                        transition: 'width 0.2s',
                    }}
                />
            </div>
        )}
            {/* Zombie sprite */}
            <div
                style={{
                    width: DISPLAY_WIDTH,
                    height: DISPLAY_HEIGHT,
                    position: 'relative',
                    marginBottom: 2,
                    overflow: 'visible',
                }}
            >
                {zombie.type === 'zombie' && (
                    <div
                        style={{
                            width: ZOMBIE_WIDTH,
                            height: ZOMBIE_HEIGHT,
                            backgroundImage: 'url(/images/zombie.png)',
                            backgroundPosition: `${bgX}px ${bgY}px`,
                            backgroundSize: `${SPRITE_WIDTH}px ${SPRITE_HEIGHT}px`,
                            imageRendering: 'pixelated',
                            transform: 'scale(0.15, 0.15)',
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            transformOrigin: 'top center',
                            translate: '-50%',
                            pointerEvents: 'none',
                        }}
                    />
                )}
                {zombie.type === 'mummy' && (
                    <div
                        style={{
                            width: ZOMBIE_WIDTH,
                            height: ZOMBIE_HEIGHT,
                            backgroundImage: 'url(/images/mummy.png)',
                            backgroundPosition: `${bgX}px ${bgY}px`,
                            backgroundSize: `${SPRITE_WIDTH}px ${SPRITE_HEIGHT}px`,
                            imageRendering: 'pixelated',
                            transform: 'scale(0.16, 0.16)',
                            position: 'absolute',
                            left: '50%',
                            top: -10,
                            transformOrigin: 'top center',
                            translate: '-50%',
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </div>
            {/* Word label further below feet */}
            {(() => {
                const isTwoLine = zombie.word.includes(' ') || zombie.word.length > 9;
                return (
                    <div
                        style={{
                            fontFamily: 'monospace',
                            fontSize: 14,
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            border: '2px solid #222',
                            borderRadius: 4,
                            padding: '2px 8px',
                            marginBottom: isTwoLine ? -30 : -4,
                            textAlign: 'center',
                            pointerEvents: 'auto',
                            minWidth: 36,
                            lineHeight: 1.2,
                        }}
                    >
                        {zombie.word}
                    </div>
                );
            })()}

        </div>
    );
};

export default Zombie;
