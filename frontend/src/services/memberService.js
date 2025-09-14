// src/services/memberService.js
import api from './api';

const memberService = {
  // Λήψη όλων των μελών
  getAllMembers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // Λήψη μέλους με συγκεκριμένο ID
  getMemberById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },

  // Δημιουργία νέου μέλους
  createMember: async (memberData) => {
    try {
      const response = await api.post('/users', memberData);
      return response.data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  // Ενημέρωση μέλους
  updateMember: async (id, memberData) => {
    try {
      const response = await api.put(`/users/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  // Διαγραφή μέλους
  deleteMember: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  // Αναζήτηση μελών
  searchMembers: async (searchTerm) => {
    try {
      const response = await api.get(`/users/search?query=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching members:', error);
      throw error;
    }
  },

  // Λήψη ενεργών μελών
  getActiveMembers: async () => {
    try {
      const response = await api.get('/users/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active members:', error);
      throw error;
    }
  },

  // Αλλαγή ρόλου χρήστη
  changeUserRole: async (userId, newRole) => {
    try {
      const response = await api.put(`/users/${userId}/role`, { role: newRole });
      return response.data;
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  },

  // Στατιστικά χρηστών
  getUserStatistics: async () => {
    try {
      const response = await api.get('/users/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }
};

export default memberService;