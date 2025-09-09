const { body } = require('express-validator');

// Validation rules for leave operations
const applyLeaveValidation = [
    body('leaveType').isIn(['annual', 'sick', 'personal', 'maternity', 'paternity']).withMessage('Invalid leave type'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('reason').notEmpty().trim().withMessage('Reason is required'),
    body('emergencyContact.name').optional().trim(),
    body('emergencyContact.phone').optional().trim(),
    body('backupPerson').optional().trim()
];

const updateStatusValidation = [
    body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
    body('rejectionReason').if(body('status').equals('REJECTED')).notEmpty().withMessage('Rejection reason is required when status is REJECTED')
];

const addCommentValidation = [
    body('comment').notEmpty().trim().withMessage('Comment is required')
];

module.exports = {
    applyLeaveValidation,
    updateStatusValidation,
    addCommentValidation
};
