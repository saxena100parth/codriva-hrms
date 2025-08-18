const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Employee = require('../models/Employee');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees with pagination and search
// @access  Private (HR, Admin)
router.get('/', auth, authorize('hr', 'admin'), [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  query('department')
    .optional()
    .isString()
    .withMessage('Department must be a string'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'terminated', 'resigned'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Get employees with pagination
    const employees = await Employee.find(filter)
      .populate('userId', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Employee.countDocuments(filter);

    res.json({
      employees,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEmployees: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/employees/:id
// @desc    Get employee by ID
// @access  Private (HR, Admin, Employee - own profile)
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'username email role');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if user can access this employee data
    if (req.user.role === 'employee' && req.user._id.toString() !== employee.userId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/employees
// @desc    Create a new employee (finalize onboarding or direct create)
// @access  Private (HR, Admin)
router.post('/', auth, authorize('hr', 'admin'), [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('department')
    .notEmpty()
    .withMessage('Department is required'),
  body('position')
    .notEmpty()
    .withMessage('Position is required'),
  body('salary')
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number'),
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await Employee.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const employee = new Employee(req.body);
    await employee.save();

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'username email role');

    res.status(201).json({
      message: 'Employee created successfully',
      employee: populatedEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (HR, Admin, Employee - own profile)
router.put('/:id', auth, [
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .notEmpty()
    .withMessage('Phone number cannot be empty'),
  body('department')
    .optional()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('position')
    .optional()
    .notEmpty()
    .withMessage('Position cannot be empty'),
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if user can update this employee
    if (req.user.role === 'employee' && req.user._id.toString() !== employee.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== employee.email) {
      const existingEmail = await Employee.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'username email role');

    res.json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee (soft delete by changing status)
// @access  Private (HR, Admin)
router.delete('/:id', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete by changing status
    employee.status = 'terminated';
    await employee.save();

    res.json({ message: 'Employee terminated successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
