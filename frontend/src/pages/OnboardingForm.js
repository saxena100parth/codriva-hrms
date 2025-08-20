import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { employeeService } from '../services/employeeService';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  BriefcaseIcon,
  HomeIcon,
  CreditCardIcon,
  DocumentIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const OnboardingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const steps = [
    { id: 1, name: 'Personal Info', icon: UserCircleIcon },
    { id: 2, name: 'Address', icon: HomeIcon },
    { id: 3, name: 'Employment', icon: BriefcaseIcon },
    { id: 4, name: 'Banking', icon: CreditCardIcon },
    { id: 5, name: 'Documents', icon: DocumentIcon },
    { id: 6, name: 'Review', icon: CheckCircleIcon }
  ];

  const sameAsCurrent = watch('sameAsCurrent');

  useEffect(() => {
    // Check if already onboarded
    if (user?.isOnboarded) {
      navigate('/');
    }
  }, [user, navigate]);

  const onStepSubmit = (data) => {
    setFormData({ ...formData, ...data });

    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      submitOnboarding({ ...formData, ...data });
    }
  };

  const submitOnboarding = async (data) => {
    try {
      setSubmitting(true);

      // Format data for submission
      const formattedData = {
        fullName: {
          first: data.firstName,
          middle: data.middleName,
          last: data.lastName
        },
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        personalEmail: data.personalEmail,
        mobileNumber: data.mobileNumber,
        emergencyContact: {
          name: data.emergencyName,
          relation: data.emergencyRelation,
          phone: data.emergencyPhone
        },
        currentAddress: {
          line1: data.currentLine1,
          line2: data.currentLine2,
          city: data.currentCity,
          state: data.currentState,
          zip: data.currentZip,
          country: data.currentCountry
        },
        permanentAddress: data.sameAsCurrent ? {
          line1: data.currentLine1,
          line2: data.currentLine2,
          city: data.currentCity,
          state: data.currentState,
          zip: data.currentZip,
          country: data.currentCountry
        } : {
          line1: data.permanentLine1,
          line2: data.permanentLine2,
          city: data.permanentCity,
          state: data.permanentState,
          zip: data.permanentZip,
          country: data.permanentCountry
        },
        joiningDate: data.joiningDate,
        jobTitle: data.jobTitle,
        department: data.department,
        reportingManager: data.reportingManager,
        employmentType: data.employmentType,
        bankAccountNumber: data.bankAccountNumber,
        ifscSwiftRoutingCode: data.ifscSwiftRoutingCode,
        taxId: data.taxId
      };

      await employeeService.submitOnboarding(formattedData);
      toast.success('Onboarding details submitted successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit onboarding details');
    } finally {
      setSubmitting(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="gradient-primary rounded-lg p-6 sm:p-8 text-white mb-8 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold">Complete Your Onboarding</h1>
        <p className="mt-2 text-blue-100 text-sm sm:text-base">
          Please fill in all the required information to complete your onboarding process.
        </p>
        <div className="mt-4 text-sm">
          Step {currentStep} of {steps.length}
        </div>
      </div>

      {/* Progress Steps - Desktop */}
      <div className="hidden md:block mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className="relative flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${step.id < currentStep
                      ? 'bg-green-600 shadow-lg'
                      : step.id === currentStep
                        ? 'bg-primary-600 shadow-lg scale-110'
                        : 'bg-gray-300'
                      }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    ) : (
                      <step.icon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    {step.name}
                  </p>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-300 ${step.id < currentStep ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    style={{ transform: 'translateX(50%)', width: 'calc(100% - 2.5rem)' }}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Progress Steps - Mobile */}
      <div className="md:hidden mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-900">
            {steps[currentStep - 1]?.name}
          </span>
          <span className="text-sm text-gray-500">
            {currentStep} / {steps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onStepSubmit)} className="bg-white shadow rounded-lg p-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  defaultValue={formData.firstName}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  type="text"
                  {...register('middleName')}
                  defaultValue={formData.middleName}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  defaultValue={formData.lastName}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  defaultValue={formData.dateOfBirth}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  defaultValue={formData.gender}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Personal Email</label>
                <input
                  type="email"
                  {...register('personalEmail', {
                    required: 'Personal email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  defaultValue={formData.personalEmail}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.personalEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                <input
                  type="tel"
                  {...register('mobileNumber', { required: 'Mobile number is required' })}
                  defaultValue={formData.mobileNumber}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.mobileNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobileNumber.message}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    {...register('emergencyName')}
                    defaultValue={formData.emergencyName}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Relation</label>
                  <input
                    type="text"
                    {...register('emergencyRelation')}
                    defaultValue={formData.emergencyRelation}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    {...register('emergencyPhone')}
                    defaultValue={formData.emergencyPhone}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Address Information</h2>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Current Address</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                  <input
                    type="text"
                    {...register('currentLine1', { required: 'Address is required' })}
                    defaultValue={formData.currentLine1}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                  {errors.currentLine1 && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentLine1.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                  <input
                    type="text"
                    {...register('currentLine2')}
                    defaultValue={formData.currentLine2}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      {...register('currentCity', { required: 'City is required' })}
                      defaultValue={formData.currentCity}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    {errors.currentCity && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentCity.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      {...register('currentState', { required: 'State is required' })}
                      defaultValue={formData.currentState}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    {errors.currentState && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentState.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      {...register('currentZip', { required: 'ZIP code is required' })}
                      defaultValue={formData.currentZip}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    {errors.currentZip && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentZip.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      {...register('currentCountry', { required: 'Country is required' })}
                      defaultValue={formData.currentCountry}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    {errors.currentCountry && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentCountry.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  {...register('sameAsCurrent')}
                  defaultChecked={formData.sameAsCurrent}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Permanent address same as current address
                </label>
              </div>

              {!sameAsCurrent && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Permanent Address</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                      <input
                        type="text"
                        {...register('permanentLine1')}
                        defaultValue={formData.permanentLine1}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                      <input
                        type="text"
                        {...register('permanentLine2')}
                        defaultValue={formData.permanentLine2}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          {...register('permanentCity')}
                          defaultValue={formData.permanentCity}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          {...register('permanentState')}
                          defaultValue={formData.permanentState}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                        <input
                          type="text"
                          {...register('permanentZip')}
                          defaultValue={formData.permanentZip}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          {...register('permanentCountry')}
                          defaultValue={formData.permanentCountry}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Employment Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Employment Details</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                <input
                  type="date"
                  {...register('joiningDate', { required: 'Joining date is required' })}
                  defaultValue={formData.joiningDate}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.joiningDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.joiningDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                <select
                  {...register('employmentType', { required: 'Employment type is required' })}
                  defaultValue={formData.employmentType}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select Type</option>
                  <option value="full-time">Full Time</option>
                  <option value="intern">Intern</option>
                  <option value="contractor">Contractor</option>
                </select>
                {errors.employmentType && (
                  <p className="mt-1 text-sm text-red-600">{errors.employmentType.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  {...register('department', { required: 'Department is required' })}
                  defaultValue={formData.department}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input
                  type="text"
                  {...register('jobTitle', { required: 'Job title is required' })}
                  defaultValue={formData.jobTitle}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.jobTitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reporting Manager</label>
              <input
                type="text"
                {...register('reportingManager')}
                defaultValue={formData.reportingManager}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 4: Banking & Tax */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Banking & Tax Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
              <input
                type="text"
                {...register('bankAccountNumber')}
                defaultValue={formData.bankAccountNumber}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">IFSC/SWIFT/Routing Code</label>
              <input
                type="text"
                {...register('ifscSwiftRoutingCode')}
                defaultValue={formData.ifscSwiftRoutingCode}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tax ID (PAN/SSN)</label>
              <input
                type="text"
                {...register('taxId')}
                defaultValue={formData.taxId}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 5: Documents */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            <p className="text-sm text-gray-500">
              Document upload functionality will be implemented in the production version.
              For now, please have your documents ready for HR verification.
            </p>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Government ID (Passport/License/National ID)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Tax ID Proof
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Educational Certificates
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Experience Letters (if applicable)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Review Your Information</h2>
            <p className="text-sm text-gray-500">
              Please review all the information you've provided. Click submit to complete your onboarding.
            </p>

            <div className="border-t pt-6">
              <dl className="divide-y divide-gray-200">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formData.firstName} {formData.middleName} {formData.lastName}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Personal Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formData.personalEmail}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Mobile Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formData.mobileNumber}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Department</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formData.department}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Job Title</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formData.jobTitle}
                  </dd>
                </div>
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Joining Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {formData.joiningDate && new Date(formData.joiningDate).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-yellow-50 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      After submission, your HR team will review your information. You will be notified once your onboarding is approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-6 border-t flex justify-between">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`${currentStep === 1 ? 'ml-auto' : ''} px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {currentStep === 6 ? (submitting ? 'Submitting...' : 'Submit') : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;
