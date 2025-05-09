import React from 'react';

interface LeaderboardEntry {
    name: string;
    points: number;
}

interface LeaderboardProps {
    scores: LeaderboardEntry[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores }) => {
    return (
        <div>
            <h1>Leaderboard</h1>
            <ul>
                {scores.map((entry, index) => (
                    <li key={index}>
                        {entry.name}: {entry.points} points
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;