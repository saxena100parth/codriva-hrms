import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { employeeService } from '../services/employeeService';
import { userService } from '../services/userService';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getEmployeeById(id);
      setEmployee(data);
    } catch (error) {
      toast.error('Failed to fetch employee details');
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      await userService.updateUserStatus(id, newStatus);
      toast.success(`Employee status updated to ${newStatus}`);
      fetchEmployee(); // Refresh data
    } catch (error) {
      toast.error('Failed to update employee status');
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      await userService.deleteUser(id);
      toast.success('Employee deleted successfully');
      navigate('/employees');
    } catch (error) {
      toast.error('Failed to delete employee');
      console.error('Error deleting employee:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Employee Not Found</h2>
        <button
          onClick={() => navigate('/employees')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/employees')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Employees
          </button>
          <button
            onClick={() => navigate(`/employees/${id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Employee
          </button>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Status & Actions</h2>
          <div className="flex space-x-3">
            <select
              value={employee.status || 'active'}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              onClick={handleDelete}
              disabled={updating}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {updating ? 'Deleting...' : 'Delete Employee'}
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-gray-900">{
              typeof employee.fullName === 'object'
                ? [employee.fullName?.first, employee.fullName?.middle, employee.fullName?.last].filter(Boolean).join(' ')
                : (employee.fullName || 'Not provided')
            }</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <p className="text-gray-900">{employee.employeeId || 'Not assigned'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <p className="text-gray-900">{employee.officialEmail || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personal Email</label>
            <p className="text-gray-900">{employee.personalEmail || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <p className="text-gray-900">{employee.mobileNumber || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <p className="text-gray-900">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <p className="text-gray-900">{employee.gender || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="text-gray-900 capitalize">{employee.role || 'Not assigned'}</p>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <p className="text-gray-900">{employee.jobTitle || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <p className="text-gray-900">{employee.department || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
            <p className="text-gray-900">{employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
            <p className="text-gray-900">{employee.employmentType || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
            <p className="text-gray-900">{employee.reportingManager || 'Not assigned'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Status</label>
            <p className="text-gray-900">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.isOnboarded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {employee.isOnboarded ? 'Completed' : 'Pending'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
            <p className="text-gray-900">{employee.currentAddress || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
            <p className="text-gray-900">{employee.permanentAddress || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Banking & Tax Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Banking & Tax Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
            <p className="text-gray-900">{employee.bankAccountNumber || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC/SWIFT Code</label>
            <p className="text-gray-900">{employee.ifscSwiftRoutingCode || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
            <p className="text-gray-900">{employee.taxId || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
            <p className="text-gray-900">{employee.emergencyContact?.name || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
            <p className="text-gray-900">{employee.emergencyContact?.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Relationship</label>
            <p className="text-gray-900">{employee.emergencyContact?.relationship || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Government ID</label>
            <p className="text-gray-900">{employee.documents?.governmentId ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID Proof</label>
            <p className="text-gray-900">{employee.documents?.taxIdProof ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Educational Certificates</label>
            <p className="text-gray-900">{employee.documents?.educationalCertificates ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Letters</label>
            <p className="text-gray-900">{employee.documents?.experienceLetters ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
        </div>
      </div>

      {/* HR/Legal Compliance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">HR/Legal Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Letter</label>
            <p className="text-gray-900">{employee.compliance?.offerLetter ? 'Signed' : 'Not signed'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NDA Signed</label>
            <p className="text-gray-900">{employee.compliance?.ndaSigned ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PF/Social Security Consent</label>
            <p className="text-gray-900">{employee.compliance?.pfOrSocialSecurityConsent ? 'Given' : 'Not given'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
