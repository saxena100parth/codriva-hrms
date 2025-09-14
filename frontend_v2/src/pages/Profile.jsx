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
    const { user, updateProfile, changePassword, isAdmin, isHR, isEmployee } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm();
    const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }, reset: resetPassword, watch } = useForm();

    useEffect(() => {
        if (user) {
            // Personal Information
            setValue('firstName', user.fullName?.first || '');
            setValue('lastName', user.fullName?.last || '');
            setValue('middleName', user.fullName?.middle || '');
            setValue('personalEmail', user.personalEmail || '');
            setValue('mobileNumber', user.mobileNumber || '');
            setValue('dateOfBirth', user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
            setValue('gender', user.gender || '');

            // Work Information
            setValue('email', user.email || '');
            setValue('employeeId', user.employeeId || '');
            setValue('jobTitle', user.jobTitle || '');
            setValue('department', user.department || '');
            setValue('employmentType', user.employmentType || '');
            setValue('reportingManagerName', user.reportingManagerName || '');
            setValue('joiningDate', user.joiningDate ? user.joiningDate.split('T')[0] : '');

            // Contact Information (Work Email is already set above)

            // Address Information
            setValue('currentAddressLine1', user.currentAddress?.line1 || '');
            setValue('currentAddressLine2', user.currentAddress?.line2 || '');
            setValue('currentAddressCity', user.currentAddress?.city || '');
            setValue('currentAddressState', user.currentAddress?.state || '');
            setValue('currentAddressZip', user.currentAddress?.zip || '');
            setValue('currentAddressCountry', user.currentAddress?.country || '');
            setValue('permanentAddressLine1', user.permanentAddress?.line1 || '');
            setValue('permanentAddressLine2', user.permanentAddress?.line2 || '');
            setValue('permanentAddressCity', user.permanentAddress?.city || '');
            setValue('permanentAddressState', user.permanentAddress?.state || '');
            setValue('permanentAddressZip', user.permanentAddress?.zip || '');
            setValue('permanentAddressCountry', user.permanentAddress?.country || '');

            // Banking & Tax Information
            setValue('bankAccountNumber', user.bankAccountNumber || '');
            setValue('ifscSwiftRoutingCode', user.ifscSwiftRoutingCode || '');
            setValue('taxId', user.taxId || '');

            // Emergency Contact
            setValue('emergencyContactName', user.emergencyContact?.name || '');
            setValue('emergencyContactRelation', user.emergencyContact?.relation || '');
            setValue('emergencyContactPhone', user.emergencyContact?.phone || '');

            // Compliance Information
            setValue('ndaSigned', user.compliance?.ndaSigned || false);
            setValue('pfOrSocialSecurityConsent', user.compliance?.pfOrSocialSecurityConsent || false);
            setValue('offerLetter', user.compliance?.offerLetter || '');
        }
    }, [user, setValue]);

    const onSubmit = async (data) => {
        try {
            // Structure data according to backend schema
            const structuredData = {
                fullName: {
                    first: data.firstName,
                    middle: data.middleName,
                    last: data.lastName
                },
                personalEmail: data.personalEmail,
                mobileNumber: data.mobileNumber,
                dateOfBirth: data.dateOfBirth,
                gender: data.gender,
                currentAddress: {
                    line1: data.currentAddressLine1,
                    line2: data.currentAddressLine2,
                    city: data.currentAddressCity,
                    state: data.currentAddressState,
                    zip: data.currentAddressZip,
                    country: data.currentAddressCountry
                },
                permanentAddress: {
                    line1: data.permanentAddressLine1,
                    line2: data.permanentAddressLine2,
                    city: data.permanentAddressCity,
                    state: data.permanentAddressState,
                    zip: data.permanentAddressZip,
                    country: data.permanentAddressCountry
                },
                emergencyContact: {
                    name: data.emergencyContactName,
                    relation: data.emergencyContactRelation,
                    phone: data.emergencyContactPhone
                }
            };

            // Only allow Admin/HR to update work-related information
            if (isAdmin || isHR) {
                Object.assign(structuredData, {
                    email: data.email,
                    jobTitle: data.jobTitle,
                    department: data.department,
                    employmentType: data.employmentType,
                    reportingManagerName: data.reportingManagerName,
                    joiningDate: data.joiningDate,
                    bankAccountNumber: data.bankAccountNumber,
                    ifscSwiftRoutingCode: data.ifscSwiftRoutingCode,
                    taxId: data.taxId,
                    compliance: {
                        ndaSigned: data.ndaSigned,
                        pfOrSocialSecurityConsent: data.pfOrSocialSecurityConsent,
                        offerLetter: data.offerLetter
                    }
                });
            }

            const result = await updateProfile(structuredData);
            if (result.success) {
                toast.success('Profile updated successfully');
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            const errorMessage = error.userMessage?.message || error.message || 'Failed to update profile';
            toast.error(errorMessage);
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
            console.error('Password change error:', error);
            const errorMessage = error.userMessage?.message || error.message || 'Failed to change password';
            toast.error(errorMessage);
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
                                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                                    <input
                                        type="text"
                                        {...register('firstName', { required: 'First name is required' })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Enter first name"
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
                                        placeholder="Enter middle name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        {...register('lastName')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Personal Email *</label>
                                    <input
                                        type="email"
                                        {...register('personalEmail', {
                                            required: 'Personal email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Enter personal email"
                                    />
                                    {errors.personalEmail && (
                                        <p className="mt-1 text-sm text-red-600">{errors.personalEmail.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        {...register('mobileNumber', { required: 'Mobile number is required' })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="Enter mobile number"
                                    />
                                    {errors.mobileNumber && (
                                        <p className="mt-1 text-sm text-red-600">{errors.mobileNumber.message}</p>
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

                            {/* Address Information Section */}
                            <div className="border-t pt-6 mt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>

                                {/* Current Address */}
                                <div className="mb-6">
                                    <h5 className="text-md font-medium text-gray-700 mb-3">Current Address</h5>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                            <input
                                                type="text"
                                                {...register('currentAddressLine1')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Enter address line 1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                                            <input
                                                type="text"
                                                {...register('currentAddressLine2')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Enter address line 2"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">City</label>
                                                <input
                                                    type="text"
                                                    {...register('currentAddressCity')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    placeholder="Enter city"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">State</label>
                                                <input
                                                    type="text"
                                                    {...register('currentAddressState')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    placeholder="Enter state"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                                <input
                                                    type="text"
                                                    {...register('currentAddressZip')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    placeholder="Enter ZIP code"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                                <input
                                                    type="text"
                                                    {...register('currentAddressCountry')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    placeholder="Enter country"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Permanent Address */}
                                <div>
                                    <h5 className="text-md font-medium text-gray-700 mb-3">Permanent Address</h5>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                            <input
                                                type="text"
                                                {...register('permanentAddressLine1')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Enter address line 1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                                            <input
                                                type="text"
                                                {...register('permanentAddressLine2')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Enter address line 2"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">City</label>
                                                <input
                                                    type="text"
                                                    {...register('permanentAddressCity')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    placeholder="Enter city"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">State</label>
                                                <input
                                                    type="text"
                                                    {...register('permanentAddressState')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    placeholder="Enter state"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                                <input
                                                    type="text"
                                                    {...register('permanentAddressZip')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    placeholder="Enter ZIP code"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Country</label>
                                                <input
                                                    type="text"
                                                    {...register('permanentAddressCountry')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    placeholder="Enter country"
                                                />
                                            </div>
                                        </div>
                                    </div>
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
                        {isEmployee && (
                            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">Read-Only Information</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>Work information can only be updated by Administrators or HR personnel. Contact your HR department if you need to update any work-related details.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Work Email *</label>
                                    <input
                                        type="email"
                                        {...register('email', {
                                            required: isAdmin || isHR ? 'Work email is required' : false,
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        })}
                                        disabled={isEmployee}
                                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                        placeholder="Enter work email"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                    <input
                                        type="text"
                                        {...register('employeeId')}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50"
                                        placeholder="Auto-generated"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Job Title</label>
                                    <input
                                        type="text"
                                        {...register('jobTitle')}
                                        disabled={isEmployee}
                                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                        placeholder="Enter job title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <select
                                        {...register('department')}
                                        disabled={isEmployee}
                                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">Select Department</option>
                                        <option value="TECH">Tech</option>
                                        <option value="HR">HR</option>
                                        <option value="FINANCE">Finance</option>
                                        <option value="MARKETING">Marketing</option>
                                        <option value="SALES">Sales</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                                    <select
                                        {...register('employmentType')}
                                        disabled={isEmployee}
                                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="FULL_TIME">Full Time</option>
                                        <option value="PART_TIME">Part Time</option>
                                        <option value="CONTRACT">Contract</option>
                                        <option value="FREELANCE">Freelance</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                    <input
                                        type="date"
                                        {...register('joiningDate')}
                                        disabled={isEmployee}
                                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reporting Manager</label>
                                <input
                                    type="text"
                                    {...register('reportingManagerName')}
                                    disabled={isEmployee}
                                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                    placeholder="Enter reporting manager name"
                                />
                            </div>

                            {/* Banking & Tax Information Section */}
                            <div className="border-t pt-6 mt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Banking & Tax Information</h4>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                                        <input
                                            type="text"
                                            {...register('bankAccountNumber')}
                                            disabled={isEmployee}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            placeholder="Enter bank account number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">IFSC/SWIFT Code</label>
                                        <input
                                            type="text"
                                            {...register('ifscSwiftRoutingCode')}
                                            disabled={isEmployee}
                                            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                            placeholder="Enter IFSC/SWIFT code"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                                    <input
                                        type="text"
                                        {...register('taxId')}
                                        disabled={isEmployee}
                                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                        placeholder="Enter tax ID"
                                    />
                                </div>
                            </div>

                            {/* Compliance Information Section */}
                            <div className="border-t pt-6 mt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Compliance Information</h4>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            {...register('ndaSigned')}
                                            disabled={isEmployee}
                                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isEmployee ? 'cursor-not-allowed opacity-50' : ''}`}
                                        />
                                        <label className={`text-sm font-medium text-gray-700 ${isEmployee ? 'opacity-50' : ''}`}>NDA Signed</label>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            {...register('pfOrSocialSecurityConsent')}
                                            disabled={isEmployee}
                                            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isEmployee ? 'cursor-not-allowed opacity-50' : ''}`}
                                        />
                                        <label className={`text-sm font-medium text-gray-700 ${isEmployee ? 'opacity-50' : ''}`}>PF/Social Security Consent</label>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Offer Letter Reference</label>
                                    <input
                                        type="text"
                                        {...register('offerLetter')}
                                        disabled={isEmployee}
                                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${isEmployee ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                        placeholder="Enter offer letter reference"
                                    />
                                </div>
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

                        {/* Contact Information Overview */}
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <UserCircleIcon className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Contact Information Overview</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>Your contact information is managed in other sections:</p>
                                            <ul className="list-disc list-inside mt-1 space-y-1">
                                                <li><strong>Personal Email:</strong> Managed in Personal Information tab</li>
                                                <li><strong>Mobile Number:</strong> Managed in Personal Information tab</li>
                                                <li><strong>Work Email:</strong> Managed in Work Information tab</li>
                                                <li><strong>Addresses:</strong> Managed in Personal Information tab</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact Information Section */}
                            <div className="border-t pt-6 mt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact Information</h4>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                                            <input
                                                type="text"
                                                {...register('emergencyContactName')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Enter emergency contact name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Relation</label>
                                            <input
                                                type="text"
                                                {...register('emergencyContactRelation')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Enter relation"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                            <input
                                                type="tel"
                                                {...register('emergencyContactPhone')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Updating...' : 'Update Emergency Contact'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
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
