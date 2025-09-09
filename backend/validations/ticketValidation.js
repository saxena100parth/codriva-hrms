const { body } = require('express-validator');

// Validation rules for ticket operations
const createTicketValidation = [
    body('category').isIn(['IT', 'HR', 'FINANCE', 'ADMIN', 'OTHER']).withMessage('Invalid category'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
    body('subject').notEmpty().trim().isLength({ max: 100 }).withMessage('Subject is required and cannot exceed 100 characters'),
    body('description').notEmpty().trim().withMessage('Description is required')
];

const updateTicketValidation = [
    body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED']).withMessage('Invalid status'),
    body('resolution').optional().trim()
];

const assignTicketValidation = [
    body('assignTo').isMongoId().withMessage('Valid user ID is required for assignment')
];

const addCommentValidation = [
    body('comment').notEmpty().trim().withMessage('Comment is required'),
    body('isInternal').optional().isBoolean().withMessage('isInternal must be a boolean')
];

const addRatingValidation = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('feedback').optional().trim()
];

module.exports = {
    createTicketValidation,
    updateTicketValidation,
    assignTicketValidation,
    addCommentValidation,
    addRatingValidation
};
