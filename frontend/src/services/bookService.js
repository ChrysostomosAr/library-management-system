// src/services/bookService.js
import api from './api';

const bookService = {
  // Λήψη όλων των βιβλίων
  getAllBooks: async () => {
    try {
      const response = await api.get('/books');
      return response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Λήψη βιβλίου με συγκεκριμένο ID
  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  // Δημιουργία νέου βιβλίου
  createBook: async (bookData) => {
    try {
      const response = await api.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Ενημέρωση βιβλίου
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  // Διαγραφή βιβλίου
  deleteBook: async (id) => {
    try {
      await api.delete(`/books/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  // Αναζήτηση βιβλίων
  searchBooks: async (searchTerm) => {
    try {
      const response = await api.get(`/books/search?query=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  // Λήψη βιβλίων ανά κατηγορία
  getBooksByCategory: async (category) => {
    try {
      const response = await api.get(`/books/category/${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching books by category:', error);
      throw error;
    }
  },

  // Λήψη όλων των κατηγοριών
  getAllCategories: async () => {
    try {
      const response = await api.get('/books/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Έλεγχος διαθεσιμότητας βιβλίου
  checkBookAvailability: async (id) => {
    try {
      const response = await api.get(`/books/${id}/availability`);
      return response.data;
    } catch (error) {
      console.error('Error checking book availability:', error);
      throw error;
    }
  }
};

export default bookService;