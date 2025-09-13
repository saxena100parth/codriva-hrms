// Export all validation rules from a single location
const holidayValidation = require('./holidayValidation');
const leaveValidation = require('./leaveValidation');
const ticketValidation = require('./ticketValidation');
const userValidation = require('./userValidation');
const authValidation = require('./authValidation');

module.exports = {
    ...holidayValidation,
    ...leaveValidation,
    ...ticketValidation,
    ...userValidation,
    ...authValidation
};
