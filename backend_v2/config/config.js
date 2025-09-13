module.exports = {
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms_db',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Default Admin
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@hrms.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
  
  // Other constants
  BCRYPT_SALT_ROUNDS: 10,
  
  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
};
