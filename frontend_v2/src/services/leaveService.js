import apiService from './api';

class LeaveService {
  // Get leaves (role-based: employees see their own, HR/Admin see all)
  async getLeaves(filters = {}, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await apiService.get(`/leaves?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get single leave
  async getLeave(leaveId) {
    try {
      const response = await apiService.get(`/leaves/${leaveId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create leave request
  async createLeave(leaveData) {
    try {
      const response = await apiService.post('/leaves', leaveData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update leave request
  async updateLeave(leaveId, leaveData) {
    try {
      const response = await apiService.put(`/leaves/${leaveId}`, leaveData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Cancel leave request
  async cancelLeave(leaveId) {
    try {
      const response = await apiService.put(`/leaves/${leaveId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update leave status (Admin/HR only)
  async updateLeaveStatus(leaveId, status, rejectionReason = '') {
    try {
      const response = await apiService.put(`/leaves/${leaveId}/status`, {
        status,
        rejectionReason
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get leave balance
  async getLeaveBalance() {
    try {
      const response = await apiService.get('/leaves/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get leave statistics
  async getLeaveStats() {
    try {
      const response = await apiService.get('/leaves/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get pending approvals (Admin/HR only)
  async getPendingApprovals() {
    try {
      const response = await apiService.get('/leaves/pending-approvals');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Apply for leave (alias for createLeave)
  async applyLeave(leaveData) {
    return this.createLeave(leaveData);
  }

  // Get leave summary
  async getLeaveSummary() {
    try {
      const response = await apiService.get('/leaves/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get pending leaves (HR/Admin)
  async getPendingLeaves() {
    try {
      const response = await apiService.get('/leaves/pending');
      return response.data;
    } catch (error) {
      throw error;
    }
  }


  // Add comment to leave
  async addComment(id, comment) {
    try {
      const response = await apiService.post(`/leaves/${id}/comments`, { comment });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new LeaveService();
