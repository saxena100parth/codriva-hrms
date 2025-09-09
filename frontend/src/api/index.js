// ========================================
// CENTRALIZED API EXPORTS
// ========================================

// Only export APIs that are actually being used
export { default as authAPI } from './authAPI';        // Authentication API (login, OTP, password)
export { default as userAPI } from './userAPI';        // User management API (onboarding, profiles)

// Re-export the base API instance for services
export { default as api } from './baseAPI';
