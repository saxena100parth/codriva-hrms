const Employee = require('../models/Employee');
const User = require('../models/User');
const Onboarding = require('../models/Onboarding');
const { sendOnboardingInvitation } = require('../utils/email');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

class EmployeeService {
  // Get all employees
  async getAllEmployees(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const query = {};
    if (filters.department) query.department = filters.department;
    if (filters.status) query['onboardingStatus'] = filters.status;
    if (filters.search) {
      query.$or = [
        { 'fullName.first': new RegExp(filters.search, 'i') },
        { 'fullName.last': new RegExp(filters.search, 'i') },
        { employeeId: new RegExp(filters.search, 'i') },
        { officialEmail: new RegExp(filters.search, 'i') }
      ];
    }

    const employees = await Employee.find(query)
      .populate('user', 'name email role isActive')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const total = await Employee.countDocuments(query);

    return {
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get single employee
  async getEmployee(employeeId) {
    const employee = await Employee.findById(employeeId)
      .populate('user', 'name email role isActive createdAt')
      .populate('onboardingApprovedBy', 'name email');

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  }

  // Get employee by user ID
  async getEmployeeByUserId(userId) {
    const employee = await Employee.findOne({ user: userId })
      .populate('user', 'name email role isActive');

    if (!employee) {
      throw new Error('Employee record not found');
    }

    return employee;
  }

  // Update employee details (HR/Admin only)
  async updateEmployee(employeeId, updateData, updatedBy) {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Don't allow certain fields to be updated directly
    delete updateData.user;
    delete updateData.employeeId;
    delete updateData.onboardingStatus;

    Object.assign(employee, updateData);
    await employee.save();

    return employee;
  }

  // Initiate employee onboarding (HR only)
  async initiateOnboarding(data, initiatedBy) {
    const { personalEmail, officialEmail, temporaryPassword, name } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: officialEmail });
    if (existingUser) {
      throw new Error('User already exists with this official email');
    }

    // Create user account
    const user = await User.create({
      email: officialEmail,
      password: temporaryPassword,
      name,
      personalEmail,
      role: 'employee',
      isOnboarded: false
    });

    // Create employee record
    const employee = await Employee.create({
      user: user._id,
      personalEmail,
      officialEmail,
      onboardingStatus: 'pending'
    });

    // Create onboarding record
    const onboarding = await Onboarding.create({
      employee: employee._id,
      initiatedBy,
      personalEmail,
      officialEmail,
      temporaryPassword: await bcrypt.hash(temporaryPassword, config.BCRYPT_SALT_ROUNDS),
      status: 'invited'
    });

    // Send invitation email
    await sendOnboardingInvitation(officialEmail, temporaryPassword, personalEmail);

    // Add to timeline
    onboarding.timeline.push({
      action: 'invited',
      performedBy: initiatedBy,
      details: `Onboarding initiated for ${name}`
    });
    await onboarding.save();

    return {
      employee,
      onboarding,
      message: 'Onboarding invitation sent successfully'
    };
  }

  // Submit onboarding details (Employee)
  async submitOnboardingDetails(userId, details) {
    const employee = await Employee.findOne({ user: userId });

    if (!employee) {
      throw new Error('Employee record not found');
    }

    if (employee.onboardingStatus !== 'pending' && employee.onboardingStatus !== 'rejected') {
      throw new Error('Cannot submit onboarding details at this stage');
    }

    // Update employee details
    Object.assign(employee, details);
    employee.onboardingStatus = 'submitted';
    employee.onboardingSubmittedAt = new Date();
    await employee.save();

    // Update onboarding record
    const onboarding = await Onboarding.findOne({ employee: employee._id });
    if (onboarding) {
      onboarding.status = 'submitted';
      onboarding.detailsSubmittedAt = new Date();
      onboarding.timeline.push({
        action: 'details_submitted',
        performedBy: userId,
        details: 'Employee submitted onboarding details'
      });
      await onboarding.save();
    }

    // Mark user as onboarded (pending approval)
    await User.findByIdAndUpdate(userId, { isOnboarded: true });

    return {
      employee,
      message: 'Onboarding details submitted successfully'
    };
  }

  // Review onboarding (HR only)
  async reviewOnboarding(employeeId, decision, reviewedBy, comments = '') {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      throw new Error('Employee not found');
    }

    if (employee.onboardingStatus !== 'submitted') {
      throw new Error('Employee onboarding is not in review stage');
    }

    const onboarding = await Onboarding.findOne({ employee: employeeId });

    if (decision === 'approve') {
      employee.onboardingStatus = 'approved';
      employee.onboardingApprovedAt = new Date();
      employee.onboardingApprovedBy = reviewedBy;
      
      // Generate employee ID
      const count = await Employee.countDocuments({ onboardingStatus: 'approved' });
      employee.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;

      if (onboarding) {
        onboarding.status = 'approved';
        onboarding.reviewedBy = reviewedBy;
        onboarding.reviewedAt = new Date();
        onboarding.reviewComments = comments;
      }
    } else {
      employee.onboardingStatus = 'rejected';
      employee.onboardingRemarks = comments;

      if (onboarding) {
        onboarding.status = 'rejected';
        onboarding.reviewedBy = reviewedBy;
        onboarding.reviewedAt = new Date();
        onboarding.reviewComments = comments;
      }
    }

    await employee.save();
    
    if (onboarding) {
      onboarding.timeline.push({
        action: decision === 'approve' ? 'approved' : 'rejected',
        performedBy: reviewedBy,
        details: comments
      });
      await onboarding.save();
    }

    return {
      employee,
      message: `Onboarding ${decision === 'approve' ? 'approved' : 'rejected'} successfully`
    };
  }

  // Get onboarding status
  async getOnboardingStatus(employeeId) {
    const onboarding = await Onboarding.findOne({ employee: employeeId })
      .populate('employee')
      .populate('initiatedBy', 'name email')
      .populate('reviewedBy', 'name email');

    if (!onboarding) {
      throw new Error('Onboarding record not found');
    }

    return onboarding;
  }

  // Get pending onboardings (HR only)
  async getPendingOnboardings() {
    const employees = await Employee.find({ onboardingStatus: 'submitted' })
      .populate('user', 'name email')
      .sort('onboardingSubmittedAt');

    return employees;
  }

  // Update leave balance (HR only)
  async updateLeaveBalance(employeeId, leaveBalances) {
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      throw new Error('Employee not found');
    }

    Object.assign(employee.leaveBalance, leaveBalances);
    await employee.save();

    return {
      employee,
      message: 'Leave balance updated successfully'
    };
  }
}

module.exports = new EmployeeService();
