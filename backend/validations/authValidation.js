const { body } = require('express-validator');

// ========================================
// AUTHENTICATION VALIDATION RULES
// ========================================

// Login validation
const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Update profile details validation
const updateDetailsValidation = [
    body('fullName.first').optional().notEmpty().trim().escape(),
    body('fullName.last').optional().notEmpty().trim().escape(),
    body('personalEmail').optional().isEmail().normalizeEmail()
];

// Change password validation
const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Forgot password validation
const forgotPasswordValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

// Reset password validation
const resetPasswordValidation = [
    body('resetToken').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Mobile login validation
const mobileLoginValidation = [
    body('mobileNumber').notEmpty().trim().withMessage('Mobile number is required')
];

// OTP verification validation
const verifyOTPValidation = [
    body('mobileNumber').notEmpty().trim().withMessage('Mobile number is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

// Resend OTP validation
const resendOTPValidation = [
    body('mobileNumber').notEmpty().trim().withMessage('Mobile number is required')
];

// Set onboarding password validation
const setOnboardingPasswordValidation = [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

module.exports = {
    loginValidation,
    updateDetailsValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    mobileLoginValidation,
    verifyOTPValidation,
    resendOTPValidation,
    setOnboardingPasswordValidation
};
