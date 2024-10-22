// src/service/permission.js
import axios from '@/utils/axios';
import { ENV_CONFIG } from '@/config';
import { hasPermission, HttpMethods } from '@/constants/authTypes';

// Cache for permission results
const permissionCache = new Map();

// Helper to generate cache key
const getCacheKey = (url, method) => `${url}:${method}`;

// Mock permission service
const mockPermissionService = {
  async checkPermission(url, method) {
    const cacheKey = getCacheKey(url, method);
    
    // Check cache first
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.role) return false;

    const result = hasPermission(user.role, url, method);
    
    // Cache the result
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

// Real API permission service
const apiPermissionService = {
  async checkPermission(url, method) {
    const cacheKey = getCacheKey(url, method);
    
    // Check cache first
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey);
    }

    try {
      const response = await axios.get('/permission', {
        params: {
          url,
          method
        }
      });

      // Cache the result
      permissionCache.set(cacheKey, response);
      
      return response;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  },

  async validatePermissions() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await axios.post('/validateToken', { token });
      return response;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },

  clearCache() {
    permissionCache.clear();
  }
};
// Export the appropriate service based on environment
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