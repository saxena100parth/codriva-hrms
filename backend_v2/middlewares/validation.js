const { validationResult } = require('express-validator');

// Validation middleware
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    
    return res.status(422).json({
      success: false,
      errors: extractedErrors
    });
  }
  
  next();
};

// Sanitize data
exports.sanitizeData = (req, res, next) => {
  // Remove any fields that shouldn't be updated
  delete req.body._id;
  delete req.body.createdAt;
  delete req.body.updatedAt;
  delete req.body.__v;
  
  next();
};
