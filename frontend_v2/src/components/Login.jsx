import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import ErrorHandler from './ErrorHandler';

const Login = ({ onClose, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { login, error, clearError, isAuthenticated, needsPasswordReset } = useAuth();
    const { error: globalError, handleError, clearError: clearGlobalError } = useErrorHandler();
    const navigate = useNavigate();

    // Close modal when user becomes authenticated
    useEffect(() => {
        if (isAuthenticated) {
            onClose();
            if (needsPasswordReset) {
                // Don't navigate, let App component handle password reset flow
                return;
            }
            navigate('/dashboard');
        }
    }, [isAuthenticated, needsPasswordReset, onClose, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearError(); // Clear any existing errors
        clearGlobalError(); // Clear global errors

        try {
            const response = await login(formData.email, formData.password);
            // Close modal and navigate to dashboard on successful login
            onClose();
            // Navigation will be handled by useEffect based on needsPasswordReset flag
        } catch (error) {
            console.error('Login failed:', error);
            // Handle error with the global error handler
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Global Error Handler */}
            <ErrorHandler
                error={globalError}
                onClose={clearGlobalError}
                onRetry={() => handleSubmit({ preventDefault: () => { } })}
            />

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Login to HRMS</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                onClick={onSwitchToRegister}
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Register here
                            </button>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => {/* Handle forgot password */ }}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            Forgot your password?
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;