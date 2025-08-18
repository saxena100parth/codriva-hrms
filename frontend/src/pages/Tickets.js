import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/ticketService';
import toast from 'react-hot-toast';

const Tickets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ subject: '', description: '' });
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const { data, isLoading } = useQuery(['tickets', statusFilter, userFilter], async () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (user.role !== 'employee' && userFilter) params.userId = userFilter;
    return ticketService.list(params);
  });

  const createMutation = useMutation((payload) => ticketService.create(payload), {
    onSuccess: () => {
      toast.success('Ticket created');
      queryClient.invalidateQueries('tickets');
      setForm({ subject: '', description: '' });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create ticket'),
  });

  const statusMutation = useMutation(({ id, status, comment }) => ticketService.updateStatus(id, status, comment), {
    onSuccess: () => {
      toast.success('Ticket updated');
      queryClient.invalidateQueries('tickets');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Tickets</h2>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          {user.role !== 'employee' && (
            <input value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Filter by UserId" className="input" />
          )}
        </div>
      </div>

      {user.role === 'employee' && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <input className="input md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <button type="submit" className="btn-primary" disabled={createMutation.isLoading}>Raise Ticket</button>
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
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Subject</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Priority</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Created</th>
                  {user.role !== 'employee' && <th className="px-4 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(data?.tickets || []).map((t) => (
                  <tr key={t._id}>
                    <td className="px-4 py-2 text-sm">{t.subject}</td>
                    <td className="px-4 py-2 text-sm capitalize">{t.status}</td>
                    <td className="px-4 py-2 text-sm capitalize">{t.priority}</td>
                    <td className="px-4 py-2 text-sm">{new Date(t.createdAt).toLocaleString()}</td>
                    {user.role !== 'employee' && (
                      <td className="px-4 py-2 text-sm text-right space-x-2">
                        <button className="btn-primary" onClick={() => statusMutation.mutate({ id: t._id, status: 'in_progress' })}>Start</button>
                        <button className="btn-primary" onClick={() => statusMutation.mutate({ id: t._id, status: 'resolved' })}>Resolve</button>
                        <button className="btn-primary" onClick={() => statusMutation.mutate({ id: t._id, status: 'rejected' })}>Reject</button>
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

export default Tickets;


