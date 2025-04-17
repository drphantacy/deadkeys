import { useEffect, useState } from 'react';
import { fetchPlayerState, submitScore } from '../utils/api';

interface PlayerState {
    highScore: number;
    totalGames: number;
}

const usePlayerState = (playerId: string) => {
    const [playerState, setPlayerState] = useState<PlayerState | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadPlayerState = async () => {
            try {
                const state = await fetchPlayerState(playerId);
                setPlayerState(state);
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadPlayerState();
    }, [playerId]);

    const savePlayerState = async (newState: PlayerState) => {
        setLoading(true);
        try {
            const updatedHighScore = await submitScore(playerId, newState.highScore); // Pass only the score
            setPlayerState({
                highScore: updatedHighScore,
                totalGames: playerState?.totalGames || 0, // Ensure totalGames is defined
            });
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { playerState, loading, error, savePlayerState };
};

export default usePlayerState;