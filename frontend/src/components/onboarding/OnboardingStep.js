import React from 'react';
import { CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ONBOARDING_STATUS } from '../../constants';

const OnboardingStep = ({ step, currentStatus, isCompleted, isCurrent, isRejected }) => {
    const getStepIcon = () => {
        if (isCompleted) {
            return <CheckIcon className="h-6 w-6 text-green-600" />;
        }
        if (isRejected) {
            return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
        }
        if (isCurrent) {
            return <ClockIcon className="h-6 w-6 text-blue-600" />;
        }
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300 bg-gray-100" />;
    };

    const getStepColor = () => {
        if (isCompleted) return 'text-green-600';
        if (isRejected) return 'text-red-600';
        if (isCurrent) return 'text-blue-600';
        return 'text-gray-500';
    };

    const getStepBorderColor = () => {
        if (isCompleted) return 'border-green-600';
        if (isRejected) return 'border-red-600';
        if (isCurrent) return 'border-blue-600';
        return 'border-gray-300';
    };

    return (
        <div className="flex items-center">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepBorderColor()}`}>
                {getStepIcon()}
            </div>
            <div className="ml-4 min-w-0 flex-1">
                <p className={`text-sm font-medium ${getStepColor()}`}>
                    {step.title}
                </p>
                {step.description && (
                    <p className="text-sm text-gray-500">
                        {step.description}
                    </p>
                )}
            </div>
        </div>
    );
};

const OnboardingSteps = ({ currentStatus, className = '' }) => {
    const steps = [
        {
            id: ONBOARDING_STATUS.INVITED,
            title: 'Invited',
            description: 'HR has sent you an invitation to complete onboarding'
        },
        {
            id: ONBOARDING_STATUS.PENDING,
            title: 'Document Upload',
            description: 'Upload required documents and complete your profile'
        },
        {
            id: ONBOARDING_STATUS.SUBMITTED,
            title: 'Documents Submitted',
            description: 'Your documents have been submitted for HR review'
        },
        {
            id: ONBOARDING_STATUS.APPROVED,
            title: 'Approved',
            description: 'HR has approved your documents'
        },
        {
            id: ONBOARDING_STATUS.COMPLETED,
            title: 'Completed',
            description: 'Onboarding completed successfully'
        }
    ];

    const getStepStatus = (stepId) => {
        const statusOrder = Object.values(ONBOARDING_STATUS);
        const currentIndex = statusOrder.indexOf(currentStatus);
        const stepIndex = statusOrder.indexOf(stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        if (currentStatus === ONBOARDING_STATUS.REJECTED && stepId === ONBOARDING_STATUS.SUBMITTED) return 'rejected';
        return 'pending';
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Onboarding Progress</h2>
                <p className="mt-2 text-gray-600">
                    Complete the following steps to finish your onboarding process
                </p>
            </div>

            <div className="space-y-4">
                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(step.id);
                    const isCompleted = stepStatus === 'completed';
                    const isCurrent = stepStatus === 'current';
                    const isRejected = stepStatus === 'rejected';

                    return (
                        <div key={step.id} className="relative">
                            <OnboardingStep
                                step={step}
                                currentStatus={currentStatus}
                                isCompleted={isCompleted}
                                isCurrent={isCurrent}
                                isRejected={isRejected}
                            />

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className={`absolute left-4 top-8 w-0.5 h-8 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'
                                    }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OnboardingSteps;
