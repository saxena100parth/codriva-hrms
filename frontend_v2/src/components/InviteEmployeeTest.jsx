import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import userService from '../services/userService';
import ErrorHandler from './ErrorHandler';

const InviteEmployeeTest = () => {
    const { isAdmin, isHR } = useAuth();
    const { error: globalError, handleError, clearError } = useErrorHandler();
    const [testResults, setTestResults] = useState([]);

    const testInviteEmployee = async () => {
        const testData = {
            name: 'Test Employee',
            personal_email: 'test.employee@example.com',
            phone_number: '+1234567890',
            department: 'TECH',
            job_title: 'Software Developer',
            reporting_manager: 'John Doe',
            invite_expiry_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        try {
            clearError();
            setTestResults(prev => [...prev, { type: 'info', message: 'Sending test invitation...' }]);

            const result = await userService.inviteEmployee(testData);

            setTestResults(prev => [...prev, {
                type: 'success',
                message: `Invitation sent successfully! User ID: ${result.user?._id || 'N/A'}`
            }]);
        } catch (error) {
            console.error('Test invite failed:', error);
            handleError(error);
            setTestResults(prev => [...prev, {
                type: 'error',
                message: `Invitation failed: ${error.message}`
            }]);
        }
    };

    const clearResults = () => {
        setTestResults([]);
        clearError();
    };

    if (!isAdmin && !isHR) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
                <p className="text-red-600">You need HR or Admin permissions to test the invite functionality.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Invite Employee Test</h2>
                <div className="space-x-3">
                    <button
                        onClick={testInviteEmployee}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Test Invite
                    </button>
                    <button
                        onClick={clearResults}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Clear Results
                    </button>
                </div>
            </div>

            {/* Global Error Handler */}
            <ErrorHandler
                error={globalError}
                onClose={clearError}
            />

            {/* Test Results */}
            {testResults.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Test Results</h3>
                    <div className="space-y-2">
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${result.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : result.type === 'error'
                                            ? 'bg-red-50 text-red-800 border border-red-200'
                                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 ${result.type === 'success'
                                            ? 'bg-green-500'
                                            : result.type === 'error'
                                                ? 'bg-red-500'
                                                : 'bg-blue-500'
                                        }`}></div>
                                    <span className="text-sm font-medium">{result.message}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Test Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Test Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Test Data:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Name: Test Employee</li>
                        <li>Email: test.employee@example.com</li>
                        <li>Phone: +1234567890</li>
                        <li>Department: Technology</li>
                        <li>Job Title: Software Developer</li>
                        <li>Expiry: 7 days from now</li>
                    </ul>
                    <p className="mt-2"><strong>Note:</strong> This will create a test user in the database. You can delete it later from the People page.</p>
                </div>
            </div>
        </div>
    );
};

export default InviteEmployeeTest;
