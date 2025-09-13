import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useErrorHandler } from './hooks/useErrorHandler';
import ErrorHandler from './components/ErrorHandler';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

// Pages
import People from './pages/People';
import Leaves from './pages/Leaves';
import Tickets from './pages/Tickets';
import Holidays from './pages/Holidays';
import Profile from './pages/Profile';
import ErrorTest from './components/ErrorTest';
import Onboarding from './pages/Onboarding';
import PasswordReset from './components/PasswordReset';

// Layout Component
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, hasRole, user, needsPasswordReset } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs password reset first (takes precedence over onboarding)
  if (needsPasswordReset) {
    return <Navigate to="/password-reset" replace />;
  }

  // Check if employee needs to complete onboarding
  if (user?.role === 'EMPLOYEE' && user?.onboardingStatus !== 'COMPLETED' && !window.location.pathname.includes('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check if user has required role(s)
  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Content Component
function AppContent() {
  const { isAuthenticated, isLoading, user, needsPasswordReset } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const { error: globalError, handleError, clearError, handleRetry } = useErrorHandler();

  // Debug logging
  console.log('AppContent - Auth state:', {
    isAuthenticated,
    isLoading,
    needsPasswordReset,
    userRole: user?.role,
    hasTemporaryPassword: user?.hasTemporaryPassword,
    onboardingStatus: user?.onboardingStatus
  });


  // Reset login modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        {/* Global Error Handler */}
        <ErrorHandler
          error={globalError}
          onClose={clearError}
          onRetry={handleRetry}
        />

        <Header onLoginClick={() => setShowLogin(true)} />
        <main>
          <Hero onLoginClick={() => setShowLogin(true)} />
          <Features />
          <Stats />
          <Testimonials />
          <CTA onLoginClick={() => setShowLogin(true)} />
        </main>
        <Footer />

        {/* Login Modal */}
        {showLogin && (
          <Login
            onClose={() => setShowLogin(false)}
            onSwitchToRegister={() => {
              // Handle register modal switch
              console.log('Switch to register');
            }}
          />
        )}
      </div>
    );
  }

  // Check if user needs password reset first (takes precedence over dashboard)
  if (needsPasswordReset) {
    console.log('AppContent: Redirecting to password reset because needsPasswordReset = true');
    return <Navigate to="/password-reset" replace />;
  }

  // Check if employee needs to complete onboarding
  if (user?.role === 'EMPLOYEE' && user?.onboardingStatus !== 'COMPLETED') {
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
}

// Main App Component with Auth Provider
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/error-test" element={<ErrorTest />} />
          <Route path="/password-reset-test" element={<PasswordReset />} />
          <Route path="/" element={<AppContent />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Common Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/holidays" element={<Holidays />} />

            {/* Employee Routes */}
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

            {/* HR/Admin Routes */}
            <Route path="/people" element={
              <ProtectedRoute roles={['HR', 'ADMIN']}>
                <People />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch All Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Notifications */}
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
      </Router>
    </AuthProvider>
  );
}

export default App;