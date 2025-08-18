import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { onboardingService } from '../services/onboardingService';
import toast from 'react-hot-toast';

const OnboardingForm = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', dateOfBirth: '', gender: 'male', department: '', position: '' });
  const mutation = useMutation((payload) => onboardingService.submit(payload), {
    onSuccess: () => {
      toast.success('Submitted for review');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Submission failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800">Employee Onboarding</h2>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="input" placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input className="input" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input className="input" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input className="input" placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
        </div>
        <div>
          <button className="btn-primary" type="submit" disabled={mutation.isLoading}>Submit</button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;


