import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import userService from '../services/userService';
import ErrorHandler from '../components/ErrorHandler';
import {
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    MapPinIcon,
    BriefcaseIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const Onboarding = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, otpLogin } = useAuth();
    const { error: globalError, handleError, clearError } = useErrorHandler();

    const [step, setStep] = useState(1); // 1: Email Verification, 2: Personal Details, 3: Job Details, 4: Complete
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [formData, setFormData] = useState({
        // Personal Information
        fullName: {
            first: '',
            last: ''
        },
        dateOfBirth: '',
        gender: '',
        personalEmail: '',
        currentAddress: {
            line1: '',
            city: '',
            state: '',
            country: '',
            zip: ''
        },
        emergencyContact: {
            name: '',
            relation: '',
            phone: ''
        },

        // Job Information
        joiningDate: '',
        employmentType: '',
        department: '',
        jobTitle: '',
        reportingManager: '',
        workLocation: '',

        // Documents
        aadharNumber: '',
        panNumber: '',
        bankAccountNumber: '',
        ifscSwiftRoutingCode: '',
        taxId: ''
    });

    const mobile = searchParams.get('mobile');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!mobile) {
            navigate('/');
            return;
        }

        // Check if user is already authenticated and has completed onboarding
        if (user && user.onboardingStatus === 'COMPLETED') {
            navigate('/dashboard');
            return;
        }

        // Fetch existing user data and auto-send OTP to email when component mounts
        fetchUserData();
        sendOTP();
    }, [mobile, user, navigate]);

    const fetchUserData = async () => {
        try {
            const response = await userService.getOnboardingData(mobile);
            if (response.user) {
                // Populate form with existing user data
                setFormData(prev => ({
                    ...prev,
                    // Personal Information
                    fullName: {
                        first: response.user.fullName?.first || '',
                        last: response.user.fullName?.last || ''
                    },
                    personalEmail: response.user.personalEmail || '',
                    dateOfBirth: response.user.dateOfBirth || '',
                    gender: response.user.gender || '',
                    currentAddress: {
                        line1: response.user.currentAddress?.line1 || '',
                        city: response.user.currentAddress?.city || '',
                        state: response.user.currentAddress?.state || '',
                        country: response.user.currentAddress?.country || '',
                        zip: response.user.currentAddress?.zip || ''
                    },
                    emergencyContact: {
                        name: response.user.emergencyContact?.name || '',
                        relation: response.user.emergencyContact?.relation || '',
                        phone: response.user.emergencyContact?.phone || ''
                    },
                    // Job Information
                    joiningDate: response.user.joiningDate || '',
                    employmentType: response.user.employmentType || '',
                    department: response.user.department || '',
                    jobTitle: response.user.jobTitle || '',
                    reportingManager: response.user.reportingManager || '',
                    workLocation: response.user.workLocation || '',
                    // Documents
                    aadharNumber: response.user.aadharNumber || '',
                    panNumber: response.user.panNumber || '',
                    bankAccountNumber: response.user.bankAccountNumber || '',
                    ifscSwiftRoutingCode: response.user.ifscSwiftRoutingCode || '',
                    taxId: response.user.taxId || ''
                }));
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            // Don't show error to user as this is not critical
        }
    };

    const sendOTP = async () => {
        try {
            setIsLoading(true);
            clearError();

            // Call backend to send OTP to email
            await userService.sendOnboardingOTP(mobile);
            setOtpSent(true);
        } catch (error) {
            console.error('Failed to send OTP:', error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTP = async () => {
        try {
            setIsLoading(true);
            clearError();

            // Use the OTP login method from AuthContext (mobile as identifier, email as delivery)
            await otpLogin(mobile, otp);

            // Fetch updated user data after successful OTP verification
            await fetchUserData();

            setOtpVerified(true);
            setStep(2);
        } catch (error) {
            console.error('OTP verification failed:', error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmitOnboarding = async () => {
        try {
            setIsLoading(true);
            clearError();

            console.log('=== SUBMITTING ONBOARDING ===');
            console.log('User:', user);
            console.log('User ID:', user?.id);
            console.log('User Status:', user?.status);
            console.log('Onboarding Status:', user?.onboardingStatus);
            console.log('Form Data:', formData);

            // Submit onboarding details
            await userService.submitOnboardingDetails(formData);
            setStep(4);
        } catch (error) {
            console.error('Onboarding submission failed:', error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = () => {
        navigate('/dashboard');
    };

    if (!mobile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Access</h2>
                    <p className="text-gray-600">Mobile number is required for onboarding.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Global Error Handler */}
            <ErrorHandler
                error={globalError}
                onClose={clearError}
            />

            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
                    <p className="text-gray-600 mt-2">Complete your profile to get started</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-8">
                        {[1, 2, 3, 4].map((stepNumber) => (
                            <div key={stepNumber} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= stepNumber
                                    ? 'bg-primary-600 border-primary-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-500'
                                    }`}>
                                    {step > stepNumber ? (
                                        <CheckCircleIcon className="h-6 w-6" />
                                    ) : (
                                        <span className="text-sm font-medium">{stepNumber}</span>
                                    )}
                                </div>
                                {stepNumber < 4 && (
                                    <div className={`w-16 h-0.5 ${step > stepNumber ? 'bg-primary-600' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-4 space-x-16">
                        <span className={`text-sm ${step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                            Email Verification
                        </span>
                        <span className={`text-sm ${step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                            Personal Details
                        </span>
                        <span className={`text-sm ${step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                            Job Details
                        </span>
                        <span className={`text-sm ${step >= 4 ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                            Complete
                        </span>
                    </div>
                </div>

                {/* Step 1: Email Verification */}
                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-center mb-6">
                            <svg className="h-16 w-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
                            <p className="text-gray-600 mt-2">
                                We've sent a verification code to your personal email address
                            </p>
                        </div>

                        <div className="max-w-md mx-auto">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter OTP
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest"
                                    placeholder="000000"
                                    maxLength="6"
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={sendOTP}
                                    disabled={isLoading}
                                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                                >
                                    {isLoading ? 'Sending...' : 'Resend OTP'}
                                </button>
                                <button
                                    onClick={verifyOTP}
                                    disabled={isLoading || !otp || otp.length !== 6}
                                    className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Personal Details */}
                {step === 2 && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-center mb-6">
                            <UserIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                            <p className="text-gray-600 mt-2">Please provide your personal details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName.first"
                                    value={formData.fullName.first}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    name="fullName.last"
                                    value={formData.fullName.last}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth *
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender *
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Personal Email *
                                </label>
                                <input
                                    type="email"
                                    name="personalEmail"
                                    value={formData.personalEmail}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Aadhar Number *
                                </label>
                                <input
                                    type="text"
                                    name="aadharNumber"
                                    value={formData.aadharNumber}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PAN Number
                                </label>
                                <input
                                    type="text"
                                    name="panNumber"
                                    value={formData.panNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="currentAddress.line1"
                                        value={formData.currentAddress.line1}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="currentAddress.city"
                                        value={formData.currentAddress.city}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="currentAddress.state"
                                        value={formData.currentAddress.state}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="currentAddress.country"
                                        value={formData.currentAddress.country}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        name="currentAddress.zip"
                                        value={formData.currentAddress.zip}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact Section */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        name="emergencyContact.name"
                                        value={formData.emergencyContact.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Relationship
                                    </label>
                                    <input
                                        type="text"
                                        name="emergencyContact.relation"
                                        value={formData.emergencyContact.relation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="emergencyContact.phone"
                                        value={formData.emergencyContact.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setStep(3)}
                                className="bg-primary-600 text-white py-3 px-8 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                Next: Job Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Job Details */}
                {step === 3 && (
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-center mb-6">
                            <BriefcaseIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900">Job Information</h2>
                            <p className="text-gray-600 mt-2">Please provide your job-related details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Joining Date *
                                </label>
                                <input
                                    type="date"
                                    name="joiningDate"
                                    value={formData.joiningDate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employment Type *
                                </label>
                                <select
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select Type</option>
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="PART_TIME">Part Time</option>
                                    <option value="CONTRACT">Contract</option>
                                    <option value="FREELANCE">Freelance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department *
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    <option value="TECH">Technology</option>
                                    <option value="HR">Human Resources</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="MARKETING">Marketing</option>
                                    <option value="SALES">Sales</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reporting Manager
                                </label>
                                <input
                                    type="text"
                                    name="reportingManager"
                                    value={formData.reportingManager}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Work Location
                                </label>
                                <input
                                    type="text"
                                    name="workLocation"
                                    value={formData.workLocation}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Banking & Tax Information Section */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Banking & Tax Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Account Number
                                    </label>
                                    <input
                                        type="text"
                                        name="bankAccountNumber"
                                        value={formData.bankAccountNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        IFSC/SWIFT Code
                                    </label>
                                    <input
                                        type="text"
                                        name="ifscSwiftRoutingCode"
                                        value={formData.ifscSwiftRoutingCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tax ID (PAN/Aadhar)
                                    </label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        value={formData.taxId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="bg-gray-600 text-white py-3 px-8 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmitOnboarding}
                                disabled={isLoading}
                                className="bg-primary-600 text-white py-3 px-8 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Submitting...' : 'Complete Onboarding'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Complete */}
                {step === 4 && (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Onboarding Complete!</h2>
                        <p className="text-gray-600 mb-6">
                            Welcome to the team! Your profile has been successfully created.
                        </p>
                        <button
                            onClick={handleComplete}
                            className="bg-primary-600 text-white py-3 px-8 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
