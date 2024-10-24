// src/service/user.js
import axios from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/axios';
import { userService } from '../utils/axios';

console.log('Is using mock data:', isUseMock());

if (isUseMock()) {
  console.log('Mock service is being used');
} else {
  console.log('Real API service is being used');
}

// Real API implementations
const apiService = {
  login: async (credentials) => {
    console.log('Sending POST request with credentials:', credentials);
    const response = await userService.post('/login', credentials);
    console.log('Response from POST request:', response);
    return response;
  },

  register: async (userData) => {
    const response = await userService.post('/api/user', userData);
    return response;
  },

  getAllUsers: async () => {
    const response = await userService.get('/api/user');
    return response;
  },

  getUserById: async (id) => {
    const response = await userService.get(`/api/user/${id}`);
    return response;
  },

  createUser: async (userData) => {
    const response = await userService.post('/api/user', userData);
    return response;
  },

  updateUser: async (id, userData) => {
    const response = await userService.put(`/api/user/${id}`, userData);
    return response;
  },

  deleteUser: async (id) => {
    const response = await userService.delete(`/api/user/${id}`);
    return response;
  },

  getCurrentUserInfo: async () => {
    const response = await userService.post('/getCurrentUserInfo');
    return response;
  },

  validateToken: async (token) => {
    const response = await userService.post('/validateToken', { token });
    return response;
  }
};

console.log('isUseMock:', isUseMock);
console.log('Environment variables:', import.meta.env);
// Export the appropriate service based on environment
export const login = isUseMock() ? mockService.login : apiService.login;
export const register = isUseMock() ? mockService.register : apiService.register;
export const getAllUsers = isUseMock() ? mockService.getAllUsers : apiService.getAllUsers;
export const getUserById = isUseMock() ? mockService.getUserById : apiService.getUserById;
export const createUser = isUseMock() ? mockService.createUser : apiService.createUser;
export const updateUser = isUseMock() ? mockService.updateUser : apiService.updateUser;
export const deleteUser = isUseMock() ? mockService.deleteUser : apiService.deleteUser;
export const getCurrentUserInfo = isUseMock() ? mockService.getCurrentUserInfo : apiService.getCurrentUserInfo;
export const validateToken = isUseMock() ? mockService.validateToken : apiService.validateToken;