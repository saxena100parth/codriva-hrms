const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

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

    // Check if user is active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
    }

    // Check if user changed password after token was issued
    if (req.user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        error: 'User recently changed password. Please log in again'
      });
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

// Check if user is onboarded (for employees)
exports.checkOnboarded = async (req, res, next) => {
  if (req.user.role === 'employee' && !req.user.isOnboarded) {
    // Allow access to onboarding routes
    const onboardingRoutes = ['/api/onboarding/submit', '/api/auth/change-password'];
    const isOnboardingRoute = onboardingRoutes.some(route => req.path.includes(route));
    
    if (!isOnboardingRoute) {
      return res.status(403).json({
        success: false,
        error: 'Please complete your onboarding process first',
        onboardingRequired: true
      });
    }
  }
  next();
};

// Rate limiting for sensitive operations
const rateLimitStore = new Map();

exports.rateLimit = (windowMs = 15 * 60 * 1000, max = 5) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    
    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
    
    const record = rateLimitStore.get(key);
    
    if (!record) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (record.resetTime < now) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter
      });
    }
    
    record.count++;
    next();
  };
};
