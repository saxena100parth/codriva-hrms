# Validation Rules

This folder contains all the validation rules for the HRMS API endpoints. The validation rules are organized by feature and use `express-validator` for input validation.

## Structure

```
validations/
├── index.js                 # Main export file for all validations
├── authValidation.js        # Authentication related validations
├── holidayValidation.js     # Holiday management validations
├── leaveValidation.js       # Leave management validations
├── ticketValidation.js      # Ticket management validations
├── userValidation.js        # User management validations
└── README.md               # This file
```

## Usage

### Importing Validation Rules

```javascript
// Import specific validation rules
const { createHolidayValidation } = require('../validations/holidayValidation');

// Import all validation rules
const validations = require('../validations');
const { createHolidayValidation } = validations;
```

### Using in Routes

```javascript
const express = require('express');
const router = express.Router();
const { createHolidayValidation } = require('../validations/holidayValidation');
const { validate } = require('../middlewares/validation');

router.post('/', createHolidayValidation, validate, createHoliday);
```

## Available Validation Rules

### Authentication (`authValidation.js`)
- `loginValidation` - Login form validation
- `registerValidation` - User registration validation
- `updateDetailsValidation` - Profile update validation
- `changePasswordValidation` - Password change validation
- `forgotPasswordValidation` - Forgot password validation
- `resetPasswordValidation` - Password reset validation

### Holiday Management (`holidayValidation.js`)
- `createHolidayValidation` - Create holiday validation
- `updateHolidayValidation` - Update holiday validation
- `bulkCreateValidation` - Bulk holiday creation validation
- `copyHolidaysValidation` - Copy holidays between years validation

### Leave Management (`leaveValidation.js`)
- `applyLeaveValidation` - Leave application validation
- `updateStatusValidation` - Leave status update validation
- `addCommentValidation` - Add comment to leave validation

### Ticket Management (`ticketValidation.js`)
- `createTicketValidation` - Create ticket validation
- `updateTicketValidation` - Update ticket validation
- `assignTicketValidation` - Assign ticket validation
- `addCommentValidation` - Add comment to ticket validation
- `addRatingValidation` - Add rating to ticket validation

### User Management (`userValidation.js`)
- `updateUserValidation` - Update user validation
- `changeRoleValidation` - Change user role validation
- `resetPasswordValidation` - Reset user password validation
- `initiateOnboardingValidation` - Initiate onboarding validation
- `submitOnboardingValidation` - Submit onboarding validation
- `reviewOnboardingValidation` - Review onboarding validation
- `updateLeaveBalanceValidation` - Update leave balance validation

## Validation Features

### Common Validation Methods
- **Required Fields**: `notEmpty()` with custom error messages
- **Email Validation**: `isEmail()` with normalization
- **Date Validation**: `isISO8601()` for ISO date format
- **Enum Validation**: `isIn()` for predefined values
- **Length Validation**: `isLength()` for string length constraints
- **Type Validation**: `isBoolean()`, `isInt()`, `isFloat()` for data types
- **Array Validation**: `isArray()` for array fields
- **MongoDB ID**: `isMongoId()` for ObjectId validation

### Error Messages
All validation rules include descriptive error messages to help users understand what went wrong:

```javascript
body('email').isEmail().withMessage('Valid email is required')
body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
```

### Sanitization
Validation rules include sanitization methods:
- `trim()` - Remove whitespace
- `escape()` - Escape HTML characters
- `normalizeEmail()` - Normalize email addresses

## Adding New Validation Rules

1. **Create or update the appropriate validation file**
2. **Export the new validation rule**
3. **Update the index.js file if needed**
4. **Import and use in the route file**

### Example: Adding a new validation rule

```javascript
// In userValidation.js
const newValidationRule = [
  body('fieldName').notEmpty().withMessage('Field is required'),
  body('fieldValue').isInt({ min: 1 }).withMessage('Value must be positive')
];

module.exports = {
  // ... existing exports
  newValidationRule
};

// In the route file
const { newValidationRule } = require('../validations/userValidation');
router.post('/new-endpoint', newValidationRule, validate, controllerMethod);
```

## Best Practices

1. **Keep validation rules focused** - Each file should handle one domain
2. **Use descriptive error messages** - Help users understand validation failures
3. **Include sanitization** - Clean input data before processing
4. **Validate early** - Apply validation middleware before controller logic
5. **Reuse common patterns** - Create reusable validation functions for common fields

## Dependencies

- `express-validator` - Main validation library
- `express` - Web framework (for router usage)

## Testing

Validation rules can be tested independently:

```javascript
const { createHolidayValidation } = require('../validations/holidayValidation');

// Test validation rules
const testData = { name: '', date: 'invalid-date' };
// Apply validation rules and check results
```

## Maintenance

- Keep validation rules up to date with schema changes
- Review and update error messages for clarity
- Ensure validation rules match frontend form requirements
- Monitor validation failures to identify common user errors
