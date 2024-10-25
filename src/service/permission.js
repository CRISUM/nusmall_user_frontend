// src/service/permission.js
import { userService } from '@/utils/axios';  // 添加这行导入
import { ENV_CONFIG } from '@/config';
import { hasPermission, HttpMethods } from '@/constants/authTypes';

// 缓存权限结果
const permissionCache = new Map();

// 帮助函数生成缓存key
const getCacheKey = (url, method) => `${url}:${method}`;

// 实际API权限服务
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

      const result = response.success;
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
      
      return response.success;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },

  clearCache() {
    permissionCache.clear();
  }
};

// Mock 权限服务 
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

// 根据环境导出服务实例
export const permissionService = ENV_CONFIG.USE_MOCK ? mockPermissionService : apiPermissionService;

// 导出帮助函数 
export const checkRoutePermission = async (route, user) => {
  if (!route.meta || !route.meta.permissions) return true;
  
  const method = route.meta.permissions.write ? HttpMethods.POST : HttpMethods.GET;
  return await permissionService.checkPermission(route.path, method);
};

export const clearPermissionCache = () => {
  permissionService.clearCache();
};