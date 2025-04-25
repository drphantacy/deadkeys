// ...existing code for Leaderboard...
const Leaderboard: React.FC<{ scores: { name: string; points: number }[] }> = ({ scores }) => {
    // ...existing code...
    const sortedScores = [...scores].sort((a, b) => b.points - a.points).slice(0, 10);
    return (
      <>
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}
        </style>
        <div style={{ fontFamily: "'Press Start 2P', cursive", color: '#fff' }}>
          <h1 style={{ textShadow: '2px 2px #000', textAlign: 'center' }}>Leaderboard</h1>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {sortedScores.map((entry, index) => {
              const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
              const color = colors[index] || '#fff';
              return (
                <li
                  key={index}
                  style={{
                    color,
                    fontSize: '14px',
                    margin: '4px 0',
                    padding: '4px',
                    backgroundColor: index < 3 ? 'rgba(0,0,0,0.5)' : 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  {index + 1}. {entry.name} – {entry.points}
                </li>
              );
            })}
          </ul>
        </div>
      </>
    );
};

export default Leaderboard; // Add default export

export {}; // Ensure this file is treated as a module
