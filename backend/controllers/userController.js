const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (HR, Admin)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  
  const result = await userService.getAllUsers(
    filters,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (HR, Admin)
exports.getUser = asyncHandler(async (req, res, next) => {
  const result = await userService.getUser(req.params.id);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Create HR user
// @route   POST /api/users/hr
// @access  Private (Admin only)
exports.createHRUser = asyncHandler(async (req, res, next) => {
  const result = await userService.createHRUser(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (HR, Admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const result = await userService.updateUser(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Toggle user status
// @route   PUT /api/users/:id/toggle-status
// @access  Private (HR, Admin)
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const result = await userService.toggleUserStatus(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Reset user password
// @route   PUT /api/users/:id/reset-password
// @access  Private (HR, Admin)
exports.resetUserPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    });
  }

  const result = await userService.resetUserPassword(
    req.params.id,
    password,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin only)
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await userService.getUserStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private (HR, Admin)
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { q, role } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }

  const users = await userService.searchUsers(q, role);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get HR users
// @route   GET /api/users/hr-list
// @access  Private (HR, Admin)
exports.getHRUsers = asyncHandler(async (req, res, next) => {
  const users = await userService.getHRUsers();

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});
