import apiService from './api';

class AuthService {
  // Login user
  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', { email, password });

      if (response.success && response.data && response.data.token) {
        apiService.setToken(response.data.token);
        return response.data;
      }
      throw new Error(response.error || 'Login failed');
    } catch (error) {
      throw error;
    }
  }

  // Register user (invite user)
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await apiService.put('/auth/updatedetails', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiService.put('/auth/changepassword', {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  logout() {
    apiService.setToken(null);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!apiService.token;
  }

  // Get stored token
  getToken() {
    return apiService.token;
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // OTP Login (for onboarding)
  async otpLogin(mobileNumber, otp) {
    try {
      const response = await apiService.post('/auth/verify-otp', {
        mobileNumber,
        otp
      });

      if (response.success && response.data && response.data.token) {
        apiService.setToken(response.data.token);
        return response.data;
      }
      throw new Error(response.error || 'OTP verification failed');
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
