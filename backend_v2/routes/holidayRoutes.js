const express = require('express');
const router = express.Router();
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
const {
  createHolidayValidation,
  updateHolidayValidation,
  bulkCreateValidation,
  copyHolidaysValidation
} = require('../validations/holidayValidation');

// ========================================
// HOLIDAY MANAGEMENT ROUTES
// ========================================

// All routes are protected (authentication required)
router.use(protect);
router.use(checkOnboarded);

// ========================================
// PUBLIC ROUTES (for all authenticated users)
// ========================================
router.get('/upcoming', getUpcomingHolidays);                                    // Get upcoming holidays
router.get('/', getHolidays);                                                     // Get all holidays
router.get('/:id', getHoliday);                                                   // Get specific holiday details

// ========================================
// HR/ADMIN ONLY ROUTES
// ========================================
router.use(authorize('HR', 'ADMIN'));
router.post('/', createHolidayValidation, validate, createHoliday);               // Create new holiday
router.put('/:id', updateHolidayValidation, validate, updateHoliday);             // Update existing holiday
router.delete('/:id', deleteHoliday);                                             // Delete holiday
router.post('/bulk', bulkCreateValidation, validate, bulkCreateHolidays);         // Create multiple holidays at once
router.post('/copy', copyHolidaysValidation, validate, copyHolidaysFromYear);     // Copy holidays from previous year
router.get('/stats/overview', getHolidayStats);                                   // Get holiday statistics overview

module.exports = router;
