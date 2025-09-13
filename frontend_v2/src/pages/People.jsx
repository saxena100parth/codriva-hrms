import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import InviteEmployee from '../components/InviteEmployee';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    LockClosedIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    PencilIcon,
    UserPlusIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const People = () => {
    const { isAdmin, isHR, user } = useAuth();

    // Debug logging
    console.log('People component - User data:', { user, isAdmin, isHR });
    const [users, setUsers] = useState([]);
    const [pendingOnboardings, setPendingOnboardings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [onboardingLoading, setOnboardingLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [onboardingStatusFilter, setOnboardingStatusFilter] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showOnboardingSection, setShowOnboardingSection] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...(searchTerm && { search: searchTerm }),
                ...(roleFilter && { role: roleFilter }),
                ...(statusFilter && { status: statusFilter }),
                ...(onboardingStatusFilter && { onboardingStatus: onboardingStatusFilter })
            };

            const response = await userService.getUsers(params);
            setUsers(response.users);
            setPagination(response.pagination);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchTerm, roleFilter, statusFilter, onboardingStatusFilter]);

    const fetchPendingOnboardings = useCallback(async () => {
        if (!isAdmin && !isHR) {
            console.log('User is not admin or HR, skipping pending onboardings fetch');
            return;
        }

        console.log('Fetching pending onboardings for user role:', { isAdmin, isHR });

        try {
            setOnboardingLoading(true);
            const response = await userService.getPendingOnboardings();
            console.log('Pending onboardings response:', response);
            setPendingOnboardings(response.data || []);
        } catch (error) {
            console.error('Error fetching pending onboardings:', error);
            toast.error('Failed to fetch pending onboardings: ' + (error.response?.data?.error || error.message));
        } finally {
            setOnboardingLoading(false);
        }
    }, [isAdmin, isHR]);

    useEffect(() => {
        fetchUsers();
        fetchPendingOnboardings();
    }, [pagination.page, roleFilter, statusFilter, onboardingStatusFilter, fetchUsers, fetchPendingOnboardings]);

    const handleInviteSuccess = () => {
        toast.success('Employee invitation sent successfully!');
        fetchUsers(); // Refresh the user list
        fetchPendingOnboardings(); // Refresh pending onboardings
    };

    const handleApproveOnboarding = async (userId) => {
        if (!window.confirm('Are you sure you want to approve this onboarding request?')) {
            return;
        }

        try {
            const comments = prompt('Enter approval comments (optional):') || 'Onboarding approved';
            await userService.reviewOnboarding(userId, 'approve', comments);
            toast.success('Onboarding request approved successfully!');
            fetchUsers();
            fetchPendingOnboardings();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to approve onboarding request');
        }
    };

    const handleRejectOnboarding = async (userId) => {
        const comments = prompt('Please provide a reason for rejection:');
        if (!comments) {
            toast.error('Rejection reason is required');
            return;
        }

        if (!window.confirm('Are you sure you want to reject this onboarding request?')) {
            return;
        }

        try {
            await userService.reviewOnboarding(userId, 'reject', comments);
            toast.success('Onboarding request rejected successfully!');
            fetchUsers();
            fetchPendingOnboardings();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reject onboarding request');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, page: 1 });
        fetchUsers();
    };

    const handleToggleStatus = async (userId) => {
        try {
            const result = await userService.toggleUserStatus(userId);
            toast.success(result.message || 'User status updated successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update user status');
        }
    };

    const handleResetPassword = async (userId) => {
        const password = prompt('Enter new password (min 6 characters):');
        if (!password || password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            const result = await userService.resetUserPassword(userId, password);
            toast.success(result.message || 'Password reset successfully');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to reset password');
        }
    };

    const getDisplayName = (user) => {
        return user.fullName ? [user.fullName.first, user.fullName.middle, user.fullName.last].filter(Boolean).join(' ') : 'Unknown';
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-100 text-purple-800';
            case 'HR': return 'bg-blue-100 text-blue-800';
            case 'EMPLOYEE': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getOnboardingStatusBadge = (onboardingStatus) => {
        switch (onboardingStatus) {
            case 'COMPLETED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
            case 'APPROVED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Approved</span>;
            case 'SUBMITTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Submitted</span>;
            case 'PENDING':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Pending</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            case 'INVITED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Invited</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
        }
    };

    return (
        <div className="w-full">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">People Management</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage all users in the system including employees, HR staff, and administrators
                    </p>
                </div>
                {(isAdmin || isHR) && (
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Invite Employee
                        </button>
                        <Link
                            to="/admin/create-hr"
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Create HR User
                        </Link>
                    </div>
                )}
            </div>

            {/* Debug Section */}
            {(isAdmin || isHR) && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">Debug Info</h3>
                    <p className="text-sm text-blue-600">User Role: {user?.role}</p>
                    <p className="text-sm text-blue-600">Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-blue-600">Is HR: {isHR ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-blue-600">Pending Count: {pendingOnboardings.length}</p>
                    <button
                        onClick={() => {
                            console.log('Manual fetch triggered');
                            fetchPendingOnboardings();
                        }}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                        Test Fetch Pending Onboardings
                    </button>
                </div>
            )}

            {/* Pending Onboardings Section */}
            {(isAdmin || isHR) && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                            <h3 className="text-lg font-medium text-yellow-800">
                                Pending Onboarding Requests ({pendingOnboardings.length})
                            </h3>
                        </div>
                        <button
                            onClick={() => setShowOnboardingSection(!showOnboardingSection)}
                            className="text-sm text-yellow-600 hover:text-yellow-800"
                        >
                            {showOnboardingSection ? 'Hide' : 'Show'} Details
                        </button>
                    </div>

                    {showOnboardingSection && (
                        <div className="space-y-3">
                            {onboardingLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                                    <span className="ml-2 text-yellow-600">Loading...</span>
                                </div>
                            ) : pendingOnboardings.length > 0 ? (
                                pendingOnboardings.map((user) => (
                                    <div key={user._id} className="bg-white rounded-lg border border-yellow-200 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <img
                                                        className="h-10 w-10 rounded-full mr-3"
                                                        src={`https://ui-avatars.com/api/?name=${getDisplayName(user)}&background=f59e0b&color=fff&size=64`}
                                                        alt=""
                                                    />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{getDisplayName(user)}</h4>
                                                        <p className="text-sm text-gray-500">{user.personalEmail}</p>
                                                        <p className="text-xs text-gray-400">
                                                            Submitted: {new Date(user.onboardingSubmittedAt).toLocaleString()}
                                                        </p>
                                                        {user.reportingManagerName && (
                                                            <p className="text-xs text-gray-400">
                                                                Reporting Manager: {user.reportingManagerName}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleApproveOnboarding(user._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectOnboarding(user._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                >
                                                    <XCircleIcon className="h-4 w-4 mr-1" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-yellow-700">No pending onboarding requests at this time.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Search by name, email, or employee ID..."
                        />
                    </div>
                </form>

                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPagination({ ...pagination, page: 1 });
                    }}
                    className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="HR">HR</option>
                    <option value="EMPLOYEE">Employee</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPagination({ ...pagination, page: 1 });
                    }}
                    className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>

                <select
                    value={onboardingStatusFilter}
                    onChange={(e) => {
                        setOnboardingStatusFilter(e.target.value);
                        setPagination({ ...pagination, page: 1 });
                    }}
                    className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    <option value="">All Onboarding Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="APPROVED">Approved</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="INVITED">Invited</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="mt-8 flex flex-col">
                <div className="table-responsive">
                    <div className="inline-block min-w-full py-2 align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Employee ID</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Onboarding</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                <div className="inline-flex items-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                                                    <span className="ml-2">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4 text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user._id}>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <img
                                                            className="h-8 w-8 rounded-full mr-3"
                                                            src={`https://ui-avatars.com/api/?name=${getDisplayName(user)}&background=3b82f6&color=fff&size=64`}
                                                            alt=""
                                                        />
                                                        <div>
                                                            <div className="font-medium">{getDisplayName(user)}</div>
                                                            {user.department && (
                                                                <div className="text-xs text-gray-500">{user.department}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {user.employeeId || '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {user.isActive ? (
                                                        <span className="inline-flex items-center text-green-600">
                                                            <CheckCircleIcon className="h-5 w-5 mr-1" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-red-600">
                                                            <XCircleIcon className="h-5 w-5 mr-1" />
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {user.onboardingStatus ? getOnboardingStatusBadge(user.onboardingStatus) : 'N/A'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            to={`/employees/${user._id}`}
                                                            className="text-primary-600 hover:text-primary-900"
                                                            title="View Details"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        {(isAdmin || (user.role === 'EMPLOYEE')) && (
                                                            <Link
                                                                to={`/employees/${user._id}/edit`}
                                                                className="text-primary-600 hover:text-primary-900"
                                                                title="Edit"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={() => handleToggleStatus(user._id)}
                                                            className="text-primary-600 hover:text-primary-900"
                                                            title={user.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetPassword(user._id)}
                                                            className="text-primary-600 hover:text-primary-900"
                                                            title="Reset Password"
                                                        >
                                                            <LockClosedIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page === pagination.pages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                                <span className="font-medium">{pagination.pages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page === pagination.pages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Employee Modal */}
            {showInviteModal && (
                <InviteEmployee
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={handleInviteSuccess}
                />
            )}
        </div>
    );
};

export default People;
