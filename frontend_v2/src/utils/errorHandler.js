// Error handling utility for API responses
export class ApiError extends Error {
    constructor(message, statusCode, type = 'API_ERROR') {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.type = type;
    }
}

// Status code to user-friendly message mapping
export const ERROR_MESSAGES = {
    // Client Errors (4xx)
    400: {
        title: 'Bad Request',
        message: 'The request was invalid. Please check your input and try again.',
        type: 'VALIDATION_ERROR'
    },
    401: {
        title: 'Unauthorized',
        message: 'You are not authorized to access this resource. Please log in again.',
        type: 'AUTH_ERROR'
    },
    403: {
        title: 'Forbidden',
        message: 'You do not have permission to perform this action.',
        type: 'PERMISSION_ERROR'
    },
    404: {
        title: 'Not Found',
        message: 'The requested resource was not found.',
        type: 'NOT_FOUND_ERROR'
    },
    422: {
        title: 'Validation Error',
        message: 'Please check your input and try again.',
        type: 'VALIDATION_ERROR'
    },
    429: {
        title: 'Too Many Requests',
        message: 'You have made too many requests. Please wait a moment and try again.',
        type: 'RATE_LIMIT_ERROR'
    },

    // Server Errors (5xx)
    500: {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        type: 'SERVER_ERROR'
    },

    // Network Errors
    NETWORK_ERROR: {
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        type: 'NETWORK_ERROR'
    },

    // Timeout Errors
    TIMEOUT_ERROR: {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        type: 'TIMEOUT_ERROR'
    }
};

// Specific error messages for common scenarios
export const SPECIFIC_ERROR_MESSAGES = {
    // Authentication errors
    'Invalid credentials': 'The email or password you entered is incorrect.',
    'Account is locked': 'Your account has been temporarily locked due to too many failed login attempts. Please try again later.',
    'Account is not active': 'Your account is not active. Please contact your administrator.',
    'Token expired': 'Your session has expired. Please log in again.',
    'Invalid token': 'Your session is invalid. Please log in again.',
    'Not authorized to access this route': 'You are not authorized to access this resource.',

    // Validation errors
    'Please provide email and password': 'Email and password are required.',
    'Please provide a valid email address': 'Please enter a valid email address.',
    'Password must be at least 6 characters': 'Password must be at least 6 characters long.',
    'Please provide current password and new password': 'Both current and new passwords are required.',

    // Permission errors
    'User role is not authorized to access this route': 'You do not have permission to access this feature.',
    'Insufficient permissions to manage users': 'You need administrator or HR permissions to manage users.',
    'Admin access required': 'Administrator access is required for this action.',
    'Please complete your onboarding process first': 'You need to complete your onboarding before accessing this feature.',
    'Onboarding must be completed before accessing this resource': 'Please complete your onboarding process first.',

    // Resource errors
    'Resource not found': 'The requested resource was not found.',
    'User not found': 'User not found.',
    'No user found with this email': 'No account found with this email address.',
    'No user found with this mobile number': 'No account found with this mobile number.',

    // Duplicate errors
    'email already exists': 'An account with this email already exists.',
    'mobileNumber already exists': 'An account with this mobile number already exists.',
    'employeeId already exists': 'An employee with this ID already exists.',

    // OTP errors
    'Invalid or expired OTP': 'The OTP you entered is invalid or has expired.',
    'Invitation has expired': 'Your invitation has expired. Please contact HR for a new invitation.',

    // Leave errors
    'Insufficient leave balance': 'You do not have enough leave balance for this request.',
    'Leave request not found': 'The leave request was not found.',
    'Cannot modify approved or rejected leave': 'You cannot modify a leave request that has been approved or rejected.',

    // Ticket errors
    'Ticket not found': 'The support ticket was not found.',
    'Cannot modify closed ticket': 'You cannot modify a closed ticket.',

    // Holiday errors
    'Holiday not found': 'The holiday was not found.',
    'Holiday already exists for this date': 'A holiday already exists for this date.',

    // Rate limiting
    'Too many requests, please try again later': 'You have made too many requests. Please wait before trying again.'
};

// Function to get user-friendly error message
export function getErrorMessage(error, statusCode = null) {
    // If it's an ApiError, use its message
    if (error instanceof ApiError) {
        return {
            title: ERROR_MESSAGES[error.statusCode]?.title || 'Error',
            message: SPECIFIC_ERROR_MESSAGES[error.message] || error.message,
            type: ERROR_MESSAGES[error.statusCode]?.type || 'API_ERROR'
        };
    }

    // If it's a string error message
    if (typeof error === 'string') {
        return {
            title: ERROR_MESSAGES[statusCode]?.title || 'Error',
            message: SPECIFIC_ERROR_MESSAGES[error] || error,
            type: ERROR_MESSAGES[statusCode]?.type || 'API_ERROR'
        };
    }

    // If it's an Error object
    if (error instanceof Error) {
        return {
            title: ERROR_MESSAGES[statusCode]?.title || 'Error',
            message: SPECIFIC_ERROR_MESSAGES[error.message] || error.message,
            type: ERROR_MESSAGES[statusCode]?.type || 'API_ERROR'
        };
    }

    // Default fallback
    return {
        title: 'Error',
        message: 'An unexpected error occurred. Please try again.',
        type: 'UNKNOWN_ERROR'
    };
}

// Function to determine if error should trigger logout
export function shouldLogoutOnError(error, statusCode) {
    const logoutStatusCodes = [401, 403];
    const logoutMessages = [
        'Token expired',
        'Invalid token',
        'Not authorized to access this route',
        'Account is not active'
    ];

    if (logoutStatusCodes.includes(statusCode)) {
        return true;
    }

    if (typeof error === 'string' && logoutMessages.some(msg => error.includes(msg))) {
        return true;
    }

    if (error instanceof Error && logoutMessages.some(msg => error.message.includes(msg))) {
        return true;
    }

    return false;
}

// Function to determine if error should show retry option
export function shouldShowRetry(error, statusCode) {
    const retryStatusCodes = [429, 500];
    const retryMessages = [
        'Too many requests',
        'Server Error',
        'Network Error',
        'Request Timeout'
    ];

    if (retryStatusCodes.includes(statusCode)) {
        return true;
    }

    if (typeof error === 'string' && retryMessages.some(msg => error.includes(msg))) {
        return true;
    }

    if (error instanceof Error && retryMessages.some(msg => error.message.includes(msg))) {
        return true;
    }

    return false;
}
