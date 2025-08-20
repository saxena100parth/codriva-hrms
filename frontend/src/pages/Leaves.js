import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { leaveService } from '../services/leaveService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const Leaves = () => {
  const { user, isEmployee, isHR, isAdmin } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [leaveSummary, setLeaveSummary] = useState(null);

  const [expandedLeaves, setExpandedLeaves] = useState([]);
  const [filter, setFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState({ show: false, leave: null, action: '' });
  const [rejectionReason, setRejectionReason] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm();

  useEffect(() => {
    fetchLeaves();
    if (isEmployee) {
      fetchLeaveSummary();
    }
  }, [filter]); // fetchLeaves and fetchLeaveSummary are stable, isEmployee checked inside

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await leaveService.getLeaves(params);
      setLeaves(data.leaves);
    } catch (error) {
      toast.error('Failed to fetch leaves');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveSummary = async () => {
    try {
      const data = await leaveService.getLeaveSummary();
      setLeaveSummary(data);
    } catch (error) {
      console.error('Failed to fetch leave summary:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      await leaveService.applyLeave(data);
      toast.success('Leave request submitted successfully');
      reset();
      setShowApplyForm(false);
      fetchLeaves();
      fetchLeaveSummary();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit leave request');
    }
  };

  const handleReviewLeave = (leave, action) => {
    setReviewModal({ show: true, leave, action });
    setRejectionReason('');
  };

  const submitReview = async () => {
    try {
      await leaveService.updateLeaveStatus(
        reviewModal.leave._id,
        reviewModal.action === 'approved' ? 'approved' : 'rejected',
        reviewModal.action === 'rejected' ? rejectionReason : ''
      );
      toast.success(`Leave ${reviewModal.action === 'approved' ? 'approved' : 'rejected'} successfully`);
      setReviewModal({ show: false, leave: null, action: '' });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${reviewModal.action} leave`);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave request?')) {
      try {
        await leaveService.cancelLeave(leaveId);
        toast.success('Leave cancelled successfully');
        fetchLeaves();
        fetchLeaveSummary();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to cancel leave');
      }
    }
  };

  const toggleExpandLeave = (leaveId) => {
    setExpandedLeaves(prev =>
      prev.includes(leaveId)
        ? prev.filter(id => id !== leaveId)
        : [...prev, leaveId]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = () => {
    const startDate = watch('startDate');
    const endDate = watch('endDate');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  return (
    <div className="w-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            {isEmployee ? 'Apply for leaves and track your leave requests' : 'Review and manage employee leave requests'}
          </p>
        </div>
        {isEmployee && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={() => setShowApplyForm(!showApplyForm)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Apply for Leave
            </button>
          </div>
        )}
      </div>

      {/* Leave Summary for Employees */}
      {isEmployee && leaveSummary && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Annual Leave</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {leaveSummary.available.annual}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                        / {leaveSummary.balance.annual}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sick Leave</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {leaveSummary.available.sick}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                        / {leaveSummary.balance.sick}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Personal Leave</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {leaveSummary.available.personal}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                        / {leaveSummary.balance.personal}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {user?.gender === 'female' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Maternity Leave</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {leaveSummary.available.maternity}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                          / {leaveSummary.balance.maternity}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user?.gender === 'male' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Paternity Leave</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {leaveSummary.available.paternity}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                          / {leaveSummary.balance.paternity}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply Leave Form */}
      {showApplyForm && isEmployee && (
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Apply for Leave</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                <select
                  {...register('leaveType', { required: 'Leave type is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select leave type</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  {user?.gender === 'female' && <option value="maternity">Maternity Leave</option>}
                  {user?.gender === 'male' && <option value="paternity">Paternity Leave</option>}
                </select>
                {errors.leaveType && (
                  <p className="mt-1 text-sm text-red-600">{errors.leaveType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                <input
                  type="text"
                  value={calculateDays()}
                  disabled
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required' })}
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  {...register('endDate', { required: 'End date is required' })}
                  min={watch('startDate') || new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <textarea
                {...register('reason', { required: 'Reason is required' })}
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Please provide a reason for your leave request..."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Backup Person</label>
                <input
                  type="text"
                  {...register('backupPerson')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Who will handle your work?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    {...register('emergencyContact.name')}
                    placeholder="Name"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  <input
                    type="tel"
                    {...register('emergencyContact.phone')}
                    placeholder="Phone"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowApplyForm(false);
                  reset();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize ${filter === status
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {status}
            </button>
          ))}
        </nav>
      </div>

      {/* Leaves List */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'No leave requests found.' : `No ${filter} leave requests.`}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {leaves.map((leave) => (
                <li key={leave._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave
                            {(isHR || isAdmin) && leave.employee && (
                              <span className="ml-2 text-gray-500">
                                - {leave.employee.fullName?.first} {leave.employee.fullName?.last}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(leave.startDate)} to {formatDate(leave.endDate)} ({leave.numberOfDays} days)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(leave.status)}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleExpandLeave(leave._id); }}
                          className="relative z-10 text-gray-400 hover:text-gray-500"
                        >
                          {expandedLeaves.includes(leave._id) ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {expandedLeaves.includes(leave._id) && (
                      <div className="mt-4 border-t pt-4">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Reason</dt>
                            <dd className="mt-1 text-sm text-gray-900">{leave.reason}</dd>
                          </div>
                          {leave.backupPerson && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Backup Person</dt>
                              <dd className="mt-1 text-sm text-gray-900">{leave.backupPerson}</dd>
                            </div>
                          )}
                          {leave.rejectionReason && (
                            <div className="sm:col-span-2">
                              <dt className="text-sm font-medium text-gray-500">Rejection Reason</dt>
                              <dd className="mt-1 text-sm text-gray-900">{leave.rejectionReason}</dd>
                            </div>
                          )}
                          {leave.approvedBy && (
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Approved By</dt>
                              <dd className="mt-1 text-sm text-gray-900">{leave.approvedBy.name}</dd>
                            </div>
                          )}
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Applied On</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(leave.createdAt)}</dd>
                          </div>
                        </dl>

                        {/* Actions */}
                        <div className="mt-4 flex space-x-3">
                          {leave.status === 'pending' && (isHR || isAdmin) && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleReviewLeave(leave, 'approved'); }}
                                className="relative z-20 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleReviewLeave(leave, 'rejected'); }}
                                className="relative z-20 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {leave.status === 'pending' && isEmployee && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleCancelLeave(leave._id); }}
                              className="relative z-20 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Cancel Request
                            </button>
                          )}
                          {leave.status === 'approved' && isEmployee && new Date(leave.startDate) > new Date() && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleCancelLeave(leave._id); }}
                              className="relative z-20 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Cancel Leave
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.show && createPortal(
        <div className="fixed z-[9999] inset-0 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setReviewModal({ show: false, leave: null, action: '' })}></div>
          <div className="relative bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-w-md transform transition-all z-[10000]">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${reviewModal.action === 'approved' ? 'bg-green-100' : 'bg-red-100'
                  } sm:mx-0 sm:h-10 sm:w-10`}>
                  {reviewModal.action === 'approved' ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {reviewModal.action === 'approved' ? 'Approve' : 'Reject'} Leave Request
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to {reviewModal.action === 'approved' ? 'approve' : 'reject'} this leave request?
                    </p>
                    {reviewModal.action === 'rejected' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Please provide a reason for rejection..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={submitReview}
                disabled={reviewModal.action === 'rejected' && !rejectionReason}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${reviewModal.action === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setReviewModal({ show: false, leave: null, action: '' })}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Leaves;
