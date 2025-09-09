const { body } = require('express-validator');

// Validation rules for holiday operations
const createHolidayValidation = [
    body('name').notEmpty().trim().withMessage('Holiday name is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('type').optional().isIn(['national', 'regional', 'optional', 'company']).withMessage('Invalid holiday type'),
    body('description').optional().trim(),
    body('isOptional').optional().isBoolean().withMessage('isOptional must be a boolean'),
    body('applicableFor').optional().isArray().withMessage('applicableFor must be an array')
];

const updateHolidayValidation = [
    body('name').optional().notEmpty().trim().withMessage('Holiday name cannot be empty'),
    body('date').optional().isISO8601().withMessage('Valid date is required'),
    body('type').optional().isIn(['national', 'regional', 'optional', 'company']).withMessage('Invalid holiday type'),
    body('description').optional().trim(),
    body('isOptional').optional().isBoolean().withMessage('isOptional must be a boolean'),
    body('applicableFor').optional().isArray().withMessage('applicableFor must be an array')
];

const bulkCreateValidation = [
    body('holidays').isArray().withMessage('Holidays must be an array'),
    body('holidays.*.name').notEmpty().trim().withMessage('Each holiday must have a name'),
    body('holidays.*.date').isISO8601().withMessage('Each holiday must have a valid date')
];

const copyHolidaysValidation = [
    body('fromYear').isInt({ min: 2020, max: 2030 }).withMessage('fromYear must be between 2020 and 2030'),
    body('toYear').isInt({ min: 2020, max: 2030 }).withMessage('toYear must be between 2020 and 2030')
];

module.exports = {
    createHolidayValidation,
    updateHolidayValidation,
    bulkCreateValidation,
    copyHolidaysValidation
};
