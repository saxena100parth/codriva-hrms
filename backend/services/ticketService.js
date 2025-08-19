const Ticket = require('../models/Ticket');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { sendTicketUpdate } = require('../utils/email');

class TicketService {
  // Create ticket (Employee)
  async createTicket(userId, ticketData) {
    const employee = await Employee.findOne({ user: userId });
    
    if (!employee) {
      throw new Error('Employee record not found');
    }

    if (employee.onboardingStatus !== 'approved') {
      throw new Error('Please complete onboarding before raising tickets');
    }

    const { category, priority, subject, description, attachments } = ticketData;

    // Create ticket
    const ticket = await Ticket.create({
      employee: employee._id,
      category,
      priority: priority || 'medium',
      subject,
      description,
      attachments
    });

    // Send notification
    const user = await User.findById(userId);
    if (user) {
      await sendTicketUpdate(user.email, ticket, 'created');
    }

    return {
      ticket: await ticket.populate('employee', 'employeeId displayName'),
      message: 'Ticket created successfully'
    };
  }

  // Get tickets (with filters)
  async getTickets(filters = {}, userRole, userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // If employee, only show their own tickets
    if (userRole === 'employee') {
      const employee = await Employee.findOne({ user: userId });
      if (employee) {
        query.employee = employee._id;
      }
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
      .populate('employee', 'employeeId fullName officialEmail')
      .populate('assignedTo', 'name')
      .populate('resolvedBy', 'name')
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
      .populate('employee', 'employeeId fullName officialEmail')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name')
      .populate('comments.user', 'name role');

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // If employee, check if it's their own ticket
    if (userRole === 'employee') {
      const employee = await Employee.findOne({ user: userId });
      if (!employee || ticket.employee._id.toString() !== employee._id.toString()) {
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
      ticket.status = status;
      
      if (status === 'resolved' || status === 'closed') {
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
    const employee = await Employee.findById(ticket.employee).populate('user');
    if (employee && employee.user) {
      await sendTicketUpdate(employee.user.email, ticket, `Status changed to ${status}`);
    }

    return {
      ticket: await ticket.populate(['employee', 'assignedTo', 'resolvedBy']),
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
    if (!assignee || !['hr', 'admin'].includes(assignee.role)) {
      throw new Error('Tickets can only be assigned to HR or Admin users');
    }

    ticket.assignedTo = assignToUserId;
    ticket.status = 'in-progress';
    
    // Add to comments
    ticket.comments.push({
      user: assignedBy,
      comment: `Ticket assigned to ${assignee.name}`,
      isInternal: true
    });

    await ticket.save();

    return {
      ticket: await ticket.populate(['employee', 'assignedTo']),
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
    if (user.role === 'employee') {
      const employee = await Employee.findOne({ user: userId });
      if (!employee || ticket.employee.toString() !== employee._id.toString()) {
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
      ticket: await ticket.populate('comments.user', 'name role'),
      message: 'Comment added successfully'
    };
  }

  // Add rating and feedback (Employee)
  async addRating(ticketId, userId, rating, feedback) {
    const employee = await Employee.findOne({ user: userId });
    
    if (!employee) {
      throw new Error('Employee record not found');
    }

    const ticket = await Ticket.findOne({
      _id: ticketId,
      employee: employee._id
    });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
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
          status: { $in: ['resolved', 'closed'] },
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
      .populate('employee', 'employeeId fullName')
      .sort('-createdAt');

    return tickets;
  }
}

module.exports = new TicketService();
