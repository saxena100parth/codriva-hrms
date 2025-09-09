import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui';
import { LoadingSpinner } from '../common';
import OnboardingSteps from './OnboardingSteps';
import MobileLogin from './MobileLogin';
import DocumentUpload from './DocumentUpload';
import PasswordSetup from './PasswordSetup';
import { ONBOARDING_STATUS } from '../../constants';
import { userAPI, authAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const OnboardingForm = ({ className = '' }) => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(ONBOARDING_STATUS.INVITED);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [invitedUser, setInvitedUser] = useState(null);

    useEffect(() => {
        // Check if user is already authenticated
        if (user) {
            setCurrentStep(user.onboardingStatus);
            setEmail(user.email || user.personalEmail);
            setLoading(false);
        } else {
            // For new employees, check if they have an invitation
            // This would typically come from URL params or localStorage
            const urlParams = new URLSearchParams(window.location.search);
            const mobileNumber = urlParams.get('mobile');
            const invitationToken = urlParams.get('token');

            if (mobileNumber) {
                setInvitedUser({ mobileNumber });
                setLoading(false);
            } else {
                // No invitation found, redirect to login
                navigate('/login');
            }
        }
    }, [user, navigate]);

    useEffect(() => {
        // Redirect if onboarding is already completed
        if (currentStep === ONBOARDING_STATUS.COMPLETED) {
            navigate('/');
            return;
        }

        // Redirect if user is not an employee (and is authenticated)
        if (user && user.role !== 'EMPLOYEE') {
            navigate('/');
            return;
        }
    }, [currentStep, user, navigate]);

    const handleMobileLoginSuccess = async (result) => {
        try {
            // Update local user state
            updateUser(result.user);

            setCurrentStep(ONBOARDING_STATUS.PENDING);
            toast.success('Mobile verification successful! Please proceed with document upload.');
        } catch (error) {
            toast.error('Failed to update status. Please try again.');
        }
    };

    const handleDocumentsSubmitted = async (documentData) => {
        try {
            console.log('=== DOCUMENT SUBMISSION STARTED ===');
            console.log('User object:', user);
            console.log('User ID:', user?._id);
            console.log('User role:', user?.role);
            console.log('User onboarding status:', user?.onboardingStatus);
            console.log('Document data:', documentData);

            if (!user?._id) {
                console.error('No user ID found!');
                toast.error('User not authenticated. Please log in again.');
                return;
            }

            // Submit onboarding documents - this automatically updates status to SUBMITTED
            const result = await userAPI.submitOnboarding({
                documents: documentData,
                submittedAt: new Date().toISOString()
            });

            console.log('API response:', result);

            // Update local user state with the result from the API
            updateUser({
                ...user,
                ...result.user,
                onboardingStatus: ONBOARDING_STATUS.SUBMITTED
            });

            setCurrentStep(ONBOARDING_STATUS.SUBMITTED);
            toast.success('Documents submitted successfully! Waiting for HR review.');
        } catch (error) {
            console.error('Document submission error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            toast.error('Failed to submit documents. Please try again.');
        }
    };

    const handlePasswordSet = async (password) => {
        try {
            // Set the initial password during onboarding
            await authAPI.setOnboardingPassword(password);

            // Complete onboarding
            await userAPI.completeOnboarding();

            // Update local user state
            updateUser({
                ...user,
                onboardingStatus: ONBOARDING_STATUS.COMPLETED
            });

            setCurrentStep(ONBOARDING_STATUS.COMPLETED);
            toast.success('Onboarding completed successfully! Welcome to the team.');

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            toast.error('Failed to set password. Please try again.');
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case ONBOARDING_STATUS.INVITED:
                return (
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Welcome to the Team!
                        </h3>
                        <p className="text-gray-600 mb-4">
                            You've been invited to join our organization. Please log in with your mobile number to continue.
                        </p>
                        <p className="text-sm text-gray-500">
                            Mobile: <strong>{user?.mobileNumber || invitedUser?.mobileNumber}</strong>
                        </p>
                        <MobileLogin
                            onSuccess={handleMobileLoginSuccess}
                            onBack={() => setCurrentStep(ONBOARDING_STATUS.INVITED)}
                        />
                    </div>
                );

            case ONBOARDING_STATUS.PENDING:
                return (
                    <DocumentUpload
                        onDocumentsSubmitted={handleDocumentsSubmitted}
                        user={user}
                    />
                );

            case ONBOARDING_STATUS.SUBMITTED:
                return (
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Documents Under Review
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Your documents have been submitted successfully and are currently under HR review.
                        </p>
                        <p className="text-sm text-gray-500">
                            You will receive an email notification once the review is complete.
                        </p>
                    </div>
                );

            case ONBOARDING_STATUS.APPROVED:
                return (
                    <PasswordSetup onPasswordSet={handlePasswordSet} />
                );

            case ONBOARDING_STATUS.REJECTED:
                return (
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Documents Rejected
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Your documents were not approved. Please review the feedback and resubmit.
                        </p>
                        <button
                            onClick={() => setCurrentStep(ONBOARDING_STATUS.PENDING)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Resubmit Documents
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="text-center">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" text="Loading onboarding..." />
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-50 py-8 ${className}`}>
            <div className="max-w-4xl mx-auto px-4">
                {/* Progress Steps */}
                <OnboardingSteps currentStatus={currentStep} className="mb-8" />

                {/* Current Step Content */}
                <Card className="p-8">
                    {renderCurrentStep()}
                </Card>
            </div>
        </div>
    );
};

export default OnboardingForm;
