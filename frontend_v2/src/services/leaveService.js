import apiService from './api';

class LeaveService {
  // Get all leaves for current user
  async getMyLeaves(filters = {}, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await apiService.get(`/leaves/my-leaves?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get all leaves (Admin/HR only)
  async getAllLeaves(filters = {}, page = 1, limit = 10) {
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
      const response = await apiService.patch(`/leaves/${leaveId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Approve leave request (Admin/HR only)
  async approveLeave(leaveId, comments = '') {
    try {
      const response = await apiService.patch(`/leaves/${leaveId}/approve`, { comments });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Reject leave request (Admin/HR only)
  async rejectLeave(leaveId, rejectionReason) {
    try {
      const response = await apiService.patch(`/leaves/${leaveId}/reject`, { rejectionReason });
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

  // Get all leaves with filters (alias for getAllLeaves)
  async getLeaves(filters = {}) {
    return this.getAllLeaves(filters);
  }

  // Update leave status (HR/Admin)
  async updateLeaveStatus(id, status, rejectionReason = '') {
    try {
      const response = await apiService.put(`/leaves/${id}/status`, {
        status,
        rejectionReason
      });
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
