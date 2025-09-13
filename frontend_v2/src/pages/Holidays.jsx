import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import holidayService from '../services/holidayService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
    CalendarIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const Holidays = () => {
    const { isAdmin, isHR } = useAuth();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm();

    useEffect(() => {
        fetchHolidays();
    }, [year]);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const data = await holidayService.getHolidays({ year });
            setHolidays(data.holidays || data);
        } catch (error) {
            toast.error('Failed to fetch holidays');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            if (editingHoliday) {
                await holidayService.updateHoliday(editingHoliday._id, data);
                toast.success('Holiday updated successfully');
            } else {
                await holidayService.createHoliday(data);
                toast.success('Holiday created successfully');
            }
            reset();
            setShowCreateForm(false);
            setEditingHoliday(null);
            fetchHolidays();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save holiday');
        }
    };

    const handleEdit = (holiday) => {
        setEditingHoliday(holiday);
        setValue('name', holiday.name);
        setValue('date', new Date(holiday.date).toISOString().split('T')[0]);
        setValue('type', holiday.type);
        setValue('description', holiday.description || '');
        setValue('isOptional', holiday.isOptional || false);
        setShowCreateForm(true);
    };

    const handleDelete = async (holidayId) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            try {
                await holidayService.deleteHoliday(holidayId);
                toast.success('Holiday deleted successfully');
                fetchHolidays();
            } catch (error) {
                toast.error(error.response?.data?.error || 'Failed to delete holiday');
            }
        }
    };

    const handleCancel = () => {
        setShowCreateForm(false);
        setEditingHoliday(null);
        reset();
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'national':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        National
                    </span>
                );
            case 'regional':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Regional
                    </span>
                );
            case 'company':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Company
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isPastHoliday = (date) => {
        return new Date(date) < new Date();
    };

    return (
        <div className="w-full">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Holiday Calendar</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage company holidays and calendar events
                    </p>
                </div>
                {(isAdmin || isHR) && (
                    <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
                        <select
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Add Holiday
                        </button>
                    </div>
                )}
            </div>

            {/* Create/Edit Holiday Form */}
            {showCreateForm && (isAdmin || isHR) && (
                <div className="mt-6 bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Holiday Name</label>
                                <input
                                    type="text"
                                    {...register('name', { required: 'Holiday name is required' })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="e.g., New Year's Day"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    {...register('date', { required: 'Date is required' })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                />
                                {errors.date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    {...register('type', { required: 'Type is required' })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                >
                                    <option value="">Select type</option>
                                    <option value="national">National Holiday</option>
                                    <option value="regional">Regional Holiday</option>
                                    <option value="company">Company Holiday</option>
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    {...register('isOptional')}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Optional Holiday
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Optional description of the holiday..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : (editingHoliday ? 'Update Holiday' : 'Add Holiday')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Holidays List */}
            <div className="mt-6">
                {loading ? (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                            <span className="ml-2">Loading...</span>
                        </div>
                    </div>
                ) : holidays.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No holidays found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            No holidays found for {year}.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {holidays.map((holiday) => (
                                <li key={holiday._id}>
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {holiday.name}
                                                        {holiday.isOptional && (
                                                            <span className="ml-2 text-xs text-gray-500">(Optional)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(holiday.date)}
                                                    </div>
                                                    {holiday.description && (
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {holiday.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getTypeBadge(holiday.type)}
                                                {isPastHoliday(holiday.date) ? (
                                                    <span className="inline-flex items-center text-gray-400">
                                                        <XCircleIcon className="h-5 w-5 mr-1" />
                                                        Past
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-green-600">
                                                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                                                        Upcoming
                                                    </span>
                                                )}
                                                {(isAdmin || isHR) && (
                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            onClick={() => handleEdit(holiday)}
                                                            className="text-primary-600 hover:text-primary-900"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(holiday._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Holidays;
