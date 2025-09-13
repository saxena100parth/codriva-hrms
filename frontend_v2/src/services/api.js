// API Configuration and Base Service
import { ApiError, getErrorMessage, shouldLogoutOnError, shouldShowRetry } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method with comprehensive error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Create a structured error with status code and additional info
        const error = new ApiError(
          data.error || `HTTP error! status: ${response.status}`,
          response.status,
          data.type || 'API_ERROR'
        );

        // Add additional error information
        error.response = response;
        error.data = data;
        error.endpoint = endpoint;
        error.shouldLogout = shouldLogoutOnError(data.error, response.status);
        error.shouldRetry = shouldShowRetry(data.error, response.status);
        error.userMessage = getErrorMessage(data.error, response.status);

        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new ApiError(
          'Network Error',
          0,
          'NETWORK_ERROR'
        );
        networkError.shouldLogout = false;
        networkError.shouldRetry = true;
        networkError.userMessage = getErrorMessage('Network Error', 0);
        throw networkError;
      }

      // Handle timeout errors (if using AbortController)
      if (error.name === 'AbortError') {
        const timeoutError = new ApiError(
          'Request Timeout',
          0,
          'TIMEOUT_ERROR'
        );
        timeoutError.shouldLogout = false;
        timeoutError.shouldRetry = true;
        timeoutError.userMessage = getErrorMessage('Request Timeout', 0);
        throw timeoutError;
      }

      // If it's already an ApiError, just re-throw it
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle other errors
      console.error('API request failed:', error);
      const genericError = new ApiError(
        error.message || 'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR'
      );
      genericError.shouldLogout = false;
      genericError.shouldRetry = true;
      genericError.userMessage = getErrorMessage(error.message, 500);
      throw genericError;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
