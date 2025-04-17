import axios from 'axios';

const API_BASE_URL = 'https://your-linera-backend-url.com/api';

export const fetchPlayerState = async (playerId: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/player/${playerId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch player state:', error);
        throw new Error('Failed to fetch player state');
    }
};

export const submitScore = async (playerId: string, score: number) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/player/${playerId}/score`, { score });
        return response.data;
    } catch (error) {
        console.error('Failed to submit score:', error);
        throw new Error('Failed to submit score');
    }
};

export const fetchLeaderboard = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/leaderboard`);
        return response.data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
    }
};