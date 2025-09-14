const Leave = require('../models/Leave');
const User = require('../models/User');
const Holiday = require('../models/Holiday');
const { sendLeaveStatusUpdate } = require('../utils/email');

class LeaveService {
  // Apply for leave (Employee)
  async applyLeave(userId, leaveData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.onboardingStatus !== 'COMPLETED') {
      throw new Error('Please complete onboarding before applying for leave');
    }

    const { leaveType, startDate, endDate, reason, emergencyContact, backupPerson } = leaveData;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    if (end < start) {
      throw new Error('End date must be after start date');
    }

    // Calculate number of days (excluding weekends and holidays)
    const numberOfDays = await this.calculateLeaveDays(start, end);

    // Check leave balance
    const availableLeave = user.leaveBalance[leaveType] - user.leavesTaken[leaveType];
    if (numberOfDays > availableLeave) {
      throw new Error(`Insufficient ${leaveType} leave balance. Available: ${availableLeave} days`);
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      user: userId,
      status: { $in: ['PENDING', 'APPROVED'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      throw new Error('You already have a leave request for these dates');
    }

    // Create leave request
    const leave = await Leave.create({
      user: userId,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      emergencyContact,
      backupPerson
    });

    return {
      leave: await leave.populate('user', 'employeeId fullName'),
      message: 'Leave request submitted successfully'
    };
  }

  // Get leaves (with filters)
  async getLeaves(filters = {}, userRole, userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // If employee, only show their own leaves
    if (userRole === 'EMPLOYEE') {
      query.user = userId;
    }

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.leaveType) query.leaveType = filters.leaveType;
    if (filters.employeeId) query.user = filters.employeeId;
    if (filters.fromDate) query.startDate = { $gte: new Date(filters.fromDate) };
    if (filters.toDate) query.endDate = { $lte: new Date(filters.toDate) };

    const leaves = await Leave.find(query)
      .populate('user', 'employeeId fullName email')
      .populate('approvedBy', 'fullName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Leave.countDocuments(query);

    return {
      leaves,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get single leave
  async getLeave(leaveId, userRole, userId) {
    // Validate ObjectId format
    if (!leaveId || !leaveId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid leave ID format');
    }

    const leave = await Leave.findById(leaveId)
      .populate('user', 'employeeId fullName email')
      .populate('approvedBy', 'fullName')
      .populate('comments.user', 'fullName role');

    if (!leave) {
      throw new Error('Leave request not found');
    }

    // If employee, check if it's their own leave
    if (userRole === 'EMPLOYEE') {
      if (leave.user._id.toString() !== userId.toString()) {
        throw new Error('Not authorized to view this leave request');
      }
    }

    return leave;
  }

  // Update leave status (HR/Admin)
  async updateLeaveStatus(leaveId, status, approvedBy, rejectionReason = '') {
    // Validate ObjectId format
    if (!leaveId || !leaveId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid leave ID format');
    }

    const leave = await Leave.findById(leaveId)
      .populate('user', 'fullName email');

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new Error('Only pending leaves can be updated');
    }

    leave.status = status.toUpperCase();
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();

    if (status.toUpperCase() === 'REJECTED') {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Send email notification
    const user = await User.findById(leave.user._id);
    if (user) {
      await sendLeaveStatusUpdate(user.email, leave, status);
    }

    return {
      leave,
      message: `Leave request ${status} successfully`
    };
  }

  // Cancel leave (Employee)
  async cancelLeave(leaveId, userId) {
    // Validate ObjectId format
    if (!leaveId || !leaveId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid leave ID format');
    }

    const leave = await Leave.findOne({
      _id: leaveId,
      user: userId
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status === 'CANCELLED') {
      throw new Error('Leave is already cancelled');
    }

    if (leave.status === 'REJECTED') {
      throw new Error('Cannot cancel rejected leave');
    }

    // Check if leave has already started
    if (leave.status === 'APPROVED' && new Date(leave.startDate) < new Date()) {
      throw new Error('Cannot cancel leave that has already started');
    }

    leave.status = 'CANCELLED';
    await leave.save();

    return {
      leave,
      message: 'Leave cancelled successfully'
    };
  }

  // Add comment to leave
  async addComment(leaveId, userId, comment) {
    // Validate ObjectId format
    if (!leaveId || !leaveId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid leave ID format');
    }

    const leave = await Leave.findById(leaveId);

    if (!leave) {
      throw new Error('Leave request not found');
    }

    leave.comments.push({
      user: userId,
      comment
    });

    await leave.save();

    return {
      leave: await leave.populate('comments.user', 'fullName role'),
      message: 'Comment added successfully'
    };
  }

  // Get leave summary for employee
  async getLeaveSummary(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User record not found');
    }

    // Ensure leaveBalance exists with default values
    const leaveBalance = user.leaveBalance || {
      annual: 1.5,
      sick: 0,
      personal: 0,
      maternity: 0,
      paternity: 0
    };

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get approved leaves for current year
    const approvedLeaves = await Leave.find({
      user: user._id,
      status: 'APPROVED',
      startDate: { $gte: yearStart, $lte: yearEnd }
    });

    // Calculate leaves by type
    const leavesByType = {
      annual: 0,
      sick: 0,
      personal: 0,
      maternity: 0,
      paternity: 0
    };

    approvedLeaves.forEach(leave => {
      if (leavesByType.hasOwnProperty(leave.leaveType)) {
        leavesByType[leave.leaveType] += leave.numberOfDays;
      }
    });

    return {
      balance: leaveBalance,
      taken: leavesByType,
      available: {
        annual: (leaveBalance.annual || 0) - leavesByType.annual,
        sick: (leaveBalance.sick || 0) - leavesByType.sick,
        personal: (leaveBalance.personal || 0) - leavesByType.personal,
        maternity: (leaveBalance.maternity || 0) - leavesByType.maternity,
        paternity: (leaveBalance.paternity || 0) - leavesByType.paternity
      },
      year: currentYear
    };
  }

  // Calculate leave days excluding weekends and holidays
  async calculateLeaveDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Check if it's a holiday
        const isHoliday = await Holiday.isHoliday(current);
        if (!isHoliday) {
          count++;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  // Get pending leaves for HR
  async getPendingLeaves() {
    const leaves = await Leave.find({ status: 'PENDING' })
      .populate('user', 'employeeId fullName email')
      .sort('createdAt');

    return leaves;
  }

  // Get leave statistics for HR/Admin
  async getLeaveStats() {
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'PENDING' });
    const approvedLeaves = await Leave.countDocuments({ status: 'APPROVED' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'REJECTED' });
    const cancelledLeaves = await Leave.countDocuments({ status: 'CANCELLED' });

    // Get leave types breakdown
    const leaveTypes = await Leave.aggregate([
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get monthly leave trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Leave.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return {
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      cancelledLeaves,
      leaveTypes,
      monthlyTrends
    };
  }

  // Get pending approvals for HR/Admin
  async getPendingApprovals() {
    const pendingApprovals = await Leave.find({ status: 'PENDING' })
      .populate('user', 'employeeId fullName email department jobTitle')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 })
      .limit(10);

    return pendingApprovals;
  }
}

module.exports = new LeaveService();
