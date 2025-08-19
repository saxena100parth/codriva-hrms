import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateDetails: async (data) => {
    const response = await api.put('/auth/updatedetails', data);
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/changepassword', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
  },

  resetPassword: async (resetToken, password) => {
    const response = await api.put('/auth/resetpassword', {
      resetToken,
      password
    });
    return response.data;
  }
};
