import axios from 'axios';

// Determine the base URL for the API
// Use environment variables for flexibility (e.g., different URLs for dev/prod)
// Fallback to localhost:5001 for local development if no env var is set.
const API_BASE_URL = 'http://localhost:5001/api';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// This interceptor runs before each request is sent.
// We use it to automatically attach the JWT token (if available) to the Authorization header.
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage (or your preferred storage)
    const token = localStorage.getItem('authToken'); // Adjust 'authToken' if you use a different key

    if (token) {
      // If a token exists, add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // Continue with the modified request config
  },
  (error) => {
    // Handle request configuration errors
    return Promise.reject(error);
  }
);

// --- Response Interceptor (Optional but Recommended) ---
// This interceptor runs when a response is received.
// You can use it for global error handling (e.g., redirect on 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx causes this function to trigger
    // Simply return the response if it's successful
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    console.error('API call error:', error.response || error.message || error);

    // Example: Handle unauthorized errors globally
    if (error.response && error.response.status === 401) {
      // Clear token, redirect to login, etc.
      // localStorage.removeItem('authToken');
      // window.location.href = '/login'; // Or use React Router's history/navigate
      console.warn('Unauthorized access - Redirecting or clearing token might be needed.');
    }

    // Return a rejected Promise with the error, so calling code can handle it too
    return Promise.reject(error);
  }
);


export default apiClient;