import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartScreen from './components/StartScreen';
import GameCanvas from './components/GameCanvas';
import Leaderboard from './components/Leaderboard';

const App = () => {
    const [gameState, setGameState] = useState('playing'); // 'playing', 'gameOver'
    const [score, setScore] = useState(0);

    const handleGameOver = () => {
        setGameState('gameOver');
    };

    const handleScoreUpdate = (points) => {
        setScore((prev) => prev + points);
    };

    const handleRestart = () => {
        setScore(0);
        setGameState('playing');
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartScreen />} />
                <Route path="/game" element={<GameCanvas onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
        </Router>
    );
};

export default App;
