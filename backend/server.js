const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');
const config = require('./config/config');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = config.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Create default admin user on startup
const createDefaultAdmin = async () => {
  try {
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      const admin = await User.create({
        name: 'System Admin',
        email: config.DEFAULT_ADMIN_EMAIL,
        password: config.DEFAULT_ADMIN_PASSWORD,
        role: 'admin',
        isActive: true,
        isOnboarded: true
      });

      console.log('Default admin user created:', admin.email);
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

// Run after database connection
setTimeout(createDefaultAdmin, 2000);
