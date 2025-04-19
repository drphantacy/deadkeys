// ...existing code for GameOver...
const GameOver: React.FC<{ score: number; onRestart: () => void }> = ({ score, onRestart }) => {
    // ...existing code...
    return (
        <div>
            <h1>Game Over</h1>
            <p>Your Score: {score}</p>
            <button onClick={onRestart}>Restart</button>
        </div>
    );
};

export default GameOver; // Add default export

export {}; // Ensure this file is treated as a module
