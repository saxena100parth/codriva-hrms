const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  createHRUser,
  updateUser,
  toggleUserStatus,
  resetUserPassword,
  getUserStats,
  searchUsers,
  getHRUsers
} = require('../controllers/userController');
const { protect, authorize, checkOnboarded } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

// Validation rules
const createHRValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().trim().escape(),
  body('personalEmail').optional().isEmail().normalizeEmail()
];

const updateUserValidation = [
  body('name').optional().notEmpty().trim().escape(),
  body('personalEmail').optional().isEmail().normalizeEmail(),
  body('isActive').optional().isBoolean()
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// All routes are protected and require HR or Admin role
router.use(protect);
router.use(checkOnboarded);
router.use(authorize('hr', 'admin'));

// Routes
router.get('/stats', authorize('admin'), getUserStats);
router.get('/search', searchUsers);
router.get('/hr-list', getHRUsers);
router.post('/hr', authorize('admin'), createHRValidation, validate, createHRUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUserValidation, validate, updateUser);
router.put('/:id/toggle-status', toggleUserStatus);
router.put('/:id/reset-password', resetPasswordValidation, validate, resetUserPassword);

module.exports = router;
