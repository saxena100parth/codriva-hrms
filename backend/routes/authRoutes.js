const express = require('express');
const { login, getMe, updateDetails, changePassword, forgotPassword, resetPassword,
  logout,  mobileLogin, verifyOTP,  resendOTP, setOnboardingPassword
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const {
  loginValidation,
  updateDetailsValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  mobileLoginValidation,
  verifyOTPValidation,
  resendOTPValidation,
  setOnboardingPasswordValidation
} = require('../validations/authValidation');

const router = express.Router();

// ========================================
// AUTHENTICATION ROUTES
// ========================================
// Security Model: Only the default admin is created automatically.
// All other users must be invited by admin/HR roles through the onboarding process.
// No self-registration is allowed to maintain system security.

// Public routes (no authentication required)
router.post('/login', loginValidation, validate, login);                            // User login with email/password
router.post('/forgotpassword', forgotPasswordValidation, validate, forgotPassword); // Send password reset email
router.put('/resetpassword', resetPasswordValidation, validate, resetPassword);     // Reset password with token
router.post('/mobile-login', mobileLoginValidation, validate, mobileLogin);         // Send OTP to mobile for onboarding
router.post('/verify-otp', verifyOTPValidation, validate, verifyOTP);               // Verify OTP for mobile login
router.post('/resend-otp', resendOTPValidation, validate, resendOTP);               // Resend OTP if expired

// Protected routes (authentication required)
router.get('/me', protect, getMe);                                                  // Get current user profile
router.put('/updatedetails', protect, updateDetailsValidation, validate, updateDetails); // Update user profile details
router.put('/changepassword', protect, changePasswordValidation, validate, changePassword); // Change password
router.post('/set-onboarding-password', protect, setOnboardingPasswordValidation, validate, setOnboardingPassword); // Set initial password during onboarding
router.post('/logout', protect, logout);                                           // Logout user

module.exports = router;
