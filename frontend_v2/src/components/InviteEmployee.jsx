import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import userService from '../services/userService';
import ErrorHandler from './ErrorHandler';
import {
    XMarkIcon,
    UserPlusIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const InviteEmployee = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const { error: globalError, handleError, clearError } = useErrorHandler();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        personalEmail: '',
        phoneNumber: '',
        department: '',
        jobTitle: '',
        reportingManager: '',
        inviteExpiryDays: 7
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        clearError();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearError();

        try {
            // Validate required fields
            if (!formData.name || !formData.personalEmail || !formData.phoneNumber) {
                throw new Error('Please fill in all required fields');
            }

            // Prepare data for API
            const inviteData = {
                name: formData.name,
                personal_email: formData.personalEmail,
                phone_number: formData.phoneNumber,
                department: formData.department,
                job_title: formData.jobTitle,
                reporting_manager: formData.reportingManager,
                invite_expiry_time: new Date(Date.now() + formData.inviteExpiryDays * 24 * 60 * 60 * 1000).toISOString()
            };

            await userService.inviteEmployee(inviteData);

            // Success - close modal and refresh data
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Invite employee failed:', error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const departments = [
        { value: 'TECH', label: 'Technology' },
        { value: 'HR', label: 'Human Resources' },
        { value: 'FINANCE', label: 'Finance' },
        { value: 'MARKETING', label: 'Marketing' },
        { value: 'SALES', label: 'Sales' },
        { value: 'OTHER', label: 'Other' }
    ];

    return (
        <>
            {/* Global Error Handler */}
            <ErrorHandler
                error={globalError}
                onClose={clearError}
            />

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <UserPlusIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="ml-3">
                                <h2 className="text-xl font-semibold text-gray-900">Invite Employee</h2>
                                <p className="text-sm text-gray-500">Send an invitation to a new employee</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                        Personal Email *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="personalEmail"
                                            name="personalEmail"
                                            value={formData.personalEmail}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Enter personal email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Information */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Job Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map(dept => (
                                            <option key={dept.value} value={dept.value}>
                                                {dept.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                        Job Title
                                    </label>
                                    <input
                                        type="text"
                                        id="jobTitle"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter job title"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="reportingManager" className="block text-sm font-medium text-gray-700 mb-1">
                                        Reporting Manager
                                    </label>
                                    <input
                                        type="text"
                                        id="reportingManager"
                                        name="reportingManager"
                                        value={formData.reportingManager}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Enter reporting manager name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="inviteExpiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                                        Invitation Expiry (Days)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="number"
                                            id="inviteExpiryDays"
                                            name="inviteExpiryDays"
                                            value={formData.inviteExpiryDays}
                                            onChange={handleChange}
                                            min="1"
                                            max="30"
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending Invitation...' : 'Send Invitation'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default InviteEmployee;
