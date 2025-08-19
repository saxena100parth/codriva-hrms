const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
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

// Validation rules
const createTicketValidation = [
  body('category').isIn(['IT', 'HR', 'Finance', 'Admin', 'Other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('subject').notEmpty().trim().isLength({ max: 100 }),
  body('description').notEmpty().trim()
];

const updateTicketValidation = [
  body('status').optional().isIn(['open', 'in-progress', 'resolved', 'closed', 'cancelled']),
  body('resolution').optional().trim()
];

const assignTicketValidation = [
  body('assignTo').isMongoId()
];

const addCommentValidation = [
  body('comment').notEmpty().trim(),
  body('isInternal').optional().isBoolean()
];

const addRatingValidation = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').optional().trim()
];

// All routes are protected
router.use(protect);
router.use(checkOnboarded);

// HR/Admin routes
router.get('/stats', authorize('hr', 'admin'), getTicketStats);
router.get('/assigned', authorize('hr', 'admin'), getMyAssignedTickets);

// Common routes
router.post('/', authorize('employee'), createTicketValidation, validate, createTicket);
router.get('/', getTickets);
router.get('/:id', getTicket);
router.put('/:id', authorize('hr', 'admin'), updateTicketValidation, validate, updateTicket);
router.put('/:id/assign', authorize('hr', 'admin'), assignTicketValidation, validate, assignTicket);
router.post('/:id/comments', addCommentValidation, validate, addComment);
router.post('/:id/rating', authorize('employee'), addRatingValidation, validate, addRating);

module.exports = router;
