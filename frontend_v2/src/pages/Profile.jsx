import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    UserCircleIcon,
    PencilIcon,
    CheckCircleIcon,
    XCircleIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
    const { user, updateProfile, changePassword } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm();
    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }, reset: resetPassword, watch } = useForm();

    useEffect(() => {
        if (user) {
            setValue('firstName', user.fullName?.first || '');
            setValue('lastName', user.fullName?.last || '');
            setValue('middleName', user.fullName?.middle || '');
            setValue('email', user.email || '');
            setValue('phone', user.phone || '');
            setValue('dateOfBirth', user.dateOfBirth || '');
            setValue('gender', user.gender || '');
            setValue('address', user.address || '');
            setValue('city', user.city || '');
            setValue('state', user.state || '');
            setValue('zipCode', user.zipCode || '');
            setValue('country', user.country || '');
            setValue('department', user.department || '');
            setValue('position', user.position || '');
            setValue('employeeId', user.employeeId || '');
            setValue('hireDate', user.hireDate || '');
            setValue('salary', user.salary || '');
            setValue('emergencyContact', user.emergencyContact || {});
        }
    }, [user, setValue]);

    const onSubmit = async (data) => {
        try {
            const result = await updateProfile(data);
            if (result.success) {
                toast.success('Profile updated successfully');
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
            console.error(error);
        }
    };

    const onSubmitPassword = async (data) => {
        try {
            const result = await changePassword(data.currentPassword, data.newPassword);
            if (result.success) {
                toast.success('Password changed successfully');
                setShowPasswordForm(false);
                resetPassword();
            } else {
                toast.error(result.error || 'Failed to change password');
            }
        } catch (error) {
            toast.error('Failed to change password');
            console.error(error);
        }
    };

    const tabs = [
        { id: 'personal', name: 'Personal Information' },
        { id: 'work', name: 'Work Information' },
        { id: 'contact', name: 'Contact Information' },
        { id: 'security', name: 'Security' }
    ];

    const getDisplayName = () => {
        if (user?.fullName) {
            return [user.fullName.first, user.fullName.middle, user.fullName.last].filter(Boolean).join(' ');
        }
        return user?.name || 'Unknown';
    };

    return (
        <div className="w-full">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage your personal information and account settings
                    </p>
                </div>
            </div>

            {/* Profile Header */}
            <div className="mt-6 bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <img
                            className="h-16 w-16 rounded-full ring-4 ring-gray-200"
                            src={`https://ui-avatars.com/api/?name=${getDisplayName()}&background=3b82f6&color=fff&bold=true&size=128`}
                            alt={getDisplayName()}
                        />
                    </div>
                    <div className="ml-6">
                        <h2 className="text-xl font-semibold text-gray-900">{getDisplayName()}</h2>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                        {user?.department && (
                            <p className="text-sm text-gray-500">{user.department} • {user.position}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'personal' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        {...register('firstName', { required: 'First name is required' })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                    <input
                                        type="text"
                                        {...register('middleName')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        {...register('lastName', { required: 'Last name is required' })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        {...register('dateOfBirth')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select
                                        {...register('gender')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Personal Info'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'work' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Work Information</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        {...register('department')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Position</label>
                                    <input
                                        type="text"
                                        {...register('position')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                    <input
                                        type="text"
                                        {...register('employeeId')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                                    <input
                                        type="date"
                                        {...register('hireDate')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Salary</label>
                                <input
                                    type="number"
                                    {...register('salary')}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Enter salary amount"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Work Info'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        {...register('email', { required: 'Email is required' })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea
                                    {...register('address')}
                                    rows={3}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        {...register('city')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input
                                        type="text"
                                        {...register('state')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                    <input
                                        type="text"
                                        {...register('zipCode')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                <input
                                    type="text"
                                    {...register('country')}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Updating...' : 'Update Contact Info'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>

                        {!showPasswordForm ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <LockClosedIcon className="h-8 w-8 text-gray-400 mr-3" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Password</h4>
                                            <p className="text-sm text-gray-500">Last updated: {user?.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleDateString() : 'Never'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPasswordForm(true)}
                                        className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-500"
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            {...registerPassword('currentPassword', { required: 'Current password is required' })}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showCurrentPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            {...registerPassword('newPassword', {
                                                required: 'New password is required',
                                                minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                            })}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showNewPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                    <div className="mt-1 relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            {...registerPassword('confirmPassword', {
                                                required: 'Please confirm your password',
                                                validate: value => value === watch('newPassword') || 'Passwords do not match'
                                            })}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            resetPassword();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isPasswordSubmitting}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPasswordSubmitting ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
