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
      permissions: {
        read: true
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
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const roles = to.matched.reduce((acc, record) => {
    if (record.meta.roles) {
      return acc.concat(record.meta.roles)
    }
    return acc
  }, [])
  
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // Public paths check
  if (!requiresAuth) {
    next()
    return
  }

  // Already logged in, redirect to home
  if (to.path === '/api/login' && isAuthenticated) {
    next('/api/home')
    return
  }

  // Authentication check
  if (requiresAuth && !isAuthenticated) {
    next('/api/login')
    return
  }

  try {
    // Role-based access check
    if (roles.length > 0 && (!user || !roles.includes(user.role))) {
      next('/403')
      return
    }

    // Permission check using backend service
    if (to.meta.permissions) {
      const method = to.meta.permissions.write ? 'POST' : 'GET'
      const hasPermission = await permissionService.checkPermission(to.path, method)
      
      if (!hasPermission) {
        next('/403')
        return
      }
    }

    next()
  } catch (error) {
    console.error('Permission check failed:', error)
    next('/api/login')
  }
})

export default router