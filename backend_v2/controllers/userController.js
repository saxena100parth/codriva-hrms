const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all users (now includes employees)
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
// @access  Private (HR, Admin, or own profile)
exports.getUser = asyncHandler(async (req, res, next) => {
  // Check if user is accessing their own profile
  if (req.user.role === 'EMPLOYEE' && req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view this profile'
    });
  }

  const user = await userService.getUser(req.params.id);

  res.status(200).json({
    success: true,
    data: user
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

// @desc    Change user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
exports.changeUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role || !['ADMIN', 'HR', 'EMPLOYEE'].includes(role.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid role (ADMIN, HR, EMPLOYEE)'
    });
  }

  const result = await userService.changeUserRole(
    req.params.id,
    role,
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
// @access  Private (HR, Admin)
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

// @desc    Initiate employee onboarding
// @route   POST /api/users/onboard
// @access  Private (HR, Admin)
exports.initiateOnboarding = asyncHandler(async (req, res, next) => {
  const result = await userService.initiateOnboarding(
    req.body,
    req.user.id
  );

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Submit onboarding details
// @route   POST /api/users/onboarding/submit
// @access  Private (Employee)
exports.submitOnboarding = asyncHandler(async (req, res, next) => {
  const result = await userService.submitOnboardingDetails(
    req.user.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Review onboarding (approve/reject)
// @route   PUT /api/users/:id/onboarding/review
// @access  Private (HR, Admin)
exports.reviewOnboarding = asyncHandler(async (req, res, next) => {
  const { decision, comments, officialEmail } = req.body;

  if (!decision || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid decision (approve/reject)'
    });
  }

  // Require official email for approval
  if (decision === 'approve' && !officialEmail) {
    return res.status(400).json({
      success: false,
      error: 'Official email address is required for approval'
    });
  }

  const result = await userService.reviewOnboarding(
    req.params.id,
    decision,
    req.user.id,
    comments || '',
    officialEmail
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get pending onboardings
// @route   GET /api/users/onboarding/pending
// @access  Private (HR, Admin)
exports.getPendingOnboardings = asyncHandler(async (req, res, next) => {
  const result = await userService.getPendingOnboardings();

  res.status(200).json({
    success: true,
    count: result.length,
    data: result
  });
});

// @desc    Update leave balance
// @route   PUT /api/users/:id/leave-balance
// @access  Private (HR, Admin)
exports.updateLeaveBalance = asyncHandler(async (req, res, next) => {
  const result = await userService.updateLeaveBalance(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get my profile (employee)
// @route   GET /api/users/me
// @access  Private (Employee)
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await userService.getMyProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Complete onboarding (Employee)
// @route   POST /api/users/onboarding/complete
// @access  Private (Employee)
exports.completeOnboarding = asyncHandler(async (req, res, next) => {
  const result = await userService.completeOnboarding(req.user.id);

  res.status(200).json({
    success: true,
    data: result
  });
});
