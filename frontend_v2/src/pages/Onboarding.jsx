import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import userService from '../services/userService';
import uploadService from '../services/uploadService';
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
    const { user, otpLogin, updateUser, logout } = useAuth();
    const { error: globalError, handleError, clearError } = useErrorHandler();

    const [step, setStep] = useState(1); // 1: Email Verification, 2: Personal Details, 3: Job Details
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState({});

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
        taxId: '',

        // Document Uploads
        documents: {
            educationalCertificates: [],
            experienceLetters: []
        }
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
            const keys = name.split('.');

            if (keys.length === 2) {
                // Handle two-level nesting (e.g., "currentAddress.city")
                const [parent, child] = keys;
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            } else if (keys.length === 3) {
                // Handle three-level nesting (e.g., "documents.governmentId.type")
                const [parent, child, grandchild] = keys;
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: {
                            ...prev[parent]?.[child],
                            [grandchild]: value
                        }
                    }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileUpload = async (file, documentType, fieldName) => {
        try {
            // Validate file
            if (!uploadService.validateFileType(file)) {
                throw new Error('Invalid file type. Only PDF, images, and Word documents are allowed.');
            }

            if (!uploadService.validateFileSize(file)) {
                throw new Error('File too large. Maximum size is 10MB.');
            }

            // Set uploading state
            setUploadingFiles(prev => ({
                ...prev,
                [fieldName]: true
            }));

            // Upload file
            const response = await uploadService.uploadDocument(file, documentType);

            // Update form data with file URL
            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [fieldName]: {
                        ...prev.documents[fieldName],
                        url: response.data.url,
                        filename: response.data.filename
                    }
                }
            }));

            return response;
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        } finally {
            // Clear uploading state
            setUploadingFiles(prev => ({
                ...prev,
                [fieldName]: false
            }));
        }
    };

    const handleMultipleFileUpload = async (files, documentType, fieldName) => {
        try {
            // Validate all files
            for (const file of files) {
                if (!uploadService.validateFileType(file)) {
                    throw new Error(`Invalid file type for ${file.name}. Only PDF, images, and Word documents are allowed.`);
                }

                if (!uploadService.validateFileSize(file)) {
                    throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
                }
            }

            // Set uploading state
            setUploadingFiles(prev => ({
                ...prev,
                [fieldName]: true
            }));

            // Upload files
            const response = await uploadService.uploadMultipleDocuments(files, documentType);

            // Update form data with file URLs
            const uploadedFiles = response.data.files.map(file => ({
                url: file.url,
                filename: file.filename
            }));

            setFormData(prev => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    [fieldName]: uploadedFiles
                }
            }));

            return response;
        } catch (error) {
            console.error('Multiple file upload failed:', error);
            throw error;
        } finally {
            // Clear uploading state
            setUploadingFiles(prev => ({
                ...prev,
                [fieldName]: false
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

            // Clean the form data before submission
            const cleanedFormData = { ...formData };

            // Clean documents object - only include fields with valid data
            if (cleanedFormData.documents) {
                // Clean governmentId - only include if it has valid data
                if (cleanedFormData.documents.governmentId) {
                    if (!cleanedFormData.documents.governmentId.type ||
                        !cleanedFormData.documents.governmentId.url) {
                        delete cleanedFormData.documents.governmentId;
                    }
                }

                // Clean taxIdProof - only include if it has valid data
                if (cleanedFormData.documents.taxIdProof) {
                    if (!cleanedFormData.documents.taxIdProof.type ||
                        !cleanedFormData.documents.taxIdProof.url) {
                        delete cleanedFormData.documents.taxIdProof;
                    }
                }

                // Clean educationalCertificates - only include non-empty items
                if (cleanedFormData.documents.educationalCertificates) {
                    cleanedFormData.documents.educationalCertificates =
                        cleanedFormData.documents.educationalCertificates.filter(cert =>
                            cert && cert.url && cert.url.trim() !== ''
                        );

                    // If array is empty, remove the property
                    if (cleanedFormData.documents.educationalCertificates.length === 0) {
                        delete cleanedFormData.documents.educationalCertificates;
                    }
                }

                // Clean experienceLetters - only include non-empty items
                if (cleanedFormData.documents.experienceLetters) {
                    cleanedFormData.documents.experienceLetters =
                        cleanedFormData.documents.experienceLetters.filter(letter =>
                            letter && letter.url && letter.url.trim() !== ''
                        );

                    // If array is empty, remove the property
                    if (cleanedFormData.documents.experienceLetters.length === 0) {
                        delete cleanedFormData.documents.experienceLetters;
                    }
                }

                // If documents object is empty, remove it entirely
                if (Object.keys(cleanedFormData.documents).length === 0) {
                    delete cleanedFormData.documents;
                }
            }

            console.log('Cleaned Form Data:', cleanedFormData);

            // Submit onboarding details
            await userService.submitOnboardingDetails(cleanedFormData);

            // Update user context with new onboarding status
            updateUser({ onboardingStatus: 'SUBMITTED' });

            // Immediately logout and redirect to login after successful submission
            logout();
            navigate('/login', {
                replace: true,
                state: {
                    message: 'Your onboarding has been submitted successfully. Please wait for HR approval before accessing your account.',
                    type: 'success'
                }
            });
        } catch (error) {
            console.error('Onboarding submission failed:', error);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
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

                        {/* Document Upload Section */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Document Upload</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Government ID */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Government ID</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                                            <select
                                                name="documents.governmentId.type"
                                                value={formData.documents.governmentId?.type || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="">Select ID Type</option>
                                                <option value="PAN">PAN Card</option>
                                                <option value="AADHAR">Aadhar Card</option>
                                                <option value="VOTER_ID">Voter ID</option>
                                                <option value="PASSPORT">Passport</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                                            <input
                                                type="text"
                                                name="documents.governmentId.number"
                                                value={formData.documents.governmentId?.number || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Enter ID number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        try {
                                                            await handleFileUpload(file, 'government-id', 'governmentId');
                                                        } catch (error) {
                                                            handleError(error);
                                                        }
                                                    }
                                                }}
                                                disabled={uploadingFiles.governmentId}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                            {uploadingFiles.governmentId && (
                                                <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                                            )}
                                            {formData.documents.governmentId?.url && (
                                                <p className="text-sm text-green-600 mt-1">✓ Document uploaded successfully</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tax ID Proof */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Tax ID Proof</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Type</label>
                                            <select
                                                name="documents.taxIdProof.type"
                                                value={formData.documents.taxIdProof?.type || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="">Select Tax ID Type</option>
                                                <option value="PAN">PAN Card</option>
                                                <option value="AADHAR">Aadhar Card</option>
                                                <option value="VOTER_ID">Voter ID</option>
                                                <option value="PASSPORT">Passport</option>
                                                <option value="OTHER">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Number</label>
                                            <input
                                                type="text"
                                                name="documents.taxIdProof.number"
                                                value={formData.documents.taxIdProof?.number || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Enter Tax ID number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document</label>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        try {
                                                            await handleFileUpload(file, 'tax-proof', 'taxIdProof');
                                                        } catch (error) {
                                                            handleError(error);
                                                        }
                                                    }
                                                }}
                                                disabled={uploadingFiles.taxIdProof}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            />
                                            {uploadingFiles.taxIdProof && (
                                                <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                                            )}
                                            {formData.documents.taxIdProof?.url && (
                                                <p className="text-sm text-green-600 mt-1">✓ Document uploaded successfully</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Educational Certificates */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Educational Certificates</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Certificates</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            multiple
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files);
                                                if (files.length > 0) {
                                                    try {
                                                        await handleMultipleFileUpload(files, 'educational', 'educationalCertificates');
                                                    } catch (error) {
                                                        handleError(error);
                                                    }
                                                }
                                            }}
                                            disabled={uploadingFiles.educationalCertificates}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        {uploadingFiles.educationalCertificates && (
                                            <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                                        )}
                                        {formData.documents.educationalCertificates.length > 0 && (
                                            <p className="text-sm text-green-600 mt-1">
                                                ✓ {formData.documents.educationalCertificates.length} certificate(s) uploaded
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Experience Letters */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">Experience Letters</h4>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Experience Letters</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            multiple
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files);
                                                if (files.length > 0) {
                                                    try {
                                                        await handleMultipleFileUpload(files, 'experience', 'experienceLetters');
                                                    } catch (error) {
                                                        handleError(error);
                                                    }
                                                }
                                            }}
                                            disabled={uploadingFiles.experienceLetters}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                        {uploadingFiles.experienceLetters && (
                                            <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                                        )}
                                        {formData.documents.experienceLetters.length > 0 && (
                                            <p className="text-sm text-green-600 mt-1">
                                                ✓ {formData.documents.experienceLetters.length} experience letter(s) uploaded
                                            </p>
                                        )}
                                    </div>
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

            </div>
        </div>
    );
};

export default Onboarding;
