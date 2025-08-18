import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Leaves from './pages/Leaves';
import Tickets from './pages/Tickets';
import Holidays from './pages/Holidays';
import OnboardingForm from './pages/OnboardingForm';
import HrInvite from './pages/HrInvite';
import HrReview from './pages/HrReview';
import AdminCreateHR from './pages/AdminCreateHR';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirects if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/:id" element={<EmployeeDetail />} />
        <Route path="profile" element={<Profile />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="holidays" element={<Holidays />} />
        <Route path="onboarding" element={<OnboardingForm />} />
        <Route path="hr/invite" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <HrInvite />
          </ProtectedRoute>
        } />
        <Route path="hr/review" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <HrReview />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="admin/create-hr" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCreateHR />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
