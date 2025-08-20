import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import usePersistentState from '../hooks/usePersistentState';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Hydrate user from localStorage to avoid losing state on refresh
  const [user, setUser] = usePersistentState('user', null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Initialize auth token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  // Set auth token in axios headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && user) {
        // We have both token and cached user, just validate token is still good
        try {
          await axios.get('/auth/me');
          // Token is valid, keep existing user data
        } catch (err) {
          console.error('Token validation failed:', err);
          setAuthToken(null);
          setUser(null);
        }
      } else if (token && !user) {
        // We have token but no user, fetch user data
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data.data);
        } catch (err) {
          console.error('Auth check failed:', err);
          setAuthToken(null);
          setUser(null);
        }
      } else {
        // No token, clear user data
        setUser(null);
      }
      setLoading(false);
    };

    // Only run auth check if we have a token or user data
    const token = localStorage.getItem('token');
    if (token || user) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [setUser, user]);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post('/auth/login', { email, password });
      const { user, token, employee } = response.data.data;

      setAuthToken(token);
      const merged = { ...user, employee };
      setUser(merged);

      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      const response = await axios.put('/auth/updatedetails', data);
      const updatedUser = response.data.data.user;
      setUser(prevUser => ({ ...prevUser, ...updatedUser }));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put('/auth/changepassword', {
        currentPassword,
        newPassword
      });

      // Update token if provided
      if (response.data.data.token) {
        setAuthToken(response.data.data.token);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isHR: user?.role === 'hr',
    isEmployee: user?.role === 'employee',
    hasRole: (roles) => roles.includes(user?.role)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
