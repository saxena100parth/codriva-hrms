# HRMS - Human Resource Management System

A comprehensive full-stack Human Resource Management System built with Node.js, Express.js, MongoDB, and React.js.

## Features

### Role-Based Access Control
- **Admin**: Create HR accounts, access all HR features
- **HR**: Manage employees, approve/reject leaves and tickets, initiate onboarding
- **Employee**: View profile, apply for leaves, raise tickets, view holidays

### Key Functionalities
- **Employee Onboarding**: Complete workflow from invitation to approval
- **Leave Management**: Apply, track, and approve/reject leave requests
- **Ticket System**: Raise and manage support tickets with priority levels
- **Holiday Management**: View and manage company holidays
- **User Management**: Create and manage user accounts

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React.js with React Router
- Tailwind CSS for styling
- React Hook Form for form management
- Axios for API calls
- React Hot Toast for notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd HRMS
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hrms_db

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Default Admin
DEFAULT_ADMIN_EMAIL=admin@hrms.com
DEFAULT_ADMIN_PASSWORD=Admin@123
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Default Admin Credentials

The system automatically creates a default admin user on first startup:
- **Email**: admin@hrms.com
- **Password**: Admin@123

**Important**: Change these credentials immediately after first login in production.

## Usage Guide

### Admin Workflow
1. Login with admin credentials
2. Create HR users from Users > Create HR
3. Access all features including employee management

### HR Workflow
1. Login with HR credentials
2. Invite new employees via Employees > Invite Employee
3. Review onboarding submissions
4. Manage leaves and tickets
5. Create and manage holidays

### Employee Workflow
1. Login with credentials provided by HR
2. Complete onboarding form (first-time login)
3. Apply for leaves
4. Raise support tickets
5. View company holidays
6. Update profile information

## Employee Onboarding Process
1. HR initiates onboarding by entering employee's personal email, official email, and temporary password
2. Employee receives invitation email (email functionality is placeholder)
3. Employee logs in and fills personal/professional details
4. HR reviews and approves/rejects the submission
5. Upon approval, employee ID is generated and onboarding is complete

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/changepassword` - Change password

### Employees
- `GET /api/employees` - Get all employees (HR/Admin)
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees/onboard` - Initiate onboarding (HR/Admin)
- `POST /api/employees/onboarding/submit` - Submit onboarding (Employee)
- `PUT /api/employees/:id/onboarding/review` - Review onboarding (HR/Admin)

### Leaves
- `GET /api/leaves` - Get leaves
- `POST /api/leaves` - Apply for leave (Employee)
- `PUT /api/leaves/:id/status` - Update leave status (HR/Admin)
- `PUT /api/leaves/:id/cancel` - Cancel leave (Employee)

### Tickets
- `GET /api/tickets` - Get tickets
- `POST /api/tickets` - Create ticket (Employee)
- `PUT /api/tickets/:id` - Update ticket (HR/Admin)
- `PUT /api/tickets/:id/assign` - Assign ticket (HR/Admin)

### Holidays
- `GET /api/holidays` - Get holidays
- `POST /api/holidays` - Create holiday (HR/Admin)
- `PUT /api/holidays/:id` - Update holiday (HR/Admin)
- `DELETE /api/holidays/:id` - Delete holiday (HR/Admin)

## Project Structure

```
HRMS/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── context/     # React context
│       ├── pages/       # Page components
│       ├── services/    # API services
│       ├── App.js       # Main app component
│       └── index.js     # Entry point
└── README.md
```

## Development

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Security Considerations

1. Change default admin credentials immediately
2. Use strong JWT secrets in production
3. Enable CORS only for trusted origins
4. Implement rate limiting for production
5. Use HTTPS in production
6. Sanitize all user inputs
7. Keep dependencies updated

## Notes

- Email functionality is currently a placeholder - integrate with email service (SendGrid, AWS SES) for production
- File upload functionality for documents is not implemented - add multer configuration for production
- Add comprehensive logging for production environment
- Implement backup strategies for MongoDB

## License

This project is licensed under the MIT License.
