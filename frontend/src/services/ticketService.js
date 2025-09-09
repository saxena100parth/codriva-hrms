import api from './api';

export const ticketService = {
  // Create ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets', ticketData);
    return response.data.data;
  },

  // Get all tickets
  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data.data;
  },

  // Get single ticket
  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data.data;
  },

  // Update ticket
  updateTicket: async (id, data) => {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data.data;
  },

  // Assign ticket
  assignTicket: async (id, assignTo) => {
    const response = await api.put(`/tickets/${id}/assign`, { assignTo });
    return response.data.data;
  },

  // Add comment to ticket
  addComment: async (id, comment, isInternal = false) => {
    const response = await api.post(`/tickets/${id}/comments`, {
      comment,
      isInternal
    });
    return response.data.data;
  },

  // Add rating to ticket
  addRating: async (id, rating, feedback = '') => {
    const response = await api.post(`/tickets/${id}/rating`, {
      rating,
      feedback
    });
    return response.data.data;
  },

  // Get ticket statistics
  getTicketStats: async () => {
    const response = await api.get('/tickets/stats');
    return response.data.data;
  },

  // Get my assigned tickets
  getMyAssignedTickets: async (status = null) => {
    const params = {};
    if (status) params.status = status;
    const response = await api.get('/tickets/assigned', { params });
    return response.data.data;
  }
};
