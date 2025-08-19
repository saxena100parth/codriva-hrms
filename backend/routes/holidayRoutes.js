const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getHolidays,
  getHoliday,
  getUpcomingHolidays,
  bulkCreateHolidays,
  copyHolidaysFromYear,
  getHolidayStats
} = require('../controllers/holidayController');
const { protect, authorize, checkOnboarded } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

// Validation rules
const createHolidayValidation = [
  body('name').notEmpty().trim(),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('type').optional().isIn(['national', 'regional', 'optional', 'company']),
  body('description').optional().trim(),
  body('isOptional').optional().isBoolean(),
  body('applicableFor').optional().isArray()
];

const updateHolidayValidation = [
  body('name').optional().notEmpty().trim(),
  body('date').optional().isISO8601(),
  body('type').optional().isIn(['national', 'regional', 'optional', 'company']),
  body('description').optional().trim(),
  body('isOptional').optional().isBoolean(),
  body('applicableFor').optional().isArray()
];

const bulkCreateValidation = [
  body('holidays').isArray().withMessage('Holidays must be an array'),
  body('holidays.*.name').notEmpty().trim(),
  body('holidays.*.date').isISO8601()
];

const copyHolidaysValidation = [
  body('fromYear').isInt({ min: 2020, max: 2030 }),
  body('toYear').isInt({ min: 2020, max: 2030 })
];

// All routes are protected
router.use(protect);
router.use(checkOnboarded);

// Public routes (for all authenticated users)
router.get('/upcoming', getUpcomingHolidays);
router.get('/', getHolidays);
router.get('/:id', getHoliday);

// HR/Admin only routes
router.use(authorize('hr', 'admin'));
router.post('/', createHolidayValidation, validate, createHoliday);
router.put('/:id', updateHolidayValidation, validate, updateHoliday);
router.delete('/:id', deleteHoliday);
router.post('/bulk', bulkCreateValidation, validate, bulkCreateHolidays);
router.post('/copy', copyHolidaysValidation, validate, copyHolidaysFromYear);
router.get('/stats/overview', getHolidayStats);

module.exports = router;
