// src/service/permission.js
import axios from '@/utils/axios';
import { ENV_CONFIG } from '@/config';
import { hasPermission, HttpMethods } from '@/constants/authTypes';

// Cache for permission results
const permissionCache = new Map();

// Helper to generate cache key
const getCacheKey = (url, method) => `${url}:${method}`;

// Real API permission service
const apiPermissionService = {
  async checkPermission(url, method) {
    const cacheKey = getCacheKey(url, method);
    
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await userService.get('/permission', {
        params: { url, method },
        headers: {
          'authToken': token
        }
      });

      const result = response.data.success;
      permissionCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  },

  async validatePermissions() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await userService.post('/validateToken', { token });
      
      return response.data.success;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },

  clearCache() {
    permissionCache.clear();
  }
};

// Mock permission service
const mockPermissionService = {
  async checkPermission(url, method) {
    const cacheKey = getCacheKey(url, method);
    
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.role) return false;

    const result = hasPermission(user.role, url, method);
    permissionCache.set(cacheKey, result);
    
    return result;
  },

  async validatePermissions() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  clearCache() {
    permissionCache.clear();
  }
};

// Export the service instance based on environment
export const permissionService = ENV_CONFIG.USE_MOCK ? mockPermissionService : apiPermissionService;

// Export helper functions
export const checkRoutePermission = async (route, user) => {
  if (!route.meta || !route.meta.permissions) return true;
  
  const method = route.meta.permissions.write ? HttpMethods.POST : HttpMethods.GET;
  return await permissionService.checkPermission(route.path, method);
};

export const clearPermissionCache = () => {
  permissionService.clearCache();
};