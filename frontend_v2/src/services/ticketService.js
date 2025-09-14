import apiService from './api';

class TicketService {
  // Get tickets (unified method for all users)
  async getTickets(filters = {}, page = 1, limit = 10) {
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

  // Alias for backward compatibility
  async getMyTickets(filters = {}, page = 1, limit = 10) {
    return this.getTickets(filters, page, limit);
  }

  // Alias for backward compatibility
  async getAllTickets(filters = {}, page = 1, limit = 10) {
    return this.getTickets(filters, page, limit);
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
  async assignTicket(ticketId, assignTo) {
    try {
      const response = await apiService.put(`/tickets/${ticketId}/assign`, { assignTo });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update ticket (includes status, priority, resolution, etc.)
  async updateTicketStatus(ticketId, updates) {
    try {
      const response = await apiService.put(`/tickets/${ticketId}`, updates);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Alias for backward compatibility
  async resolveTicket(ticketId, resolution) {
    return this.updateTicketStatus(ticketId, { status: 'RESOLVED', resolution });
  }

  // Alias for backward compatibility
  async closeTicket(ticketId) {
    return this.updateTicketStatus(ticketId, { status: 'CLOSED' });
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
      const response = await apiService.post(`/tickets/${ticketId}/rating`, {
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
