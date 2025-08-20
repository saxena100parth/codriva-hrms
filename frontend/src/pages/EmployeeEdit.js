import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { employeeService } from '../services/employeeService';

const EmployeeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        const loadEmployee = async () => {
            try {
                setLoading(true);
                const employee = await employeeService.getEmployeeById(id);

                // Full name
                setValue('fullName.first', employee.fullName?.first || '');
                setValue('fullName.middle', employee.fullName?.middle || '');
                setValue('fullName.last', employee.fullName?.last || '');

                // Contact
                setValue('personalEmail', employee.personalEmail || '');
                setValue('officialEmail', employee.officialEmail || '');
                setValue('mobileNumber', employee.mobileNumber || '');

                // Employment
                setValue('jobTitle', employee.jobTitle || '');
                setValue('department', employee.department || '');
                setValue('reportingManager', employee.reportingManager || '');
                setValue('employmentType', employee.employmentType || '');
                setValue('joiningDate', employee.joiningDate ? new Date(employee.joiningDate).toISOString().split('T')[0] : '');

                // Addresses
                setValue('currentAddress.line1', employee.currentAddress?.line1 || '');
                setValue('currentAddress.line2', employee.currentAddress?.line2 || '');
                setValue('currentAddress.city', employee.currentAddress?.city || '');
                setValue('currentAddress.state', employee.currentAddress?.state || '');
                setValue('currentAddress.zip', employee.currentAddress?.zip || '');
                setValue('currentAddress.country', employee.currentAddress?.country || '');

                setValue('permanentAddress.line1', employee.permanentAddress?.line1 || '');
                setValue('permanentAddress.line2', employee.permanentAddress?.line2 || '');
                setValue('permanentAddress.city', employee.permanentAddress?.city || '');
                setValue('permanentAddress.state', employee.permanentAddress?.state || '');
                setValue('permanentAddress.zip', employee.permanentAddress?.zip || '');
                setValue('permanentAddress.country', employee.permanentAddress?.country || '');
            } catch (error) {
                toast.error('Failed to load employee');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadEmployee();
    }, [id, setValue]);

    const onSubmit = async (data) => {
        try {
            setSaving(true);
            await employeeService.updateEmployee(id, data);
            toast.success('Employee updated successfully');
            navigate(`/employees/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update employee');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Edit Employee</h1>
                <div className="space-x-3">
                    <Link to={`/employees/${id}`} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">Cancel</Link>
                    <button form="editEmployeeForm" type="submit" disabled={saving} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <form id="editEmployeeForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white shadow rounded-lg p-6">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">First Name</label>
                            <input className="form-input" {...register('fullName.first', { required: 'First name is required' })} />
                            {errors.fullName?.first && <p className="mt-1 text-sm text-red-600">{errors.fullName.first.message}</p>}
                        </div>
                        <div>
                            <label className="form-label">Middle Name</label>
                            <input className="form-input" {...register('fullName.middle')} />
                        </div>
                        <div>
                            <label className="form-label">Last Name</label>
                            <input className="form-input" {...register('fullName.last', { required: 'Last name is required' })} />
                            {errors.fullName?.last && <p className="mt-1 text-sm text-red-600">{errors.fullName.last.message}</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">Personal Email</label>
                            <input type="email" className="form-input" {...register('personalEmail')} />
                        </div>
                        <div>
                            <label className="form-label">Official Email</label>
                            <input type="email" className="form-input" {...register('officialEmail')} />
                        </div>
                        <div>
                            <label className="form-label">Mobile Number</label>
                            <input className="form-input" {...register('mobileNumber')} />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Employment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="form-label">Job Title</label>
                            <input className="form-input" {...register('jobTitle')} />
                        </div>
                        <div>
                            <label className="form-label">Department</label>
                            <input className="form-input" {...register('department')} />
                        </div>
                        <div>
                            <label className="form-label">Employment Type</label>
                            <select className="form-select" {...register('employmentType')} defaultValue="">
                                <option value="">Select</option>
                                <option value="full-time">Full Time</option>
                                <option value="intern">Intern</option>
                                <option value="contractor">Contractor</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Reporting Manager</label>
                            <input className="form-input" {...register('reportingManager')} />
                        </div>
                        <div>
                            <label className="form-label">Joining Date</label>
                            <input type="date" className="form-input" {...register('joiningDate')} />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Current Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="form-label">Address Line 1</label>
                            <input className="form-input" {...register('currentAddress.line1')} />
                        </div>
                        <div>
                            <label className="form-label">Address Line 2</label>
                            <input className="form-input" {...register('currentAddress.line2')} />
                        </div>
                        <div>
                            <label className="form-label">City</label>
                            <input className="form-input" {...register('currentAddress.city')} />
                        </div>
                        <div>
                            <label className="form-label">State</label>
                            <input className="form-input" {...register('currentAddress.state')} />
                        </div>
                        <div>
                            <label className="form-label">ZIP</label>
                            <input className="form-input" {...register('currentAddress.zip')} />
                        </div>
                        <div>
                            <label className="form-label">Country</label>
                            <input className="form-input" {...register('currentAddress.country')} />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Permanent Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="form-label">Address Line 1</label>
                            <input className="form-input" {...register('permanentAddress.line1')} />
                        </div>
                        <div>
                            <label className="form-label">Address Line 2</label>
                            <input className="form-input" {...register('permanentAddress.line2')} />
                        </div>
                        <div>
                            <label className="form-label">City</label>
                            <input className="form-input" {...register('permanentAddress.city')} />
                        </div>
                        <div>
                            <label className="form-label">State</label>
                            <input className="form-input" {...register('permanentAddress.state')} />
                        </div>
                        <div>
                            <label className="form-label">ZIP</label>
                            <input className="form-input" {...register('permanentAddress.zip')} />
                        </div>
                        <div>
                            <label className="form-label">Country</label>
                            <input className="form-input" {...register('permanentAddress.country')} />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EmployeeEdit;


