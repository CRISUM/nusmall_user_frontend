// src/service/permission.js
import { userService } from '@/utils/axios';
import { ENV_CONFIG } from '@/config';
import { UserRoles } from '@/constants/authTypes';

// 缓存权限结果
const permissionCache = new Map();

const getCacheKey = (url, method) => `${url}:${method}`;

// 实际API权限服务
const apiPermissionService = {
  async checkPermission(url, method) {
    const cacheKey = getCacheKey(url, method);
    
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey);
    }

    try {
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      if (!token) return false;

      // 根据API文档，调用permission检查接口
      const response = await userService.get('/permission', {
        params: { 
          url,  // API需要url参数
          method  // API需要method参数
        },
        headers: {
          'authToken': token  // API需要在header中传入authToken
        }
      });

      // API返回值为boolean类型
      const hasPermission = !!response;
      permissionCache.set(cacheKey, hasPermission);
      
      return hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  },

  async validatePermissions() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // 根据API文档调用token验证接口
      const response = await userService.post('/validateToken', { token });
      
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

// Mock权限服务(开发环境使用) 
const mockPermissionService = {
  async checkPermission(url, method) {
    const cacheKey = getCacheKey(url, method);
    
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // 从localStorage获取用户信息进行权限判断
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.role) return false;

    // 使用authTypes中定义的权限检查函数
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
export const permissionService = ENV_CONFIG.USE_MOCK ? 
  mockPermissionService : apiPermissionService;

// 导出辅助函数
export const checkRoutePermission = async (route, user) => {
  if (!route.meta?.permissions) return true;
  
  const method = route.meta.permissions.write ? 'POST' : 'GET';
  return await permissionService.checkPermission(route.path, method);
};

export const clearPermissionCache = () => {
  permissionService.clearCache();
};