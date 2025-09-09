import api from './api';

export const authService = {
  // ========================================
  // AUTHENTICATION SERVICE METHODS
  // ========================================

  // User login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  // User logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data.data;
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  // Update user details
  updateDetails: async (data) => {
    const response = await api.put('/auth/updatedetails', data);
    return response.data.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/changepassword', {
      currentPassword,
      newPassword
    });
    return response.data.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data.data;
  },

  // Reset password
  resetPassword: async (resetToken, password) => {
    const response = await api.put('/auth/resetpassword', {
      resetToken,
      password
    });
    return response.data.data;
  }
};
