const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  changePassword,
  logout
} = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().trim().escape(),
  body('role').isIn(['admin', 'hr', 'employee']).withMessage('Invalid role'),
  body('personalEmail').optional().isEmail().normalizeEmail()
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const changePasswordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail()
];

const resetPasswordValidation = [
  body('resetToken').notEmpty(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const updateDetailsValidation = [
  body('name').optional().notEmpty().trim().escape(),
  body('personalEmail').optional().isEmail().normalizeEmail()
];

// Routes
router.post('/register', protect, authorize('admin'), registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsValidation, validate, updateDetails);
router.put('/changepassword', protect, changePasswordValidation, validate, changePassword);
router.post('/forgotpassword', forgotPasswordValidation, validate, forgotPassword);
router.put('/resetpassword', resetPasswordValidation, validate, resetPassword);

module.exports = router;
