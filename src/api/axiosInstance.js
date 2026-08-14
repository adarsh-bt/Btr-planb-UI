import axios from 'axios';

// Base API Configuration
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'https://api.agrimonitor.gov.in/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 & Error Handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      if (error.response.status === 401) {
        // Handle unauthorized / expired token
        console.warn('Unauthorized access - token may be expired');
      }
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || 'Server error occurred'
      });
    } else if (error.request) {
      // Request was made but no response was received
      return Promise.reject({
        status: 0,
        message: 'Network error. Unable to reach server.'
      });
    }
    return Promise.reject({
      status: -1,
      message: error.message || 'An unexpected error occurred'
    });
  }
);

export default axiosInstance;
