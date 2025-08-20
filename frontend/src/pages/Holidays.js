import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { holidayService } from '../services/holidayService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import usePersistentState from '../hooks/usePersistentState';
import {
  CalendarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Holidays = () => {
  const { isHR, isAdmin } = useAuth();
  const [holidays, setHolidays] = usePersistentState('holidays', []);
  const [groupedHolidays, setGroupedHolidays] = usePersistentState('groupedHolidays', {});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [selectedYear, setSelectedYear] = usePersistentState('selectedYear', new Date().getFullYear());
  const [upcomingHolidays, setUpcomingHolidays] = usePersistentState('upcomingHolidays', []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm();

  useEffect(() => {
    // Check if we have cached data that's less than 5 minutes old
    const lastFetch = localStorage.getItem(`holidays_lastFetch_${selectedYear}`);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (!lastFetch || (now - parseInt(lastFetch)) > fiveMinutes || holidays.length === 0) {
      fetchHolidays();
    } else {
      setLoading(false);
    }

    // Always fetch upcoming holidays if empty
    if (upcomingHolidays.length === 0) {
      fetchUpcomingHolidays();
    }
  }, [selectedYear, holidays.length, upcomingHolidays.length]); // fetchHolidays and fetchUpcomingHolidays are stable

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await holidayService.getHolidays({ year: selectedYear });
      setHolidays(response.data.holidays);
      setGroupedHolidays(response.data.groupedByMonth);
      // Cache the fetch timestamp
      localStorage.setItem(`holidays_lastFetch_${selectedYear}`, Date.now().toString());
    } catch (error) {
      toast.error('Failed to fetch holidays');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingHolidays = async () => {
    try {
      const response = await holidayService.getUpcomingHolidays(5);
      setUpcomingHolidays(response.data);
    } catch (error) {
      console.error('Failed to fetch upcoming holidays:', error);
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
      setShowAddForm(false);
      setEditingHoliday(null);
      fetchHolidays();
      fetchUpcomingHolidays();
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
    setValue('isOptional', holiday.isOptional);
    setValue('applicableFor', holiday.applicableFor);
    setShowAddForm(true);
  };

  const handleDelete = async (holidayId) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await holidayService.deleteHoliday(holidayId);
        toast.success('Holiday deleted successfully');
        fetchHolidays();
        fetchUpcomingHolidays();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete holiday');
      }
    }
  };

  const handleCopyFromYear = async () => {
    const fromYear = prompt(`Copy holidays from which year? (e.g., ${selectedYear - 1})`);
    if (fromYear && !isNaN(fromYear)) {
      try {
        await holidayService.copyHolidaysFromYear(parseInt(fromYear), selectedYear);
        toast.success(`Holidays copied from ${fromYear} to ${selectedYear}`);
        fetchHolidays();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to copy holidays');
      }
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

  const getHolidayTypeBadge = (type) => {
    const typeConfig = {
      national: 'bg-blue-100 text-blue-800',
      regional: 'bg-green-100 text-green-800',
      optional: 'bg-yellow-100 text-yellow-800',
      company: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${typeConfig[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Holidays</h1>
          <p className="mt-2 text-sm text-gray-700">
            View company holidays and time off schedule
          </p>
        </div>
        {(isHR || isAdmin) && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            <button
              onClick={handleCopyFromYear}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Copy from Year
            </button>
            <button
              onClick={() => {
                setEditingHoliday(null);
                reset();
                setShowAddForm(!showAddForm);
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Holiday
            </button>
          </div>
        )}
      </div>

      {/* Year Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setSelectedYear(selectedYear - 1)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">{selectedYear}</h2>
        <button
          onClick={() => setSelectedYear(selectedYear + 1)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Add/Edit Holiday Form */}
      {showAddForm && (isHR || isAdmin) && (
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
                  {...register('type')}
                  defaultValue="national"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="national">National Holiday</option>
                  <option value="regional">Regional Holiday</option>
                  <option value="optional">Optional Holiday</option>
                  <option value="company">Company Holiday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Applicable For</label>
                <select
                  {...register('applicableFor')}
                  multiple
                  defaultValue={['all']}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="all">All Employees</option>
                  <option value="full-time">Full Time Only</option>
                  <option value="intern">Interns Only</option>
                  <option value="contractor">Contractors Only</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                {...register('description')}
                rows={2}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Optional description..."
              />
            </div>

            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  {...register('isOptional')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">This is an optional holiday</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingHoliday(null);
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
                {isSubmitting ? 'Saving...' : (editingHoliday ? 'Update' : 'Create')} Holiday
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full mr-3">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Holidays</h2>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              {upcomingHolidays.length} holidays
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingHolidays.map((holiday) => (
              <div key={holiday._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{holiday.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{formatDate(holiday.date)}</p>
                    <div className="flex items-center space-x-2">
                      {getHolidayTypeBadge(holiday.type)}
                      {holiday.isOptional && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Optional</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {(() => {
                        const days = Math.ceil((new Date(holiday.date) - new Date()) / (1000 * 60 * 60 * 24));
                        return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holidays by Month */}
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
              No holidays have been added for {selectedYear}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
              <div key={month} className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                    <CalendarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{month}</h3>
                  <span className="ml-auto bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                    {monthHolidays.length} holidays
                  </span>
                </div>
                <div className="space-y-4">
                  {monthHolidays.map((holiday) => (
                    <div key={holiday._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{holiday.name}</h4>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          {holiday.description && (
                            <p className="text-xs text-gray-500 mb-2">{holiday.description}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            {getHolidayTypeBadge(holiday.type)}
                            {holiday.isOptional && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">Optional</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {(isHR || isAdmin) && (
                        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => handleEdit(holiday)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(holiday._id)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm text-red-600 bg-white border border-red-300 hover:bg-red-50 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Holiday Summary */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Holiday Summary for {selectedYear}</h3>
          <div className="text-sm text-gray-500">
            {holidays.length} total holidays
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-600 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <dt className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Holidays</dt>
            <dd className="mt-1 text-2xl font-bold text-blue-900">{holidays.length}</dd>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-600 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <dt className="text-xs font-medium text-green-700 uppercase tracking-wide">National</dt>
            <dd className="mt-1 text-2xl font-bold text-green-900">
              {holidays.filter(h => h.type === 'national').length}
            </dd>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 text-center border border-yellow-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-yellow-500 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <dt className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Optional</dt>
            <dd className="mt-1 text-2xl font-bold text-yellow-900">
              {holidays.filter(h => h.isOptional).length}
            </dd>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-600 rounded-full">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <dt className="text-xs font-medium text-purple-700 uppercase tracking-wide">Company</dt>
            <dd className="mt-1 text-2xl font-bold text-purple-900">
              {holidays.filter(h => h.type === 'company').length}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holidays;
