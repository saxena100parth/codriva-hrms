import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors }, reset: resetProfile } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword, watch } = useForm();

  useEffect(() => {
    if (user?.role === 'employee') {
      fetchEmployeeProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEmployeeProfile = async () => {
    try {
      const response = await employeeService.getMyProfile();
      setEmployee(response.data);
      resetProfile({
        name: user?.name || '',
        personalEmail: user?.personalEmail || response.data.personalEmail || ''
      });
    } catch (error) {
      console.error('Failed to fetch employee profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.error);
    }
  };

  const onPasswordSubmit = async (data) => {
    const result = await changePassword(data.currentPassword, data.newPassword);
    if (result.success) {
      toast.success('Password changed successfully');
      resetPassword();
    } else {
      toast.error(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and personal information.
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <img
            className="h-20 w-20 rounded-full"
            src={`https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff&size=200`}
            alt=""
          />
          <div className="ml-6">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            {employee?.employeeId && (
              <p className="text-sm text-gray-500">Employee ID: {employee.employeeId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
            {user?.role === 'employee' && (
              <button
                onClick={() => setActiveTab('employment')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'employment'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Employment Details
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    {...registerProfile('name', { required: 'Name is required' })}
                    defaultValue={user?.name}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Official Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">Contact admin to change official email</p>
                </div>
              </div>

              <div>
                <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700">
                  Personal Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    {...registerProfile('personalEmail', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    defaultValue={user?.personalEmail || employee?.personalEmail}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {profileErrors.personalEmail && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.personalEmail.message}</p>
                  )}
                </div>
              </div>

              {employee && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={employee.mobileNumber || 'Not provided'}
                        disabled
                        className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        disabled
                        className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-lg">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === watch('newPassword') || 'Passwords do not match'
                    })}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Change Password
                </button>
              </div>
            </form>
          )}

          {/* Employment Details Tab (Employee Only) */}
          {activeTab === 'employment' && user?.role === 'employee' && employee && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
                  <p className="mt-1 text-sm text-gray-900">{employee.employeeId || 'Pending'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1 text-sm text-gray-900">{employee.department || 'Not assigned'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Job Title</h3>
                  <p className="mt-1 text-sm text-gray-900">{employee.jobTitle || 'Not assigned'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employment Type</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{employee.employmentType || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Joining Date</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {employee.joiningDate
                      ? new Date(employee.joiningDate).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Reporting Manager</h3>
                  <p className="mt-1 text-sm text-gray-900">{employee.reportingManager || 'Not assigned'}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balance</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900">Annual Leave</h4>
                    <p className="mt-2 text-2xl font-semibold text-blue-900">
                      {employee.availableLeaves?.annual || 0}
                      <span className="text-sm font-normal text-blue-700">
                        {' '}/ {employee.leaveBalance?.annual || 0}
                      </span>
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900">Sick Leave</h4>
                    <p className="mt-2 text-2xl font-semibold text-green-900">
                      {employee.availableLeaves?.sick || 0}
                      <span className="text-sm font-normal text-green-700">
                        {' '}/ {employee.leaveBalance?.sick || 0}
                      </span>
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-900">Personal Leave</h4>
                    <p className="mt-2 text-2xl font-semibold text-purple-900">
                      {employee.availableLeaves?.personal || 0}
                      <span className="text-sm font-normal text-purple-700">
                        {' '}/ {employee.leaveBalance?.personal || 0}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
