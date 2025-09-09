import React, { useState } from 'react';
import { Button, Input, Card } from '../ui';
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { validatePassword } from '../../utils/validation';
import toast from 'react-hot-toast';

const PasswordSetup = ({ onPasswordSet, className = '' }) => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'password') {
            const validation = validatePassword(value);
            setPasswordValidation(validation);
        }
    };

    const validateForm = () => {
        if (!formData.password) {
            toast.error('Please enter a password');
            return false;
        }

        if (passwordValidation && !passwordValidation.isValid) {
            toast.error('Please fix password validation errors');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            await onPasswordSet(formData.password);
            toast.success('Password set successfully!');
        } catch (error) {
            toast.error('Failed to set password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (!formData.password) return 'text-gray-400';
        if (passwordValidation?.isValid) return 'text-green-600';
        if (formData.password.length >= 6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPasswordStrengthText = () => {
        if (!formData.password) return 'Enter a password';
        if (passwordValidation?.isValid) return 'Strong password';
        if (formData.password.length >= 6) return 'Weak password';
        return 'Very weak password';
    };

    return (
        <Card className={`max-w-md mx-auto ${className}`}>
            <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Set Your Password</h3>
                <p className="mt-2 text-sm text-gray-600">
                    Create a strong password to secure your account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="mt-2">
                        <p className={`text-sm ${getPasswordStrengthColor()}`}>
                            {getPasswordStrengthText()}
                        </p>
                    </div>

                    {/* Password Validation Errors */}
                    {passwordValidation && !passwordValidation.isValid && (
                        <div className="mt-2 space-y-1">
                            {passwordValidation.errors.map((error, index) => (
                                <p key={index} className="text-sm text-red-600 flex items-center">
                                    <XMarkIcon className="h-4 w-4 mr-1" />
                                    {error}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Password Requirements */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li className="flex items-center">
                                <CheckIcon className={`h-3 w-3 mr-2 ${formData.password.length >= 6 ? 'text-green-500' : 'text-gray-400'
                                    }`} />
                                At least 6 characters
                            </li>
                            <li className="flex items-center">
                                <CheckIcon className={`h-3 w-3 mr-2 ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'
                                    }`} />
                                At least one lowercase letter
                            </li>
                            <li className="flex items-center">
                                <CheckIcon className={`h-3 w-3 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-400'
                                    }`} />
                                At least one uppercase letter
                            </li>
                            <li className="flex items-center">
                                <CheckIcon className={`h-3 w-3 mr-2 ${/\d/.test(formData.password) ? 'text-green-500' : 'text-gray-400'
                                    }`} />
                                At least one number
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                                <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                        <div className="mt-2">
                            <p className={`text-sm ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={loading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                    loading={loading}
                    className="w-full"
                >
                    Set Password & Complete Onboarding
                </Button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                    Your password will be used to access your account. Keep it secure and don't share it with anyone.
                </p>
            </div>
        </Card>
    );
};

export default PasswordSetup;
