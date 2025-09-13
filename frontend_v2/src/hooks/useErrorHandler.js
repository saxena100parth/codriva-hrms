import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
    const [error, setError] = useState(null);

    const handleError = useCallback((error) => {
        console.error('Error caught by error handler:', error);
        setError(error);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const handleRetry = useCallback((retryFunction) => {
        if (retryFunction && typeof retryFunction === 'function') {
            retryFunction();
        }
        clearError();
    }, [clearError]);

    return {
        error,
        handleError,
        clearError,
        handleRetry
    };
};
