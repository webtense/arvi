export const emitToast = ({ type = 'info', message = 'Operacion completada.' } = {}) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent('arvi:toast', {
        detail: { type, message }
    }));
};
