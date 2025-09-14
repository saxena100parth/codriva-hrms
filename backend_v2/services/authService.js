const User = require('../models/User');
const config = require('../config/config');
const { sendEmail } = require('../utils/email');

class AuthService {
  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  // Login user
  async login(email, password) {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

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
    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active. Please contact administrator.');
    }

    // Remove password from output
    user.password = undefined;

    // Check if user needs to reset password (temporary password scenario)
    // Handle case where hasTemporaryPassword field might not exist for existing users
    const needsPasswordReset = user.hasTemporaryPassword === true;

    console.log('Login - user hasTemporaryPassword:', user.hasTemporaryPassword);
    console.log('Login - needsPasswordReset:', needsPasswordReset);
    console.log('Login - user status:', user.status);
    console.log('Login - user role:', user.role);

    return {
      user,
      token: user.getSignedJwtToken(),
      needsPasswordReset
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
    user.hasTemporaryPassword = false; // Clear temporary password flag
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

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send password reset email
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

    // Include needsPasswordReset flag in profile response
    const needsPasswordReset = user.hasTemporaryPassword === true;

    console.log('getProfile - user hasTemporaryPassword:', user.hasTemporaryPassword);
    console.log('getProfile - needsPasswordReset:', needsPasswordReset);

    return {
      ...user.toObject(),
      needsPasswordReset
    };
  }

  // Update profile
  async updateProfile(userId, updateData) {
    // Filter out undefined values to avoid overwriting with undefined
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    const user = await User.findByIdAndUpdate(
      userId,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return { user };
  }

  // Mobile login - send OTP
  async mobileLogin(mobileNumber) {
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      throw new Error('No user found with this mobile number');
    }

    // Check if user is in onboarding process
    if (user.onboardingStatus === 'COMPLETED') {
      throw new Error('User has already completed onboarding. Please use email login.');
    }

    // Check if invitation has expired
    if (user.inviteExpiryTime && user.inviteExpiryTime < Date.now()) {
      throw new Error('Invitation has expired. Please contact HR for a new invitation.');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otpCode = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP via email (in production, this would be SMS)
    await this.sendOTPEmail(user.personalEmail, otp);

    return {
      message: 'OTP sent successfully',
      mobileNumber: user.mobileNumber
    };
  }

  // Verify OTP
  async verifyOTP(mobileNumber, otp) {
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      throw new Error('No user found with this mobile number');
    }

    // Check if OTP is valid and not expired
    if (!user.otpCode || user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < Date.now()) {
      throw new Error('Invalid or expired OTP');
    }

    // Clear OTP after successful verification
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;

    // Update onboarding status to PENDING (keep status as DRAFT until onboarding is approved)
    if (user.onboardingStatus === 'INVITED') {
      user.onboardingStatus = 'PENDING';
      // Keep status as DRAFT during onboarding - only change to ACTIVE after approval
    }

    await user.save();

    // Refresh user data from database to ensure we have the latest status
    const refreshedUser = await User.findById(user._id);

    return {
      user: refreshedUser.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } }),
      token: refreshedUser.getSignedJwtToken()
    };
  }

  // Resend OTP
  async resendOTP(mobileNumber) {
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      throw new Error('No user found with this mobile number');
    }

    // Check if invitation has expired
    if (user.inviteExpiryTime && user.inviteExpiryTime < Date.now()) {
      throw new Error('Invitation has expired. Please contact HR for a new invitation.');
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otpCode = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send OTP via email
    await this.sendOTPEmail(user.personalEmail, otp);

    return {
      message: 'OTP resent successfully',
      mobileNumber: user.mobileNumber
    };
  }

  // Get onboarding data by mobile number
  async getOnboardingData(mobileNumber) {
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      throw new Error('No user found with this mobile number');
    }

    // Check if invitation has expired
    if (user.inviteExpiryTime && user.inviteExpiryTime < Date.now()) {
      throw new Error('Invitation has expired. Please contact HR for a new invitation.');
    }

    // Return user data for onboarding (excluding sensitive information)
    return {
      user: user.toObject({
        transform: (doc, ret) => {
          delete ret.password;
          delete ret.otpCode;
          delete ret.otpExpiresAt;
          return ret;
        }
      })
    };
  }

  // Send OTP email
  async sendOTPEmail(email, otp) {
    const subject = 'Your OTP for HRMS Login';
    const text = `
      Your OTP for HRMS login is: ${otp}
      
      This OTP will expire in 10 minutes.
      
      If you didn't request this OTP, please ignore this email.
      
      Best regards,
      HRMS Team
    `;

    return await sendEmail({
      to: email,
      subject,
      text
    });
  }

  // Set initial password during onboarding
  async setOnboardingPassword(userId, password) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is in onboarding process
    if (user.onboardingStatus !== 'APPROVED') {
      throw new Error('Cannot set password at this stage. Onboarding must be approved first.');
    }

    // Set the new password
    user.password = password;
    user.passwordChangedAt = Date.now();
    await user.save();

    return {
      message: 'Password set successfully',
      user: user.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } })
    };
  }

  // Check if token is blacklisted
  isTokenBlacklisted(token) {
    // For now, we'll implement a simple blacklist check
    // In a production environment, you might want to use Redis or a database
    // to store blacklisted tokens
    return false; // No tokens are blacklisted for now
  }

  // Add token to blacklist (for logout functionality)
  blacklistToken(token, expirationTime) {
    // For now, we'll implement a simple blacklist
    // In a production environment, you might want to use Redis or a database
    // to store blacklisted tokens with their expiration times
    // This is a placeholder implementation
    console.log(`Token blacklisted: ${token.substring(0, 20)}... (expires: ${expirationTime})`);
  }
}

module.exports = new AuthService();
