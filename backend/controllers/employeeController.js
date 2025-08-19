const employeeService = require('../services/employeeService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (HR, Admin)
exports.getEmployees = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, ...filters } = req.query;
  
  const result = await employeeService.getAllEmployees(
    filters,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private (HR, Admin, or own profile)
exports.getEmployee = asyncHandler(async (req, res, next) => {
  let employee;
  
  // If user is requesting their own profile
  if (req.user.role === 'employee' && !req.params.id) {
    employee = await employeeService.getEmployeeByUserId(req.user.id);
  } else {
    // Check if employee is accessing someone else's profile
    if (req.user.role === 'employee') {
      const ownEmployee = await employeeService.getEmployeeByUserId(req.user.id);
      if (ownEmployee._id.toString() !== req.params.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this profile'
        });
      }
    }
    employee = await employeeService.getEmployee(req.params.id);
  }

  res.status(200).json({
    success: true,
    data: employee
  });
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (HR, Admin)
exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const result = await employeeService.updateEmployee(
    req.params.id,
    req.body,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Initiate employee onboarding
// @route   POST /api/employees/onboard
// @access  Private (HR, Admin)
exports.initiateOnboarding = asyncHandler(async (req, res, next) => {
  const result = await employeeService.initiateOnboarding(
    req.body,
    req.user.id
  );

  res.status(201).json({
    success: true,
    data: result
  });
});

// @desc    Submit onboarding details
// @route   POST /api/employees/onboarding/submit
// @access  Private (Employee)
exports.submitOnboarding = asyncHandler(async (req, res, next) => {
  const result = await employeeService.submitOnboardingDetails(
    req.user.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Review onboarding (approve/reject)
// @route   PUT /api/employees/:id/onboarding/review
// @access  Private (HR, Admin)
exports.reviewOnboarding = asyncHandler(async (req, res, next) => {
  const { decision, comments } = req.body;

  if (!decision || !['approve', 'reject'].includes(decision)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid decision (approve/reject)'
    });
  }

  const result = await employeeService.reviewOnboarding(
    req.params.id,
    decision,
    req.user.id,
    comments
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get onboarding status
// @route   GET /api/employees/:id/onboarding
// @access  Private (HR, Admin, or own)
exports.getOnboardingStatus = asyncHandler(async (req, res, next) => {
  // Check if employee is accessing their own onboarding status
  if (req.user.role === 'employee') {
    const employee = await employeeService.getEmployeeByUserId(req.user.id);
    if (employee._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this onboarding status'
      });
    }
  }

  const result = await employeeService.getOnboardingStatus(req.params.id);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get pending onboardings
// @route   GET /api/employees/onboarding/pending
// @access  Private (HR, Admin)
exports.getPendingOnboardings = asyncHandler(async (req, res, next) => {
  const result = await employeeService.getPendingOnboardings();

  res.status(200).json({
    success: true,
    count: result.length,
    data: result
  });
});

// @desc    Update employee leave balance
// @route   PUT /api/employees/:id/leave-balance
// @access  Private (HR, Admin)
exports.updateLeaveBalance = asyncHandler(async (req, res, next) => {
  const result = await employeeService.updateLeaveBalance(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Get my profile (employee)
// @route   GET /api/employees/me
// @access  Private (Employee)
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  const employee = await employeeService.getEmployeeByUserId(req.user.id);

  res.status(200).json({
    success: true,
    data: employee
  });
});
