const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const validator = require('validator');

// Sanitize and validate input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
};

// Validate email
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate mobile number
const isValidMobileNumber = (number) => {
  // Remove any non-digit characters and check if it's 10 digits
  const cleanNumber = number.replace(/\D/g, '');
  return cleanNumber.length === 10 && /^[6-9]\d{9}$/.test(cleanNumber);
};

// ========================================
// AUTHENTICATION CONTROLLERS
// ========================================

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const email = sanitizeInput(req.body.email);
  const password = req.body.password; // Don't sanitize password

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password'
    });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }

  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const result = await authService.getProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const sanitizedData = {
    fullName: sanitizeInput(req.body.fullName),
    personalEmail: sanitizeInput(req.body.personalEmail)
  };

  // Validate email if provided
  if (sanitizedData.personalEmail && !isValidEmail(sanitizedData.personalEmail)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }

  const result = await authService.updateProfile(req.user.id, sanitizedData);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Change password
// @route   PUT /api/auth/changepassword
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Please provide current password and new password'
    });
  }

  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email'
    });
  }

  const result = await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken, password } = req.body;

  if (!resetToken || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide reset token and new password'
    });
  }

  const result = await authService.resetPassword(resetToken, password);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, config.JWT_SECRET);

  // Add token to blacklist with its expiration time
  authService.blacklistToken(token, decoded.exp);

  res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully'
    }
  });
});

// @desc    Mobile login with OTP
// @route   POST /api/auth/mobile-login
// @access  Public
exports.mobileLogin = asyncHandler(async (req, res, next) => {
  const mobileNumber = sanitizeInput(req.body.mobileNumber);

  if (!mobileNumber) {
    return res.status(400).json({
      success: false,
      error: 'Mobile number is required'
    });
  }

  if (!isValidMobileNumber(mobileNumber)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid mobile number'
    });
  }

  const result = await authService.mobileLogin(mobileNumber);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { mobileNumber, otp } = req.body;

  if (!mobileNumber || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Mobile number and OTP are required'
    });
  }

  const result = await authService.verifyOTP(mobileNumber, otp);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get user onboarding data by mobile number
// @route   GET /api/auth/onboarding-data/:mobileNumber
// @access  Public
exports.getOnboardingData = asyncHandler(async (req, res, next) => {
  const { mobileNumber } = req.params;

  if (!mobileNumber) {
    return res.status(400).json({
      success: false,
      error: 'Mobile number is required'
    });
  }

  const result = await authService.getOnboardingData(mobileNumber);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Set initial password during onboarding
// @route   POST /api/auth/set-onboarding-password
// @access  Private (Employee during onboarding)
exports.setOnboardingPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    });
  }

  const result = await authService.setOnboardingPassword(req.user.id, password);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = asyncHandler(async (req, res, next) => {
  const { mobileNumber } = req.body;

  if (!mobileNumber) {
    return res.status(400).json({
      success: false,
      error: 'Mobile number is required'
    });
  }

  const result = await authService.resendOTP(mobileNumber);

  res.status(200).json({
    success: true,
    data: result
  });
});
