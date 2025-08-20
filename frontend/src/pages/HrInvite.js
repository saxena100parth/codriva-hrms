import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const HrInvite = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await employeeService.initiateOnboarding(data);
      toast.success(result.data.message);
      navigate('/employees');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to initiate onboarding');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Invite New Employee</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start the onboarding process by inviting a new employee.
        </p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Employee Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700">
              Personal Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                {...register('personalEmail', {
                  required: 'Personal email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="personal@email.com"
              />
              {errors.personalEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.personalEmail.message}</p>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              The onboarding invitation will be sent to this email address.
            </p>
          </div>

          <div>
            <label htmlFor="officialEmail" className="block text-sm font-medium text-gray-700">
              Official Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                {...register('officialEmail', {
                  required: 'Official email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="employee@company.com"
              />
              {errors.officialEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.officialEmail.message}</p>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This will be the employee's login email.
            </p>
          </div>

          <div>
            <label htmlFor="temporaryPassword" className="block text-sm font-medium text-gray-700">
              Temporary Password
            </label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('temporaryPassword', {
                  required: 'Temporary password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter temporary password"
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
              {errors.temporaryPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.temporaryPassword.message}</p>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              The employee will be required to change this password on first login.
            </p>
          </div>

          <div className="bg-blue-50 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  An invitation email will be sent to the employee's personal email with login instructions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6 -mx-4 -my-5 sm:-mx-6 sm:-my-6 sm:rounded-b-lg">
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HrInvite;
