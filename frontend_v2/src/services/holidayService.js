import apiService from './api';

class HolidayService {
  // Get all holidays
  async getHolidays(filters = {}, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await apiService.get(`/holidays?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get holidays by year
  async getHolidaysByYear(year) {
    try {
      const response = await apiService.get(`/holidays/year/${year}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get single holiday
  async getHoliday(holidayId) {
    try {
      const response = await apiService.get(`/holidays/${holidayId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create holiday (Admin/HR only)
  async createHoliday(holidayData) {
    try {
      const response = await apiService.post('/holidays', holidayData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update holiday (Admin/HR only)
  async updateHoliday(holidayId, holidayData) {
    try {
      const response = await apiService.put(`/holidays/${holidayId}`, holidayData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete holiday (Admin/HR only)
  async deleteHoliday(holidayId) {
    try {
      const response = await apiService.delete(`/holidays/${holidayId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Check if date is holiday
  async isHoliday(date) {
    try {
      const response = await apiService.get(`/holidays/check?date=${date}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming holidays
  async getUpcomingHolidays(limit = 5) {
    try {
      const response = await apiService.get(`/holidays/upcoming?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get holiday calendar for month
  async getHolidayCalendar(year, month) {
    try {
      const response = await apiService.get(`/holidays/calendar/${year}/${month}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new HolidayService();
