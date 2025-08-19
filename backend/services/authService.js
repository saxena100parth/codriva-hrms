const User = require('../models/User');
const Employee = require('../models/Employee');
const config = require('../config/config');
const { sendEmail } = require('../utils/email');

class AuthService {
  // Register user (mainly for HR creation by admin)
  async register(userData) {
    const { email, password, role, name, personalEmail } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      name,
      personalEmail
    });

    // If employee, create employee record
    if (role === 'employee') {
      await Employee.create({
        user: user._id,
        personalEmail,
        officialEmail: email
      });
    }

    // Remove password from output
    user.password = undefined;

    return {
      user,
      token: user.getSignedJwtToken()
    };
  }

  // Login user
  async login(email, password) {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }
    console.log('User found:', user);

    // Check if account is locked
    if (user.isLocked) {
      throw new Error('Account is locked due to too many failed login attempts. Please try again later.');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact administrator.');
    }

    // Remove password from output
    user.password = undefined;

    // Get employee details if user is employee
    let employeeDetails = null;
    if (user.role === 'employee') {
      employeeDetails = await Employee.findOne({ user: user._id });
    }

    return {
      user,
      employee: employeeDetails,
      token: user.getSignedJwtToken()
    };
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new Error('User not found');
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    return {
      message: 'Password changed successfully',
      token: user.getSignedJwtToken()
    };
  }

  // Forgot password
  async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('No user found with this email');
    }

    // Generate reset token (in production, implement proper token generation)
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click on this link to reset your password: ${resetUrl}. This link will expire in 30 minutes.`
    });

    return { message: 'Password reset email sent' };
  }

  // Reset password
  async resetPassword(resetToken, newPassword) {
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    return {
      message: 'Password reset successful',
      token: user.getSignedJwtToken()
    };
  }

  // Get current user profile
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    let profile = { user };

    // If employee, get employee details
    if (user.role === 'employee') {
      const employee = await Employee.findOne({ user: userId });
      profile.employee = employee;
    }

    return profile;
  }

  // Update profile
  async updateProfile(userId, updateData) {
    const { name, personalEmail } = updateData;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, personalEmail },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return { user };
  }
}

module.exports = new AuthService();
