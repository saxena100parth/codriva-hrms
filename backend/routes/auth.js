const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Onboarding = require('../models/Onboarding');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (public)
// @access  Public
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'hr', 'employee'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = 'employee' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Onboarding: HR invites employee with personal email (creates user with temp password and invited status)
// @route   POST /api/auth/invite
// @desc    HR invite employee (creates temporary login)
// @access  Private (HR, Admin)
router.post('/invite', auth, authorize('hr', 'admin'), [
  body('username').isLength({ min: 3, max: 30 }).withMessage('Username 3-30 chars'),
  body('email').isEmail().withMessage('Valid personal email'),
  body('password').isLength({ min: 6 }).withMessage('Temporary password min 6 chars')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User with email or username already exists' });

    const user = new User({ username, email, password, role: 'employee', onboardingStatus: 'invited' });
    await user.save();

    res.status(201).json({ message: 'Employee invited successfully', user: { id: user._id, username, email, role: user.role, onboardingStatus: user.onboardingStatus } });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ message: 'Server error during invite' });
  }
});

// Onboarding: employee submits onboarding details (moves to submitted)
// @route   POST /api/auth/onboarding
// @desc    Employee submits onboarding details
// @access  Private (Employee)
router.post('/onboarding', auth, authorize('employee'), [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('phone').notEmpty(),
  body('dateOfBirth').isISO8601(),
  body('gender').isIn(['male', 'female', 'other']),
  body('department').notEmpty(),
  body('position').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const payload = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      department: req.body.department,
      position: req.body.position,
    };

    let ob = await Onboarding.findOne({ userId: user._id });
    if (!ob) {
      ob = new Onboarding({ userId: user._id, data: payload, status: 'submitted' });
    } else {
      ob.data = payload;
      ob.status = 'submitted';
    }
    await ob.save();

    user.onboardingStatus = 'submitted';
    await user.save();

    res.json({ message: 'Onboarding details submitted', status: user.onboardingStatus, onboarding: ob });
  } catch (error) {
    console.error('Onboarding submit error:', error);
    res.status(500).json({ message: 'Server error during onboarding' });
  }
});

// Onboarding: HR reviews and approves, sets official email and creates/updates employee record
// @route   POST /api/auth/onboarding/:userId/approve
// @desc    HR approves onboarding and assigns official email
// @access  Private (HR, Admin)
router.post('/onboarding/:userId/approve', auth, authorize('hr', 'admin'), [
  param('userId').isMongoId(),
  body('officialEmail').isEmail().withMessage('Valid official email required'),
  body('employee').isObject().withMessage('Employee payload required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { userId } = req.params;
    const { officialEmail, employee } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure unique official email
    const existingEmail = await User.findOne({ email: officialEmail });
    if (existingEmail && existingEmail._id.toString() !== userId) {
      return res.status(400).json({ message: 'Official email already in use' });
    }

    // Update user email -> official, mark approved
    user.email = officialEmail;
    user.officialEmail = officialEmail;
    user.onboardingStatus = 'approved';
    await user.save();

    // Pull onboarding data if present
    let ob = await Onboarding.findOne({ userId });

    // Create or update employee record
    const Employee = require('../models/Employee');
    let emp = await Employee.findOne({ userId: user._id });
    const merged = { ...(ob?.data || {}), ...(employee || {}) };
    if (!emp) {
      emp = new Employee({ ...merged, userId: user._id, email: officialEmail });
      await emp.save();
    } else {
      Object.assign(emp, { ...merged, email: officialEmail });
      await emp.save();
    }

    if (ob) {
      ob.status = 'submitted';
      await ob.save();
    }

    res.json({ message: 'Onboarding approved', user: { id: user._id, email: user.email, onboardingStatus: user.onboardingStatus }, employee: emp });
  } catch (error) {
    console.error('Onboarding approve error:', error);
    res.status(500).json({ message: 'Server error during approval' });
  }
});

// HR: list submitted onboarding entries for review
// @route   GET /api/auth/onboarding/submissions
// @access  Private (HR, Admin)
router.get('/onboarding/submissions', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const submissions = await Onboarding.find({ status: 'submitted' }).populate('userId', 'username email');
    res.json({ submissions });
  } catch (error) {
    console.error('List onboarding submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me', auth, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
