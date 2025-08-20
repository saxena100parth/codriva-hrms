import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
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
      if (user?.role === 'employee' && !user?.isOnboarded) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);

    if (result.success) {
      toast.success('Login successful!');

      // Check if employee needs onboarding
      if (result.user.role === 'employee' && !result.user.isOnboarded) {
        navigate('/onboarding');
      } else {
        const intended = localStorage.getItem('intended_path');
        localStorage.removeItem('intended_path');
        navigate(intended || '/');
      }
    } else {
      toast.error(result.error || 'Login failed');
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
        <div className="card shadow-card bg-white p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label text-gray-700">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                id="email"
                autoComplete="email"
                className="form-input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  className="form-input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full py-3 text-base font-medium shadow-hover"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Default Credentials Section */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Demo Credentials</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600 text-center font-medium mb-2">Default Admin Login:</p>
                <div className="text-xs text-gray-700 space-y-1 text-center">
                  <p><span className="font-medium">Email:</span> admin@hrms.com</p>
                  <p><span className="font-medium">Password:</span> Admin@123</p>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact your system administrator
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2024 HRMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;