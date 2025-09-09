import api from './api';

export const holidayService = {
  // Create holiday
  createHoliday: async (holidayData) => {
    const response = await api.post('/holidays', holidayData);
    return response.data.data;
  },

  // Get all holidays
  getHolidays: async (params = {}) => {
    const response = await api.get('/holidays', { params });
    return response.data.data;
  },

  // Get single holiday
  getHoliday: async (id) => {
    const response = await api.get(`/holidays/${id}`);
    return response.data.data;
  },

  // Update holiday
  updateHoliday: async (id, data) => {
    const response = await api.put(`/holidays/${id}`, data);
    return response.data.data;
  },

  // Delete holiday
  deleteHoliday: async (id) => {
    const response = await api.delete(`/holidays/${id}`);
    return response.data.data;
  },

  // Get upcoming holidays
  getUpcomingHolidays: async (limit = 5) => {
    const response = await api.get('/holidays/upcoming', {
      params: { limit }
    });
    return response.data.data;
  },

  // Bulk create holidays
  bulkCreateHolidays: async (holidays) => {
    const response = await api.post('/holidays/bulk', { holidays });
    return response.data.data;
  },

  // Copy holidays from year
  copyHolidaysFromYear: async (fromYear, toYear) => {
    const response = await api.post('/holidays/copy', { fromYear, toYear });
    return response.data.data;
  },

  // Get holiday statistics
  getHolidayStats: async () => {
    const response = await api.get('/holidays/stats/overview');
    return response.data.data;
  }
};
