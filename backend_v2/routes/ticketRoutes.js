const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  assignTicket,
  addComment,
  addRating,
  getTicketStats,
  getMyAssignedTickets
} = require('../controllers/ticketController');
const { protect, authorize, checkOnboarded } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const {
  createTicketValidation,
  updateTicketValidation,
  assignTicketValidation,
  addCommentValidation,
  addRatingValidation
} = require('../validations/ticketValidation');

// ========================================
// TICKET MANAGEMENT ROUTES
// ========================================

// All routes are protected (authentication required)
router.use(protect);
router.use(checkOnboarded);

// ========================================
// HR/ADMIN ROUTES
// ========================================
router.get('/stats', authorize('HR', 'ADMIN'), getTicketStats);                   // Get ticket statistics
router.get('/assigned', authorize('HR', 'ADMIN'), getMyAssignedTickets);          // Get tickets assigned to current HR/Admin user

// ========================================
// COMMON ROUTES (accessible to all authenticated users)
// ========================================
router.post('/', authorize('EMPLOYEE'), createTicketValidation, validate, createTicket); // Create new support ticket
router.get('/', getTickets);                                                      // Get list of tickets (filtered by user role)
router.get('/:id', getTicket);                                                    // Get specific ticket details
router.put('/:id', authorize('HR', 'ADMIN'), updateTicketValidation, validate, updateTicket); // Update ticket details
router.put('/:id/assign', authorize('HR', 'ADMIN'), assignTicketValidation, validate, assignTicket); // Assign ticket to HR/Admin
router.post('/:id/comments', addCommentValidation, validate, addComment);         // Add comment to ticket
router.post('/:id/rating', authorize('EMPLOYEE'), addRatingValidation, validate, addRating); // Rate ticket resolution

module.exports = router;
