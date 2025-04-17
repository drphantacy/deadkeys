import React from 'react';
import usePlayerState from '../hooks/usePlayerState';

const PlayerState: React.FC = () => {
    const { playerState, loading, error } = usePlayerState('playerId'); // Pass a valid playerId

    if (loading) return <div>Loading...</div>;
    if (error) {
        return (
            <div className="player-state">
                <h2>Error</h2>
                <p>Failed to load player state. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="player-state">
            <h2>Player State</h2>
            <p>High Score: {playerState?.highScore || 0}</p>
            <p>Total Games: {playerState?.totalGames || 0}</p>
        </div>
    );
};

export default PlayerState;