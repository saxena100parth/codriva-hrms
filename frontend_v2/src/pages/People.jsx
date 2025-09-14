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
    ExclamationTriangleIcon,
    UserIcon,
    ShieldCheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const People = () => {
    const { isAdmin, isHR, user } = useAuth();

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
    const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
    const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [showPendingDetailsModal, setShowPendingDetailsModal] = useState(false);
    const [showEditPendingModal, setShowEditPendingModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserForApproval, setSelectedUserForApproval] = useState(null);
    const [selectedPendingUser, setSelectedPendingUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [editFormData, setEditFormData] = useState({});
    const [approvalFormData, setApprovalFormData] = useState({
        officialEmail: '',
        comments: ''
    });
    const [editPendingFormData, setEditPendingFormData] = useState({});
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
            return;
        }

        try {
            setOnboardingLoading(true);
            const response = await userService.getPendingOnboardings();
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
        // Show modal for approval with official email requirement
        setSelectedUserForApproval(pendingOnboardings.find(user => user._id === userId));
        setShowApprovalModal(true);
    };

    const handleApprovalSubmit = async () => {
        if (!approvalFormData.officialEmail) {
            toast.error('Official email address is required for approval');
            return;
        }

        try {
            await userService.reviewOnboarding(
                selectedUserForApproval._id,
                'approve',
                approvalFormData.comments || 'Onboarding approved',
                approvalFormData.officialEmail
            );
            toast.success('Onboarding request approved successfully!');
            setShowApprovalModal(false);
            setSelectedUserForApproval(null);
            setApprovalFormData({ officialEmail: '', comments: '' });
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

    const handleEditPendingUser = (user) => {
        setSelectedPendingUser(user);
        // Initialize form data with current user data
        setEditPendingFormData({
            fullName: {
                first: user.fullName?.first || '',
                middle: user.fullName?.middle || '',
                last: user.fullName?.last || ''
            },
            personalEmail: user.personalEmail || '',
            mobileNumber: user.mobileNumber || '',
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
            gender: user.gender || '',
            jobTitle: user.jobTitle || '',
            department: user.department || '',
            employmentType: user.employmentType || '',
            reportingManagerName: user.reportingManagerName || '',
            joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : '',
            currentAddress: {
                line1: user.currentAddress?.line1 || '',
                line2: user.currentAddress?.line2 || '',
                city: user.currentAddress?.city || '',
                state: user.currentAddress?.state || '',
                zip: user.currentAddress?.zip || '',
                country: user.currentAddress?.country || ''
            },
            permanentAddress: {
                line1: user.permanentAddress?.line1 || '',
                line2: user.permanentAddress?.line2 || '',
                city: user.permanentAddress?.city || '',
                state: user.permanentAddress?.state || '',
                zip: user.permanentAddress?.zip || '',
                country: user.permanentAddress?.country || ''
            },
            bankAccountNumber: user.bankAccountNumber || '',
            ifscSwiftRoutingCode: user.ifscSwiftRoutingCode || '',
            taxId: user.taxId || '',
            emergencyContact: {
                name: user.emergencyContact?.name || '',
                relation: user.emergencyContact?.relation || '',
                phone: user.emergencyContact?.phone || ''
            },
            compliance: {
                ndaSigned: user.compliance?.ndaSigned || false,
                pfOrSocialSecurityConsent: user.compliance?.pfOrSocialSecurityConsent || false,
                offerLetter: user.compliance?.offerLetter || ''
            },
            documents: {
                governmentId: user.documents?.governmentId || null,
                taxIdProof: user.documents?.taxIdProof || null,
                educationalCertificates: user.documents?.educationalCertificates || [],
                experienceLetters: user.documents?.experienceLetters || []
            }
        });
        setShowEditPendingModal(true);
    };

    const handleEditPendingFormChange = (field, value, subField = null, subSubField = null) => {
        if (subField && subSubField) {
            // Handle four-level nesting (e.g., documents.governmentId.type)
            setEditPendingFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [subField]: {
                        ...prev[field]?.[subField],
                        [subSubField]: value
                    }
                }
            }));
        } else if (subField) {
            // Handle three-level nesting (e.g., emergencyContact.name)
            setEditPendingFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [subField]: value
                }
            }));
        } else {
            // Handle two-level nesting (e.g., personalEmail)
            setEditPendingFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleEditPendingSubmit = async () => {
        try {
            // Flatten the nested data for API submission
            const flattenedData = {
                fullName: editPendingFormData.fullName,
                personalEmail: editPendingFormData.personalEmail,
                mobileNumber: editPendingFormData.mobileNumber,
                dateOfBirth: editPendingFormData.dateOfBirth,
                gender: editPendingFormData.gender,
                jobTitle: editPendingFormData.jobTitle,
                department: editPendingFormData.department,
                employmentType: editPendingFormData.employmentType,
                reportingManagerName: editPendingFormData.reportingManagerName,
                joiningDate: editPendingFormData.joiningDate,
                currentAddress: editPendingFormData.currentAddress,
                permanentAddress: editPendingFormData.permanentAddress,
                bankAccountNumber: editPendingFormData.bankAccountNumber,
                ifscSwiftRoutingCode: editPendingFormData.ifscSwiftRoutingCode,
                taxId: editPendingFormData.taxId,
                emergencyContact: editPendingFormData.emergencyContact,
                compliance: editPendingFormData.compliance
            };

            await userService.updateUser(selectedPendingUser._id, flattenedData);
            toast.success('Pending onboarding details updated successfully!');
            setShowEditPendingModal(false);
            setSelectedPendingUser(null);
            setEditPendingFormData({});
            fetchPendingOnboardings();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update pending onboarding details');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, page: 1 });
        fetchUsers();
    };

    const handleRoleChange = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setShowRoleChangeModal(true);
    };

    const handleConfirmRoleChange = async () => {
        if (!selectedUser || !newRole) {
            toast.error('Please select a role');
            return;
        }

        if (newRole === selectedUser.role) {
            toast.error('User already has this role');
            setShowRoleChangeModal(false);
            return;
        }

        try {
            await userService.updateUserRole(selectedUser._id, newRole);
            toast.success(`User role changed from ${selectedUser.role} to ${newRole} successfully`);
            setShowRoleChangeModal(false);
            setSelectedUser(null);
            setNewRole('');
            fetchUsers();
        } catch (error) {
            console.error('Error changing user role:', error);
            toast.error('Failed to change user role: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleCreateAdmin = () => {
        setShowCreateAdminModal(true);
    };

    const handleSelectUserForAdmin = (user) => {
        setSelectedUser(user);
        setNewRole('ADMIN');
        setShowCreateAdminModal(false);
        setShowRoleChangeModal(true);
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

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowViewModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditFormData({
            // Personal Information
            gender: user.gender || '',
            personalEmail: user.personalEmail || '',
            mobileNumber: user.mobileNumber || '',
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '', // Format for date input

            // Work Information
            role: user.role || '',
            status: user.status || '',
            department: user.department || '',
            jobTitle: user.jobTitle || '',
            employmentType: user.employmentType || '',
            reportingManagerName: user.reportingManagerName || '',
            joiningDate: user.joiningDate ? user.joiningDate.split('T')[0] : '', // Format for date input

            // Address Information
            currentAddress: {
                line1: user.currentAddress?.line1 || '',
                line2: user.currentAddress?.line2 || '',
                city: user.currentAddress?.city || '',
                state: user.currentAddress?.state || '',
                zip: user.currentAddress?.zip || '',
                country: user.currentAddress?.country || ''
            },
            permanentAddress: {
                line1: user.permanentAddress?.line1 || '',
                line2: user.permanentAddress?.line2 || '',
                city: user.permanentAddress?.city || '',
                state: user.permanentAddress?.state || '',
                zip: user.permanentAddress?.zip || '',
                country: user.permanentAddress?.country || ''
            },

            // Banking & Tax Information
            bankAccountNumber: user.bankAccountNumber || '',
            ifscSwiftRoutingCode: user.ifscSwiftRoutingCode || '',
            taxId: user.taxId || '',

            // Emergency Contact
            emergencyContact: {
                name: user.emergencyContact?.name || '',
                relation: user.emergencyContact?.relation || '',
                phone: user.emergencyContact?.phone || ''
            },

            // Leave Information
            leaveBalance: {
                annual: user.leaveBalance?.annual || 0,
                sick: user.leaveBalance?.sick || 0,
                personal: user.leaveBalance?.personal || 0,
                maternity: user.leaveBalance?.maternity || 0,
                paternity: user.leaveBalance?.paternity || 0
            },

            // Compliance Information
            compliance: {
                ndaSigned: user.compliance?.ndaSigned || false,
                pfOrSocialSecurityConsent: user.compliance?.pfOrSocialSecurityConsent || false,
                offerLetter: user.compliance?.offerLetter || ''
            },

            // Onboarding Information
            onboardingStatus: user.onboardingStatus || '',
            onboardingRemarks: user.onboardingRemarks || ''
        });
        setShowEditModal(true);
    };

    const handleEditFormChange = (field, value, subField = null) => {
        setEditFormData(prev => {
            if (subField) {
                return {
                    ...prev,
                    [field]: {
                        ...prev[field],
                        [subField]: value
                    }
                };
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleEditSubmit = async () => {
        if (!selectedUser) return;

        try {
            const updateData = {};

            // Flatten nested objects for comparison and submission
            const flattenData = (obj, prefix = '') => {
                const result = {};
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    const newKey = prefix ? `${prefix}.${key}` : key;

                    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                        Object.assign(result, flattenData(value, newKey));
                    } else {
                        result[newKey] = value;
                    }
                });
                return result;
            };

            // Compare with original data
            const originalFlattened = flattenData(selectedUser);
            const newFlattened = flattenData(editFormData);

            // Only include changed fields
            Object.keys(newFlattened).forEach(key => {
                if (newFlattened[key] !== originalFlattened[key]) {
                    updateData[key] = newFlattened[key];
                }
            });

            if (Object.keys(updateData).length === 0) {
                toast.info('No changes to save');
                return;
            }

            await userService.updateUser(selectedUser._id, updateData);
            toast.success('User updated successfully');
            setShowEditModal(false);
            setSelectedUser(null);
            setEditFormData({});
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update user');
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACTIVE':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Active
                    </span>
                );
            case 'INACTIVE':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Inactive
                    </span>
                );
            case 'DRAFT':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Draft
                    </span>
                );
            case 'DELETED':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Deleted
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                        Unknown
                    </span>
                );
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
        <div className="w-full max-w-full overflow-hidden">
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
                        <button
                            onClick={handleCreateAdmin}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Change Role
                        </button>
                    </div>
                )}
            </div>


            {/* Pending Onboardings Section */}
            {(isAdmin || isHR) && (
                <div className="mt-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                        <div className="px-6 py-4 border-b border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                        <ClockIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Pending Onboarding Requests
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {pendingOnboardings.length === 0
                                                ? 'No pending requests'
                                                : `${pendingOnboardings.length} request${pendingOnboardings.length > 1 ? 's' : ''} awaiting review`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowOnboardingSection(!showOnboardingSection)}
                                    className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    {showOnboardingSection ? (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            Hide Details
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            Show Details
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {showOnboardingSection && (
                            <div className="p-6">
                                {onboardingLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="flex items-center space-x-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="text-gray-600 font-medium">Loading onboarding requests...</span>
                                        </div>
                                    </div>
                                ) : pendingOnboardings.length > 0 ? (
                                    <div className="space-y-4">
                                        {pendingOnboardings.map((user) => (
                                            <div key={user._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <img
                                                                className="h-14 w-14 rounded-full ring-4 ring-blue-50"
                                                                src={`https://ui-avatars.com/api/?name=${getDisplayName(user)}&background=3b82f6&color=fff&size=64&bold=true`}
                                                                alt={getDisplayName(user)}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <h4 className="text-lg font-semibold text-gray-900 truncate">
                                                                    {getDisplayName(user)}
                                                                </h4>
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    Pending Review
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                                    </svg>
                                                                    {user.personalEmail}
                                                                </div>
                                                                <div className="flex items-center text-sm text-gray-600">
                                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    Submitted: {new Date(user.onboardingSubmittedAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                                {user.reportingManagerName && (
                                                                    <div className="flex items-center text-sm text-gray-600">
                                                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                        </svg>
                                                                        Reporting Manager: {user.reportingManagerName}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 ml-4">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPendingUser(user);
                                                                setShowPendingDetailsModal(true);
                                                            }}
                                                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                                        >
                                                            <EyeIcon className="h-4 w-4 mr-2" />
                                                            View Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveOnboarding(user._id)}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                                                        >
                                                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectOnboarding(user._id)}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm"
                                                        >
                                                            <XCircleIcon className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                                        <p className="text-gray-600 max-w-sm mx-auto">
                                            There are no pending onboarding requests at this time. New requests will appear here when employees submit their onboarding forms.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="DRAFT">Draft</option>
                    <option value="DELETED">Deleted</option>
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
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">Users List</h3>
                    <p className="text-sm text-gray-500">Scroll horizontally to see all columns</p>
                </div>
                <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
                    <div className="inline-block min-w-full py-2 align-middle">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300" style={{ minWidth: '1200px' }}>
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-48">Name</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-64">Email</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-24">Role</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32">Employee ID</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-24">Status</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32">Onboarding</th>
                                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-32">Created</th>
                                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6 w-40">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4">
                                                <div className="inline-flex items-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                                                    <span className="ml-2">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4 text-gray-500">
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
                                                <td className="px-3 py-4 text-sm text-gray-500">
                                                    <div className="max-w-xs truncate" title={user.email}>
                                                        {user.email}
                                                    </div>
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
                                                    {getStatusBadge(user.status)}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {user.onboardingStatus ? getOnboardingStatusBadge(user.onboardingStatus) : 'N/A'}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <button
                                                            onClick={() => handleViewUser(user)}
                                                            className="text-primary-600 hover:text-primary-900"
                                                            title="View Details"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </button>
                                                        {(isAdmin || isHR) && (
                                                            <button
                                                                onClick={() => handleEditUser(user)}
                                                                className="text-primary-600 hover:text-primary-900"
                                                                title="Edit User"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleToggleStatus(user._id)}
                                                            className="text-primary-600 hover:text-primary-900"
                                                            title={user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleResetPassword(user._id)}
                                                            className="text-primary-600 hover:text-primary-900"
                                                            title="Reset Password"
                                                        >
                                                            <LockClosedIcon className="h-4 w-4" />
                                                        </button>
                                                        {isAdmin && user._id !== user?.id && (
                                                            <button
                                                                onClick={() => handleRoleChange(user)}
                                                                className="text-primary-600 hover:text-primary-900"
                                                                title="Change Role"
                                                            >
                                                                <ShieldCheckIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
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

            {/* Role Change Modal */}
            {showRoleChangeModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
                                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                                Change User Role
                            </h3>
                            <div className="mb-6">
                                <div className="text-center mb-4">
                                    <img
                                        className="h-16 w-16 rounded-full mx-auto mb-2"
                                        src={`https://ui-avatars.com/api/?name=${getDisplayName(selectedUser)}&background=3b82f6&color=fff&size=64&bold=true`}
                                        alt={getDisplayName(selectedUser)}
                                    />
                                    <h4 className="text-lg font-semibold text-gray-900">{getDisplayName(selectedUser)}</h4>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                                    <p className="text-xs text-gray-400">
                                        Current Role: <span className="font-medium">{selectedUser.role}</span>
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select New Role
                                    </label>
                                    <select
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="HR">HR</option>
                                        {selectedUser.role !== 'ADMIN' && <option value="ADMIN">Admin</option>}
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowRoleChangeModal(false);
                                        setSelectedUser(null);
                                        setNewRole('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmRoleChange}
                                    className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Change Role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {showViewModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedUser(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Personal Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedUser.fullName?.first || 'N/A'} {selectedUser.fullName?.middle || ''} {selectedUser.fullName?.last || ''}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Gender</label>
                                        <p className="text-sm text-gray-900 capitalize">{selectedUser.gender || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Work Email</label>
                                        <p className="text-sm text-gray-900">{selectedUser.email || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Personal Email</label>
                                        <p className="text-sm text-gray-900">{selectedUser.personalEmail || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Mobile Number</label>
                                        <p className="text-sm text-gray-900">{selectedUser.mobileNumber || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Work Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Work Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                                        <p className="text-sm text-gray-900">{selectedUser.employeeId || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Role</label>
                                        <div className="mt-1">
                                            {getRoleBadgeColor(selectedUser.role) && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                                                    {selectedUser.role}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">
                                            {getStatusBadge(selectedUser.status)}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Department</label>
                                        <p className="text-sm text-gray-900">{selectedUser.department || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Job Title</label>
                                        <p className="text-sm text-gray-900">{selectedUser.jobTitle || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Employment Type</label>
                                        <p className="text-sm text-gray-900">{selectedUser.employmentType || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Joining Date</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedUser.joiningDate ? new Date(selectedUser.joiningDate).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Reporting Manager</label>
                                        <p className="text-sm text-gray-900">{selectedUser.reportingManagerName || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            {(selectedUser.currentAddress?.line1 || selectedUser.permanentAddress?.line1) && (
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Address Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {selectedUser.currentAddress?.line1 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Current Address</label>
                                                <div className="text-sm text-gray-900">
                                                    <p>{selectedUser.currentAddress.line1}</p>
                                                    {selectedUser.currentAddress.line2 && <p>{selectedUser.currentAddress.line2}</p>}
                                                    <p>{selectedUser.currentAddress.city}, {selectedUser.currentAddress.state}</p>
                                                    <p>{selectedUser.currentAddress.zip} {selectedUser.currentAddress.country}</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedUser.permanentAddress?.line1 && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-2">Permanent Address</label>
                                                <div className="text-sm text-gray-900">
                                                    <p>{selectedUser.permanentAddress.line1}</p>
                                                    {selectedUser.permanentAddress.line2 && <p>{selectedUser.permanentAddress.line2}</p>}
                                                    <p>{selectedUser.permanentAddress.city}, {selectedUser.permanentAddress.state}</p>
                                                    <p>{selectedUser.permanentAddress.zip} {selectedUser.permanentAddress.country}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Banking & Tax Information */}
                            {(selectedUser.bankAccountNumber || selectedUser.ifscSwiftRoutingCode || selectedUser.taxId) && (
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Banking & Tax Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Bank Account Number</label>
                                            <p className="text-sm text-gray-900">{selectedUser.bankAccountNumber || 'N/A'}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">IFSC/SWIFT Code</label>
                                            <p className="text-sm text-gray-900">{selectedUser.ifscSwiftRoutingCode || 'N/A'}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Tax ID</label>
                                            <p className="text-sm text-gray-900">{selectedUser.taxId || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Emergency Contact */}
                            {selectedUser.emergencyContact?.name && (
                                <div>
                                    <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Emergency Contact</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Name</label>
                                            <p className="text-sm text-gray-900">{selectedUser.emergencyContact.name}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Relation</label>
                                            <p className="text-sm text-gray-900">{selectedUser.emergencyContact.relation}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-sm text-gray-900">{selectedUser.emergencyContact.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Leave Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Leave Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Leave Balance</label>
                                        <div className="text-sm text-gray-900">
                                            <p>Annual: {selectedUser.leaveBalance?.annual || 0} days</p>
                                            <p>Sick: {selectedUser.leaveBalance?.sick || 0} days</p>
                                            <p>Personal: {selectedUser.leaveBalance?.personal || 0} days</p>
                                            <p>Maternity: {selectedUser.leaveBalance?.maternity || 0} days</p>
                                            <p>Paternity: {selectedUser.leaveBalance?.paternity || 0} days</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Leaves Taken</label>
                                        <div className="text-sm text-gray-900">
                                            <p>Annual: {selectedUser.leavesTaken?.annual || 0} days</p>
                                            <p>Sick: {selectedUser.leavesTaken?.sick || 0} days</p>
                                            <p>Personal: {selectedUser.leavesTaken?.personal || 0} days</p>
                                            <p>Maternity: {selectedUser.leavesTaken?.maternity || 0} days</p>
                                            <p>Paternity: {selectedUser.leavesTaken?.paternity || 0} days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Compliance Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">NDA Signed</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedUser.compliance?.ndaSigned ? 'Yes' : 'No'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">PF/Social Security Consent</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedUser.compliance?.pfOrSocialSecurityConsent ? 'Yes' : 'No'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Offer Letter</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedUser.compliance?.offerLetter ? 'Provided' : 'Not Provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* System Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">System Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Onboarding Status</label>
                                        <div className="mt-1">
                                            {selectedUser.onboardingStatus ? getOnboardingStatusBadge(selectedUser.onboardingStatus) : 'N/A'}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Account Status</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedUser.hasTemporaryPassword ? 'Temporary Password' : 'Regular Account'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Account Created</label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedUser.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                                        <p className="text-sm text-gray-900">
                                            {new Date(selectedUser.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {selectedUser.onboardingSubmittedAt && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Onboarding Submitted</label>
                                            <p className="text-sm text-gray-900">
                                                {new Date(selectedUser.onboardingSubmittedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {selectedUser.onboardingApprovedAt && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500">Onboarding Approved</label>
                                            <p className="text-sm text-gray-900">
                                                {new Date(selectedUser.onboardingApprovedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {selectedUser.onboardingRemarks && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-500">Onboarding Remarks</label>
                                            <p className="text-sm text-gray-900">{selectedUser.onboardingRemarks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedUser(null);
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedUser(null);
                                    setEditFormData({});
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-96 overflow-y-auto">
                            {/* Personal Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Personal Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                        <select
                                            value={editFormData.gender}
                                            onChange={(e) => handleEditFormChange('gender', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Personal Email</label>
                                        <input
                                            type="email"
                                            value={editFormData.personalEmail}
                                            onChange={(e) => handleEditFormChange('personalEmail', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter personal email"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                        <input
                                            type="tel"
                                            value={editFormData.mobileNumber}
                                            onChange={(e) => handleEditFormChange('mobileNumber', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter mobile number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={editFormData.dateOfBirth}
                                            onChange={(e) => handleEditFormChange('dateOfBirth', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Work Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Work Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                        <select
                                            value={editFormData.role}
                                            onChange={(e) => handleEditFormChange('role', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="HR">HR</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                        <select
                                            value={editFormData.status}
                                            onChange={(e) => handleEditFormChange('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="DRAFT">Draft</option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="DELETED">Deleted</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                        <select
                                            value={editFormData.department}
                                            onChange={(e) => handleEditFormChange('department', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                                        <input
                                            type="text"
                                            value={editFormData.jobTitle}
                                            onChange={(e) => handleEditFormChange('jobTitle', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter job title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                                        <select
                                            value={editFormData.employmentType}
                                            onChange={(e) => handleEditFormChange('employmentType', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                                        <input
                                            type="date"
                                            value={editFormData.joiningDate}
                                            onChange={(e) => handleEditFormChange('joiningDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Manager</label>
                                        <input
                                            type="text"
                                            value={editFormData.reportingManagerName}
                                            onChange={(e) => handleEditFormChange('reportingManagerName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter reporting manager name"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Address Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Current Address */}
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-600 mb-3">Current Address</h5>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editFormData.currentAddress?.line1 || ''}
                                                onChange={(e) => handleEditFormChange('currentAddress', e.target.value, 'line1')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Address Line 1"
                                            />
                                            <input
                                                type="text"
                                                value={editFormData.currentAddress?.line2 || ''}
                                                onChange={(e) => handleEditFormChange('currentAddress', e.target.value, 'line2')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Address Line 2"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={editFormData.currentAddress?.city || ''}
                                                    onChange={(e) => handleEditFormChange('currentAddress', e.target.value, 'city')}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="City"
                                                />
                                                <input
                                                    type="text"
                                                    value={editFormData.currentAddress?.state || ''}
                                                    onChange={(e) => handleEditFormChange('currentAddress', e.target.value, 'state')}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="State"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={editFormData.currentAddress?.zip || ''}
                                                    onChange={(e) => handleEditFormChange('currentAddress', e.target.value, 'zip')}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="ZIP Code"
                                                />
                                                <input
                                                    type="text"
                                                    value={editFormData.currentAddress?.country || ''}
                                                    onChange={(e) => handleEditFormChange('currentAddress', e.target.value, 'country')}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Country"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Permanent Address */}
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-600 mb-3">Permanent Address</h5>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editFormData.permanentAddress?.line1 || ''}
                                                onChange={(e) => handleEditFormChange('permanentAddress', e.target.value, 'line1')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Address Line 1"
                                            />
                                            <input
                                                type="text"
                                                value={editFormData.permanentAddress?.line2 || ''}
                                                onChange={(e) => handleEditFormChange('permanentAddress', e.target.value, 'line2')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Address Line 2"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={editFormData.permanentAddress?.city || ''}
                                                    onChange={(e) => handleEditFormChange('permanentAddress', e.target.value, 'city')}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="City"
                                                />
                                                <input
                                                    type="text"
                                                    value={editFormData.permanentAddress?.state || ''}
                                                    onChange={(e) => handleEditFormChange('permanentAddress', e.target.value, 'state')}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="State"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={editFormData.permanentAddress?.zip || ''}
                                                    onChange={(e) => handleEditFormChange('permanentAddress', e.target.value, 'zip')}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="ZIP Code"
                                                />
                                                <input
                                                    type="text"
                                                    value={editFormData.permanentAddress?.country || ''}
                                                    onChange={(e) => handleEditFormChange('permanentAddress', e.target.value, 'country')}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Country"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Banking & Tax Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Banking & Tax Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                                        <input
                                            type="text"
                                            value={editFormData.bankAccountNumber}
                                            onChange={(e) => handleEditFormChange('bankAccountNumber', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter bank account number"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">IFSC/SWIFT Code</label>
                                        <input
                                            type="text"
                                            value={editFormData.ifscSwiftRoutingCode}
                                            onChange={(e) => handleEditFormChange('ifscSwiftRoutingCode', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter IFSC/SWIFT code"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                                        <input
                                            type="text"
                                            value={editFormData.taxId}
                                            onChange={(e) => handleEditFormChange('taxId', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter tax ID"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Emergency Contact</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={editFormData.emergencyContact?.name || ''}
                                            onChange={(e) => handleEditFormChange('emergencyContact', e.target.value, 'name')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter emergency contact name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Relation</label>
                                        <input
                                            type="text"
                                            value={editFormData.emergencyContact?.relation || ''}
                                            onChange={(e) => handleEditFormChange('emergencyContact', e.target.value, 'relation')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter relation"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={editFormData.emergencyContact?.phone || ''}
                                            onChange={(e) => handleEditFormChange('emergencyContact', e.target.value, 'phone')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Leave Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Leave Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Leave Balance</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                value={editFormData.leaveBalance?.annual || 0}
                                                onChange={(e) => handleEditFormChange('leaveBalance', parseFloat(e.target.value) || 0, 'annual')}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Annual"
                                            />
                                            <input
                                                type="number"
                                                value={editFormData.leaveBalance?.sick || 0}
                                                onChange={(e) => handleEditFormChange('leaveBalance', parseFloat(e.target.value) || 0, 'sick')}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Sick"
                                            />
                                            <input
                                                type="number"
                                                value={editFormData.leaveBalance?.personal || 0}
                                                onChange={(e) => handleEditFormChange('leaveBalance', parseFloat(e.target.value) || 0, 'personal')}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Personal"
                                            />
                                            <input
                                                type="number"
                                                value={editFormData.leaveBalance?.maternity || 0}
                                                onChange={(e) => handleEditFormChange('leaveBalance', parseFloat(e.target.value) || 0, 'maternity')}
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Maternity"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Paternity Leave</label>
                                        <input
                                            type="number"
                                            value={editFormData.leaveBalance?.paternity || 0}
                                            onChange={(e) => handleEditFormChange('leaveBalance', parseFloat(e.target.value) || 0, 'paternity')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Paternity"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Compliance Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Compliance Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={editFormData.compliance?.ndaSigned || false}
                                            onChange={(e) => handleEditFormChange('compliance', e.target.checked, 'ndaSigned')}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="text-sm font-medium text-gray-700">NDA Signed</label>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={editFormData.compliance?.pfOrSocialSecurityConsent || false}
                                            onChange={(e) => handleEditFormChange('compliance', e.target.checked, 'pfOrSocialSecurityConsent')}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="text-sm font-medium text-gray-700">PF/Social Security Consent</label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Offer Letter</label>
                                        <input
                                            type="text"
                                            value={editFormData.compliance?.offerLetter || ''}
                                            onChange={(e) => handleEditFormChange('compliance', e.target.value, 'offerLetter')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter offer letter reference"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Onboarding Information */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-700 border-b pb-2 mb-4">Onboarding Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Onboarding Status</label>
                                        <select
                                            value={editFormData.onboardingStatus}
                                            onChange={(e) => handleEditFormChange('onboardingStatus', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="INVITED">Invited</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="SUBMITTED">Submitted</option>
                                            <option value="APPROVED">Approved</option>
                                            <option value="REJECTED">Rejected</option>
                                            <option value="COMPLETED">Completed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Onboarding Remarks</label>
                                        <input
                                            type="text"
                                            value={editFormData.onboardingRemarks}
                                            onChange={(e) => handleEditFormChange('onboardingRemarks', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter onboarding remarks"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedUser(null);
                                    setEditFormData({});
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Admin Modal */}
            {showCreateAdminModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Create Admin - Select Employee
                                </h3>
                                <button
                                    onClick={() => setShowCreateAdminModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                Select an employee to promote to admin role. Only employees with ACTIVE status can be promoted to admin.
                            </p>

                            <div className="max-h-96 overflow-y-auto">
                                <div className="grid grid-cols-1 gap-3">
                                    {users
                                        .filter(user => user.role === 'EMPLOYEE' && user.status === 'ACTIVE')
                                        .map(user => (
                                            <div
                                                key={user._id}
                                                onClick={() => handleSelectUserForAdmin(user)}
                                                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        className="h-12 w-12 rounded-full"
                                                        src={`https://ui-avatars.com/api/?name=${getDisplayName(user)}&background=3b82f6&color=fff&size=48&bold=true`}
                                                        alt={getDisplayName(user)}
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {getDisplayName(user)}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                {user.role}
                                                            </span>
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                {user.department || 'No Department'}
                                                            </span>
                                                            {user.jobTitle && (
                                                                <span className="text-xs text-gray-500">
                                                                    {user.jobTitle}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-gray-500">
                                                            {user.employeeId || 'No ID'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {users.filter(user => user.role === 'EMPLOYEE' && user.status === 'ACTIVE').length === 0 && (
                                    <div className="text-center py-8">
                                        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Employees</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            There are no active employees available to promote to admin.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowCreateAdminModal(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            {showApprovalModal && selectedUserForApproval && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Approve Onboarding</h3>
                                <button
                                    onClick={() => {
                                        setShowApprovalModal(false);
                                        setSelectedUserForApproval(null);
                                        setApprovalFormData({ officialEmail: '', comments: '' });
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Employee Information</h4>
                                <p className="text-sm text-blue-700">
                                    <strong>Name:</strong> {selectedUserForApproval.fullName?.first} {selectedUserForApproval.fullName?.last}<br />
                                    <strong>Personal Email:</strong> {selectedUserForApproval.personalEmail}<br />
                                    <strong>Mobile:</strong> {selectedUserForApproval.mobileNumber}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Official Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={approvalFormData.officialEmail}
                                        onChange={(e) => setApprovalFormData({
                                            ...approvalFormData,
                                            officialEmail: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="employee@company.com"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This will be the only email address the employee can use to log in.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Approval Comments (Optional)
                                    </label>
                                    <textarea
                                        value={approvalFormData.comments}
                                        onChange={(e) => setApprovalFormData({
                                            ...approvalFormData,
                                            comments: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Welcome to the team! Your onboarding has been approved."
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowApprovalModal(false);
                                        setSelectedUserForApproval(null);
                                        setApprovalFormData({ officialEmail: '', comments: '' });
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApprovalSubmit}
                                    disabled={!approvalFormData.officialEmail}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Approve & Send Credentials
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Details Modal */}
            {showPendingDetailsModal && selectedPendingUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-medium text-gray-900">Onboarding Request Details</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setShowPendingDetailsModal(false);
                                            handleEditPendingUser(selectedPendingUser);
                                        }}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowPendingDetailsModal(false);
                                            setSelectedPendingUser(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedPendingUser.fullName?.first} {selectedPendingUser.fullName?.middle} {selectedPendingUser.fullName?.last}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Personal Email</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.personalEmail || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.mobileNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedPendingUser.dateOfBirth ? new Date(selectedPendingUser.dateOfBirth).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Gender</label>
                                            <p className="text-sm text-gray-900 capitalize">{selectedPendingUser.gender || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Work Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Work Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Job Title</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.jobTitle || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Department</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.department || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Employment Type</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.employmentType || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Reporting Manager</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.reportingManagerName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Joining Date</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedPendingUser.joiningDate ? new Date(selectedPendingUser.joiningDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Current Address</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedPendingUser.currentAddress?.line1 || 'N/A'}
                                                {selectedPendingUser.currentAddress?.line2 && `, ${selectedPendingUser.currentAddress.line2}`}
                                                {selectedPendingUser.currentAddress?.city && `, ${selectedPendingUser.currentAddress.city}`}
                                                {selectedPendingUser.currentAddress?.state && `, ${selectedPendingUser.currentAddress.state}`}
                                                {selectedPendingUser.currentAddress?.zip && ` ${selectedPendingUser.currentAddress.zip}`}
                                                {selectedPendingUser.currentAddress?.country && `, ${selectedPendingUser.currentAddress.country}`}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Permanent Address</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedPendingUser.permanentAddress?.line1 || 'N/A'}
                                                {selectedPendingUser.permanentAddress?.line2 && `, ${selectedPendingUser.permanentAddress.line2}`}
                                                {selectedPendingUser.permanentAddress?.city && `, ${selectedPendingUser.permanentAddress.city}`}
                                                {selectedPendingUser.permanentAddress?.state && `, ${selectedPendingUser.permanentAddress.state}`}
                                                {selectedPendingUser.permanentAddress?.zip && ` ${selectedPendingUser.permanentAddress.zip}`}
                                                {selectedPendingUser.permanentAddress?.country && `, ${selectedPendingUser.permanentAddress.country}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Banking & Emergency Contact */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Banking & Emergency Contact</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Bank Account</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.bankAccountNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">IFSC/SWIFT Code</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.ifscSwiftRoutingCode || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Tax ID</label>
                                            <p className="text-sm text-gray-900">{selectedPendingUser.taxId || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Emergency Contact</label>
                                            <p className="text-sm text-gray-900">
                                                {selectedPendingUser.emergencyContact?.name || 'N/A'}
                                                {selectedPendingUser.emergencyContact?.relation && ` (${selectedPendingUser.emergencyContact.relation})`}
                                                {selectedPendingUser.emergencyContact?.phone && ` - ${selectedPendingUser.emergencyContact.phone}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance Information */}
                            <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Compliance Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">NDA Signed</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedPendingUser.compliance?.ndaSigned ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">PF/Social Security Consent</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedPendingUser.compliance?.pfOrSocialSecurityConsent ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Offer Letter</label>
                                        <p className="text-sm text-gray-900">{selectedPendingUser.compliance?.offerLetter || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Document Uploads */}
                            <div className="mt-6 bg-green-50 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Document Uploads</h4>
                                <div className="space-y-4">
                                    {/* Government ID */}
                                    {selectedPendingUser.documents?.governmentId && (
                                        <div className="bg-white rounded-lg p-3 border">
                                            <h5 className="text-md font-medium text-gray-800 mb-2">Government ID</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                                    <p className="text-sm text-gray-900">{selectedPendingUser.documents.governmentId.type || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Number</label>
                                                    <p className="text-sm text-gray-900">{selectedPendingUser.documents.governmentId.number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Document</label>
                                                    {selectedPendingUser.documents.governmentId.url ? (
                                                        <button
                                                            onClick={() => {
                                                                const link = document.createElement('a');
                                                                link.href = selectedPendingUser.documents.governmentId.url;
                                                                link.download = selectedPendingUser.documents.governmentId.filename || 'government-id-document';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                            className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                        >
                                                            Download Document
                                                        </button>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No document uploaded</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tax ID Proof */}
                                    {selectedPendingUser.documents?.taxIdProof && (
                                        <div className="bg-white rounded-lg p-3 border">
                                            <h5 className="text-md font-medium text-gray-800 mb-2">Tax ID Proof</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Type</label>
                                                    <p className="text-sm text-gray-900">{selectedPendingUser.documents.taxIdProof.type || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Number</label>
                                                    <p className="text-sm text-gray-900">{selectedPendingUser.documents.taxIdProof.number || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500">Document</label>
                                                    {selectedPendingUser.documents.taxIdProof.url ? (
                                                        <button
                                                            onClick={() => {
                                                                const link = document.createElement('a');
                                                                link.href = selectedPendingUser.documents.taxIdProof.url;
                                                                link.download = selectedPendingUser.documents.taxIdProof.filename || 'tax-id-proof-document';
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }}
                                                            className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                        >
                                                            Download Document
                                                        </button>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No document uploaded</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Educational Certificates */}
                                    {selectedPendingUser.documents?.educationalCertificates && selectedPendingUser.documents.educationalCertificates.length > 0 && (
                                        <div className="bg-white rounded-lg p-3 border">
                                            <h5 className="text-md font-medium text-gray-800 mb-2">Educational Certificates ({selectedPendingUser.documents.educationalCertificates.length})</h5>
                                            <div className="space-y-2">
                                                {selectedPendingUser.documents.educationalCertificates.map((cert, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                        <div className="flex-1">
                                                            <span className="text-sm text-gray-700">
                                                                Certificate {index + 1}
                                                                {cert.type && ` - ${cert.type}`}
                                                                {cert.institution && ` (${cert.institution})`}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            {cert.url ? (
                                                                <button
                                                                    onClick={() => {
                                                                        const link = document.createElement('a');
                                                                        link.href = cert.url;
                                                                        link.download = cert.filename || `educational-certificate-${index + 1}`;
                                                                        document.body.appendChild(link);
                                                                        link.click();
                                                                        document.body.removeChild(link);
                                                                    }}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                                >
                                                                    Download
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-500">No file</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Experience Letters */}
                                    {selectedPendingUser.documents?.experienceLetters && selectedPendingUser.documents.experienceLetters.length > 0 && (
                                        <div className="bg-white rounded-lg p-3 border">
                                            <h5 className="text-md font-medium text-gray-800 mb-2">Experience Letters ({selectedPendingUser.documents.experienceLetters.length})</h5>
                                            <div className="space-y-2">
                                                {selectedPendingUser.documents.experienceLetters.map((letter, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                        <div className="flex-1">
                                                            <span className="text-sm text-gray-700">
                                                                Letter {index + 1}
                                                                {letter.type && ` - ${letter.type}`}
                                                                {letter.company && ` (${letter.company})`}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            {letter.url ? (
                                                                <button
                                                                    onClick={() => {
                                                                        const link = document.createElement('a');
                                                                        link.href = letter.url;
                                                                        link.download = letter.filename || `experience-letter-${index + 1}`;
                                                                        document.body.appendChild(link);
                                                                        link.click();
                                                                        document.body.removeChild(link);
                                                                    }}
                                                                    className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                                >
                                                                    Download
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-500">No file</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No documents uploaded */}
                                    {(!selectedPendingUser.documents?.governmentId &&
                                        !selectedPendingUser.documents?.taxIdProof &&
                                        (!selectedPendingUser.documents?.educationalCertificates || selectedPendingUser.documents.educationalCertificates.length === 0) &&
                                        (!selectedPendingUser.documents?.experienceLetters || selectedPendingUser.documents.experienceLetters.length === 0)) && (
                                            <div className="bg-white rounded-lg p-3 border border-dashed border-gray-300">
                                                <p className="text-sm text-gray-500 text-center">No documents uploaded by employee</p>
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* Submission Details */}
                            <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Submission Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Submitted On</label>
                                        <p className="text-sm text-gray-900">
                                            {selectedPendingUser.onboardingSubmittedAt ? new Date(selectedPendingUser.onboardingSubmittedAt).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <p className="text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                {selectedPendingUser.onboardingStatus || 'PENDING'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowPendingDetailsModal(false);
                                        setSelectedPendingUser(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPendingDetailsModal(false);
                                        handleApproveOnboarding(selectedPendingUser._id);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Approve Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Pending Modal */}
            {showEditPendingModal && selectedPendingUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-5 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-medium text-gray-900">Edit Pending Onboarding Details</h3>
                                <button
                                    onClick={() => {
                                        setShowEditPendingModal(false);
                                        setSelectedPendingUser(null);
                                        setEditPendingFormData({});
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">First Name *</label>
                                                    <input
                                                        type="text"
                                                        value={editPendingFormData.fullName?.first || ''}
                                                        onChange={(e) => handleEditPendingFormChange('fullName', e.target.value, 'first')}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                                                    <input
                                                        type="text"
                                                        value={editPendingFormData.fullName?.middle || ''}
                                                        onChange={(e) => handleEditPendingFormChange('fullName', e.target.value, 'middle')}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                                    <input
                                                        type="text"
                                                        value={editPendingFormData.fullName?.last || ''}
                                                        onChange={(e) => handleEditPendingFormChange('fullName', e.target.value, 'last')}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Personal Email *</label>
                                                <input
                                                    type="email"
                                                    value={editPendingFormData.personalEmail || ''}
                                                    onChange={(e) => handleEditPendingFormChange('personalEmail', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                                                <input
                                                    type="tel"
                                                    value={editPendingFormData.mobileNumber || ''}
                                                    onChange={(e) => handleEditPendingFormChange('mobileNumber', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                                    <input
                                                        type="date"
                                                        value={editPendingFormData.dateOfBirth || ''}
                                                        onChange={(e) => handleEditPendingFormChange('dateOfBirth', e.target.value)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                                    <select
                                                        value={editPendingFormData.gender || ''}
                                                        onChange={(e) => handleEditPendingFormChange('gender', e.target.value)}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    >
                                                        <option value="">Select Gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Work Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Work Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                                                <input
                                                    type="text"
                                                    value={editPendingFormData.jobTitle || ''}
                                                    onChange={(e) => handleEditPendingFormChange('jobTitle', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                                <select
                                                    value={editPendingFormData.department || ''}
                                                    onChange={(e) => handleEditPendingFormChange('department', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                                                <select
                                                    value={editPendingFormData.employmentType || ''}
                                                    onChange={(e) => handleEditPendingFormChange('employmentType', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                                <label className="block text-sm font-medium text-gray-700">Reporting Manager</label>
                                                <input
                                                    type="text"
                                                    value={editPendingFormData.reportingManagerName || ''}
                                                    onChange={(e) => handleEditPendingFormChange('reportingManagerName', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                                                <input
                                                    type="date"
                                                    value={editPendingFormData.joiningDate || ''}
                                                    onChange={(e) => handleEditPendingFormChange('joiningDate', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Banking Information */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Banking Information</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                                                <input
                                                    type="text"
                                                    value={editPendingFormData.bankAccountNumber || ''}
                                                    onChange={(e) => handleEditPendingFormChange('bankAccountNumber', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">IFSC/SWIFT Code</label>
                                                <input
                                                    type="text"
                                                    value={editPendingFormData.ifscSwiftRoutingCode || ''}
                                                    onChange={(e) => handleEditPendingFormChange('ifscSwiftRoutingCode', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                                                <input
                                                    type="text"
                                                    value={editPendingFormData.taxId || ''}
                                                    onChange={(e) => handleEditPendingFormChange('taxId', e.target.value)}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                                                <input
                                                    type="text"
                                                    value={editPendingFormData.emergencyContact?.name || ''}
                                                    onChange={(e) => handleEditPendingFormChange('emergencyContact', e.target.value, 'name')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Relation</label>
                                                <input
                                                    type="text"
                                                    value={editPendingFormData.emergencyContact?.relation || ''}
                                                    onChange={(e) => handleEditPendingFormChange('emergencyContact', e.target.value, 'relation')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={editPendingFormData.emergencyContact?.phone || ''}
                                                    onChange={(e) => handleEditPendingFormChange('emergencyContact', e.target.value, 'phone')}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Compliance Information */}
                                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Compliance Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={editPendingFormData.compliance?.ndaSigned || false}
                                                onChange={(e) => handleEditPendingFormChange('compliance', e.target.checked, 'ndaSigned')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="text-sm font-medium text-gray-700">NDA Signed</label>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={editPendingFormData.compliance?.pfOrSocialSecurityConsent || false}
                                                onChange={(e) => handleEditPendingFormChange('compliance', e.target.checked, 'pfOrSocialSecurityConsent')}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="text-sm font-medium text-gray-700">PF/Social Security Consent</label>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Offer Letter Reference</label>
                                            <input
                                                type="text"
                                                value={editPendingFormData.compliance?.offerLetter || ''}
                                                onChange={(e) => handleEditPendingFormChange('compliance', e.target.value, 'offerLetter')}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Document Uploads */}
                                <div className="mt-6 bg-green-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Document Uploads</h4>
                                    <div className="space-y-4">
                                        {/* Government ID */}
                                        <div className="bg-white rounded-lg p-3 border">
                                            <h5 className="text-md font-medium text-gray-800 mb-3">Government ID</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                                    <select
                                                        value={editPendingFormData.documents?.governmentId?.type || ''}
                                                        onChange={(e) => handleEditPendingFormChange('documents', e.target.value, 'governmentId', 'type')}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                                    <label className="block text-sm font-medium text-gray-700">Number</label>
                                                    <input
                                                        type="text"
                                                        value={editPendingFormData.documents?.governmentId?.number || ''}
                                                        onChange={(e) => handleEditPendingFormChange('documents', e.target.value, 'governmentId', 'number')}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        placeholder="Enter ID number"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Document</label>
                                                    {editPendingFormData.documents?.governmentId?.url ? (
                                                        <div className="mt-1">
                                                            <button
                                                                onClick={() => {
                                                                    const link = document.createElement('a');
                                                                    link.href = editPendingFormData.documents.governmentId.url;
                                                                    link.download = editPendingFormData.documents.governmentId.filename || 'government-id-document';
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }}
                                                                className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                            >
                                                                Download Document
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 mt-1">No document uploaded</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tax ID Proof */}
                                        <div className="bg-white rounded-lg p-3 border">
                                            <h5 className="text-md font-medium text-gray-800 mb-3">Tax ID Proof</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                                    <select
                                                        value={editPendingFormData.documents?.taxIdProof?.type || ''}
                                                        onChange={(e) => handleEditPendingFormChange('documents', e.target.value, 'taxIdProof', 'type')}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                                    <label className="block text-sm font-medium text-gray-700">Number</label>
                                                    <input
                                                        type="text"
                                                        value={editPendingFormData.documents?.taxIdProof?.number || ''}
                                                        onChange={(e) => handleEditPendingFormChange('documents', e.target.value, 'taxIdProof', 'number')}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        placeholder="Enter Tax ID number"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Document</label>
                                                    {editPendingFormData.documents?.taxIdProof?.url ? (
                                                        <div className="mt-1">
                                                            <button
                                                                onClick={() => {
                                                                    const link = document.createElement('a');
                                                                    link.href = editPendingFormData.documents.taxIdProof.url;
                                                                    link.download = editPendingFormData.documents.taxIdProof.filename || 'tax-id-proof-document';
                                                                    document.body.appendChild(link);
                                                                    link.click();
                                                                    document.body.removeChild(link);
                                                                }}
                                                                className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                            >
                                                                Download Document
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 mt-1">No document uploaded</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Educational Certificates */}
                                        {editPendingFormData.documents?.educationalCertificates && editPendingFormData.documents.educationalCertificates.length > 0 && (
                                            <div className="bg-white rounded-lg p-3 border">
                                                <h5 className="text-md font-medium text-gray-800 mb-3">Educational Certificates ({editPendingFormData.documents.educationalCertificates.length})</h5>
                                                <div className="space-y-2">
                                                    {editPendingFormData.documents.educationalCertificates.map((cert, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                            <div className="flex-1">
                                                                <span className="text-sm text-gray-700">
                                                                    Certificate {index + 1}
                                                                    {cert.type && ` - ${cert.type}`}
                                                                    {cert.institution && ` (${cert.institution})`}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                {cert.url ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            const link = document.createElement('a');
                                                                            link.href = cert.url;
                                                                            link.download = cert.filename || `educational-certificate-${index + 1}`;
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            document.body.removeChild(link);
                                                                        }}
                                                                        className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                                    >
                                                                        Download
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-gray-500">No file</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Experience Letters */}
                                        {editPendingFormData.documents?.experienceLetters && editPendingFormData.documents.experienceLetters.length > 0 && (
                                            <div className="bg-white rounded-lg p-3 border">
                                                <h5 className="text-md font-medium text-gray-800 mb-3">Experience Letters ({editPendingFormData.documents.experienceLetters.length})</h5>
                                                <div className="space-y-2">
                                                    {editPendingFormData.documents.experienceLetters.map((letter, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                            <div className="flex-1">
                                                                <span className="text-sm text-gray-700">
                                                                    Letter {index + 1}
                                                                    {letter.type && ` - ${letter.type}`}
                                                                    {letter.company && ` (${letter.company})`}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                {letter.url ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            const link = document.createElement('a');
                                                                            link.href = letter.url;
                                                                            link.download = letter.filename || `experience-letter-${index + 1}`;
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            document.body.removeChild(link);
                                                                        }}
                                                                        className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                                                    >
                                                                        Download
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-gray-500">No file</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* No documents uploaded */}
                                        {(!editPendingFormData.documents?.governmentId &&
                                            !editPendingFormData.documents?.taxIdProof &&
                                            (!editPendingFormData.documents?.educationalCertificates || editPendingFormData.documents.educationalCertificates.length === 0) &&
                                            (!editPendingFormData.documents?.experienceLetters || editPendingFormData.documents.experienceLetters.length === 0)) && (
                                                <div className="bg-white rounded-lg p-3 border border-dashed border-gray-300">
                                                    <p className="text-sm text-gray-500 text-center">No documents uploaded by employee</p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowEditPendingModal(false);
                                        setSelectedPendingUser(null);
                                        setEditPendingFormData({});
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditPendingSubmit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Update Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default People;
