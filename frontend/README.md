# HRMS Frontend

A modern React-based frontend application for Human Resource Management System with beautiful UI and responsive design.

## 🚀 Features

- **Modern UI/UX**: Built with Tailwind CSS for beautiful, responsive design
- **Authentication**: Complete login/register system with JWT tokens
- **Role-based Access**: Different interfaces for Admin, HR, and Employee roles
- **Responsive Design**: Mobile-first approach with responsive sidebar
- **State Management**: React Context API for global state management
- **Form Handling**: React Hook Form for efficient form management
- **API Integration**: Axios-based API service with interceptors
- **Toast Notifications**: User-friendly feedback with react-hot-toast

## 🛠️ Tech Stack

- **Framework**: React 18
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Data Fetching**: React Query (configured)

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html              # Main HTML file
├── src/
│   ├── components/
│   │   └── Layout.js           # Main layout with navigation
│   ├── context/
│   │   └── AuthContext.js      # Authentication context
│   ├── hooks/                  # Custom React hooks
│   ├── pages/
│   │   ├── Dashboard.js        # Main dashboard
│   │   ├── Login.js            # Login page
│   │   ├── Register.js         # Registration page
│   │   ├── Employees.js        # Employee management
│   │   ├── EmployeeDetail.js   # Employee details
│   │   ├── Profile.js          # User profile
│   │   └── Users.js            # User management (Admin)
│   ├── services/
│   │   ├── api.js              # Base API configuration
│   │   └── authService.js      # Authentication service
│   ├── utils/                  # Utility functions
│   ├── App.js                  # Main app component
│   ├── index.js                # Entry point
│   └── index.css               # Global styles with Tailwind
├── package.json                 # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend root:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## 🎨 UI Components

### Design System

The application uses a comprehensive design system built with Tailwind CSS:

- **Colors**: Primary (blue) and secondary (gray) color palettes
- **Typography**: Inter font family with consistent sizing
- **Spacing**: Consistent spacing scale using Tailwind's spacing utilities
- **Components**: Pre-built component classes for buttons, forms, cards, tables

### Component Classes

```css
/* Buttons */
.btn-primary    /* Primary action button */
.btn-secondary  /* Secondary action button */
.btn-danger     /* Destructive action button */

/* Forms */
.input          /* Standard input field */
.input-error    /* Input field with error state */
.form-group     /* Form field container */
.form-label     /* Form field label */
.form-error     /* Form error message */

/* Layout */
.card           /* Card container */
.card-header    /* Card header section */
.card-body      /* Card content section */

/* Tables */
.table          /* Table container */
.table-header   /* Table header row */
.table-body     /* Table body */
.table-row      /* Table row */
.table-cell     /* Table cell */
```

## 🔐 Authentication

### Features

- **JWT Token Management**: Automatic token storage and refresh
- **Protected Routes**: Role-based access control
- **Auto-logout**: Automatic logout on token expiration
- **Persistent Sessions**: Remembers user login state

### User Roles

- **Admin**: Full access to all features
- **HR**: Employee management and basic user operations
- **Employee**: Limited access to own profile and basic features

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm - lg)
- **Desktop**: > 1024px (lg)

### Features

- **Mobile-first**: Designed for mobile devices first
- **Responsive Sidebar**: Collapsible sidebar on mobile
- **Touch-friendly**: Optimized for touch interactions
- **Adaptive Layout**: Components adapt to screen size

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App
npm run eject
```

### Code Style

- **ESLint**: Configured with React recommended rules
- **Prettier**: Code formatting (when configured)
- **Component Structure**: Functional components with hooks
- **File Naming**: PascalCase for components, camelCase for utilities

## 🚀 Deployment

### Build Process

1. **Create production build**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | http://localhost:5000/api |

### Production Considerations

- **HTTPS**: Ensure your domain uses HTTPS
- **Environment Variables**: Set production API URLs
- **Build Optimization**: Production build is automatically optimized
- **CDN**: Consider using a CDN for static assets

## 🧪 Testing

### Testing Framework

- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **User Event**: Simulating user interactions

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 🔄 State Management

### Context API

- **AuthContext**: Manages authentication state
- **User State**: Current user information and permissions
- **Token Management**: JWT token storage and validation

### Local State

- **Component State**: Local component state with useState
- **Form State**: Form management with React Hook Form
- **UI State**: UI interactions and modal states

## 📊 Data Fetching

### API Services

- **Base API**: Configured axios instance with interceptors
- **Service Classes**: Organized API calls by feature
- **Error Handling**: Centralized error handling and user feedback
- **Authentication**: Automatic token inclusion in requests

### React Query

- **Configured**: React Query is set up and ready to use
- **Caching**: Automatic caching and background updates
- **Optimistic Updates**: Support for optimistic UI updates

## 🎯 Future Enhancements

### Planned Features

- **Real-time Updates**: WebSocket integration for live data
- **Advanced Filtering**: Enhanced search and filter capabilities
- **Data Export**: Export functionality for reports
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Dashboard with charts and insights

### Technical Improvements

- **TypeScript**: Migration to TypeScript for better type safety
- **Testing**: Comprehensive test coverage
- **Performance**: Code splitting and lazy loading
- **Accessibility**: Enhanced accessibility features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Updates

- **v1.0.0**: Initial release with basic HRMS functionality
- Authentication system with role-based access
- Responsive design with Tailwind CSS
- Component-based architecture
- API integration ready
