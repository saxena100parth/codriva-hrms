import api from './api';

export const employeeService = {
  // Get all employees
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Get single employee
  getEmployee: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data; // return the employee object
  },

  // Explicit alias used by EmployeeDetail
  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data.data; // return the employee object
  },

  // Get my profile (employee)
  getMyProfile: async () => {
    const response = await api.get('/employees/me');
    return response.data;
  },

  // Update employee
  updateEmployee: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  // Initiate onboarding
  initiateOnboarding: async (data) => {
    const response = await api.post('/employees/onboard', data);
    return response.data;
  },

  // Submit onboarding details
  submitOnboarding: async (data) => {
    const response = await api.post('/employees/onboarding/submit', data);
    return response.data;
  },

  // Review onboarding
  reviewOnboarding: async (id, decision, comments) => {
    const response = await api.put(`/employees/${id}/onboarding/review`, {
      decision,
      comments
    });
    return response.data;
  },

  // Get onboarding status
  getOnboardingStatus: async (id) => {
    const response = await api.get(`/employees/${id}/onboarding`);
    return response.data;
  },

  // Get pending onboardings
  getPendingOnboardings: async () => {
    const response = await api.get('/employees/onboarding/pending');
    return response.data;
  },

  // Update leave balance
  updateLeaveBalance: async (id, data) => {
    const response = await api.put(`/employees/${id}/leave-balance`, data);
    return response.data;
  }
};
