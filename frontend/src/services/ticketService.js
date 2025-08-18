import api from './api';

export const ticketService = {
  async list(params = {}) {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/tickets', payload);
    return response.data;
  },

  async updateStatus(ticketId, status, comment = '') {
    const response = await api.patch(`/tickets/${ticketId}/status`, { status, comment });
    return response.data;
  },
};


