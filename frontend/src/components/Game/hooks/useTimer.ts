import { useState, useEffect } from 'react';

const useTimer = (initialTime: number, onGameOver: () => void) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onGameOver]);

    return { timeLeft };
};

export default useTimer;
