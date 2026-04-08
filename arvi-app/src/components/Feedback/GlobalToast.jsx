import { useEffect, useState } from 'react';
import './GlobalToast.css';

export const GlobalToast = () => {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        let timerId;

        const handleToast = (event) => {
            const detail = event.detail || {};
            const nextToast = {
                id: Date.now(),
                type: detail.type || 'info',
                message: detail.message || 'Operacion completada.'
            };

            setToast(nextToast);

            if (timerId) {
                window.clearTimeout(timerId);
            }

            timerId = window.setTimeout(() => {
                setToast(null);
            }, 4200);
        };

        window.addEventListener('arvi:toast', handleToast);

        return () => {
            if (timerId) {
                window.clearTimeout(timerId);
            }
            window.removeEventListener('arvi:toast', handleToast);
        };
    }, []);

    if (!toast) {
        return null;
    }

    return (
        <div className={`global-toast global-toast--${toast.type}`} role="status" aria-live="polite">
            {toast.message}
        </div>
    );
};
