// src/service/user.js
import axios from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/axios';

// Real API implementations
const apiService = {
  login: async (credentials) => {
    const response = await axios.post('/login', credentials);
    return response;
  },

  register: async (userData) => {
    const response = await axios.post('/api/user', userData);
    return response;
  },

  getAllUsers: async () => {
    const response = await axios.get('/api/user');
    return response;
  },

  getUserById: async (id) => {
    const response = await axios.get(`/api/user/${id}`);
    return response;
  },

  createUser: async (userData) => {
    const response = await axios.post('/api/user', userData);
    return response;
  },

  updateUser: async (id, userData) => {
    const response = await axios.put(`/api/user/${id}`, userData);
    return response;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`/api/user/${id}`);
    return response;
  },

  getCurrentUserInfo: async () => {
    const response = await axios.post('/getCurrentUserInfo');
    return response;
  },

  validateToken: async (token) => {
    const response = await axios.post('/validateToken', { token });
    return response;
  }
};

// Export the appropriate service based on environment
export const login = isUseMock ? mockService.login : apiService.login;
export const register = isUseMock ? mockService.register : apiService.register;
export const getAllUsers = isUseMock ? mockService.getAllUsers : apiService.getAllUsers;
export const getUserById = isUseMock ? mockService.getUserById : apiService.getUserById;
export const createUser = isUseMock ? mockService.createUser : apiService.createUser;
export const updateUser = isUseMock ? mockService.updateUser : apiService.updateUser;
export const deleteUser = isUseMock ? mockService.deleteUser : apiService.deleteUser;
export const getCurrentUserInfo = isUseMock ? mockService.getCurrentUserInfo : apiService.getCurrentUserInfo;
export const validateToken = isUseMock ? mockService.validateToken : apiService.validateToken;