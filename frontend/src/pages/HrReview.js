import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';
import {
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  UserCircleIcon,
  CalendarIcon,
  BriefcaseIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const HrReview = () => {
  const [pendingOnboardings, setPendingOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingOnboardings();
  }, []);

  const fetchPendingOnboardings = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getPendingOnboardings();
      setPendingOnboardings(response);
    } catch (error) {
      toast.error('Failed to fetch pending onboardings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (employee, decision) => {
    setSelectedEmployee(employee);
    setReviewDecision(decision);
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewComments && reviewDecision === 'reject') {
      toast.error('Please provide comments for rejection');
      return;
    }

    try {
      setSubmitting(true);
      const result = await employeeService.reviewOnboarding(
        selectedEmployee._id,
        reviewDecision,
        reviewComments
      );
      toast.success(result.message || 'Onboarding review submitted successfully');
      setReviewModal(false);
      setReviewComments('');
      fetchPendingOnboardings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
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
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Review Onboarding</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve employee onboarding submissions.
        </p>
      </div>

      {pendingOnboardings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending onboardings</h3>
          <p className="mt-1 text-sm text-gray-500">All employee onboardings have been reviewed.</p>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {pendingOnboardings.map((employee) => (
              <li key={employee._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={`https://ui-avatars.com/api/?name=${employee.name || (employee.fullName ? [employee.fullName.first, employee.fullName.last].filter(Boolean).join(' ') : 'E')}&background=3b82f6&color=fff`}
                          alt=""
                        />
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.name || (employee.fullName ? [employee.fullName.first, employee.fullName.middle, employee.fullName.last].filter(Boolean).join(' ') : 'Unknown')}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {employee.email || employee.officialEmail || 'No email'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <Link
                        to={`/employees/${employee._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-20 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <EyeIcon className="-ml-0.5 mr-2" style={{ width: 16, height: 16 }} />
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleReview(employee, 'approve'); }}
                        className="relative z-20 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckIcon className="-ml-0.5 mr-2" style={{ width: 16, height: 16 }} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleReview(employee, 'reject'); }}
                        className="relative z-20 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XMarkIcon className="-ml-0.5 mr-2" style={{ width: 16, height: 16 }} />
                        Reject
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="flex-shrink-0 mr-1.5 text-gray-400" style={{ width: 16, height: 16 }} />
                      Submitted: {employee.onboardingSubmittedAt ? formatDate(employee.onboardingSubmittedAt) : 'Not specified'}
                    </div>
                    {employee.joiningDate && (
                      <div className="flex items-center text-sm text-gray-500">
                        <BriefcaseIcon className="flex-shrink-0 mr-1.5 text-gray-400" style={{ width: 16, height: 16 }} />
                        Joining: {formatDate(employee.joiningDate)}
                      </div>
                    )}
                    {employee.department && employee.jobTitle && (
                      <div className="flex items-center text-sm text-gray-500">
                        <DocumentTextIcon className="flex-shrink-0 mr-1.5 text-gray-400" style={{ width: 16, height: 16 }} />
                        {employee.department} - {employee.jobTitle}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${reviewDecision === 'approve' ? 'bg-green-100' : 'bg-red-100'
                    } sm:mx-0 sm:h-10 sm:w-10`}>
                    {reviewDecision === 'approve' ? (
                      <CheckIcon className="h-6 w-6 text-green-600" />
                    ) : (
                      <XMarkIcon className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {reviewDecision === 'approve' ? 'Approve' : 'Reject'} Onboarding
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to {reviewDecision} the onboarding for{' '}
                        <span className="font-medium">
                          {selectedEmployee?.name || (selectedEmployee?.fullName ? [selectedEmployee.fullName.first, selectedEmployee.fullName.last].filter(Boolean).join(' ') : 'Unknown')}
                        </span>?
                      </p>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                        Comments {reviewDecision === 'reject' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        id="comments"
                        rows={3}
                        value={reviewComments}
                        onChange={(e) => setReviewComments(e.target.value)}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder={reviewDecision === 'approve' ? 'Optional comments...' : 'Please provide reason for rejection...'}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={submitReview}
                  disabled={submitting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${reviewDecision === 'approve'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? 'Processing...' : `Confirm ${reviewDecision === 'approve' ? 'Approval' : 'Rejection'}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReviewModal(false);
                    setReviewComments('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrReview;
