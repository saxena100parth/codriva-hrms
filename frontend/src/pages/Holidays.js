import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { holidayService } from '../services/holidayService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
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
  const [holidays, setHolidays] = useState([]);
  const [groupedHolidays, setGroupedHolidays] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm();

  useEffect(() => {
    fetchHolidays();
    fetchUpcomingHolidays();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const response = await holidayService.getHolidays({ year: selectedYear });
      setHolidays(response.data.holidays);
      setGroupedHolidays(response.data.groupedByMonth);
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
    <div>
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
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Holidays</h2>
          <div className="space-y-3">
            {upcomingHolidays.map((holiday) => (
              <div key={holiday._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(holiday.date)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getHolidayTypeBadge(holiday.type)}
                  {holiday.isOptional && (
                    <span className="text-xs text-gray-500">Optional</span>
                  )}
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
              <div key={month} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{month}</h3>
                <div className="space-y-3">
                  {monthHolidays.map((holiday) => (
                    <div key={holiday._id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{holiday.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(holiday.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        {holiday.description && (
                          <p className="text-xs text-gray-400 mt-1">{holiday.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        {getHolidayTypeBadge(holiday.type)}
                        {(isHR || isAdmin) && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(holiday)}
                              className="inline-flex items-center px-2 py-1 rounded text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="ml-1 text-xs font-medium">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(holiday._id)}
                              className="inline-flex items-center px-2 py-1 rounded text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span className="ml-1 text-xs font-medium">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Holiday Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-900">Holiday Summary for {selectedYear}</h3>
        <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Holidays</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{holidays.length}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">National</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">
              {holidays.filter(h => h.type === 'national').length}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Optional</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">
              {holidays.filter(h => h.isOptional).length}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Company</dt>
            <dd className="mt-1 text-3xl font-semibold text-purple-600">
              {holidays.filter(h => h.type === 'company').length}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Holidays;
