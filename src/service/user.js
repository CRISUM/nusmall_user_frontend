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
    try {
      const response = await userService.get(`/api/user/${id}`);
      
      if (response.success && response.data) {
        // 获取用户角色
        try {
          const roleResponse = await apiService.getUserRole(id);
          if (roleResponse && roleResponse.name) {
            response.data.role = roleResponse.name;
          }
        } catch (roleError) {
          console.error('Failed to get user role:', roleError);
        }
      }

      return response;
    } catch (error) {
      console.error('Failed to get user:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await userService.post('/api/user', {
        ...userData,
        role: undefined  // 移除role字段，因为用户表不存储role
      });

      if (response.success && response.data) {
        // 创建用户后设置角色
        try {
          await apiService.createUserRole(
            response.data.userId,
            userData.role || 'CUSTOMER'
          );
        } catch (roleError) {
          console.error('Failed to set user role:', roleError);
        }
      }

      return response;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (userData) => {
    try {
      // 保存角色信息
      const roleName = userData.role;
      // 移除role字段
      const { role, ...userDataWithoutRole } = userData;

      // 更新用户基本信息
      const response = await userService.put(`/api/user/${userData.userId}`, userDataWithoutRole);

      if (response.success) {
        // 更新用户角色
        try {
          await apiService.createUserRole(userData.userId, roleName);
        } catch (roleError) {
          console.error('Failed to update user role:', roleError);
          throw new Error('User updated but role update failed');
        }
      }
      return response;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token is required');
      }

      const response = await userService.delete(`/api/user/${userId}`, {
        headers: {
          'authToken': token
        }
      });

      return response;
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  },

  getCurrentUserInfo: async (token) => {
    try {
      const response = await userService.post('/getCurrentUserInfo', null, {
        headers: {
          'authToken': token
        }
      });

      if (response.success && response.data) {
        // 获取用户角色
        try {
          const roleResponse = await apiService.getUserRole(response.data.userId);
          if (roleResponse && roleResponse.name) {
            response.data.role = roleResponse.name;
          }
        } catch (roleError) {
          console.error('Failed to get user role:', roleError);
        }
      }

      return response;
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  },

  /**
   * Create user role assignment
   * POST /user-roles/create
   * @param {number} userId 
   * @param {number} roleId - 1: ADMIN, 2: CUSTOMER, 3: SELLER
   */
  createUserRole: async (userId, roleName) => {
    try {
      // 将角色名称转换为roleId
      const roleMap = {
        'ADMIN': 1,
        'CUSTOMER': 2,
        'SELLER': 3
      };
      
      const roleId = roleMap[roleName];
      if (!roleId) {
        throw new Error('Invalid role name');
      }

      const response = await userService.post('/user-roles/create', null, {
        params: {
          userId,
          roleId
        },
        headers: {
          'authToken': localStorage.getItem('token')
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to create user role:', error);
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
      const response = await userService.get(`/user-roles/user/${userId}`, {
        headers: {
          'authToken': localStorage.getItem('token')
        }
      });
      console.log(`Role response for user ${userId}:`, response);  // 添加日志
      return response;
    } catch (error) {
      console.error(`Failed to get role for user ${userId}:`, error);
      return null;
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