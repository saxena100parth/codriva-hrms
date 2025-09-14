import apiService from './api';

class UserService {
  // Get all users (Admin/HR only)
  async getUsers(filters = {}, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await apiService.get(`/users?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get single user
  async getUser(userId) {
    try {
      const response = await apiService.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await apiService.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await apiService.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create user (invite)
  async createUser(userData) {
    try {
      const response = await apiService.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      const response = await apiService.patch(`/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const response = await apiService.put(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user dashboard data
  async getUserDashboard() {
    try {
      const response = await apiService.get('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await apiService.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Toggle user status (Admin/HR only)
  async toggleUserStatus(userId) {
    try {
      const response = await apiService.put(`/users/${userId}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reset user password (Admin/HR only)
  async resetUserPassword(userId, newPassword) {
    try {
      const response = await apiService.put(`/users/${userId}/reset-password`, { newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get pending onboardings (HR/Admin only)
  async getPendingOnboardings() {
    try {
      console.log('Making API call to /users/onboarding/pending');
      console.log('Full URL will be:', apiService.baseURL + '/users/onboarding/pending');
      const response = await apiService.get('/users/onboarding/pending');
      console.log('API response:', response);
      return response;
    } catch (error) {
      console.error('API call failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.statusCode,
        data: error.data,
        shouldLogout: error.shouldLogout
      });
      throw error;
    }
  }

  // Invite employee (HR/Admin only)
  async inviteEmployee(employeeData) {
    try {
      const response = await apiService.post('/users/onboard', employeeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Send OTP for onboarding (uses existing auth endpoint)
  async sendOnboardingOTP(mobile) {
    try {
      const response = await apiService.post('/auth/mobile-login', {
        mobileNumber: mobile
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Verify OTP for onboarding (uses existing auth endpoint)
  async verifyOnboardingOTP(mobile, otp) {
    try {
      const response = await apiService.post('/auth/verify-otp', {
        mobileNumber: mobile,
        otp: otp
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user onboarding data by mobile number
  async getOnboardingData(mobile) {
    try {
      const response = await apiService.get(`/auth/onboarding-data/${mobile}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Submit onboarding details
  async submitOnboardingDetails(formData) {
    try {
      const response = await apiService.post('/users/onboarding/submit', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Review onboarding request (HR/Admin only)
  async reviewOnboarding(userId, decision, comments = '') {
    try {
      const response = await apiService.put(`/users/${userId}/onboarding/review`, {
        decision,
        comments
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
