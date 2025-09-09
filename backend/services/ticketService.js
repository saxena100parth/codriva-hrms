const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendTicketUpdate } = require('../utils/email');

class TicketService {
  // Create ticket (Employee)
  async createTicket(userId, ticketData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.onboardingStatus !== 'COMPLETED') {
      throw new Error('Please complete onboarding before raising tickets');
    }

    const { category, priority, subject, description, attachments } = ticketData;

    // Create ticket - now associated directly with user instead of employee
    const ticket = await Ticket.create({
      user: userId,
      category,
      priority: priority || 'MEDIUM',
      subject,
      description,
      attachments
    });

    // Send notification
    if (user) {
      await sendTicketUpdate(user.email, ticket, 'created');
    }

    return {
      ticket: await ticket.populate('user', 'employeeId fullName'),
      message: 'Ticket created successfully'
    };
  }

  // Get tickets (with filters)
  async getTickets(filters = {}, userRole, userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // If employee, only show their own tickets
    if (userRole === 'EMPLOYEE') {
      query.user = userId;
    }

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.search) {
      query.$or = [
        { ticketNumber: new RegExp(filters.search, 'i') },
        { subject: new RegExp(filters.search, 'i') },
        { description: new RegExp(filters.search, 'i') }
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'employeeId fullName email')
      .populate('assignedTo', 'fullName')
      .populate('resolvedBy', 'fullName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Ticket.countDocuments(query);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get single ticket
  async getTicket(ticketId, userRole, userId) {
    const ticket = await Ticket.findById(ticketId)
      .populate('user', 'employeeId fullName email')
      .populate('assignedTo', 'fullName email')
      .populate('resolvedBy', 'fullName')
      .populate('comments.user', 'fullName role');

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // If employee, check if it's their own ticket
    if (userRole === 'EMPLOYEE') {
      if (ticket.user._id.toString() !== userId.toString()) {
        throw new Error('Not authorized to view this ticket');
      }
    }

    return ticket;
  }

  // Update ticket status (HR/Admin)
  async updateTicketStatus(ticketId, updates, updatedBy) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { status, assignedTo, resolution } = updates;

    // Update fields
    if (status) {
      ticket.status = status.toUpperCase();

      if (status.toUpperCase() === 'RESOLVED' || status.toUpperCase() === 'CLOSED') {
        ticket.resolvedBy = updatedBy;
        ticket.resolvedAt = new Date();
        if (resolution) {
          ticket.resolution = resolution;
        }
      }
    }

    if (assignedTo !== undefined) {
      ticket.assignedTo = assignedTo;
    }

    await ticket.save();

    // Send notification
    const user = await User.findById(ticket.user);
    if (user) {
      await sendTicketUpdate(user.email, ticket, `Status changed to ${status}`);
    }

    return {
      ticket: await ticket.populate(['user', 'assignedTo', 'resolvedBy']),
      message: 'Ticket updated successfully'
    };
  }

  // Assign ticket to HR/Admin
  async assignTicket(ticketId, assignToUserId, assignedBy) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Verify assignee is HR or Admin
    const assignee = await User.findById(assignToUserId);
    if (!assignee || !['HR', 'ADMIN'].includes(assignee.role)) {
      throw new Error('Tickets can only be assigned to HR or Admin users');
    }

    ticket.assignedTo = assignToUserId;
    ticket.status = 'IN_PROGRESS';

    // Add to comments
    ticket.comments.push({
      user: assignedBy,
      comment: `Ticket assigned to ${assignee.fullName.first} ${assignee.fullName.last}`,
      isInternal: true
    });

    await ticket.save();

    return {
      ticket: await ticket.populate(['user', 'assignedTo']),
      message: 'Ticket assigned successfully'
    };
  }

  // Add comment to ticket
  async addComment(ticketId, userId, comment, isInternal = false) {
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Check permissions
    const user = await User.findById(userId);
    if (user.role === 'EMPLOYEE') {
      if (ticket.user.toString() !== userId.toString()) {
        throw new Error('Not authorized to comment on this ticket');
      }
      isInternal = false; // Employees can't add internal comments
    }

    ticket.comments.push({
      user: userId,
      comment,
      isInternal
    });

    await ticket.save();

    return {
      ticket: await ticket.populate('comments.user', 'fullName role'),
      message: 'Comment added successfully'
    };
  }

  // Add rating and feedback (Employee)
  async addRating(ticketId, userId, rating, feedback) {
    const ticket = await Ticket.findOne({
      _id: ticketId,
      user: userId
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
      throw new Error('Can only rate resolved or closed tickets');
    }

    if (ticket.rating) {
      throw new Error('Ticket has already been rated');
    }

    ticket.rating = rating;
    ticket.feedback = feedback;
    await ticket.save();

    return {
      ticket,
      message: 'Rating submitted successfully'
    };
  }

  // Get ticket statistics (HR/Admin)
  async getTicketStats() {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average resolution time for resolved tickets
    const resolutionTime = await Ticket.aggregate([
      {
        $match: {
          status: { $in: ['RESOLVED', 'CLOSED'] },
          resolvedAt: { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $subtract: ['$resolvedAt', '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    // Average rating
    const avgRating = await Ticket.aggregate([
      {
        $match: {
          rating: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRated: { $sum: 1 }
        }
      }
    ]);

    return {
      byStatus: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byCategory: categoryStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      byPriority: priorityStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      avgResolutionTime: resolutionTime[0]?.avgResolutionTime || 0,
      avgRating: avgRating[0]?.avgRating || 0,
      totalRated: avgRating[0]?.totalRated || 0
    };
  }

  // Get my assigned tickets (HR/Admin)
  async getMyAssignedTickets(userId, status = null) {
    const query = { assignedTo: userId };
    if (status) {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'employeeId fullName')
      .sort('-createdAt');

    return tickets;
  }
}

module.exports = new TicketService();
