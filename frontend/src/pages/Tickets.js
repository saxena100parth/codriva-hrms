import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import { userService } from '../services/userService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  TicketIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const Tickets = () => {
  const { isEmployee, isHR, isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [hrUsers, setHrUsers] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [comment, setComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    fetchTickets();
    if (isHR || isAdmin) {
      fetchHRUsers();
    }
  }, [filter]); // fetchTickets and fetchHRUsers are stable, isHR/isAdmin checked inside

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await ticketService.getTickets(params);
      setTickets(response.data.tickets);
    } catch (error) {
      toast.error('Failed to fetch tickets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHRUsers = async () => {
    try {
      const response = await userService.getHRUsers();
      setHrUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch HR users:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      await ticketService.createTicket(data);
      toast.success('Ticket created successfully');
      reset();
      setShowCreateForm(false);
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create ticket');
    }
  };

  const handleAssignTicket = async (ticketId, assignTo) => {
    try {
      await ticketService.assignTicket(ticketId, assignTo);
      toast.success('Ticket assigned successfully');
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign ticket');
    }
  };

  const handleUpdateStatus = async (ticketId, status, resolution = '') => {
    try {
      await ticketService.updateTicket(ticketId, { status, resolution });
      toast.success('Ticket status updated successfully');
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update ticket');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await ticketService.addComment(selectedTicket._id, comment, isInternalComment);
      toast.success('Comment added successfully');
      setComment('');
      setIsInternalComment(false);
      setShowCommentModal(false);
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add comment');
    }
  };

  const handleAddRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await ticketService.addRating(selectedTicket._id, rating, feedback);
      toast.success('Rating submitted successfully');
      setRating(0);
      setFeedback('');
      setShowRatingModal(false);
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit rating');
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
    const statusConfig = {
      open: { icon: ClockIcon, class: 'bg-yellow-100 text-yellow-800', text: 'Open' },
      'in-progress': { icon: ClockIcon, class: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      resolved: { icon: CheckCircleIcon, class: 'bg-green-100 text-green-800', text: 'Resolved' },
      closed: { icon: CheckCircleIcon, class: 'bg-gray-100 text-gray-800', text: 'Closed' },
      cancelled: { icon: XCircleIcon, class: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.open;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${priorityConfig[priority]}`}>
        {priority}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Support Tickets</h1>
          <p className="mt-2 text-sm text-gray-700">
            {isEmployee ? 'Raise and track your support tickets' : 'Manage and respond to support tickets'}
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
                  <option value="HR">HR Related</option>
                  <option value="Finance">Finance</option>
                  <option value="Admin">Administration</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  {...register('priority')}
                  defaultValue="medium"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                {...register('subject', {
                  required: 'Subject is required',
                  maxLength: { value: 100, message: 'Subject cannot exceed 100 characters' }
                })}
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
                placeholder="Provide detailed information about your issue..."
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
          {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize ${filter === status
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      {/* Tickets List */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-2">Loading...</span>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' ? 'No tickets have been created yet.' : `No ${filter} tickets.`}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <li key={ticket._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <TicketIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.subject}
                                <span className="ml-2 text-xs text-gray-500">#{ticket.ticketNumber}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {ticket.category} • Created {formatDate(ticket.createdAt)}
                                {(isHR || isAdmin) && ticket.employee && (
                                  <span> • By {ticket.employee.fullName?.first} {ticket.employee.fullName?.last}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(ticket.priority)}
                              {getStatusBadge(ticket.status)}
                              <button
                                onClick={() => toggleExpandTicket(ticket._id)}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                {expandedTickets.includes(ticket._id) ? (
                                  <ChevronUpIcon className="h-5 w-5" />
                                ) : (
                                  <ChevronDownIcon className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedTickets.includes(ticket._id) && (
                      <div className="mt-4 border-t pt-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Description</h4>
                            <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
                          </div>

                          {ticket.assignedTo && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Assigned To</h4>
                              <p className="mt-1 text-sm text-gray-600">{ticket.assignedTo.name}</p>
                            </div>
                          )}

                          {ticket.resolution && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Resolution</h4>
                              <p className="mt-1 text-sm text-gray-600">{ticket.resolution}</p>
                            </div>
                          )}

                          {ticket.rating && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Rating</h4>
                              <div className="mt-1 flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIconSolid
                                    key={star}
                                    className={`h-5 w-5 ${star <= ticket.rating ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                  />
                                ))}
                                {ticket.feedback && (
                                  <p className="ml-2 text-sm text-gray-600">{ticket.feedback}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Comments */}
                          {ticket.comments && ticket.comments.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Comments</h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {ticket.comments.map((comment, idx) => (
                                  <div key={idx} className={`text-sm ${comment.isInternal ? 'bg-yellow-50 p-2 rounded' : ''}`}>
                                    <span className="font-medium text-gray-900">{comment.user.name}</span>
                                    {comment.isInternal && <span className="ml-2 text-xs text-yellow-600">(Internal)</span>}
                                    <span className="text-gray-500 text-xs ml-2">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                    <p className="text-gray-600 mt-1">{comment.comment}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowCommentModal(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                              Add Comment
                            </button>

                            {(isHR || isAdmin) && ticket.status === 'open' && (
                              <select
                                onChange={(e) => handleAssignTicket(ticket._id, e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                defaultValue=""
                              >
                                <option value="" disabled>Assign to...</option>
                                {hrUsers.map((hrUser) => (
                                  <option key={hrUser._id} value={hrUser._id}>
                                    {hrUser.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            {(isHR || isAdmin) && ['open', 'in-progress'].includes(ticket.status) && (
                              <>
                                {ticket.status === 'open' && (
                                  <button
                                    onClick={() => handleUpdateStatus(ticket._id, 'in-progress')}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                  >
                                    Start Working
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const resolution = prompt('Please provide resolution details:');
                                    if (resolution) {
                                      handleUpdateStatus(ticket._id, 'resolved', resolution);
                                    }
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                  Resolve
                                </button>
                              </>
                            )}

                            {isEmployee && ticket.status === 'resolved' && !ticket.rating && (
                              <button
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowRatingModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                              >
                                <StarIcon className="h-4 w-4 mr-1" />
                                Rate & Feedback
                              </button>
                            )}
                          </div>
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

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Add Comment
                </h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your comment..."
                />
                {(isHR || isAdmin) && (
                  <div className="mt-3">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={isInternalComment}
                        onChange={(e) => setIsInternalComment(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Internal comment (visible to HR/Admin only)</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Comment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCommentModal(false);
                    setComment('');
                    setIsInternalComment(false);
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

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Rate Your Experience
                </h3>
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      {star <= rating ? (
                        <StarIconSolid className="h-8 w-8 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Additional feedback (optional)..."
                />
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddRating}
                  disabled={rating === 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Rating
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRatingModal(false);
                    setRating(0);
                    setFeedback('');
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

export default Tickets;
