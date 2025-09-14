// src/services/api.js
import axios from 'axios';

// Βασική διεύθυνση του backend
const BASE_URL = 'http://localhost:8080/api';

// Δημιουργία axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Interceptor για requests
api.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url);
    
    // Προσθέτουμε το JWT token αν υπάρχει
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor για responses
api.interceptors.response.use(
  response => {
    console.log('Response received:', response.status, response.data);
    return response;
  },
  error => {
    console.error('Response error:', error.response?.status, error.message);
    
    // Καλύτερο error handling
    if (error.response?.status === 403) {
      console.log('Authentication required - endpoint exists!');
    } else if (error.response?.status === 404) {
      console.log('Endpoint not found');
    } else if (error.response?.status >= 500) {
      console.log('Server error');
    } else if (error.code === 'ERR_NETWORK') {
      console.log('Network error - backend not responding');
    }
    
    return Promise.reject(error);
  }
);

export default api;