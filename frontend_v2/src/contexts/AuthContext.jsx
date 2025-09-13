import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/authService';

// Initial state
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    needsPasswordReset: false
};

// Action types
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    SET_LOADING: 'SET_LOADING',
    CLEAR_ERROR: 'CLEAR_ERROR',
    UPDATE_USER: 'UPDATE_USER'
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                isLoading: true,
                error: null
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            console.log('LOGIN_SUCCESS - payload:', action.payload);
            console.log('LOGIN_SUCCESS - needsPasswordReset:', action.payload.needsPasswordReset);
            console.log('LOGIN_SUCCESS - user hasTemporaryPassword:', action.payload.user?.hasTemporaryPassword);
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                needsPasswordReset: action.payload.needsPasswordReset || false
            };

        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                needsPasswordReset: false
            };

        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload }
            };

        default:
            return state;
    }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            const token = authService.getToken();

            if (token) {
                try {
                    const user = await authService.getCurrentUser();
                    dispatch({
                        type: AUTH_ACTIONS.LOGIN_SUCCESS,
                        payload: {
                            user,
                            token,
                            needsPasswordReset: user.needsPasswordReset || false
                        }
                    });
                } catch (error) {
                    // Check if error should trigger logout
                    if (error.shouldLogout) {
                        console.error('Authentication failed, logging out:', error.message);
                        authService.logout();
                        dispatch({ type: AUTH_ACTIONS.LOGOUT });
                    } else {
                        console.error('Token validation failed:', error);
                        authService.logout();
                        dispatch({ type: AUTH_ACTIONS.LOGOUT });
                    }
                }
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        try {
            const response = await authService.login(email, password);
            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: response
            });
            return response;
        } catch (error) {
            // Handle structured errors from API service
            const errorMessage = error.userMessage?.message || error.message || 'Login failed';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            });
            throw error;
        }
    };

    // OTP Login function (for onboarding)
    const otpLogin = async (mobileNumber, otp) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        try {
            const response = await authService.otpLogin(mobileNumber, otp);
            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: response
            });
            return response;
        } catch (error) {
            // Handle structured errors from API service
            const errorMessage = error.userMessage?.message || error.message || 'OTP verification failed';
            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage
            });
            throw error;
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };

    // Update user function
    const updateUser = (userData) => {
        dispatch({
            type: AUTH_ACTIONS.UPDATE_USER,
            payload: userData
        });
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    // Check if user has specific role or any of the specified roles
    const hasRole = (roles) => {
        if (!state.user?.role) return false;
        if (Array.isArray(roles)) {
            return roles.includes(state.user.role);
        }
        return state.user.role === roles;
    };

    // Check if user has any of the specified roles (alias for hasRole)
    const hasAnyRole = (roles) => {
        return hasRole(roles);
    };

    const value = {
        ...state,
        login,
        otpLogin,
        logout,
        updateUser,
        clearError,
        hasRole,
        hasAnyRole,
        isAdmin: state.user?.role === 'ADMIN',
        isHR: state.user?.role === 'HR',
        isEmployee: state.user?.role === 'EMPLOYEE'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default AuthContext;
