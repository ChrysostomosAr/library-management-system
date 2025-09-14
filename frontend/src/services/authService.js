// src/services/authService.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/auth';

// Δημιουργία axios instance για authentication
const authApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

const authService = {
  // Register νέου χρήστη
  register: async (userData) => {
    try {
      const response = await authApi.post('/register', userData);
      
      // Αποθήκευση του token αν το registration επιτύχει
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login υπάρχοντος χρήστη
  login: async (credentials) => {
    try {
      const response = await authApi.post('/login', credentials);
       console.log('Login response:', response.data);
      // Αποθήκευση του token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      const userData = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        role: response.data.role
      };






      localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Έλεγχος αν ο χρήστης είναι logged in
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Λήψη του αποθηκευμένου token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Λήψη του αποθηκευμένου χρήστη
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Validation του token με το backend
  validateToken: async () => {
    try {
      const token = authService.getToken();
      if (!token) return false;

      const response = await authApi.post('/validate', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      // Αν το token είναι invalid, κάνε logout
      authService.logout();
      return false;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No token available');

      const response = await authApi.post('/refresh', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Ενημέρωση του token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      authService.logout();
      throw error;
    }
  }
};

export default authService;