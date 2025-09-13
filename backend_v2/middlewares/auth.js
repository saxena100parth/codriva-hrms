const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const authService = require('../services/authService');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  // Check if token is blacklisted
  if (authService.isTokenBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      error: 'Token has been invalidated. Please log in again'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is active (not INACTIVE or DELETED)
    // Allow DRAFT status for users during onboarding process
    if (req.user.status === 'INACTIVE' || req.user.status === 'DELETED') {
      return res.status(401).json({
        success: false,
        error: `User account is ${req.user.status.toLowerCase()}. Please contact administrator.`
      });
    }

    // For DRAFT status users, only allow onboarding-related routes
    if (req.user.status === 'DRAFT') {
      const allowedRoutes = [
        '/api/users/onboarding/submit',
        '/api/users/onboarding/complete',
        '/api/auth/onboarding-data',
        '/api/auth/verify-otp',
        '/api/auth/resend-otp',
        '/api/auth/mobile-login',
        '/api/auth/me'
      ];

      // More robust route matching
      const fullPath = req.baseUrl + req.path; // Get the complete path
      const isAllowedRoute = allowedRoutes.some(route => {
        // Check if the request path matches the allowed route
        return fullPath === route || fullPath.startsWith(route + '/') || req.path === route || req.path.startsWith(route + '/');
      });

      if (!isAllowedRoute) {
        return res.status(401).json({
          success: false,
          error: 'User account is draft. Please contact administrator.',
          onboardingRequired: true,
          currentStatus: req.user.status,
          requestedPath: req.path,
          fullPath: fullPath,
          allowedRoutes: allowedRoutes
        });
      }
    }

    // Check if user changed password after token was issued
    if (req.user.passwordChangedAt) {
      const changedTimestamp = parseInt(
        req.user.passwordChangedAt.getTime() / 1000,
        10
      );

      if (decoded.iat < changedTimestamp) {
        return res.status(401).json({
          success: false,
          error: 'User recently changed password. Please log in again'
        });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is onboarded (for employees and HR)
exports.checkOnboarded = async (req, res, next) => {
  // Only check onboarding for EMPLOYEE and HR roles
  if ((req.user.role === 'EMPLOYEE' || req.user.role === 'HR') &&
    req.user.onboardingStatus !== 'COMPLETED') {

    // Allow access to onboarding and essential routes
    const allowedRoutes = [
      '/api/users/onboarding/submit',
      '/api/users/onboarding/review',
      '/api/auth/change-password',
      '/api/auth/profile',
      '/api/auth/verify-otp',
      '/api/auth/resend-otp',
      '/api/auth/mobile-login'
    ];

    const isAllowedRoute = allowedRoutes.some(route => req.path.includes(route));

    if (!isAllowedRoute) {
      return res.status(403).json({
        success: false,
        error: 'Please complete your onboarding process first',
        onboardingRequired: true,
        currentStatus: req.user.onboardingStatus
      });
    }
  }
  next();
};

// Check if user has completed onboarding (for specific operations)
exports.requireOnboarded = async (req, res, next) => {
  if (req.user.role === 'EMPLOYEE' || req.user.role === 'HR') {
    if (req.user.onboardingStatus !== 'COMPLETED') {
      return res.status(403).json({
        success: false,
        error: 'Onboarding must be completed before accessing this resource',
        onboardingRequired: true,
        currentStatus: req.user.onboardingStatus
      });
    }
  }
  next();
};

// Check if user can manage other users (ADMIN or HR)
exports.canManageUsers = (req, res, next) => {
  if (!['ADMIN', 'HR'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to manage users'
    });
  }
  next();
};

// Check if user is admin
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Rate limiting for sensitive operations
const rateLimitStore = new Map();

exports.rateLimit = (windowMs = 15 * 60 * 1000, max = 5) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const currentTime = Date.now();

    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < currentTime) {
        rateLimitStore.delete(k);
      }
    }

    const record = rateLimitStore.get(key);

    if (!record) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: currentTime + windowMs
      });
      return next();
    }

    if (record.resetTime < currentTime) {
      record.count = 1;
      record.resetTime = currentTime + windowMs;
      return next();
    }

    // Increment request count
    record.count += 1;

    // Check if max requests exceeded
    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((record.resetTime - currentTime) / 1000)
      });
    }

    return next();
  };
};

// OTP-based authentication middleware
exports.authenticateOTP = async (req, res, next) => {
  const { mobileNumber, otp } = req.body;

  if (!mobileNumber || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Mobile number and OTP are required'
    });
  }

  try {
    // Find user by mobile number
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'No user found with this mobile number'
      });
    }

    // Check if OTP is valid and not expired
    if (!user.otpCode || user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < Date.now()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    // Check if invitation has expired
    if (user.inviteExpiryTime && user.inviteExpiryTime < Date.now()) {
      return res.status(401).json({
        success: false,
        error: 'Invitation has expired. Please contact HR for a new invitation.'
      });
    }

    // Clear OTP after successful verification
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Set user in request
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};
