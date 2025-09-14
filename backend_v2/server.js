const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config/config');

// ========================================
// ENVIRONMENT & DATABASE SETUP
// ========================================

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// ========================================
// ROUTE IMPORTS
// ========================================
const authRoutes = require('./routes/authRoutes');        // Authentication routes (login, password reset, etc.)
const leaveRoutes = require('./routes/leaveRoutes');      // Leave management routes
const ticketRoutes = require('./routes/ticketRoutes');    // Support ticket routes
const holidayRoutes = require('./routes/holidayRoutes');  // Holiday management routes
const userRoutes = require('./routes/userRoutes');        // User management routes

const app = express();

// ========================================
// MIDDLEWARE SETUP
// ========================================

// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS for frontend communication
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
// Old configuration (restricted to specific frontend URL):
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));

// ========================================
// API ROUTES
// ========================================

// Mount API routes with their respective prefixes
app.use('/api/auth', authRoutes);                        // /api/auth/* - Authentication endpoints
app.use('/api/leaves', leaveRoutes);                     // /api/leaves/* - Leave management endpoints
app.use('/api/tickets', ticketRoutes);                   // /api/tickets/* - Support ticket endpoints
app.use('/api/holidays', holidayRoutes);                 // /api/holidays/* - Holiday management endpoints
app.use('/api/users', userRoutes);                       // /api/users/* - User management endpoints

// ========================================
// HEALTH CHECK & ERROR HANDLING
// ========================================

// Health check endpoint to verify API is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler middleware
app.use(errorHandler);

// ========================================
// SERVER STARTUP
// ========================================

const PORT = config.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// ========================================
// DEFAULT ADMIN USER CREATION
// ========================================

// Create default admin user on startup if none exists
// Note: Only the default admin is created automatically.
// All other users (HR, employees) must be invited by admin/HR roles.
const createDefaultAdmin = async () => {
  try {
    // Wait for database connection to be ready
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for database connection...');
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }

    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'ADMIN' });

    if (!adminExists) {
      const admin = await User.create({
        email: config.DEFAULT_ADMIN_EMAIL,
        password: config.DEFAULT_ADMIN_PASSWORD,
        role: 'ADMIN',
        status: 'ACTIVE',
        onboardingStatus: 'COMPLETED',
        fullName: {
          first: 'System',
          last: 'Administrator'
        },
        personalEmail: config.DEFAULT_ADMIN_EMAIL,
        mobileNumber: '0000000000', // Default placeholder
        department: 'TECH',
        employmentType: 'FULL_TIME',
        joiningDate: new Date()
      });

      console.log('✓ Default admin user created:', admin.email);
    } else {
      console.log('✓ Admin user already exists:', adminExists.email);
    }
  } catch (error) {
    console.error('✗ Error creating default admin:', error.message);
  }
};

// Run admin creation after database connection is established
mongoose.connection.once('connected', () => {
  console.log('Database connected, creating default admin...');
  createDefaultAdmin();
});
