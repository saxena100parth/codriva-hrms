import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ticketService from '../services/ticketService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    TicketIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ExclamationTriangleIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Tickets = () => {
    const { user, isEmployee, isHR, isAdmin } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [expandedTickets, setExpandedTickets] = useState([]);
    const [filter, setFilter] = useState('all');
    const [assignModal, setAssignModal] = useState({ show: false, ticket: null });
    const [assignTo, setAssignTo] = useState('');
    const [statusModal, setStatusModal] = useState({ show: false, ticket: null, newStatus: '', resolution: '' });

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            // Fetch all tickets and filter on frontend for better control
            const data = await ticketService.getTickets();
            setTickets(data.tickets || data);
        } catch (error) {
            toast.error('Failed to fetch tickets');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Filter tickets based on current filter
    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'all') return true;
        return ticket.status?.toLowerCase() === filter.toLowerCase();
    });

    const onSubmit = async (data) => {
        try {
            // Ensure priority is uppercase if provided, remove if empty
            if (data.priority && data.priority.trim() !== '') {
                data.priority = data.priority.toUpperCase();
            } else {
                delete data.priority; // Remove empty priority
            }

            // Ensure category is uppercase
            if (data.category) {
                data.category = data.category.toUpperCase();
            }

            await ticketService.createTicket(data);
            toast.success('Ticket created successfully');
            reset();
            setShowCreateForm(false);
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create ticket');
        }
    };

    const handleAssignTicket = async () => {
        if (!assignTo) {
            toast.error('Please select a user to assign to');
            return;
        }

        try {
            await ticketService.assignTicket(assignModal.ticket._id, assignTo);
            toast.success('Ticket assigned successfully');
            setAssignModal({ show: false, ticket: null });
            setAssignTo('');
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to assign ticket');
        }
    };

    const handleStatusUpdate = async () => {
        if (!statusModal.newStatus) {
            toast.error('Please select a status');
            return;
        }

        try {
            const updates = { status: statusModal.newStatus };

            // Add resolution if status is resolved or closed
            if ((statusModal.newStatus === 'RESOLVED' || statusModal.newStatus === 'CLOSED') && statusModal.resolution) {
                updates.resolution = statusModal.resolution;
            }

            await ticketService.updateTicketStatus(statusModal.ticket._id, updates);
            toast.success('Ticket status updated successfully');
            setStatusModal({ show: false, ticket: null, newStatus: '', resolution: '' });
            fetchTickets();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update ticket status');
        }
    };

    const toggleExpandTicket = (ticketId) => {
        setExpandedTickets(prev =>
            prev.includes(ticketId)
                ? prev.filter(id => id !== ticketId)
                : [...prev, ticketId]
        );
    };

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        Open
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        In Progress
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                        Resolved
                    </span>
                );
            case 'closed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircleIcon className="w-3 h-3 mr-1" />
                        Closed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="w-3 h-3 mr-1" />
                        Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        Urgent
                    </span>
                );
            case 'high':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        High
                    </span>
                );
            case 'medium':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        Medium
                    </span>
                );
            case 'low':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        Low
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

    return (
        <div className="w-full">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        {isEmployee ? 'Create and track your support tickets' : 'Manage and resolve support tickets'}
                    </p>
                </div>
                {isEmployee && (
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Create Ticket
                        </button>
                    </div>
                )}
            </div>

            {/* Create Ticket Form */}
            {showCreateForm && isEmployee && (
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Ticket</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    {...register('category', { required: 'Category is required' })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                    <option value="">Select category</option>
                                    <option value="IT">IT Support</option>
                                    <option value="HR">HR Support</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="ADMIN">Administrative</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Priority</label>
                                <select
                                    {...register('priority')}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                    <option value="">Select priority (optional)</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                                {errors.priority && (
                                    <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <input
                                type="text"
                                {...register('subject', { required: 'Subject is required' })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Brief description of the issue"
                            />
                            {errors.subject && (
                                <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                {...register('description', { required: 'Description is required' })}
                                rows={4}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Please provide detailed information about the issue..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(false);
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
                                {isSubmitting ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="mt-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { key: 'all', label: 'All Tickets', color: 'gray' },
                        { key: 'open', label: 'Open', color: 'yellow' },
                        { key: 'in_progress', label: 'In Progress', color: 'blue' },
                        { key: 'resolved', label: 'Resolved', color: 'green' },
                        { key: 'closed', label: 'Closed', color: 'gray' },
                        { key: 'cancelled', label: 'Cancelled', color: 'red' }
                    ].map(({ key, label, color }) => {
                        const count = key === 'all'
                            ? tickets.length
                            : tickets.filter(ticket => ticket.status?.toLowerCase() === key.toLowerCase()).length;

                        return (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${filter === key
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span>{label}</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${filter === key
                                    ? 'bg-primary-100 text-primary-800'
                                    : `bg-${color}-100 text-${color}-800`
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Filter Summary */}
            {filteredTickets.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-medium text-gray-900">{filteredTickets.length}</span> of <span className="font-medium text-gray-900">{tickets.length}</span> tickets
                            </div>
                            {filter !== 'all' && (
                                <div className="text-sm text-gray-500">
                                    Filtered by: <span className="font-medium capitalize">{filter.replace('_', ' ')}</span>
                                </div>
                            )}
                        </div>
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Tickets List */}
            <div className="mt-6">
                {loading ? (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                            <span className="ml-2">Loading...</span>
                        </div>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filter === 'all' ? 'No tickets found.' : `No ${filter} tickets.`}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {filteredTickets.map((ticket) => (
                                <li key={ticket._id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <TicketIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {ticket.subject}
                                                        <span className="ml-2 text-gray-500">#{ticket.ticketNumber}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {ticket.category} • {formatDate(ticket.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(ticket.status)}
                                                {getPriorityBadge(ticket.priority)}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); toggleExpandTicket(ticket._id); }}
                                                    className="relative z-10 text-gray-400 hover:text-gray-500"
                                                >
                                                    {expandedTickets.includes(ticket._id) ? (
                                                        <ChevronUpIcon className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {expandedTickets.includes(ticket._id) && (
                                            <div className="mt-4 border-t pt-4">
                                                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                                    <div>
                                                        <dt className="text-sm font-medium text-gray-500">Description</dt>
                                                        <dd className="mt-1 text-sm text-gray-900">{ticket.description}</dd>
                                                    </div>
                                                    {ticket.assignedTo && (
                                                        <div>
                                                            <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                                                            <dd className="mt-1 text-sm text-gray-900">{ticket.assignedTo.name}</dd>
                                                        </div>
                                                    )}
                                                    {ticket.resolution && (
                                                        <div className="sm:col-span-2">
                                                            <dt className="text-sm font-medium text-gray-500">Resolution</dt>
                                                            <dd className="mt-1 text-sm text-gray-900">{ticket.resolution}</dd>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <dt className="text-sm font-medium text-gray-500">Created By</dt>
                                                        <dd className="mt-1 text-sm text-gray-900">{ticket.user?.name || 'Unknown'}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                                        <dd className="mt-1 text-sm text-gray-900">{formatDate(ticket.updatedAt)}</dd>
                                                    </div>
                                                </dl>

                                                {/* Actions */}
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {/* Status Update Buttons */}
                                                    {(isHR || isAdmin) && (
                                                        <>
                                                            {ticket.status?.toLowerCase() === 'open' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setStatusModal({
                                                                            show: true,
                                                                            ticket,
                                                                            newStatus: 'IN_PROGRESS',
                                                                            resolution: ''
                                                                        });
                                                                    }}
                                                                    className="relative z-20 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    Start Work
                                                                </button>
                                                            )}

                                                            {ticket.status?.toLowerCase() === 'in_progress' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setStatusModal({
                                                                            show: true,
                                                                            ticket,
                                                                            newStatus: 'RESOLVED',
                                                                            resolution: ''
                                                                        });
                                                                    }}
                                                                    className="relative z-20 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                                                >
                                                                    Resolve
                                                                </button>
                                                            )}

                                                            {ticket.status?.toLowerCase() === 'resolved' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setStatusModal({
                                                                            show: true,
                                                                            ticket,
                                                                            newStatus: 'CLOSED',
                                                                            resolution: ticket.resolution || ''
                                                                        });
                                                                    }}
                                                                    className="relative z-20 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                                                                >
                                                                    Close
                                                                </button>
                                                            )}

                                                            {(ticket.status?.toLowerCase() === 'open' || ticket.status?.toLowerCase() === 'in_progress') && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setStatusModal({
                                                                            show: true,
                                                                            ticket,
                                                                            newStatus: 'CANCELLED',
                                                                            resolution: ''
                                                                        });
                                                                    }}
                                                                    className="relative z-20 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setStatusModal({
                                                                        show: true,
                                                                        ticket,
                                                                        newStatus: '',
                                                                        resolution: ticket.resolution || ''
                                                                    });
                                                                }}
                                                                className="relative z-20 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                            >
                                                                Update Status
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Assign Button */}
                                                    {ticket.status?.toLowerCase() === 'open' && (isHR || isAdmin) && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setAssignModal({ show: true, ticket }); }}
                                                            className="relative z-20 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                                        >
                                                            Assign
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

            {/* Assign Modal */}
            {assignModal.show && (
                <div className="fixed z-[9999] inset-0 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setAssignModal({ show: false, ticket: null })}></div>
                    <div className="relative bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-w-md transform transition-all z-[10000]">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <TicketIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Assign Ticket
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Assign ticket #{assignModal.ticket?.ticketNumber} to a team member
                                        </p>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Assign To
                                            </label>
                                            <select
                                                value={assignTo}
                                                onChange={(e) => setAssignTo(e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            >
                                                <option value="">Select team member</option>
                                                <option value="hr-team">HR Team</option>
                                                <option value="it-team">IT Team</option>
                                                <option value="finance-team">Finance Team</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={handleAssignTicket}
                                disabled={!assignTo}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign
                            </button>
                            <button
                                type="button"
                                onClick={() => setAssignModal({ show: false, ticket: null })}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {statusModal.show && (
                <div className="fixed z-[9999] inset-0 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setStatusModal({ show: false, ticket: null, newStatus: '', resolution: '' })}></div>
                    <div className="relative bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-w-md transform transition-all z-[10000]">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Update Ticket Status
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Update status for ticket #{statusModal.ticket?.ticketNumber}
                                        </p>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    New Status
                                                </label>
                                                <select
                                                    value={statusModal.newStatus}
                                                    onChange={(e) => setStatusModal(prev => ({ ...prev, newStatus: e.target.value }))}
                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                >
                                                    <option value="">Select status</option>
                                                    <option value="OPEN">Open</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="RESOLVED">Resolved</option>
                                                    <option value="CLOSED">Closed</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </div>

                                            {(statusModal.newStatus === 'RESOLVED' || statusModal.newStatus === 'CLOSED') && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Resolution Details
                                                    </label>
                                                    <textarea
                                                        value={statusModal.resolution}
                                                        onChange={(e) => setStatusModal(prev => ({ ...prev, resolution: e.target.value }))}
                                                        rows={3}
                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                        placeholder="Describe how the issue was resolved..."
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={handleStatusUpdate}
                                disabled={!statusModal.newStatus}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Update Status
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusModal({ show: false, ticket: null, newStatus: '', resolution: '' })}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;
