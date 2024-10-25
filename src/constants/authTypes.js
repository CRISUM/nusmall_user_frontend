// src/constants/authTypes.js

// User Roles
export const UserRoles = {
    CUSTOMER: 'CUSTOMER',
    SELLER: 'SELLER',
    ADMIN: 'ADMIN'
  };
  
  // HTTP Methods
  export const HttpMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
  };
  
  // Define accessible routes for each role
  export const RoleRoutes = {
    CUSTOMER: [
      '/api/home',
      '/api/products',
      '/api/cart',
      '/api/user',
      '/api/product',
      '/api/getCurrentUserInfo'
    ],
    SELLER: [
      '/api/home',
      '/api/products',
      '/api/cart',
      '/api/user',
      '/api/product',
      '/api/inventory',
      '/api/merchant/products',
      '/api/getCurrentUserInfo'
    ],
    ADMIN: [
      '/api/home',
      '/api/products',
      '/api/cart',
      '/api/user',
      '/api/product',
      '/api/inventory',
      '/api/users',
      '/api/merchant/products',
      '/api/getCurrentUserInfo'
    ]
  };
  
  // Route permissions mapping with detailed access control
  export const RoutePermissions = {
    '/api/home': {
      [HttpMethods.GET]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN]
    },
    '/api/products': {
      [HttpMethods.GET]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.POST]: [UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.PUT]: [UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.DELETE]: [UserRoles.SELLER, UserRoles.ADMIN]
    },
    '/api/cart': {
      [HttpMethods.GET]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.POST]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.PUT]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.DELETE]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN]
    },
    '/api/user': {
      [HttpMethods.GET]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.PUT]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.POST]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN]
    },
    '/api/getCurrentUserInfo': {
      [HttpMethods.POST]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.GET]: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN]
    },
    '/api/inventory': {
      [HttpMethods.GET]: [UserRoles.SELLER, UserRoles.ADMIN],
      [HttpMethods.PUT]: [UserRoles.SELLER, UserRoles.ADMIN]
    },
    '/api/users': {
      [HttpMethods.GET]: [UserRoles.ADMIN],
      [HttpMethods.POST]: [UserRoles.ADMIN],
      [HttpMethods.PUT]: [UserRoles.ADMIN],
      [HttpMethods.DELETE]: [UserRoles.ADMIN]
    }
  };
  
  // Permission check helpers
  export const hasPermission = (userRole, path, method) => {
    // Admin has access to everything
    if (userRole === UserRoles.ADMIN) return true;
  
    // Check if route exists in permissions
    const routePermission = RoutePermissions[path];
    if (!routePermission) return true; // Change to true for undefined routes
  
    // Check if method is allowed for this route
    const allowedRoles = routePermission[method];
    if (!allowedRoles) return true; // Change to true for undefined methods
  
    // Check if user role is allowed
    return allowedRoles.includes(userRole);
  };
  
  // Check if route is accessible for role
  export const isRouteAccessible = (userRole, path) => {
    if (!userRole) return false;
    if (userRole === 'ADMIN') return true;
    
    const allowedRoutes = RoleRoutes[userRole] || [];
    return allowedRoutes.some(route => path.startsWith(route));
  };