import api from './api';

export const ticketService = {
  // Create ticket
  createTicket: async (data) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  // Get tickets
  getTickets: async (params = {}) => {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  // Get single ticket
  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, data) => {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data;
  },

  // Assign ticket
  assignTicket: async (id, assignTo) => {
    const response = await api.put(`/tickets/${id}/assign`, { assignTo });
    return response.data;
  },

  // Add comment
  addComment: async (id, comment, isInternal = false) => {
    const response = await api.post(`/tickets/${id}/comments`, {
      comment,
      isInternal
    });
    return response.data;
  },

  // Add rating
  addRating: async (id, rating, feedback) => {
    const response = await api.post(`/tickets/${id}/rating`, {
      rating,
      feedback
    });
    return response.data;
  },

  // Get ticket stats
  getTicketStats: async () => {
    const response = await api.get('/tickets/stats');
    return response.data;
  },

  // Get my assigned tickets
  getMyAssignedTickets: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/tickets/assigned', { params });
    return response.data;
  }
};
