import api from './api';

export const userService = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create HR user
  createHRUser: async (data) => {
    const response = await api.post('/users/hr', data);
    return response.data;
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (id, password) => {
    const response = await api.put(`/users/${id}/reset-password`, { password });
    return response.data;
  },

  // Get user stats
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data.data; // unwrap {success,data}
  },

  // Search users
  searchUsers: async (query, role = null) => {
    const params = { q: query };
    if (role) params.role = role;
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  // Get HR users list
  getHRUsers: async () => {
    const response = await api.get('/users/hr-list');
    return response.data;
  }
};
