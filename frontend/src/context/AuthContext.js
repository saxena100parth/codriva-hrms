import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                isLoading: true,
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    dispatch({ type: 'AUTH_START' });
                    const response = await authService.getProfile();
                    dispatch({
                        type: 'AUTH_SUCCESS',
                        payload: { user: response.user, token },
                    });
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    dispatch({ type: 'AUTH_FAILURE' });
                }
            } else {
                dispatch({ type: 'AUTH_FAILURE' });
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            dispatch({ type: 'AUTH_START' });
            const response = await authService.login(email, password);

            localStorage.setItem('token', response.token);
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: response,
            });

            return { success: true };
        } catch (error) {
            dispatch({ type: 'AUTH_FAILURE' });
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            dispatch({ type: 'AUTH_START' });
            const response = await authService.register(userData);

            localStorage.setItem('token', response.token);
            dispatch({
                type: 'AUTH_SUCCESS',
                payload: response,
            });

            return { success: true };
        } catch (error) {
            dispatch({ type: 'AUTH_FAILURE' });
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    };

    const updateProfile = async (userData) => {
        try {
            const response = await authService.updateProfile(userData);
            dispatch({
                type: 'UPDATE_USER',
                payload: response.user,
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
