import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import ErrorHandler from './ErrorHandler';
import {
    UserIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, error, clearError, isAuthenticated, needsPasswordReset } = useAuth();
    const { error: globalError, handleError, clearError: clearGlobalError } = useErrorHandler();
    const navigate = useNavigate();

    // Navigate when user becomes authenticated
    useEffect(() => {
        if (isAuthenticated) {
            if (needsPasswordReset) {
                navigate('/password-reset');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, needsPasswordReset, navigate]);

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
        clearError();
        clearGlobalError();

        try {
            await login(formData.email, formData.password);
            // Navigation will be handled by useEffect
        } catch (error) {
            console.error('Login failed:', error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: UserGroupIcon,
            title: 'Employee Management',
            description: 'Complete employee lifecycle management from onboarding to offboarding'
        },
        {
            icon: ClockIcon,
            title: 'Leave Management',
            description: 'Streamlined leave requests, approvals, and attendance tracking'
        },
        {
            icon: ChartBarIcon,
            title: 'Analytics & Reports',
            description: 'Comprehensive HR analytics and reporting for data-driven decisions'
        },
        {
            icon: ShieldCheckIcon,
            title: 'Secure & Compliant',
            description: 'Enterprise-grade security with compliance management features'
        }
    ];

    return (
        <>
            {/* Global Error Handler */}
            <ErrorHandler
                error={globalError}
                onClose={clearGlobalError}
                onRetry={() => handleSubmit({ preventDefault: () => { } })}
            />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="flex min-h-screen">
                    {/* Left Side - Login Form */}
                    <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
                        <div className="mx-auto w-full max-w-sm lg:w-96">
                            {/* Logo and Title */}
                            <div className="text-center mb-8">
                                <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                                    <BuildingOfficeIcon className="h-8 w-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">HRMS Portal</h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    Access your HR management system
                                </p>
                            </div>

                            {/* Login Form */}
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <UserIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                                                placeholder="Enter your password"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>


                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Signing in...
                                                </div>
                                            ) : (
                                                'Sign in to HRMS'
                                            )}
                                        </button>
                                    </div>
                                </form>

                                {/* Additional Info */}
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Need access? Contact your HR administrator.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Features */}
                    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700">
                        <div className="max-w-md mx-auto">
                            <h3 className="text-3xl font-bold text-white mb-6">
                                Comprehensive HR Management
                            </h3>
                            <p className="text-blue-100 mb-8 text-lg">
                                Streamline your HR operations with our powerful, user-friendly platform designed for modern organizations.
                            </p>

                            <div className="space-y-6">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                                <feature.icon className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold text-white mb-1">
                                                {feature.title}
                                            </h4>
                                            <p className="text-blue-100 text-sm">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="mt-12 grid grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">500+</div>
                                    <div className="text-blue-100 text-sm">Organizations</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">50K+</div>
                                    <div className="text-blue-100 text-sm">Employees</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">99.9%</div>
                                    <div className="text-blue-100 text-sm">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">24/7</div>
                                    <div className="text-blue-100 text-sm">Support</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
