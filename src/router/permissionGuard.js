// src/router/permissionGuard.js

import { isRouteAccessible } from '@/constants/authTypes';
import { permissionService } from '@/service/permission';

export const setupPermissionGuard = (router) => {
  router.beforeEach(async (to, from, next) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

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
      if (user && !isRouteAccessible(user.role, to.path)) {
        next('/403');
        return;
      }

      // Check specific permission for the route
      const method = to.meta.permissions?.write ? 'POST' : 'GET';
      const hasPermission = await permissionService.checkPermission(
        to.path,
        method
      );

      if (!hasPermission) {
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