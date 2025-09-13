import React from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { ApiError } from '../utils/errorHandler';
import InviteEmployeeTest from './InviteEmployeeTest';

const ErrorTest = () => {
    const { handleError, clearError } = useErrorHandler();

    const testErrors = [
        {
            name: 'Authentication Error (401)',
            error: new ApiError('Invalid credentials', 401, 'AUTH_ERROR')
        },
        {
            name: 'Permission Error (403)',
            error: new ApiError('Insufficient permissions to manage users', 403, 'PERMISSION_ERROR')
        },
        {
            name: 'Validation Error (400)',
            error: new ApiError('Please provide a valid email address', 400, 'VALIDATION_ERROR')
        },
        {
            name: 'Not Found Error (404)',
            error: new ApiError('User not found', 404, 'NOT_FOUND_ERROR')
        },
        {
            name: 'Rate Limit Error (429)',
            error: new ApiError('Too many requests, please try again later', 429, 'RATE_LIMIT_ERROR')
        },
        {
            name: 'Server Error (500)',
            error: new ApiError('Internal server error', 500, 'SERVER_ERROR')
        },
        {
            name: 'Network Error',
            error: new ApiError('Network Error', 0, 'NETWORK_ERROR')
        }
    ];

    const handleTestError = (error) => {
        handleError(error);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Error Handling Test</h1>
                <p className="mb-6 text-gray-600">
                    Click the buttons below to test different error scenarios and see how they are handled.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testErrors.map((test, index) => (
                        <button
                            key={index}
                            onClick={() => handleTestError(test.error)}
                            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
                        >
                            <h3 className="font-medium text-gray-900 mb-2">{test.name}</h3>
                            <p className="text-sm text-gray-600">Status: {test.error.statusCode}</p>
                            <p className="text-sm text-gray-500">Type: {test.error.type}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8">
                    <button
                        onClick={clearError}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Clear All Errors
                    </button>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">Test Instructions:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Click any error button to trigger that error type</li>
                        <li>• Notice how different errors show different colors and messages</li>
                        <li>• Some errors will show retry buttons</li>
                        <li>• Auth errors will trigger logout behavior</li>
                        <li>• Errors auto-dismiss after 5 seconds (except critical ones)</li>
                    </ul>
                </div>

                {/* Invite Employee Test */}
                <div className="mt-8">
                    <InviteEmployeeTest />
                </div>
            </div>
        </div>
    );
};

export default ErrorTest;
