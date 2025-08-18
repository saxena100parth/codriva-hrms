import api from './api';

export const usersService = {
  async createHR({ username, email, password }) {
    const res = await api.post('/users/hr', { username, email, password });
    return res.data;
  },
};


