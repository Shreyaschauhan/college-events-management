import apiClient from './apiClient';

/**
 * Registers a new user.
 * @param {object} userData - User data.
 * @param {string} userData.fullName
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} [userData.role] - Optional role (defaults to 'student' on backend).
 * @returns {Promise<object>} - The response data containing user info and token.
 */
const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    // Optionally, save the token immediately after registration
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token); // Adjust 'authToken' key if needed
    }
    return response.data; // Contains { message, user, token }
  } catch (error) {
    console.error('Registration service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Registration failed');
  }
};

/**
 * Logs in a user.
 * @param {object} credentials - User credentials.
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<object>} - The response data containing user info and token.
 */
const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    // Save the token upon successful login
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token); // Adjust 'authToken' key if needed
    }
    return response.data; // Contains { message, user, token }
  } catch (error) {
    console.error('Login service error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Login failed');
  }
};

/**
 * Verifies the current JWT token stored in localStorage.
 * Assumes the token is automatically added by the apiClient interceptor.
 * @returns {Promise<object>} - The response data containing user info and token validity message.
 */
const verifyToken = async () => {
  try {
    // The token is added automatically by the interceptor
    const response = await apiClient.get('/auth/verify-token');
    return response.data; // Contains { message, user, token }
  } catch (error) {
    console.error('Token verification service error:', error.response?.data || error.message);
    // If verification fails (e.g., 401), the interceptor might handle redirection,
    // but we still throw the error for component-level handling if needed.
    localStorage.removeItem('authToken'); // Clear invalid token
    throw error.response?.data || new Error('Token verification failed');
  }
};

/**
 * Logs out the user by removing the token from storage.
 * Note: This is a client-side action; the backend token remains valid until expiry unless you implement server-side invalidation.
 */
const logout = () => {
  localStorage.removeItem('authToken'); // Adjust 'authToken' key if needed
  // Optionally, notify other parts of the app or redirect
};

export const authService = {
  register,
  login,
  verifyToken,
  logout,
};