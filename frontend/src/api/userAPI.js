import api from './baseAPI';

const userAPI = {
  // Get all users
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Get current user profile
  getMyProfile: async () => {
    const response = await api.get('/users/me');
    return response.data.data;
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  // Toggle user status
  toggleUserStatus: async (id) => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data.data;
  },

  // Reset user password
  resetUserPassword: async (id, password) => {
    const response = await api.put(`/users/${id}/reset-password`, { password });
    return response.data.data;
  },

  // Get user stats
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data.data;
  },

  // Search users
  searchUsers: async (query, role = null) => {
    const params = { q: query };
    if (role) params.role = role;
    const response = await api.get('/users/search', { params });
    return response.data.data;
  },

  // Get HR users list
  getHRUsers: async () => {
    const response = await api.get('/users/hr-list');
    return response.data.data;
  },

  // Change user role (Admin only)
  changeUserRole: async (id, role) => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data.data;
  },

  // Initiate employee onboarding
  initiateOnboarding: async (data) => {
    const response = await api.post('/users/onboard', data);
    return response.data.data;
  },

  // Submit onboarding details
  submitOnboarding: async (data) => {
    const response = await api.post('/users/onboarding/submit', data);
    return response.data.data;
  },

  // Get pending onboardings
  getPendingOnboardings: async () => {
    const response = await api.get('/users/onboarding/pending');
    return response.data.data;
  },

  // Review onboarding
  reviewOnboarding: async (id, decision, comments) => {
    const response = await api.put(`/users/${id}/onboarding/review`, {
      decision,
      comments
    });
    return response.data.data;
  },

  // Update leave balance
  updateLeaveBalance: async (id, data) => {
    const response = await api.put(`/users/${id}/leave-balance`, data);
    return response.data.data;
  },

  // Complete onboarding
  completeOnboarding: async () => {
    const response = await api.post('/users/onboarding/complete');
    return response.data.data;
  }
};

export default userAPI;
