# HRMS Backend API

A robust Node.js backend API for Human Resource Management System built with Express.js, MongoDB Atlas, and JWT authentication.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete CRUD operations for users with different roles (Admin, HR, Employee)
- **Employee Management**: Comprehensive employee data management with search and pagination
- **Security**: Password hashing, rate limiting, CORS protection, and input validation
- **Database**: MongoDB Atlas integration with Mongoose ODM
- **API Documentation**: Well-documented RESTful API endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Logging**: morgan

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── User.js              # User model for authentication
│   └── Employee.js          # Employee data model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   └── employees.js         # Employee management routes
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── env.example               # Environment variables template
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `env.example` to `.env`
   - Update the following variables:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
     JWT_SECRET=your_jwt_secret_key_here
     PORT=5000
     ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile

### User Management (Admin Only)
- `GET /api/users` - Get all users with pagination
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `PUT /api/users/:id/activate` - Activate user

### Employee Management
- `GET /api/employees` - Get all employees with search and pagination
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee (HR/Admin)
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Terminate employee (HR/Admin)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express.js
- **Role-based Access Control**: Different permissions for different user roles

## 📊 Database Models

### User Model
- Username, email, password
- Role-based access (admin, hr, employee)
- Account status and last login tracking
- Password hashing and comparison methods

### Employee Model
- Personal information (name, contact, address)
- Employment details (department, position, salary)
- Document management
- Status tracking (active, inactive, terminated, resigned)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Ensure all production environment variables are set
2. **Database**: Use production MongoDB Atlas cluster
3. **Security**: Use strong JWT secrets and HTTPS
4. **Monitoring**: Implement logging and monitoring solutions
5. **Rate Limiting**: Adjust rate limits based on production needs

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Updates

- **v1.0.0**: Initial release with basic HRMS functionality
- Authentication and authorization system
- User and employee management
- RESTful API endpoints
- Security features and validation
