// src/router/permissionGuard.js

import { isRouteAccessible } from '@/constants/authTypes';
import { permissionService } from '@/service/permission';
import { UserRoles } from '@/constants/authTypes' 

// src/router/permissionGuard.js
export const setupPermissionGuard = (router) => {
  router.beforeEach(async (to, from, next) => {
    console.log('Permission guard triggered:', {
      path: to.path,
      from: from.path
    });

    // 如果是不需要认证的路由
    if (!to.meta.requiresAuth) {
      next();
      return;
    }

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    console.log('Auth check:', {
      path: to.path,
      token: !!token,
      userRole: user?.role
    });

    // 没有token或user信息
    if (!token || !user) {
      next('/api/login');
      return;
    }

    try {
      // Admin直接放行，不需要额外的权限检查
      if (user.role === 'ADMIN') {
        console.log('Admin access granted for:', to.path);
        next();
        return;
      }

      // 对于非admin用户进行权限检查
      const hasPermission = await permissionService.checkPermission(
        to.path, 
        to.meta?.permissions?.write ? 'POST' : 'GET'
      );

      if (hasPermission) {
        next();
        return;
      }

      // 如果没有权限，检查是否在允许的角色列表中
      const allowedRoles = to.meta?.roles || [];
      if (allowedRoles.length > 0 && allowedRoles.includes(user.role)) {
        next();
        return;
      }

      // 最后检查通用路由访问权限
      if (isRouteAccessible(user.role, to.path)) {
        next();
        return;
      }

      console.log('Access denied for:', {
        path: to.path,
        userRole: user.role,
        hasPermission
      });
      
      next('/403');
    } catch (error) {
      console.error('Permission check failed:', error);
      next('/api/login');
    }
  });
};