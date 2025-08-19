const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Holiday = require('../models/Holiday');
const { sendLeaveStatusUpdate } = require('../utils/email');

class LeaveService {
  // Apply for leave (Employee)
  async applyLeave(userId, leaveData) {
    const employee = await Employee.findOne({ user: userId });
    
    if (!employee) {
      throw new Error('Employee record not found');
    }

    if (employee.onboardingStatus !== 'approved') {
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
    const availableLeave = employee.leaveBalance[leaveType] - employee.leavesTaken[leaveType];
    if (numberOfDays > availableLeave) {
      throw new Error(`Insufficient ${leaveType} leave balance. Available: ${availableLeave} days`);
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employee: employee._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingLeave) {
      throw new Error('You already have a leave request for these dates');
    }

    // Create leave request
    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      emergencyContact,
      backupPerson
    });

    return {
      leave: await leave.populate('employee', 'employeeId displayName'),
      message: 'Leave request submitted successfully'
    };
  }

  // Get leaves (with filters)
  async getLeaves(filters = {}, userRole, userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {};

    // If employee, only show their own leaves
    if (userRole === 'employee') {
      const employee = await Employee.findOne({ user: userId });
      if (employee) {
        query.employee = employee._id;
      }
    }

    // Apply filters
    if (filters.status) query.status = filters.status;
    if (filters.leaveType) query.leaveType = filters.leaveType;
    if (filters.employeeId) query.employee = filters.employeeId;
    if (filters.fromDate) query.startDate = { $gte: new Date(filters.fromDate) };
    if (filters.toDate) query.endDate = { $lte: new Date(filters.toDate) };

    const leaves = await Leave.find(query)
      .populate('employee', 'employeeId fullName officialEmail')
      .populate('approvedBy', 'name')
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
      .populate('employee', 'employeeId fullName officialEmail')
      .populate('approvedBy', 'name')
      .populate('comments.user', 'name role');

    if (!leave) {
      throw new Error('Leave request not found');
    }

    // If employee, check if it's their own leave
    if (userRole === 'employee') {
      const employee = await Employee.findOne({ user: userId });
      if (!employee || leave.employee._id.toString() !== employee._id.toString()) {
        throw new Error('Not authorized to view this leave request');
      }
    }

    return leave;
  }

  // Update leave status (HR/Admin)
  async updateLeaveStatus(leaveId, status, approvedBy, rejectionReason = '') {
    const leave = await Leave.findById(leaveId)
      .populate('employee', 'user');

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'pending') {
      throw new Error('Only pending leaves can be updated');
    }

    leave.status = status;
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();

    if (status === 'rejected') {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();

    // Send email notification
    const employee = await Employee.findById(leave.employee._id).populate('user');
    if (employee && employee.user) {
      await sendLeaveStatusUpdate(employee.user.email, leave, status);
    }

    return {
      leave,
      message: `Leave request ${status} successfully`
    };
  }

  // Cancel leave (Employee)
  async cancelLeave(leaveId, userId) {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      throw new Error('Employee record not found');
    }

    const leave = await Leave.findOne({
      _id: leaveId,
      employee: employee._id
    });

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status === 'cancelled') {
      throw new Error('Leave is already cancelled');
    }

    if (leave.status === 'rejected') {
      throw new Error('Cannot cancel rejected leave');
    }

    // Check if leave has already started
    if (leave.status === 'approved' && new Date(leave.startDate) < new Date()) {
      throw new Error('Cannot cancel leave that has already started');
    }

    leave.status = 'cancelled';
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
      leave: await leave.populate('comments.user', 'name role'),
      message: 'Comment added successfully'
    };
  }

  // Get leave summary for employee
  async getLeaveSummary(userId) {
    const employee = await Employee.findOne({ user: userId });

    if (!employee) {
      throw new Error('Employee record not found');
    }

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    // Get approved leaves for current year
    const approvedLeaves = await Leave.find({
      employee: employee._id,
      status: 'approved',
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
      balance: employee.leaveBalance,
      taken: leavesByType,
      available: {
        annual: employee.leaveBalance.annual - leavesByType.annual,
        sick: employee.leaveBalance.sick - leavesByType.sick,
        personal: employee.leaveBalance.personal - leavesByType.personal,
        maternity: employee.leaveBalance.maternity - leavesByType.maternity,
        paternity: employee.leaveBalance.paternity - leavesByType.paternity
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
    const leaves = await Leave.find({ status: 'pending' })
      .populate('employee', 'employeeId fullName officialEmail')
      .sort('createdAt');

    return leaves;
  }
}

module.exports = new LeaveService();
