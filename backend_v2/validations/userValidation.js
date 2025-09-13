const { body } = require('express-validator');

// Validation rules for user operations
const updateUserValidation = [
    body('fullName.first').optional().notEmpty().trim().escape(),
    body('fullName.last').optional().notEmpty().trim().escape(),
    body('personalEmail').optional().isEmail().normalizeEmail(),
    body('status').optional().isIn(['DRAFT', 'ACTIVE', 'INACTIVE', 'DELETED'])
];

const changeRoleValidation = [
    body('role').isIn(['ADMIN', 'HR', 'EMPLOYEE']).withMessage('Invalid role')
];

const resetPasswordValidation = [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const initiateOnboardingValidation = [
    body('name').notEmpty().trim().withMessage('Full name is required'),
    body('phone_number').notEmpty().trim().withMessage('Phone number is required'),
    body('personal_email').isEmail().normalizeEmail().withMessage('Valid personal email is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid official email is required'),
    body('invite_expiry_time').optional().isISO8601().withMessage('Valid expiry time is required')
];

const submitOnboardingValidation = [
    body('fullName.first').optional().trim(),
    body('fullName.last').optional().trim(),
    body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('mobileNumber').optional().trim(),
    body('personalEmail').optional().isEmail().normalizeEmail(),
    body('currentAddress.city').optional().trim(),
    body('currentAddress.state').optional().trim(),
    body('currentAddress.country').optional().trim(),
    body('joiningDate').optional().isISO8601().withMessage('Valid joining date is required'),
    body('employmentType').optional().isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'OTHER']).withMessage('Invalid employment type')
];

const reviewOnboardingValidation = [
    body('decision').isIn(['approve', 'reject']).withMessage('Decision must be approve or reject'),
    body('comments').optional().trim()
];

const updateLeaveBalanceValidation = [
    body('annual').optional().isFloat({ min: 0 }).withMessage('Annual leave must be a positive number'),
    body('sick').optional().isFloat({ min: 0 }).withMessage('Sick leave must be a positive number'),
    body('personal').optional().isFloat({ min: 0 }).withMessage('Personal leave must be a positive number'),
    body('maternity').optional().isFloat({ min: 0 }).withMessage('Maternity leave must be a positive number'),
    body('paternity').optional().isFloat({ min: 0 }).withMessage('Paternity leave must be a positive number')
];

module.exports = {
    updateUserValidation,
    changeRoleValidation,
    resetPasswordValidation,
    initiateOnboardingValidation,
    submitOnboardingValidation,
    reviewOnboardingValidation,
    updateLeaveBalanceValidation
};
