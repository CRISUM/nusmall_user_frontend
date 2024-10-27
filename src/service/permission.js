// src/service/permission.js
import { userService } from '@/utils/axios';  // 添加这行导入
import { ENV_CONFIG } from '@/config';
import { hasPermission, HttpMethods } from '@/constants/authTypes';

// 缓存权限结果
const permissionCache = new Map();

// 帮助函数生成缓存key
const getCacheKey = (url, method) => `${url}:${method}`;

// 实际API权限服务
export const permissionService = {
  async checkPermission(url, method) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Admin has all permissions
      if (user?.role === UserRoles.ADMIN) {
        return true;
      }

      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await userService.get('/permission', {
        params: { url, method },
        headers: {
          'authToken': token
        }
      });

      // 如果API返回false但是用户有正确的角色，依然返回true
      if (!response && user) {
        const allowedRoutes = {
          '/api/users': [UserRoles.ADMIN],
          '/api/user': [UserRoles.ADMIN],
          '/api/orders': [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN]
        };

        const routeRoles = allowedRoutes[url];
        if (routeRoles && routeRoles.includes(user.role)) {
          return true;
        }
      }

      return response;
    } catch (error) {
      console.error('Permission check failed:', error);
      // 如果API检查失败，回退到基于角色的权限检查
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.role === UserRoles.ADMIN;
    }
  },

  async validatePermissions() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      // Admin always has valid permissions
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.role === UserRoles.ADMIN) {
        return true;
      }

      const response = await userService.post('/validateToken', { token });
      return response?.success ?? false;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },

  clearCache() {
    permissionCache.clear();
  }
};

// 导出帮助函数 
export const checkRoutePermission = async (route, user) => {
  if (!route.meta || !route.meta.permissions) return true;
  
  const method = route.meta.permissions.write ? HttpMethods.POST : HttpMethods.GET;
  return await permissionService.checkPermission(route.path, method);
};

export const clearPermissionCache = () => {
  permissionService.clearCache();
};