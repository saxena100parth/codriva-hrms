const User = require('../models/User');
const Employee = require('../models/Employee');

class UserService {
  // Get all users (HR/Admin)
  async getAllUsers(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const query = {};
    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true';
    if (filters.search) {
      query.$or = [
        { name: new RegExp(filters.search, 'i') },
        { email: new RegExp(filters.search, 'i') }
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

  // Get single user (HR/Admin)
  async getUser(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    // If user is employee, get employee details
    let employeeDetails = null;
    if (user.role === 'employee') {
      employeeDetails = await Employee.findOne({ user: userId });
    }

    return { user, employee: employeeDetails };
  }

  // Create HR user (Admin only)
  async createHRUser(userData, createdBy) {
    const { email, password, name, personalEmail } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create HR user
    const user = await User.create({
      email,
      password,
      name,
      personalEmail,
      role: 'hr',
      isOnboarded: true, // HR users don't need onboarding
      isActive: true
    });

    // Remove password from output
    user.password = undefined;

    return {
      user,
      message: 'HR user created successfully'
    };
  }

  // Update user (HR/Admin)
  async updateUser(userId, updateData, updatedBy) {
    // Don't allow certain fields to be updated
    delete updateData.password;
    delete updateData.role;
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

  // Toggle user active status (HR/Admin)
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
    if (user.role === 'admin' && updatingUser.role !== 'admin') {
      throw new Error('Only admins can deactivate admin accounts');
    }

    user.isActive = !user.isActive;
    await user.save();

    return {
      user,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
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
    if (user.role === 'admin' && resettingUser.role !== 'admin') {
      throw new Error('Only admins can reset admin passwords');
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    return {
      message: 'Password reset successfully'
    };
  }

  // Get user statistics (Admin only)
  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          inactive: {
            $sum: { $cond: ['$isActive', 0, 1] }
          }
        }
      }
    ]);

    const onboardingStats = await Employee.aggregate([
      {
        $group: {
          _id: '$onboardingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentUsers = await User.find()
      .select('name email role createdAt isActive')
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
        { name: new RegExp(searchTerm, 'i') },
        { email: new RegExp(searchTerm, 'i') }
      ]
    };

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('_id name email role')
      .limit(10);

    return users;
  }

  // Get HR users (for assignment purposes)
  async getHRUsers() {
    const hrUsers = await User.find({ 
      role: { $in: ['hr', 'admin'] },
      isActive: true
    })
      .select('_id name email')
      .sort('name');

    return hrUsers;
  }
}

module.exports = new UserService();
