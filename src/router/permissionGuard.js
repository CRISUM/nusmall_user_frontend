// src/router/permissionGuard.js

import { isRouteAccessible } from '@/constants/authTypes';
import { permissionService } from '@/service/permission';

export const setupPermissionGuard = (router) => {
  router.beforeEach(async (to, from, next) => {

    console.log('Permission guard triggered', {
      path: to.path,
      from: from.path
    });

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    console.log('Permission check:', {
      token: !!token,
      user: user ? {
        ...user,
        password: undefined // 不记录敏感信息
      } : null,
      path: to.path,
      meta: to.meta
    });

    // Public routes
    if (!requiresAuth) {
      next();
      return;
    }

    // No token
    if (!token) {
      next('/api/login');
      return;
    }

    try {
      // Check if route is accessible for user role
      if (!user || !user.role) {
        console.log('No user role found, redirecting to login');
        next('/api/login');
        return;
      }

      const canAccess = isRouteAccessible(user.role, to.path);
      console.log('Route accessibility check:', {
        role: user.role,
        path: to.path,
        canAccess
      });

      if (!canAccess) {
        console.log('Access denied, redirecting to 403');
        next('/403');
        return;
      }

      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      next('/api/login');
    }
  });
};