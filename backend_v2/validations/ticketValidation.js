const { body } = require('express-validator');

// Validation rules for ticket operations
const createTicketValidation = [
    body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['IT', 'HR', 'FINANCE', 'ADMIN', 'OTHER'])
        .withMessage('Invalid category. Must be one of: IT, HR, FINANCE, ADMIN, OTHER'),
    body('priority')
        .optional()
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true; // Allow empty values
            }
            if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(value)) {
                throw new Error('Invalid priority. Must be one of: LOW, MEDIUM, HIGH, URGENT');
            }
            return true;
        }),
    body('subject')
        .notEmpty()
        .withMessage('Subject is required')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Subject must be between 1 and 100 characters'),
    body('description')
        .notEmpty()
        .withMessage('Description is required')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long')
];

const updateTicketValidation = [
    body('status')
        .optional()
        .isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'])
        .withMessage('Invalid status. Must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED'),
    body('priority')
        .optional()
        .custom((value) => {
            if (value === '' || value === null || value === undefined) {
                return true; // Allow empty values
            }
            if (!['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(value)) {
                throw new Error('Invalid priority. Must be one of: LOW, MEDIUM, HIGH, URGENT');
            }
            return true;
        }),
    body('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid user ID for assignment'),
    body('resolution')
        .optional()
        .trim()
        .isLength({ min: 5 })
        .withMessage('Resolution must be at least 5 characters long')
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
