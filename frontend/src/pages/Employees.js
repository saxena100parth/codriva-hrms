import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  FunnelIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';

const Employees = () => {
  const formatFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'object') return '';
    return [fullName.first, fullName.middle, fullName.last]
      .filter(Boolean)
      .join(' ')
      .trim();
  };
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(departmentFilter && { department: departmentFilter }),
        ...(statusFilter && { status: statusFilter })
      };

      const response = await employeeService.getEmployees(params);
      setEmployees(response.data.employees);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchEmployees();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge badge-success">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Onboarded
          </span>
        );
      case 'submitted':
        return (
          <span className="badge badge-warning">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending Review
          </span>
        );
      case 'pending':
        return (
          <span className="badge badge-warning">
            <ClockIcon className="w-3 h-3 mr-1" />
            Invited
          </span>
        );
      case 'rejected':
        return (
          <span className="badge badge-danger">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return <span className="badge">Unknown</span>;
    }
  };

  // Employee Card Component for mobile/card view
  const EmployeeCard = ({ employee }) => {
    const displayName = formatFullName(employee.fullName) || employee.name;
    return (
      <div className="card shadow-hover bg-white p-6 transition-all duration-200">
        <div className="flex items-start space-x-4">
          <img
            className="h-12 w-12 rounded-full ring-2 ring-gray-200"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Employee')}&background=3b82f6&color=fff&bold=true`}
            alt={displayName}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {displayName}
              </h3>
              {getStatusBadge(employee.onboardingStatus)}
            </div>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-gray-500">{employee.jobTitle || 'Not specified'}</p>
              <p className="text-sm text-gray-500">{employee.department || 'Not specified'}</p>
              <p className="text-sm text-gray-500">{employee.officialEmail || employee.email}</p>
              {employee.employeeId && (
                <p className="text-xs text-gray-400">ID: {employee.employeeId}</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                to={`/employees/${employee._id}`}
                className="btn btn-primary text-sm py-1 px-3"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's employees
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {/* View Toggle */}
          <div className="hidden sm:flex rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${viewMode === 'cards'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <ViewColumnsIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <ViewColumnsIcon className="h-4 w-4 rotate-90" />
            </button>
          </div>

          <Link
            to="/hr/invite"
            className="btn btn-primary inline-flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Invite Employee</span>
            <span className="sm:hidden">Invite</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
                placeholder="Search employees..."
              />
            </div>
          </form>

          {/* Filter Toggle for Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary sm:hidden"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>

          {/* Filters */}
          <div className={`flex flex-col sm:flex-row gap-4 ${showFilters ? 'block' : 'hidden sm:flex'}`}>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="form-select"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="approved">Onboarded</option>
              <option value="submitted">Pending Review</option>
              <option value="pending">Invited</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {employees.length} of {pagination.total} employees
          </span>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Card View - Default for mobile, optional for desktop */}
          <div className={`${viewMode === 'table' ? 'hidden lg:hidden' : 'block'}`}>
            {employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                  <EmployeeCard key={employee._id} employee={employee} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || departmentFilter || statusFilter
                    ? 'Try adjusting your search criteria'
                    : 'Start by inviting your first employee'
                  }
                </p>
                <Link to="/hr/invite" className="btn btn-primary">
                  Invite Employee
                </Link>
              </div>
            )}
          </div>

          {/* Table View - Desktop only when selected */}
          <div className={`${viewMode === 'table' ? 'hidden lg:block' : 'hidden'}`}>
            <div className="card bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50">
                        {(() => { /* normalize name once per row */ })()}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent((formatFullName(employee.fullName) || employee.name || 'Employee'))}&background=3b82f6&color=fff&bold=true`}
                              alt=""
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatFullName(employee.fullName) || employee.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.officialEmail || employee.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.jobTitle || 'Not specified'}</div>
                          {employee.employeeId && (
                            <div className="text-sm text-gray-500">ID: {employee.employeeId}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.department || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(employee.onboardingStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/employees/${employee._id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && employees.length > 0 && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page <= 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(page =>
                page === 1 ||
                page === pagination.pages ||
                Math.abs(page - pagination.page) <= 1
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] < page - 1 && (
                    <span className="text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`px-3 py-2 text-sm rounded-md ${page === pagination.page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))
            }
          </div>

          <button
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page >= pagination.pages}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Employees;