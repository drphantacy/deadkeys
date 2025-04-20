import React from 'react';

interface HealthDisplayProps {
    health: number;
}

const HealthDisplay: React.FC<HealthDisplayProps> = ({ health }) => (
    <div style={{ display: 'flex', gap: '5px' }}>
        {Array.from({ length: health }).map((_, index) => (
            <div
                key={index}
                style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'red',
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                }}
            ></div>
        ))}
    </div>
);

export default HealthDisplay;
