import api from './api';

export const leaveService = {
  async list(params = {}) {
    const response = await api.get('/leaves', { params });
    return response.data;
  },

  async apply(payload) {
    const response = await api.post('/leaves', payload);
    return response.data;
  },

  async updateStatus(leaveId, status, comment = '') {
    const response = await api.patch(`/leaves/${leaveId}/status`, { status, comment });
    return response.data;
  },
};


