const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEmployees,
  getEmployee,
  updateEmployee,
  initiateOnboarding,
  submitOnboarding,
  reviewOnboarding,
  getOnboardingStatus,
  getPendingOnboardings,
  updateLeaveBalance,
  getMyProfile
} = require('../controllers/employeeController');
const { protect, authorize, checkOnboarded } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

// Validation rules
const initiateOnboardingValidation = [
  body('personalEmail').isEmail().normalizeEmail(),
  body('officialEmail').isEmail().normalizeEmail(),
  body('temporaryPassword').isLength({ min: 6 }),
  body('name').notEmpty().trim()
];

const submitOnboardingValidation = [
  body('fullName.first').optional().trim(),
  body('fullName.last').optional().trim(),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('mobileNumber').optional().trim(),
  body('personalEmail').optional().isEmail().normalizeEmail(),
  body('currentAddress.city').optional().trim(),
  body('currentAddress.state').optional().trim(),
  body('currentAddress.country').optional().trim(),
  body('joiningDate').optional().isISO8601(),
  body('employmentType').optional().isIn(['full-time', 'intern', 'contractor'])
];

const reviewOnboardingValidation = [
  body('decision').isIn(['approve', 'reject']),
  body('comments').optional().trim()
];

const updateLeaveBalanceValidation = [
  body('annual').optional().isInt({ min: 0 }),
  body('sick').optional().isInt({ min: 0 }),
  body('personal').optional().isInt({ min: 0 }),
  body('maternity').optional().isInt({ min: 0 }),
  body('paternity').optional().isInt({ min: 0 })
];

// Routes

// Employee routes (must be protected)
router.use(protect);

// Employee self-service routes
router.get('/me', authorize('employee'), getMyProfile);
router.post('/onboarding/submit', authorize('employee'), submitOnboardingValidation, validate, submitOnboarding);

// HR/Admin routes
router.get('/onboarding/pending', authorize('hr', 'admin'), getPendingOnboardings);
router.post('/onboard', authorize('hr', 'admin'), initiateOnboardingValidation, validate, initiateOnboarding);
router.get('/', authorize('hr', 'admin'), checkOnboarded, getEmployees);
router.get('/:id', checkOnboarded, getEmployee);
router.put('/:id', authorize('hr', 'admin'), checkOnboarded, updateEmployee);
router.get('/:id/onboarding', getOnboardingStatus);
router.put('/:id/onboarding/review', authorize('hr', 'admin'), reviewOnboardingValidation, validate, reviewOnboarding);
router.put('/:id/leave-balance', authorize('hr', 'admin'), updateLeaveBalanceValidation, validate, updateLeaveBalance);

module.exports = router;
