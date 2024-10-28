// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { permissionService } from '@/service/permission'
import { UserRoles } from '@/constants/authTypes'
import Login from '@/views/Login.vue'
import User from '@/views/User.vue'
import UserList from '@/views/UserList.vue'
import UserForm from '@/views/UserForm.vue'
import Home from '@/views/Home.vue'
import Cart from '@/views/cart.vue'
import ProductList from '@/views/ProductList.vue'
import ProductDetail from '@/views/ProductDetail.vue'
import InventoryManagement from '@/views/InventoryManagement.vue'
import { setupPermissionGuard } from './permissionGuard'
import CategoryManagement from '@/views/CategoryManagement.vue'

const UserSettings = () => import('@/views/UserSettings.vue');
const AddressManagement = () => import('@/views/AddressManagement.vue');



const routes = [
  {
    path: '/',
    redirect: '/api/login'
  },
  {
    path: '/api/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/api/register',
    name: 'Register',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/api/home',
    name: 'Home',
    component: Home,
    meta: { 
      requiresAuth: true,
      roles: [UserRoles.ADMIN, UserRoles.SELLER, UserRoles.CUSTOMER],  // 明确允许的角色
      permissions: {
        read: true,  // 基础读取权限
        write: false // 不需要写入权限
      }
    }
  },
  {
    path: '/api/user',
    name: 'User',
    component: User,
    meta: { 
      requiresAuth: true,
      permissions: {
        read: true,
        write: true
      }
    }
  },
  {
    path: '/api/users',
    name: 'UserList',
    component: UserList,
    meta: { 
      requiresAuth: true,
      roles: [UserRoles.ADMIN],
      permissions: {
        read: true,
        write: true
      }
    }
  },
  {
    path: '/api/users/new',
    name: 'CreateUser',
    component: UserForm,
    meta: { 
      requiresAuth: true,
      roles: [UserRoles.ADMIN],
      permissions: {
        write: true
      }
    }
  },
  {
    path: '/api/users/:id',
    name: 'EditUser',
    component: UserForm,
    meta: { 
      requiresAuth: true,
      roles: [UserRoles.ADMIN],
      permissions: {
        write: true
      }
    }
  },
  {
    path: '/api/user/settings',
    name: 'UserSettings',
    component: UserSettings,
    meta: {
      requiresAuth: true,
      roles: [UserRoles.ADMIN, UserRoles.SELLER, UserRoles.CUSTOMER],
      permissions: {
        read: true,
        write: true
      }
    }
  },
  {
    path: '/api/user/addresses',
    name: 'AddressManagement',
    component: AddressManagement,
    meta: {
      requiresAuth: true,
      roles: [UserRoles.ADMIN, UserRoles.SELLER, UserRoles.CUSTOMER],
      permissions: {
        read: true,
        write: true
      }
    }
  },
  {
    path: '/api/products',
    name: 'ProductList',
    component: ProductList,
    meta: {
      requiresAuth: false,
      permissions: {
        read: true
      }
    }
  },
  {
    path: '/api/product/:id',
    name: 'ProductDetail',
    component: ProductDetail,
    meta: {
      requiresAuth: false,
      permissions: {
        read: true
      }
    }
  },
  {
    path: '/api/inventory',
    name: 'InventoryManagement',
    component: InventoryManagement,
    meta: {
      requiresAuth: true,
      roles: [UserRoles.SELLER, UserRoles.ADMIN],
      permissions: {
        read: true,
        write: true
      }
    }
  },
  {
    path: '/api/cart',
    name: 'Cart',
    component: Cart,
    meta: { 
      requiresAuth: true,
      permissions: {
        read: true,
        write: true
      }
    }
  },
  {
    path: '/api/orders',
    name: 'Orders',
    component: () => import('@/views/OrderList.vue'),
    meta: { 
      requiresAuth: true,
      roles: [UserRoles.CUSTOMER, UserRoles.SELLER, UserRoles.ADMIN],
      permissions: {
        read: true
      }
    }
  },
  {
    path: '/api/category-management',
    name: 'CategoryManagement',
    component: CategoryManagement,
    meta: { 
      requiresAuth: true,
      roles: [UserRoles.ADMIN], // 只允许管理员访问
      permissions: {
        read: true,
        write: true
      }
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: { requiresAuth: false }
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  console.log('Global navigation guard:', {
    to: to.path,
    from: from.path,
    meta: to.meta
  });

  next();
});

router.beforeEach(async (to, from, next) => {

  console.log('Global navigation guard triggered', {
    to: to.path,
    from: from.path,
    meta: to.meta
  });

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (!requiresAuth) {
    next();
    return;
  }
  const roles = to.matched.reduce((acc, record) => {
    if (record.meta.roles) {
      return acc.concat(record.meta.roles)
    }
    return acc
  }, [])
  
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  console.log('Auth check:', {
    path: to.path,
    requiresAuth,
    user: user ? { ...user, token: undefined } : null
  });

  if (!token) {
    next('/api/login');
    return;
  }

  const allowedRoles = to.meta?.roles || [];
  if (user && user.role && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      console.error('Unauthorized role:', {
        userRole: user.role,
        allowedRoles,
        path: to.path
      });
      next('/403');
      return;
    }
  }

  next();
})

setupPermissionGuard(router);

export default router