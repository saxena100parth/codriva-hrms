import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { holidayService } from '../services/holidayService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Holidays = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', date: '', description: '', isOptional: false });

  const { data, isLoading } = useQuery(['holidays'], holidayService.list);

  const createMutation = useMutation((payload) => holidayService.create(payload), {
    onSuccess: () => {
      toast.success('Holiday added');
      queryClient.invalidateQueries('holidays');
      setForm({ name: '', date: '', description: '', isOptional: false });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to add holiday'),
  });

  const deleteMutation = useMutation((id) => holidayService.remove(id), {
    onSuccess: () => {
      toast.success('Holiday deleted');
      queryClient.invalidateQueries('holidays');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to delete holiday'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const canManage = user.role === 'hr' || user.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Holidays</h2>
      </div>

      {canManage && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input className="input" placeholder="Holiday Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isOptional} onChange={(e) => setForm({ ...form, isOptional: e.target.checked })} />
              Optional
            </label>
          </div>
          <div>
            <button type="submit" className="btn-primary" disabled={createMutation.isLoading}>Add Holiday</button>
          </div>
        </form>
      )}

      <div className="card">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Optional</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                  {canManage && <th className="px-4 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(data?.holidays || []).map((h) => (
                  <tr key={h._id}>
                    <td className="px-4 py-2 text-sm">{h.name}</td>
                    <td className="px-4 py-2 text-sm">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm">{h.isOptional ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 text-sm">{h.description}</td>
                    {canManage && (
                      <td className="px-4 py-2 text-sm text-right">
                        <button className="btn-primary" onClick={() => deleteMutation.mutate(h._id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holidays;


