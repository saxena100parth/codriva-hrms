import api from './api';

export const holidayService = {
  async list() {
    const response = await api.get('/holidays');
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/holidays', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/holidays/${id}`, payload);
    return response.data;
  },

  async remove(id) {
    const response = await api.delete(`/holidays/${id}`);
    return response.data;
  },
};


