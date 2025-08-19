const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Private (Admin only)
exports.register = asyncHandler(async (req, res, next) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password'
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
  const result = await authService.updateProfile(req.user.id, req.body);

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
  // In a stateless JWT system, logout is handled on the client side
  // by removing the token. Here we just send a success response.
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully'
    }
  });
});
