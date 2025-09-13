import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ErrorHandler = ({ error, onClose, onRetry }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (error) {
            setIsVisible(true);
            // Auto-hide after 5 seconds for non-critical errors
            if (!error.shouldLogout && !error.shouldRetry) {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                    onClose?.();
                }, 5000);
                return () => clearTimeout(timer);
            }
        } else {
            setIsVisible(false);
        }
    }, [error, onClose]);

    if (!error || !isVisible) return null;

    const getErrorIcon = () => {
        switch (error.type) {
            case 'AUTH_ERROR':
            case 'PERMISSION_ERROR':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
            case 'VALIDATION_ERROR':
                return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
            case 'NETWORK_ERROR':
            case 'SERVER_ERROR':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
        }
    };

    const getErrorColor = () => {
        switch (error.type) {
            case 'AUTH_ERROR':
            case 'PERMISSION_ERROR':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'VALIDATION_ERROR':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'NETWORK_ERROR':
            case 'SERVER_ERROR':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-red-50 border-red-200 text-red-800';
        }
    };

    const getErrorTitle = () => {
        if (error.userMessage?.title) {
            return error.userMessage.title;
        }

        switch (error.type) {
            case 'AUTH_ERROR':
                return 'Authentication Error';
            case 'PERMISSION_ERROR':
                return 'Access Denied';
            case 'VALIDATION_ERROR':
                return 'Validation Error';
            case 'NETWORK_ERROR':
                return 'Connection Error';
            case 'SERVER_ERROR':
                return 'Server Error';
            default:
                return 'Error';
        }
    };

    const getErrorMessage = () => {
        if (error.userMessage?.message) {
            return error.userMessage.message;
        }
        return error.message || 'An unexpected error occurred';
    };

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md">
            <div className={`rounded-lg border p-4 shadow-lg ${getErrorColor()}`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {getErrorIcon()}
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium">
                            {getErrorTitle()}
                        </h3>
                        <div className="mt-1 text-sm">
                            {getErrorMessage()}
                        </div>

                        {/* Show retry button for retryable errors */}
                        {error.shouldRetry && onRetry && (
                            <div className="mt-3">
                                <button
                                    onClick={() => {
                                        onRetry();
                                        onClose?.();
                                    }}
                                    className="text-sm font-medium underline hover:no-underline"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Show logout message for auth errors */}
                        {error.shouldLogout && (
                            <div className="mt-2 text-xs">
                                You will be redirected to the login page.
                            </div>
                        )}
                    </div>

                    {/* Close button */}
                    {!error.shouldLogout && (
                        <div className="ml-4 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setIsVisible(false);
                                    onClose?.();
                                }}
                                className="inline-flex text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorHandler;
