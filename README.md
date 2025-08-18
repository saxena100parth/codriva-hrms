# HRMS - Human Resource Management System

A complete full-stack Human Resource Management System built with modern technologies, featuring a React frontend and Node.js backend with MongoDB Atlas integration.

## 🚀 Project Overview

This HRMS system provides comprehensive human resource management capabilities including:

- **User Authentication & Authorization** with role-based access control
- **Employee Management** with detailed profiles and records
- **User Management** for system administrators
- **Modern Web Interface** with responsive design
- **Secure API** with JWT authentication and validation
- **Database Integration** with MongoDB Atlas cloud database

## 🏗️ Architecture

```
HRMS/
├── frontend/          # React frontend application
│   ├── src/          # Source code
│   ├── public/       # Public assets
│   └── package.json  # Frontend dependencies
├── backend/          # Node.js backend API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   ├── config/       # Configuration files
│   └── package.json  # Backend dependencies
└── README.md         # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **MongoDB Atlas** account
- **Git** for version control

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HRMS
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Environment configuration
cp env.example .env
# Edit .env with your MongoDB Atlas connection string and other settings

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Environment configuration
# Create .env file with:
REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

## 🔐 Authentication & Roles

### User Roles

- **Admin**: Full system access, user management
- **HR**: Employee management, basic operations
- **Employee**: Limited access to own profile

### Default Admin Account

After setting up the database, create an admin user:

```bash
# Using the API
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@company.com",
  "password": "admin123",
  "role": "admin"
}
```

## 📊 Database Schema

### User Model
- Authentication credentials
- Role-based permissions
- Account status tracking

### Employee Model
- Personal information
- Employment details
- Document management
- Status tracking

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet** security headers
- **Role-based Access Control**

## 📱 Features

### Core Functionality
- ✅ User authentication and registration
- ✅ Role-based access control
- ✅ Employee management (CRUD operations)
- ✅ User management (Admin only)
- ✅ Profile management
- ✅ Responsive web interface

### User Interface
- ✅ Modern, clean design with Tailwind CSS
- ✅ Mobile-responsive layout
- ✅ Interactive dashboard
- ✅ Form validation and error handling
- ✅ Toast notifications
- ✅ Loading states and animations

### API Features
- ✅ RESTful API design
- ✅ Comprehensive error handling
- ✅ Input validation and sanitization
- ✅ Pagination and search
- ✅ File upload support (structure ready)

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Use production MongoDB Atlas cluster
3. **Process Manager**: Use PM2 or similar for Node.js apps
4. **Reverse Proxy**: Nginx or Apache for production

### Frontend Deployment

1. **Build**: `npm run build`
2. **Deploy**: Upload `build` folder to hosting service
3. **Environment**: Set production API URLs
4. **HTTPS**: Ensure SSL certificate is configured

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=production
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance & Monitoring

### Backend
- **Morgan** logging for HTTP requests
- **Error tracking** with detailed error messages
- **Rate limiting** to prevent abuse
- **Database connection** monitoring

### Frontend
- **React Query** for efficient data fetching
- **Optimized builds** with Create React App
- **Lazy loading** ready for code splitting
- **Performance monitoring** with web vitals

## 🔄 Development Workflow

### Code Structure
- **Modular architecture** with clear separation of concerns
- **Consistent naming conventions**
- **Comprehensive error handling**
- **Input validation** at all levels

### Best Practices
- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **Git hooks** for pre-commit checks
- **Documentation** for all major components

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic authentication system
- ✅ User and employee management
- ✅ Responsive web interface
- ✅ API foundation

### Phase 2 (Planned)
- 🔄 Advanced employee features
- 🔄 Reporting and analytics
- 🔄 Document management
- 🔄 Email notifications

### Phase 3 (Future)
- 🔄 Mobile application
- 🔄 Advanced analytics dashboard
- 🔄 Integration with third-party services
- 🔄 Multi-tenant support

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Setup

```bash
# Install dependencies for both projects
cd backend && npm install
cd ../frontend && npm install

# Run both servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string in `.env`
   - Ensure network access is enabled in MongoDB Atlas
   - Verify username/password are correct

2. **CORS Errors**
   - Check `CORS_ORIGIN` in backend `.env`
   - Ensure frontend URL matches backend CORS settings

3. **JWT Token Issues**
   - Verify `JWT_SECRET` is set in backend `.env`
   - Check token expiration settings

4. **Port Conflicts**
   - Backend runs on port 5000 by default
   - Frontend runs on port 3000 by default
   - Change ports in respective `.env` files if needed

## 📚 Documentation

- **Backend API**: See `backend/README.md`
- **Frontend**: See `frontend/README.md`
- **API Endpoints**: Documented in route files
- **Database Models**: See `backend/models/`

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- 📧 Create an issue in the repository
- 💬 Contact the development team
- 📖 Check the documentation in each project folder

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the cloud database service
- **Express.js** community for the web framework

---

**Happy Coding! 🚀**

This HRMS system provides a solid foundation for human resource management with modern web technologies. Feel free to customize and extend it according to your specific needs.
