import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// ========================================
// PAGE IMPORTS
// ========================================
import Login from './pages/Login';                    // User authentication page
import Dashboard from './pages/Dashboard';            // Main dashboard for all users
import EmployeeDetail from './pages/EmployeeDetail';  // Employee profile view (HR/Admin)
import OnboardingForm from './pages/OnboardingForm'; // Employee onboarding process
import HrReview from './pages/HrReview';             // HR review of onboarding submissions
import HrInvite from './pages/HrInvite';             // HR invitation management
import Leaves from './pages/Leaves';                  // Leave management page
import Tickets from './pages/Tickets';                // Support ticket management
import Holidays from './pages/Holidays';              // Holiday calendar and management
import Profile from './pages/Profile';                // User's own profile page
import People from './pages/People';                  // People management (HR/Admin)
import AdminCreateHR from './pages/AdminCreateHR';    // Admin HR user creation
import EmployeeEdit from './pages/EmployeeEdit';      // Employee profile editing (HR/Admin)
import ResetPassword from './pages/ResetPassword';    // Password reset page
import ForgotPassword from './pages/ForgotPassword';  // Forgot password page

// ========================================
// COMPONENT IMPORTS
// ========================================
import Layout from './components/Layout';             // Main layout wrapper with navigation

// ========================================
// PROTECTED ROUTE COMPONENT
// ========================================
// Wraps routes that require authentication and specific roles
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, hasRole, user } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Persist current path so a refresh returns here after auth check
  const intendedPath = window.location.pathname + window.location.search;
  if (!isAuthenticated) {
    localStorage.setItem('intended_path', intendedPath);
    return <Navigate to="/login" replace />;
  }

  // Check if employee needs to complete onboarding
  if (user?.role === 'EMPLOYEE' && !user?.isOnboarded && !window.location.pathname.includes('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check if user has required role(s)
  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ========================================
// MAIN ROUTING COMPONENT
// ========================================
function AppRoutes() {
  return (
    <Routes>
      {/* ======================================== */}
      {/* PUBLIC ROUTES (No authentication required) */}
      {/* ======================================== */}
      <Route path="/login" element={<Login />} />                    // User login page
      <Route path="/onboarding" element={<OnboardingForm />} />      // Employee onboarding (accessible via invitation)
      <Route path="/reset-password" element={<ResetPassword />} />    // Password reset page
      <Route path="/forgot-password" element={<ForgotPassword />} />  // Forgot password page

      {/* ======================================== */}
      {/* PROTECTED ROUTES (Authentication required) */}
      {/* ======================================== */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

        {/* ======================================== */}
        {/* COMMON ROUTES (All authenticated users) */}
        {/* ======================================== */}
        <Route path="/" element={<Dashboard />} />                   // Main dashboard
        <Route path="/profile" element={<Profile />} />              // User's own profile
        <Route path="/holidays" element={<Holidays />} />            // Holiday calendar

        {/* ======================================== */}
        {/* EMPLOYEE ROUTES (Employee, HR, Admin) */}
        {/* ======================================== */}
        <Route path="/leaves" element={
          <ProtectedRoute roles={['EMPLOYEE', 'HR', 'ADMIN']}>
            <Leaves />
          </ProtectedRoute>
        } />
        <Route path="/tickets" element={
          <ProtectedRoute roles={['EMPLOYEE', 'HR', 'ADMIN']}>
            <Tickets />
          </ProtectedRoute>
        } />

        {/* ======================================== */}
        {/* HR/ADMIN ROUTES (HR and Admin only) */}
        {/* ======================================== */}
        <Route path="/people" element={
          <ProtectedRoute roles={['HR', 'ADMIN']}>
            <People />
          </ProtectedRoute>
        } />
        <Route path="/employees/:id" element={
          <ProtectedRoute roles={['HR', 'ADMIN']}>
            <EmployeeDetail />
          </ProtectedRoute>
        } />
        <Route path="/employees/:id/edit" element={
          <ProtectedRoute roles={['HR', 'ADMIN']}>
            <EmployeeEdit />
          </ProtectedRoute>
        } />
        <Route path="/hr/invite" element={
          <ProtectedRoute roles={['HR', 'ADMIN']}>
            <HrInvite />
          </ProtectedRoute>
        } />
        <Route path="/hr/review" element={
          <ProtectedRoute roles={['HR', 'ADMIN']}>
            <HrReview />
          </ProtectedRoute>
        } />

        {/* ======================================== */}
        {/* ADMIN ONLY ROUTES (Admin only) */}
        {/* ======================================== */}
        <Route path="/admin/create-hr" element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminCreateHR />
          </ProtectedRoute>
        } />
      </Route>

      {/* ======================================== */}
      {/* CATCH ALL ROUTE */}
      {/* ======================================== */}
      <Route path="*" element={<Navigate to="/" replace />} />      // Redirect unknown routes to dashboard
    </Routes>
  );
}

// ========================================
// MAIN APP COMPONENT
// ========================================
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        {/* Global toast notifications */}
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