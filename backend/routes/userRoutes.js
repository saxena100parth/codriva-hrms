const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  toggleUserStatus,
  changeUserRole,
  resetUserPassword,
  getUserStats,
  searchUsers,
  getHRUsers,
  initiateOnboarding,
  submitOnboarding,
  reviewOnboarding,
  getPendingOnboardings,
  updateLeaveBalance,
  getMyProfile,
  completeOnboarding
} = require('../controllers/userController');
const { protect, authorize, checkOnboarded } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const {
  updateUserValidation,
  changeRoleValidation,
  resetPasswordValidation,
  initiateOnboardingValidation,
  submitOnboardingValidation,
  reviewOnboardingValidation,
  updateLeaveBalanceValidation
} = require('../validations/userValidation');

// ========================================
// USER MANAGEMENT ROUTES
// ========================================

// All routes are protected (authentication required)
router.use(protect);

// ========================================
// EMPLOYEE SELF-SERVICE ROUTES
// ========================================
router.get('/me', authorize('EMPLOYEE', 'HR'), getMyProfile);                    // Get current user's own profile
router.post('/onboarding/submit', authorize('EMPLOYEE'), submitOnboardingValidation, validate, submitOnboarding); // Submit onboarding documents
router.post('/onboarding/complete', authorize('EMPLOYEE'), completeOnboarding);  // Mark onboarding as completed

// ========================================
// HR/ADMIN ROUTES (requires HR or ADMIN role)
// ========================================
router.use(authorize('HR', 'ADMIN'));

// ========================================
// ONBOARDING MANAGEMENT ROUTES
// ========================================
// These routes are accessible to HR/Admin without completed onboarding
router.get('/onboarding/pending', getPendingOnboardings);                       // Get list of pending onboardings
router.put('/:id/onboarding/review', reviewOnboardingValidation, validate, reviewOnboarding); // Review and approve/reject onboarding

// ========================================
// USER MANAGEMENT ROUTES (requires completed onboarding)
// ========================================
router.use(checkOnboarded);
router.get('/stats', getUserStats);                                             // Get user statistics
router.get('/search', searchUsers);                                            // Search users by criteria
router.get('/hr-list', getHRUsers);                                            // Get list of HR users
router.post('/onboard', initiateOnboardingValidation, validate, initiateOnboarding); // Initiate onboarding for new employee
router.get('/', getUsers);                                                      // Get paginated list of all users
router.get('/:id', getUser);                                                    // Get specific user by ID
router.put('/:id', updateUserValidation, validate, updateUser);                // Update user details
router.put('/:id/toggle-status', toggleUserStatus);                            // Activate/deactivate user
router.put('/:id/role', authorize('ADMIN'), changeRoleValidation, validate, changeUserRole); // Change user role (ADMIN only)
router.put('/:id/reset-password', resetPasswordValidation, validate, resetUserPassword); // Reset user password
router.put('/:id/leave-balance', updateLeaveBalanceValidation, validate, updateLeaveBalance); // Update user's leave balance

module.exports = router;
