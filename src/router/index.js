//index.js

import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import User from '@/views/User.vue'
import UserList from '@/views/UserList.vue'
import UserForm from '@/views/UserForm.vue'
import Home from '@/views/Home.vue'
// import ProductManagement from '@/views/ProductManagement.vue'
// import ShoppingCart from '@/views/ShoppingCart.vue'

const routes = [
  {
    path: '/',
    redirect: '/api/login'
  },
  {
    path: '/api/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/api/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/api/user',
    name: 'User',
    component: User,
    meta: { requiresAuth: true }
  },
  {
    path: '/api/users',
    name: 'UserList',
    component: UserList,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/api/users/new',
    name: 'CreateUser',
    component: UserForm,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/api/users/:id/edit',
    name: 'EditUser',
    component: UserForm,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // {
  //   path: '/api/products',
  //   name: 'ProductManagement',
  //   component: ProductManagement,
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  // {
  //   path: '/api/cart',
  //   name: 'ShoppingCart',
  //   component: ShoppingCart,
  //   meta: { requiresAuth: true }
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const isAdmin = user && user.role === 'ADMIN'

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/api/login')
  } else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
    next('/api/user')
  } else {
    next()
  }
})

export default router