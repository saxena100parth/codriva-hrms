import api from './api';

export const leaveService = {
  // Apply for leave
  applyLeave: async (leaveData) => {
    const response = await api.post('/leaves', leaveData);
    return response.data.data;
  },

  // Get all leaves
  getLeaves: async (params = {}) => {
    const response = await api.get('/leaves', { params });
    return response.data.data;
  },

  // Get single leave
  getLeave: async (id) => {
    const response = await api.get(`/leaves/${id}`);
    return response.data.data;
  },

  // Update leave status (HR/Admin)
  updateLeaveStatus: async (id, status, rejectionReason = '') => {
    const response = await api.put(`/leaves/${id}/status`, {
      status,
      rejectionReason
    });
    return response.data.data;
  },

  // Cancel leave
  cancelLeave: async (id) => {
    const response = await api.put(`/leaves/${id}/cancel`);
    return response.data.data;
  },

  // Add comment to leave
  addComment: async (id, comment) => {
    const response = await api.post(`/leaves/${id}/comments`, { comment });
    return response.data.data;
  },

  // Get leave summary
  getLeaveSummary: async () => {
    const response = await api.get('/leaves/summary');
    return response.data.data;
  },

  // Get pending leaves (HR/Admin)
  getPendingLeaves: async () => {
    const response = await api.get('/leaves/pending');
    return response.data.data;
  }
};
