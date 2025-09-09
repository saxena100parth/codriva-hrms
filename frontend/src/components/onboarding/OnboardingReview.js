import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, SelectField } from '../ui';
import { LoadingSpinner, EmptyState } from '../common';
import PageHeader from '../layout/PageHeader';
import { ONBOARDING_STATUS, STATUS_COLORS } from '../../constants';
import { userAPI } from '../../api';
import { formatUserName, formatDate } from '../../utils/format';
import {
    EyeIcon,
    CheckIcon,
    XMarkIcon,
    DocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OnboardingReview = ({ className = '' }) => {
    const [onboardings, setOnboardings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewing, setReviewing] = useState(false);
    const [selectedOnboarding, setSelectedOnboarding] = useState(null);
    const [reviewData, setReviewData] = useState({
        decision: '',
        comments: ''
    });

    useEffect(() => {
        fetchPendingOnboardings();
    }, []);

    const fetchPendingOnboardings = async () => {
        try {
            const data = await userAPI.getPendingOnboardings();
            setOnboardings(data);
        } catch (error) {
            toast.error('Failed to fetch pending onboardings');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async () => {
        if (!reviewData.decision) {
            toast.error('Please select a decision');
            return;
        }

        setReviewing(true);
        try {
            await userAPI.reviewOnboarding(
                selectedOnboarding._id,
                reviewData.decision,
                reviewData.comments
            );

            // Update local state
            setOnboardings(prev =>
                prev.filter(onboarding => onboarding._id !== selectedOnboarding._id)
            );

            toast.success('Onboarding reviewed successfully');
            setSelectedOnboarding(null);
            setReviewData({ decision: '', comments: '' });
        } catch (error) {
            toast.error('Failed to review onboarding');
        } finally {
            setReviewing(false);
        }
    };

    const getStatusBadge = (status) => {
        const color = STATUS_COLORS[status] || 'gray';
        return (
            <Badge variant={color} size="sm">
                {status}
            </Badge>
        );
    };

    const renderOnboardingDetails = (onboarding) => {
        return (
            <div className="space-y-4">
                {/* User Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Employee Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Name:</span>
                            <span className="ml-2 font-medium">
                                {formatUserName(onboarding)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Email:</span>
                            <span className="ml-2 font-medium">{onboarding.email}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Role:</span>
                            <span className="ml-2 font-medium">{onboarding.role}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Submitted:</span>
                            <span className="ml-2 font-medium">
                                {formatDate(onboarding.onboardingSubmittedAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Documents */}
                {onboarding.documents && onboarding.documents.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Submitted Documents</h4>
                        <div className="space-y-2">
                            {onboarding.documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <DocumentIcon className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                                            <p className="text-xs text-gray-500">{doc.fileName}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(doc.fileUrl, '_blank')}
                                    >
                                        <EyeIcon className="h-4 w-4 mr-1" />
                                        View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Review Form */}
                <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Review Decision</h4>
                    <div className="space-y-4">
                        <SelectField
                            label="Decision"
                            value={reviewData.decision}
                            onChange={(e) => setReviewData(prev => ({ ...prev, decision: e.target.value }))}
                            options={[
                                { value: ONBOARDING_STATUS.APPROVED, label: 'Approve' },
                                { value: ONBOARDING_STATUS.REJECTED, label: 'Reject' }
                            ]}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments
                            </label>
                            <textarea
                                value={reviewData.comments}
                                onChange={(e) => setReviewData(prev => ({ ...prev, comments: e.target.value }))}
                                rows={3}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Add your review comments..."
                            />
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                onClick={handleReview}
                                disabled={reviewing || !reviewData.decision}
                                loading={reviewing}
                                variant={reviewData.decision === ONBOARDING_STATUS.APPROVED ? 'success' : 'danger'}
                            >
                                {reviewData.decision === ONBOARDING_STATUS.APPROVED ? (
                                    <>
                                        <CheckIcon className="h-4 w-4 mr-2" />
                                        Approve
                                    </>
                                ) : (
                                    <>
                                        <XMarkIcon className="h-4 w-4 mr-2" />
                                        Reject
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedOnboarding(null);
                                    setReviewData({ decision: '', comments: '' });
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" text="Loading pending onboardings..." />
            </div>
        );
    }

    return (
        <div className={className}>
            <PageHeader
                title="Onboarding Review"
                subtitle="Review and approve employee onboarding submissions"
            />

            {onboardings.length === 0 ? (
                <EmptyState
                    title="No Pending Onboardings"
                    description="All onboarding submissions have been reviewed."
                    icon={CheckIcon}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Onboarding List */}
                    <div className="lg:col-span-1">
                        <Card title="Pending Reviews" className="h-fit">
                            <div className="space-y-3">
                                {onboardings.map((onboarding) => (
                                    <div
                                        key={onboarding._id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedOnboarding?._id === onboarding._id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedOnboarding(onboarding)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">
                                                {formatUserName(onboarding)}
                                            </h4>
                                            {getStatusBadge(onboarding.onboardingStatus)}
                                        </div>
                                        <p className="text-sm text-gray-600">{onboarding.email}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Submitted: {formatDate(onboarding.onboardingSubmittedAt)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Review Panel */}
                    <div className="lg:col-span-2">
                        {selectedOnboarding ? (
                            <Card title={`Review: ${formatUserName(selectedOnboarding)}`}>
                                {renderOnboardingDetails(selectedOnboarding)}
                            </Card>
                        ) : (
                            <Card>
                                <div className="text-center py-12">
                                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Select an Onboarding
                                    </h3>
                                    <p className="text-gray-600">
                                        Choose an onboarding submission from the list to review
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnboardingReview;
