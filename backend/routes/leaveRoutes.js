const express = require('express');
const router = express.Router();
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
const {
  applyLeaveValidation,
  updateStatusValidation,
  addCommentValidation
} = require('../validations/leaveValidation');

// ========================================
// LEAVE MANAGEMENT ROUTES
// ========================================

// All routes are protected (authentication required)
router.use(protect);
router.use(checkOnboarded);

// ========================================
// EMPLOYEE ROUTES
// ========================================
router.get('/summary', authorize('EMPLOYEE'), getLeaveSummary);                   // Get employee's leave summary and balance

// ========================================
// HR/ADMIN ROUTES
// ========================================
router.get('/pending', authorize('HR', 'ADMIN'), getPendingLeaves);              // Get list of pending leave requests

// ========================================
// COMMON ROUTES (accessible to all authenticated users)
// ========================================
router.post('/', authorize('EMPLOYEE'), applyLeaveValidation, validate, applyLeave); // Apply for leave
router.get('/', getLeaves);                                                      // Get list of leaves (filtered by user role)
router.get('/:id', getLeave);                                                    // Get specific leave request details
router.put('/:id/status', authorize('HR', 'ADMIN'), updateStatusValidation, validate, updateLeaveStatus); // Approve/reject leave request
router.put('/:id/cancel', authorize('EMPLOYEE'), cancelLeave);                   // Cancel leave request
router.post('/:id/comments', addCommentValidation, validate, addComment);        // Add comment to leave request

module.exports = router;
