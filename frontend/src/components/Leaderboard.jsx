import React from 'react';

const Leaderboard = () => {
    const mockScores = [
        { name: 'Player1', score: 100 },
        { name: 'Player2', score: 80 },
        { name: 'Player3', score: 60 },
    ];

    return (
        <div>
            <h1>Leaderboard</h1>
            <ul>
                {mockScores.map((entry, index) => (
                    <li key={index}>
                        {entry.name}: {entry.score} points
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
