import React from 'react';

const Leaderboard = ({ scores }) => {
    return (
        <div>
            <h2>Leaderboard</h2>
            <ul>
                {scores.map((score, index) => (
                    <li key={index}>
                        {index + 1}. {score.name}: {score.points}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
