const holidayService = require('../services/holidayService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create holiday
// @route   POST /api/holidays
// @access  Private (HR, Admin)
exports.createHoliday = asyncHandler(async (req, res, next) => {
  const result = await holidayService.createHoliday(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Update holiday
// @route   PUT /api/holidays/:id
// @access  Private (HR, Admin)
exports.updateHoliday = asyncHandler(async (req, res, next) => {
  const result = await holidayService.updateHoliday(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Delete holiday
// @route   DELETE /api/holidays/:id
// @access  Private (HR, Admin)
exports.deleteHoliday = asyncHandler(async (req, res, next) => {
  const result = await holidayService.deleteHoliday(req.params.id);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get holidays
// @route   GET /api/holidays
// @access  Private
exports.getHolidays = asyncHandler(async (req, res, next) => {
  const result = await holidayService.getHolidays(req.query);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get single holiday
// @route   GET /api/holidays/:id
// @access  Private
exports.getHoliday = asyncHandler(async (req, res, next) => {
  const holiday = await holidayService.getHoliday(req.params.id);

  res.status(200).json({
    success: true,
    data: holiday
  });
});

// @desc    Get upcoming holidays
// @route   GET /api/holidays/upcoming
// @access  Private
exports.getUpcomingHolidays = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  const holidays = await holidayService.getUpcomingHolidays(limit);

  res.status(200).json({
    success: true,
    count: holidays.length,
    data: holidays
  });
});

// @desc    Bulk create holidays
// @route   POST /api/holidays/bulk
// @access  Private (HR, Admin)
exports.bulkCreateHolidays = asyncHandler(async (req, res, next) => {
  const { holidays } = req.body;

  if (!holidays || !Array.isArray(holidays)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide an array of holidays'
    });
  }

  const result = await holidayService.bulkCreateHolidays(holidays, req.user.id);

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Copy holidays from year
// @route   POST /api/holidays/copy
// @access  Private (HR, Admin)
exports.copyHolidaysFromYear = asyncHandler(async (req, res, next) => {
  const { fromYear, toYear } = req.body;

  if (!fromYear || !toYear) {
    return res.status(400).json({
      success: false,
      error: 'Please provide fromYear and toYear'
    });
  }

  const result = await holidayService.copyHolidaysFromYear(
    parseInt(fromYear),
    parseInt(toYear),
    req.user.id
  );

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Get holiday statistics
// @route   GET /api/holidays/stats
// @access  Private (HR, Admin)
exports.getHolidayStats = asyncHandler(async (req, res, next) => {
  const stats = await holidayService.getHolidayStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});
