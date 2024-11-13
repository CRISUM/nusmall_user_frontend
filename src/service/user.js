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
    try {
      const response = await userService.post('/api/user', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (userData) => {
    try {
      // 从本地存储获取当前用户ID
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser?.userId) {
        throw new Error('User ID not found');
      }
      
      // 使用实际的userId构建URL
      const response = await userService.put(`/api/user/${currentUser.userId}`, userData);
      return response;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    const response = await userService.delete(`/api/user/${id}`);
    return response;
  },

  /**
   * Get current user info including role
   * Backend endpoint: POST /getCurrentUserInfo
   * @param {string} token - Auth token
   * @returns {Promise<ApiResponseUser>} 
   */
  getCurrentUserInfo: async (token) => {
    try {
      console.log('Sending getCurrentUserInfo request with token:', token);
      const response = await userService.post('/getCurrentUserInfo', {}, {
        headers: {
          'authToken': token
        }
      });
      if (response.success && response.data) {
        const roleResponse = await apiService.getUserRole(response.data.userId);
        // 直接将角色名称赋值给用户的role属性
        response.data.role = roleResponse ? roleResponse.name : null;
      }
      return response;
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  },

  /**
 * Get user role by user ID
 * Backend endpoint: GET /user-roles/user/{userId}
 * @param {number} userId 
 * @returns {Promise<Role>}
 */
  getUserRole: async (userId) => {
    try {
      const response = await userService.get(`/user-roles/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Failed to get user role:', error);
      throw error;
    }
  },

  validateToken: async (token) => {
    const response = await userService.post('/validateToken', { token });
    return response;
  }
};

console.log('isUseMock:', isUseMock);
console.log('Environment variables:', import.meta.env);
// Export the appropriate service based on environment
export const {
  login,
  register,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUserInfo,
  getUserRole,
  validateToken
} = isUseMock() ? mockService : apiService;