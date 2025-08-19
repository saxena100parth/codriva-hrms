const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  applyLeave,
  getLeaves,
  getLeave,
  updateLeaveStatus,
  cancelLeave,
  addComment,
  getLeaveSummary,
  getPendingLeaves
} = require('../controllers/leaveController');
const { protect, authorize, checkOnboarded } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

// Validation rules
const applyLeaveValidation = [
  body('leaveType').isIn(['annual', 'sick', 'personal', 'maternity', 'paternity']),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').notEmpty().trim().withMessage('Reason is required'),
  body('emergencyContact.name').optional().trim(),
  body('emergencyContact.phone').optional().trim(),
  body('backupPerson').optional().trim()
];

const updateStatusValidation = [
  body('status').isIn(['approved', 'rejected']),
  body('rejectionReason').if(body('status').equals('rejected')).notEmpty()
];

const addCommentValidation = [
  body('comment').notEmpty().trim()
];

// All routes are protected
router.use(protect);
router.use(checkOnboarded);

// Employee routes
router.get('/summary', authorize('employee'), getLeaveSummary);

// HR/Admin routes
router.get('/pending', authorize('hr', 'admin'), getPendingLeaves);

// Common routes
router.post('/', authorize('employee'), applyLeaveValidation, validate, applyLeave);
router.get('/', getLeaves);
router.get('/:id', getLeave);
router.put('/:id/status', authorize('hr', 'admin'), updateStatusValidation, validate, updateLeaveStatus);
router.put('/:id/cancel', authorize('employee'), cancelLeave);
router.post('/:id/comments', addCommentValidation, validate, addComment);

module.exports = router;
