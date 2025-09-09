import api from './baseAPI';

const authAPI = {
  // ========================================
  // AUTHENTICATION API METHODS
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
  },

  // Mobile login - send OTP
  mobileLogin: async (mobileNumber) => {
    const response = await api.post('/auth/mobile-login', { mobileNumber });
    return response.data.data;
  },

  // Verify OTP
  verifyOTP: async (mobileNumber, otp) => {
    const response = await api.post('/auth/verify-otp', { mobileNumber, otp });
    return response.data.data;
  },

  // Resend OTP
  resendOTP: async (mobileNumber) => {
    const response = await api.post('/auth/resend-otp', { mobileNumber });
    return response.data.data;
  },

  // Set onboarding password
  setOnboardingPassword: async (password) => {
    const response = await api.post('/auth/set-onboarding-password', { password });
    return response.data.data;
  }
};

export default authAPI;
