const leaveService = require('../services/leaveService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee)
exports.applyLeave = asyncHandler(async (req, res, next) => {
  const result = await leaveService.applyLeave(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Get leaves
// @route   GET /api/leaves
// @access  Private
exports.getLeaves = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  
  const result = await leaveService.getLeaves(
    filters,
    req.user.role,
    req.user.id,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = asyncHandler(async (req, res, next) => {
  const leave = await leaveService.getLeave(
    req.params.id,
    req.user.role,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: leave
  });
});

// @desc    Update leave status (approve/reject)
// @route   PUT /api/leaves/:id/status
// @access  Private (HR, Admin)
exports.updateLeaveStatus = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid status (approved/rejected)'
    });
  }

  if (status === 'rejected' && !rejectionReason) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a reason for rejection'
    });
  }

  const result = await leaveService.updateLeaveStatus(
    req.params.id,
    status,
    req.user.id,
    rejectionReason
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Cancel leave
// @route   PUT /api/leaves/:id/cancel
// @access  Private (Employee - own leave only)
exports.cancelLeave = asyncHandler(async (req, res, next) => {
  const result = await leaveService.cancelLeave(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Add comment to leave
// @route   POST /api/leaves/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a comment'
    });
  }

  const result = await leaveService.addComment(
    req.params.id,
    req.user.id,
    comment
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get leave summary
// @route   GET /api/leaves/summary
// @access  Private (Employee)
exports.getLeaveSummary = asyncHandler(async (req, res, next) => {
  const summary = await leaveService.getLeaveSummary(req.user.id);

  res.status(200).json({
    success: true,
    data: summary
  });
});

// @desc    Get pending leaves
// @route   GET /api/leaves/pending
// @access  Private (HR, Admin)
exports.getPendingLeaves = asyncHandler(async (req, res, next) => {
  const leaves = await leaveService.getPendingLeaves();

  res.status(200).json({
    success: true,
    count: leaves.length,
    data: leaves
  });
});
