import { useEffect } from 'react';

export const useAutoTheme = () => {
    useEffect(() => {
        const checkTheme = () => {
            const hour = new Date().getHours();
            // Light theme between 08:00 and 19:59, Dark otherwise
            const isDaytime = hour >= 8 && hour < 20;

            // Allow manual override via localStorage later, but auto by default
            const manualTheme = localStorage.getItem('arvi-theme');
            if (manualTheme) {
                document.documentElement.setAttribute('data-theme', manualTheme);
            } else {
                document.documentElement.setAttribute('data-theme', isDaytime ? 'light' : 'dark');
            }
        };

        checkTheme();

        // Check periodically if left open
        const interval = setInterval(checkTheme, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, []);
};
