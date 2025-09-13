import apiService from './api';

class TicketService {
  // Get all tickets for current user
  async getMyTickets(filters = {}, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await apiService.get(`/tickets/my-tickets?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get all tickets (Admin/HR only)
  async getAllTickets(filters = {}, page = 1, limit = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await apiService.get(`/tickets?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get single ticket
  async getTicket(ticketId) {
    try {
      const response = await apiService.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create ticket
  async createTicket(ticketData) {
    try {
      const response = await apiService.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update ticket
  async updateTicket(ticketId, ticketData) {
    try {
      const response = await apiService.put(`/tickets/${ticketId}`, ticketData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Assign ticket (Admin/HR only)
  async assignTicket(ticketId, assignedTo) {
    try {
      const response = await apiService.patch(`/tickets/${ticketId}/assign`, { assignedTo });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update ticket status
  async updateTicketStatus(ticketId, status) {
    try {
      const response = await apiService.patch(`/tickets/${ticketId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Resolve ticket
  async resolveTicket(ticketId, resolution) {
    try {
      const response = await apiService.patch(`/tickets/${ticketId}/resolve`, { resolution });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Close ticket
  async closeTicket(ticketId) {
    try {
      const response = await apiService.patch(`/tickets/${ticketId}/close`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Add comment to ticket
  async addComment(ticketId, comment, isInternal = false) {
    try {
      const response = await apiService.post(`/tickets/${ticketId}/comments`, {
        comment,
        isInternal
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Rate ticket
  async rateTicket(ticketId, rating, feedback = '') {
    try {
      const response = await apiService.post(`/tickets/${ticketId}/rate`, {
        rating,
        feedback
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get ticket statistics
  async getTicketStats() {
    try {
      const response = await apiService.get('/tickets/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get assigned tickets (Admin/HR only)
  async getAssignedTickets() {
    try {
      const response = await apiService.get('/tickets/assigned');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new TicketService();
