import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { onboardingService } from '../services/onboardingService';
import toast from 'react-hot-toast';

const HrInvite = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const mutation = useMutation((payload) => onboardingService.invite(payload), {
    onSuccess: () => {
      toast.success('Invitation created');
      setForm({ username: '', email: '', password: '' });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Invite failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-semibold text-gray-800">Invite Employee</h2>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="input" placeholder="Personal Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Temp Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <button type="submit" className="btn-primary" disabled={mutation.isLoading}>Send Invite</button>
        </div>
      </form>
    </div>
  );
};

export default HrInvite;


