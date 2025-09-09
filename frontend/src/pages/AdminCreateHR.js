import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ArrowUpCircleIcon
} from '@heroicons/react/24/outline';

const AdminCreateHR = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [promoting, setPromoting] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Get only employees (not HR or admin)
      const response = await userService.getUsers({ role: 'EMPLOYEE' });
      setEmployees(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToHR = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to promote ${userName} to HR role?`)) {
      return;
    }

    try {
      setPromoting(userId);
              const result = await userService.changeUserRole(userId, 'HR');
      toast.success(result.message || 'Employee promoted to HR successfully!');
      navigate('/people');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to promote employee to HR');
    } finally {
      setPromoting(null);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Promote Employee to HR</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select an existing employee to promote to HR role with administrative privileges.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search employees by name, email, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No employees found' : 'No employees available'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'All employees have already been promoted or no employees exist.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Available Employees ({filteredEmployees.length})
            </h3>

            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={`https://ui-avatars.com/api/?name=${employee.name}&background=3b82f6&color=fff&size=64`}
                      alt={employee.name}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.email}
                      </div>
                      {employee.employeeId && (
                        <div className="text-xs text-gray-400">
                          ID: {employee.employeeId}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>

                    <button
                      onClick={() => handlePromoteToHR(employee._id, employee.name)}
                      disabled={promoting === employee._id || !employee.isActive}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {promoting === employee._id ? (
                        <>
                          <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Promoting...
                        </>
                      ) : (
                        <>
                          <ArrowUpCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                          Promote to HR
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/people')}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to People
        </button>
      </div>
    </div>
  );
};

export default AdminCreateHR;