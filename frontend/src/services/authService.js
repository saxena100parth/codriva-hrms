import api from './api';

class AuthService {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    }

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    }

    async getProfile() {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to get profile');
        }
    }

    async updateProfile(userData) {
        try {
            const response = await api.put('/auth/me', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.put('/auth/change-password', {
                currentPassword,
                newPassword,
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to change password');
        }
    }
}

export const authService = new AuthService();
