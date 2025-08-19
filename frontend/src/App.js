import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import OnboardingForm from './pages/OnboardingForm';
import HrReview from './pages/HrReview';
import HrInvite from './pages/HrInvite';
import Leaves from './pages/Leaves';
import Tickets from './pages/Tickets';
import Holidays from './pages/Holidays';
import Profile from './pages/Profile';
import Users from './pages/Users';
import AdminCreateHR from './pages/AdminCreateHR';

// Components
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, hasRole, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs to complete onboarding
  if (user?.role === 'employee' && !user?.isOnboarded && !window.location.pathname.includes('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Common Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/holidays" element={<Holidays />} />

        {/* Employee Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute roles={['employee']}>
            <OnboardingForm />
          </ProtectedRoute>
        } />
        <Route path="/leaves" element={
          <ProtectedRoute roles={['employee', 'hr', 'admin']}>
            <Leaves />
          </ProtectedRoute>
        } />
        <Route path="/tickets" element={
          <ProtectedRoute roles={['employee', 'hr', 'admin']}>
            <Tickets />
          </ProtectedRoute>
        } />

        {/* HR/Admin Routes */}
        <Route path="/employees" element={
          <ProtectedRoute roles={['hr', 'admin']}>
            <Employees />
          </ProtectedRoute>
        } />
        <Route path="/employees/:id" element={
          <ProtectedRoute roles={['hr', 'admin']}>
            <EmployeeDetail />
          </ProtectedRoute>
        } />
        <Route path="/hr/invite" element={
          <ProtectedRoute roles={['hr', 'admin']}>
            <HrInvite />
          </ProtectedRoute>
        } />
        <Route path="/hr/review" element={
          <ProtectedRoute roles={['hr', 'admin']}>
            <HrReview />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute roles={['hr', 'admin']}>
            <Users />
          </ProtectedRoute>
        } />

        {/* Admin Only Routes */}
        <Route path="/admin/create-hr" element={
          <ProtectedRoute roles={['admin']}>
            <AdminCreateHR />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;