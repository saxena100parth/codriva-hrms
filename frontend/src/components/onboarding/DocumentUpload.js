import React, { useState } from 'react';
import { Card, Button, Input } from '../ui';
import { LoadingSpinner } from '../common';
import toast from 'react-hot-toast';

const DocumentUpload = ({ onDocumentsSubmitted, user }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: {
      first: user?.fullName?.first || '',
      last: user?.fullName?.last || ''
    },
    dateOfBirth: '',
    gender: '',
    currentAddress: {
      city: '',
      state: '',
      country: ''
    },
    joiningDate: '',
    employmentType: '',
    documents: {
      governmentId: {
        type: '',
        number: '',
        url: ''
      },
      educationalCertificates: [],
      experienceLetters: []
    }
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate document upload (in real app, you'd handle file uploads)
      await onDocumentsSubmitted(formData);
    } catch (error) {
      toast.error('Failed to submit documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p className="text-gray-600 mt-2">
          Please provide your details and upload required documents
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.fullName.first}
              onChange={(e) => handleInputChange('fullName.first', e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={formData.fullName.last}
              onChange={(e) => handleInputChange('fullName.last', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Current Address</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.currentAddress.city}
              onChange={(e) => handleInputChange('currentAddress.city', e.target.value)}
            />
            <Input
              label="State"
              value={formData.currentAddress.state}
              onChange={(e) => handleInputChange('currentAddress.state', e.target.value)}
            />
            <Input
              label="Country"
              value={formData.currentAddress.country}
              onChange={(e) => handleInputChange('currentAddress.country', e.target.value)}
            />
          </div>
        </div>

        {/* Employment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Joining Date"
              type="date"
              value={formData.joiningDate}
              onChange={(e) => handleInputChange('joiningDate', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                value={formData.employmentType}
                onChange={(e) => handleInputChange('employmentType', e.target.value)}
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
          </div>
        </div>

        {/* Document Upload Placeholder */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm">
                Document upload functionality will be implemented here
              </p>
              <p className="mt-1 text-xs text-gray-400">
                For now, you can proceed with the form submission
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Submit Documents'}
        </Button>
      </form>
    </Card>
  );
};

export default DocumentUpload;
