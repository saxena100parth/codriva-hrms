# 🏢 HRMS Pro - Complete Human Resource Management System

A comprehensive, full-stack Human Resource Management System built with React, Node.js, and MongoDB. This system provides complete employee lifecycle management, leave management, ticket system, and holiday management.

## 🚀 Features

### 👥 **User Management**
- **Role-based Access Control**: Admin, HR, and Employee roles
- **User Authentication**: JWT-based secure authentication
- **Profile Management**: Complete user profile with personal, work, and contact information
- **Employee Onboarding**: Streamlined onboarding process with document upload
- **User Statistics**: Comprehensive user analytics and reporting

### 📅 **Leave Management**
- **Leave Types**: Annual, Sick, Personal, Maternity, Paternity leaves
- **Leave Application**: Easy-to-use leave application form
- **Leave Approval**: HR/Admin approval workflow
- **Leave Balance**: Real-time leave balance tracking
- **Leave History**: Complete leave history and analytics

### 🎫 **Ticket System**
- **Support Categories**: IT, HR, Finance, and General support
- **Priority Levels**: High, Medium, Low priority tickets
- **Ticket Assignment**: Automatic and manual ticket assignment
- **Status Tracking**: Open, In Progress, Resolved, Closed statuses
- **Comments & Ratings**: Internal comments and customer ratings

### 🗓️ **Holiday Management**
- **Holiday Types**: National, Regional, and Company holidays
- **Holiday Calendar**: Interactive holiday calendar view
- **Optional Holidays**: Support for optional holidays
- **Year-based Filtering**: Filter holidays by year
- **Holiday Statistics**: Holiday usage and analytics

### 📊 **Dashboard & Analytics**
- **Role-specific Dashboards**: Customized dashboards for each role
- **Real-time Statistics**: Live data and metrics
- **Quick Actions**: Fast access to common tasks
- **Recent Activity**: Latest updates and notifications
- **Performance Metrics**: Key performance indicators

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Toast notifications
- **Heroicons** - Beautiful SVG icons
- **Axios** - HTTP client for API calls

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📁 **Project Structure**

```
HRMS2/
├── frontend/                 # Complete React frontend reference
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── constants/      # Application constants
│   └── package.json
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── server.js          # Server entry point
├── src/                    # Main React application
│   ├── components/        # UI components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── contexts/         # React contexts
│   └── App.jsx           # Main app component
└── README.md
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HRMS2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hrms
   JWT_SECRET=your-secret-key
   PORT=5000
   DEFAULT_ADMIN_EMAIL=admin@company.com
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔐 **Authentication & Authorization**

### **User Roles**
- **Admin**: Full system access, user management, system configuration
- **HR**: Employee management, leave approval, ticket management
- **Employee**: Personal profile, leave requests, ticket creation

### **Authentication Flow**
1. User logs in with email and password
2. JWT token is generated and stored
3. Token is included in all API requests
4. Protected routes check for valid token
5. Role-based access control for specific features

## 📱 **Responsive Design**

The application is fully responsive and works seamlessly across:
- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Optimized layout with collapsible sidebar
- **Mobile**: Mobile-first design with hamburger menu

## 🎨 **UI/UX Features**

- **Modern Design**: Clean, professional interface
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG compliant design
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback
- **Form Validation**: Client-side and server-side validation

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/changepassword` - Change password

### **Users**
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users` - Create user
- `GET /api/users/stats` - Get user statistics

### **Leaves**
- `GET /api/leaves` - Get all leaves
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Update leave
- `PUT /api/leaves/:id/status` - Update leave status
- `GET /api/leaves/summary` - Get leave summary

### **Tickets**
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/:id` - Update ticket
- `PUT /api/tickets/:id/assign` - Assign ticket
- `GET /api/tickets/stats` - Get ticket statistics

### **Holidays**
- `GET /api/holidays` - Get all holidays
- `POST /api/holidays` - Create holiday
- `PUT /api/holidays/:id` - Update holiday
- `DELETE /api/holidays/:id` - Delete holiday

## 🧪 **Testing**

### **Frontend Testing**
```bash
npm run test
```

### **Backend Testing**
```bash
cd backend
npm run test
```

## 📦 **Deployment**

### **Frontend Deployment (Vercel/Netlify)**
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting platform

### **Backend Deployment (Heroku/Railway)**
1. Set up environment variables
2. Deploy to your hosting platform
3. Configure MongoDB Atlas for production

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 **Future Enhancements**

- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Business intelligence dashboard
- **Integration**: Third-party service integrations
- **Automation**: Workflow automation features
- **AI Features**: AI-powered insights and recommendations

---

**Built with ❤️ by the HRMS Development Team**