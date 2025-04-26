import React from 'react';

interface Zombie {
    id: number;
    word: string;
    position: number; // Vertical position of the zombie
    left: number; // Horizontal position of the zombie
    health: number;
}

interface ZombieProps {
    zombie: Zombie;
}

const Zombie: React.FC<ZombieProps> = ({ zombie }) => (
    <div
        style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            position: 'absolute',
            top: `${zombie.position}px`,
            left: `${zombie.left}%`,
            width: '30px',
            height: '30px',
            backgroundColor: 'purple',
            borderRadius: '50%',
            textAlign: 'center',
            color: 'white',
            lineHeight: '30px',
        }}
        onCopy={e => e.preventDefault()}
        onCut={e => e.preventDefault()}
        onContextMenu={e => e.preventDefault()}
    >
        {zombie.word}
        <div
            style={{
                position: 'absolute',
                top: '-10px',
                left: '0',
                width: '100%',
                height: '5px',
                backgroundColor: 'gray',
            }}
        >
            <div
                style={{
                    width: `${zombie.health}%`,
                    height: '100%',
                    backgroundColor: 'green',
                }}
            ></div>
        </div>
    </div>
);

export default Zombie;
