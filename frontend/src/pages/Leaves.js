import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { leaveService } from '../services/leaveService';
import toast from 'react-hot-toast';

const Leaves = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ type: 'casual', startDate: '', endDate: '', reason: '' });
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const { data, isLoading } = useQuery(['leaves', statusFilter, userFilter], async () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (user.role !== 'employee' && userFilter) params.userId = userFilter;
    return leaveService.list(params);
  });

  const applyMutation = useMutation((payload) => leaveService.apply(payload), {
    onSuccess: () => {
      toast.success('Leave applied');
      queryClient.invalidateQueries('leaves');
      setForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to apply leave'),
  });

  const statusMutation = useMutation(({ id, status, comment }) => leaveService.updateStatus(id, status, comment), {
    onSuccess: () => {
      toast.success('Leave updated');
      queryClient.invalidateQueries('leaves');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to update'),
  });

  const handleApply = (e) => {
    e.preventDefault();
    applyMutation.mutate(form);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Leaves</h2>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          {user.role !== 'employee' && (
            <input value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Filter by UserId" className="input" />
          )}
        </div>
      </div>

      {user.role === 'employee' && (
        <form onSubmit={handleApply} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="earned">Earned</option>
              <option value="unpaid">Unpaid</option>
              <option value="other">Other</option>
            </select>
            <input type="date" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <input type="date" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            <input type="text" placeholder="Reason" className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div>
            <button type="submit" className="btn-primary" disabled={applyMutation.isLoading}>Apply Leave</button>
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
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Dates</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Days</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Reason</th>
                  {user.role !== 'employee' && <th className="px-4 py-2" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(data?.leaves || []).map((leave) => (
                  <tr key={leave._id}>
                    <td className="px-4 py-2 text-sm">{leave.type}</td>
                    <td className="px-4 py-2 text-sm">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm">{leave.totalDays}</td>
                    <td className="px-4 py-2 text-sm capitalize">{leave.status}</td>
                    <td className="px-4 py-2 text-sm">{leave.reason}</td>
                    {user.role !== 'employee' && (
                      <td className="px-4 py-2 text-sm text-right space-x-2">
                        <button className="btn-primary" onClick={() => statusMutation.mutate({ id: leave._id, status: 'approved' })}>Approve</button>
                        <button className="btn-primary" onClick={() => statusMutation.mutate({ id: leave._id, status: 'rejected' })}>Reject</button>
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

export default Leaves;


