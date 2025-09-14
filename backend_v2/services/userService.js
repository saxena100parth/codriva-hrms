const User = require('../models/User');

class UserService {
  // Get all users (HR/Admin)
  async getAllUsers(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.role) query.role = filters.role.toUpperCase();
    if (filters.status) query.status = filters.status.toUpperCase();
    if (filters.department) query.department = filters.department.toUpperCase();
    if (filters.onboardingStatus) query.onboardingStatus = filters.onboardingStatus.toUpperCase();
    if (filters.search) {
      query.$or = [
        { email: new RegExp(filters.search, 'i') },
        { employeeId: new RegExp(filters.search, 'i') },
        { 'fullName.first': new RegExp(filters.search, 'i') },
        { 'fullName.last': new RegExp(filters.search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get single user
  async getUser(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user (HR/Admin)
  async updateUser(userId, updateData, updatedBy) {
    // Don't allow certain fields to be updated
    delete updateData.password;
    delete updateData._id;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return {
      user,
      message: 'User updated successfully'
    };
  }

  // Toggle user status (HR/Admin)
  async toggleUserStatus(userId, updatedBy) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    // Prevent deactivating self
    if (userId === updatedBy) {
      throw new Error('Cannot deactivate your own account');
    }

    // Prevent deactivating admin users (only other admins can do this)
    const updatingUser = await User.findById(updatedBy);
    if (user.role === 'ADMIN' && updatingUser.role !== 'ADMIN') {
      throw new Error('Only admins can deactivate admin accounts');
    }

    user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await user.save();

    return {
      user,
      message: `User ${user.status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`
    };
  }

  // Change user role (Admin only)
  async changeUserRole(userId, newRole, changedBy) {
    const user = await User.findById(userId);
    const changingUser = await User.findById(changedBy);

    if (!user) {
      throw new Error('User not found');
    }

    if (changingUser.role !== 'ADMIN') {
      throw new Error('Only admins can change user roles');
    }

    if (userId === changedBy) {
      throw new Error('Cannot change your own role');
    }

    const oldRole = user.role;
    user.role = newRole.toUpperCase();

    // If promoting to HR, ensure they're onboarded
    if (newRole.toUpperCase() === 'HR' && user.onboardingStatus !== 'COMPLETED') {
      user.onboardingStatus = 'COMPLETED';
      user.onboardingApprovedAt = new Date();
      user.onboardingApprovedBy = changedBy;
    }

    await user.save();

    return {
      user,
      message: `User role changed from ${oldRole} to ${newRole} successfully`
    };
  }

  // Reset user password (HR/Admin)
  async resetUserPassword(userId, newPassword, resetBy) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Prevent resetting admin passwords by non-admins
    const resettingUser = await User.findById(resetBy);
    if (user.role === 'ADMIN' && resettingUser.role !== 'ADMIN') {
      throw new Error('Only admins can reset admin passwords');
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    return {
      message: 'Password reset successfully'
    };
  }

  // Get user statistics
  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$status', 'INACTIVE'] }, 1, 0] }
          }
        }
      }
    ]);

    const onboardingStats = await User.aggregate([
      {
        $match: { role: { $in: ['EMPLOYEE', 'HR'] } }
      },
      {
        $group: {
          _id: '$onboardingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .select('fullName email role createdAt status')
      .sort('-createdAt')
      .limit(5);

    return {
      byRole: stats.reduce((acc, curr) => {
        acc[curr._id] = {
          total: curr.count,
          active: curr.active,
          inactive: curr.inactive
        };
        return acc;
      }, {}),
      onboarding: onboardingStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      recentUsers
    };
  }

  // Search users
  async searchUsers(searchTerm, role = null) {
    const query = {
      $or: [
        { email: new RegExp(searchTerm, 'i') },
        { 'fullName.first': new RegExp(searchTerm, 'i') },
        { 'fullName.last': new RegExp(searchTerm, 'i') }
      ]
    };

    if (role) {
      query.role = role.toUpperCase();
    }

    const users = await User.find(query)
      .select('_id fullName email role')
      .limit(10);

    return users;
  }

  // Get HR users (for assignment purposes)
  async getHRUsers() {
    const hrUsers = await User.find({
      role: { $in: ['HR', 'ADMIN'] },
      status: 'ACTIVE'
    })
      .select('_id fullName email')
      .sort('fullName.first');

    return hrUsers;
  }

  // Initiate employee onboarding (HR/Admin)
  async initiateOnboarding(data, initiatedBy) {
    const { name, phone_number, personal_email, email, invite_expiry_time } = data;

    // Check if user already exists
    if (email) {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        throw new Error('User already exists with this official email');
      }
    }

    // Check if mobile number already exists
    const existingMobileUser = await User.findOne({ mobileNumber: phone_number });
    if (existingMobileUser) {
      throw new Error('User already exists with this mobile number');
    }

    // Generate invitation token
    const invitationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create user account
    const userData = {
      fullName: {
        first: name.split(' ')[0] || name,
        last: name.split(' ').slice(1).join(' ') || ''
      },
      mobileNumber: phone_number,
      personalEmail: personal_email,
      role: 'EMPLOYEE',
      status: 'DRAFT',
      onboardingStatus: 'INVITED',
      inviteExpiryTime: invite_expiry_time ? new Date(invite_expiry_time) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
      invitationToken: invitationToken
    };

    // Add email if provided
    if (email) {
      userData.email = email;
      // Generate temporary password for email login
      const tempPassword = Math.random().toString(36).substring(2, 15);
      userData.password = tempPassword;
    }

    const user = await User.create(userData);

    // Generate invitation URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const invitationUrl = `${frontendUrl}/onboarding?mobile=${phone_number}&token=${invitationToken}`;

    // Send invitation email
    const { sendOnboardingInvitation } = require('../utils/email');
    await sendOnboardingInvitation(user, personal_email, invitationUrl);

    return {
      user,
      invitationUrl,
      message: 'Onboarding invitation sent successfully'
    };
  }

  // Submit onboarding details (Employee)
  async submitOnboardingDetails(userId, details) {
    console.log('=== SUBMIT ONBOARDING DETAILS CALLED ===');
    console.log('User ID:', userId);
    console.log('Details:', details);

    const user = await User.findById(userId);

    if (!user) {
      console.log('User not found for ID:', userId);
      throw new Error('User not found');
    }

    console.log('Current user status:', user.onboardingStatus);
    console.log('User role:', user.role);
    console.log('User email:', user.email);

    if (user.onboardingStatus !== 'PENDING' && user.onboardingStatus !== 'REJECTED') {
      console.log('Invalid status for submission:', user.onboardingStatus);
      throw new Error('Cannot submit onboarding details at this stage');
    }

    // Update user details
    // Handle reportingManager separately to avoid ObjectId casting issues
    const { reportingManager, ...otherDetails } = details;

    Object.assign(user, otherDetails);

    // Store reporting manager name during onboarding (will be resolved to ObjectId later)
    if (reportingManager) {
      user.reportingManagerName = reportingManager;
    }

    user.onboardingStatus = 'SUBMITTED';
    user.onboardingSubmittedAt = new Date();

    console.log('Updating user status to:', user.onboardingStatus);
    console.log('Setting submittedAt to:', user.onboardingSubmittedAt);

    await user.save();

    console.log('User saved successfully. New status:', user.onboardingStatus);
    console.log('User saved successfully. SubmittedAt:', user.onboardingSubmittedAt);

    // Send notification email to HR/Admin
    const { sendOnboardingSubmittedNotification } = require('../utils/email');
    await sendOnboardingSubmittedNotification(user);

    return {
      user,
      message: 'Onboarding details submitted successfully'
    };
  }

  // Review onboarding (HR/Admin)
  async reviewOnboarding(userId, decision, reviewedBy, comments = '', officialEmail = null) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.onboardingStatus !== 'SUBMITTED') {
      throw new Error('User onboarding is not in review stage');
    }

    if (decision === 'approve') {
      // REQUIRE official email assignment during approval
      if (!officialEmail) {
        throw new Error('Official email address is required for approval. Please assign an official email address.');
      }

      // Validate official email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(officialEmail)) {
        throw new Error('Please provide a valid official email address.');
      }

      // Check if official email is already in use
      const existingUser = await User.findOne({
        email: officialEmail.toLowerCase(),
        _id: { $ne: userId } // Exclude current user
      });

      if (existingUser) {
        throw new Error('Official email address is already in use by another user.');
      }

      user.onboardingStatus = 'APPROVED'; // Set to APPROVED first, COMPLETED after email confirmation
      user.onboardingApprovedAt = new Date();
      user.onboardingApprovedBy = reviewedBy;
      user.onboardingRemarks = comments;

      // Assign the official email address
      user.email = officialEmail.toLowerCase();

      // Generate a temporary password if no password is set
      let tempPassword = null;
      if (!user.password) {
        const crypto = require('crypto');
        tempPassword = crypto.randomBytes(8).toString('hex');
        user.password = tempPassword; // Will be hashed by pre-save hook
        user.hasTemporaryPassword = true; // Mark as having temporary password
      }

      user.status = 'ACTIVE';

      // Generate employee ID
      const count = await User.countDocuments({
        onboardingStatus: 'COMPLETED',
        role: { $in: ['EMPLOYEE', 'HR'] }
      });
      user.employeeId = `EMP${String(count + 1).padStart(5, '0')}`;

      // Try to resolve reporting manager name to ObjectId if provided
      if (user.reportingManagerName) {
        try {
          // Look for a user with matching name (first name or last name contains the manager name)
          const managerName = user.reportingManagerName.toLowerCase();
          const manager = await User.findOne({
            $or: [
              { 'fullName.first': { $regex: managerName, $options: 'i' } },
              { 'fullName.last': { $regex: managerName, $options: 'i' } },
              { 'fullName.first': { $regex: managerName.split(' ')[0], $options: 'i' } }
            ],
            role: { $in: ['EMPLOYEE', 'HR', 'ADMIN'] },
            status: 'ACTIVE'
          });

          if (manager) {
            user.reportingManager = manager._id;
          }
          // If no manager found, keep the name in reportingManagerName for manual assignment later
        } catch (error) {
          console.log('Could not resolve reporting manager:', error.message);
          // Keep the name in reportingManagerName for manual assignment later
        }
      }

      // Save user with APPROVED status first
      await user.save();

      // Send approval email with official email and temp password
      const { sendOnboardingApprovedNotification } = require('../utils/email');
      await sendOnboardingApprovedNotification(user, tempPassword);

      // Set status to COMPLETED after email is sent
      user.onboardingStatus = 'COMPLETED';
      user.status = 'ACTIVE';
      await user.save();
    } else {
      user.onboardingStatus = 'REJECTED';
      user.onboardingRemarks = comments;

      // Send rejection email
      const { sendOnboardingRejectedNotification } = require('../utils/email');
      await sendOnboardingRejectedNotification(user, comments);
    }

    await user.save();

    return {
      user,
      message: `Onboarding ${decision === 'approve' ? 'approved' : 'rejected'} successfully`
    };
  }

  // Get pending onboardings (HR/Admin)
  async getPendingOnboardings() {
    console.log('Fetching pending onboardings...');

    const users = await User.find({
      onboardingStatus: { $in: ['PENDING', 'SUBMITTED'] },
      role: { $in: ['EMPLOYEE', 'HR'] }
    })
      .select('-password')
      .sort('onboardingSubmittedAt');

    console.log('Found pending onboardings:', users.length);
    console.log('Users:', users.map(u => ({
      id: u._id,
      name: u.fullName?.first,
      status: u.onboardingStatus,
      role: u.role
    })));

    return users;
  }

  // Complete onboarding after password reset (Employee)
  async completeOnboarding(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.onboardingStatus !== 'APPROVED') {
      throw new Error('Onboarding must be approved before completion');
    }

    user.onboardingStatus = 'COMPLETED';
    await user.save();

    return {
      user,
      message: 'Onboarding completed successfully'
    };
  }

  // Update leave balance (HR/Admin)
  async updateLeaveBalance(userId, leaveBalances) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'EMPLOYEE' && user.role !== 'HR') {
      throw new Error('Leave balance can only be updated for employees');
    }

    Object.assign(user.leaveBalance, leaveBalances);
    await user.save();

    return {
      user,
      message: 'Leave balance updated successfully'
    };
  }

  // Get my profile (for current user)
  async getMyProfile(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

}

module.exports = new UserService();
