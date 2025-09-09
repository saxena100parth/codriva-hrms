import api from './api';

export const employeeService = {
  // Get employee profile
  getEmployeeProfile: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  // Update employee profile
  updateEmployeeProfile: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  // Get employee leave summary
  getEmployeeLeaveSummary: async () => {
    const response = await api.get('/leaves/summary');
    return response.data.data;
  },

  // Get employee leaves
  getEmployeeLeaves: async (params = {}) => {
    const response = await api.get('/leaves', { params });
    return response.data.data;
  },

  // Get employee tickets
  getEmployeeTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data.data;
  },

  // Submit onboarding details
  submitOnboarding: async (data) => {
    const response = await api.post('/users/onboarding/submit', data);
    return response.data.data;
  },

  // Get onboarding status
  getOnboardingStatus: async () => {
    const response = await api.get('/users/me');
    return response.data.data.onboardingStatus;
  },

  // Initiate onboarding (HR/Admin only)
  initiateOnboarding: async (data) => {
    console.log('employeeService.initiateOnboarding called with data:', data);
    try {
      const response = await api.post('/users/onboard', data);
      console.log('employeeService.initiateOnboarding response:', response);
      return response.data.data;
    } catch (error) {
      console.error('employeeService.initiateOnboarding error:', error);
      throw error;
    }
  },

  // Get pending onboardings (HR/Admin only)
  getPendingOnboardings: async () => {
    const response = await api.get('/users/onboarding/pending');
    return response.data.data;
  }
};
