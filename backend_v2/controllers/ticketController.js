const ticketService = require('../services/ticketService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create ticket
// @route   POST /api/tickets
// @access  Private (Employee)
exports.createTicket = asyncHandler(async (req, res, next) => {
  const result = await ticketService.createTicket(req.user.id, req.body);

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Get tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  
  const result = await ticketService.getTickets(
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

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = asyncHandler(async (req, res, next) => {
  const ticket = await ticketService.getTicket(
    req.params.id,
    req.user.role,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: ticket
  });
});

// @desc    Update ticket status
// @route   PUT /api/tickets/:id
// @access  Private (HR, Admin)
exports.updateTicket = asyncHandler(async (req, res, next) => {
  const result = await ticketService.updateTicketStatus(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Assign ticket
// @route   PUT /api/tickets/:id/assign
// @access  Private (HR, Admin)
exports.assignTicket = asyncHandler(async (req, res, next) => {
  const { assignTo } = req.body;

  if (!assignTo) {
    return res.status(400).json({
      success: false,
      error: 'Please provide user ID to assign'
    });
  }

  const result = await ticketService.assignTicket(
    req.params.id,
    assignTo,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const { comment, isInternal } = req.body;

  if (!comment) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a comment'
    });
  }

  const result = await ticketService.addComment(
    req.params.id,
    req.user.id,
    comment,
    isInternal
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Add rating to ticket
// @route   POST /api/tickets/:id/rating
// @access  Private (Employee - ticket owner only)
exports.addRating = asyncHandler(async (req, res, next) => {
  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a rating between 1 and 5'
    });
  }

  const result = await ticketService.addRating(
    req.params.id,
    req.user.id,
    rating,
    feedback
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private (HR, Admin)
exports.getTicketStats = asyncHandler(async (req, res, next) => {
  const stats = await ticketService.getTicketStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get my assigned tickets
// @route   GET /api/tickets/assigned
// @access  Private (HR, Admin)
exports.getMyAssignedTickets = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  
  const tickets = await ticketService.getMyAssignedTickets(
    req.user.id,
    status
  );

  res.status(200).json({
    success: true,
    count: tickets.length,
    data: tickets
  });
});
