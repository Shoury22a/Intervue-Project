import { useEffect, useState } from 'react';

export function usePollTimer(timeRemaining: number, onExpire?: () => void) {
    const [secondsLeft, setSecondsLeft] = useState(timeRemaining);

    useEffect(() => {
        setSecondsLeft(timeRemaining);
    }, [timeRemaining]);

    useEffect(() => {
        if (secondsLeft <= 0) {
            onExpire?.();
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onExpire?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft, onExpire]);

    const minutes = Math.floor(secondsLeft / 60)
        .toString()
        .padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');

    return { secondsLeft, formatted: `${minutes}:${seconds}` };
}
