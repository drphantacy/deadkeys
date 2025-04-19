// ...existing code for Leaderboard...
const Leaderboard: React.FC<{ scores: { name: string; points: number }[] }> = ({ scores }) => {
    // ...existing code...
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

export default Leaderboard; // Add default export

export {}; // Ensure this file is treated as a module
