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
      leavesByType[leave.leaveType] += leave.numberOfDays;
    });

    return {
      balance: user.leaveBalance,
      taken: leavesByType,
      available: {
        annual: user.leaveBalance.annual - leavesByType.annual,
        sick: user.leaveBalance.sick - leavesByType.sick,
        personal: user.leaveBalance.personal - leavesByType.personal,
        maternity: user.leaveBalance.maternity - leavesByType.maternity,
        paternity: user.leaveBalance.paternity - leavesByType.paternity
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
}

module.exports = new LeaveService();
