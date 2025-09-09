import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            await authAPI.forgotPassword(email);
            setSubmitted(true);
            toast.success('Password reset email sent! Check your inbox.');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Check Your Email
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        We've sent a password reset link to {email}
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <Card>
                        <div className="p-6 text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Click the link in the email to reset your password. The link will expire in 30 minutes.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Forgot Your Password?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Card>
                    <form className="space-y-6 p-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="text-sm text-primary-600 hover:text-primary-500"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
