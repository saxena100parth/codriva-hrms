import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { ROLES, ONBOARDING_STATUS } from '../constants';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role or onboarding status
      if (user?.role === ROLES.EMPLOYEE && user?.onboardingStatus !== ONBOARDING_STATUS.COMPLETED) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);
      toast.success('Login successful!');

      // Check if employee needs onboarding
      if (result.user.role === ROLES.EMPLOYEE && result.user.onboardingStatus !== ONBOARDING_STATUS.COMPLETED) {
        navigate('/onboarding');
      } else {
        const intended = localStorage.getItem('intended_path');
        localStorage.removeItem('intended_path');
        navigate(intended || '/');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-lg" style={{ background: '#3b82f6' }}>
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Codriva HRMS
          </h2>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Sign in to continue
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              error={errors.email?.message}
              required
            />

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={errors.password?.message}
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
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="w-full"
            >
              Sign in
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need access to the system?{' '}
            <span className="font-medium text-blue-600">
              Contact your administrator or HR team
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;