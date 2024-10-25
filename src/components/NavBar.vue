// src/components/NavBar.vue
<template>
  <nav class="navbar">
    <ul class="nav-list">
      <li><router-link to="/api/home">Home</router-link></li>
      
      <!-- Admin Only -->
      <li v-if="userRole === 'ADMIN'"><router-link to="/api/users">User Management</router-link></li>
      <li v-if="userRole === 'ADMIN'"><router-link to="/api/products">Product Management</router-link></li>
      
      <!-- Seller Only -->
      <li v-if="userRole === 'SELLER'"><router-link to="/api/products">My Products</router-link></li>
      
      <!-- Seller and Admin -->
      <li v-if="['SELLER', 'ADMIN'].includes(userRole)">
        <router-link to="/api/inventory">Inventory</router-link>
      </li>
      
      <!-- All Users -->
      <li><router-link to="/api/products">Shop</router-link></li>
      <li><router-link to="/api/cart">Shopping Cart</router-link></li>
      <li><router-link to="/api/user">My Profile</router-link></li>
      <li><button @click="logout">Logout</button></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { pageQuery } from '@/service/category';

const router = useRouter();
const route = useRoute();
const userRole = ref('');

const checkUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  userRole.value = user ? user.role : '';
  console.log('User role:', userRole.value);
};

// 计算属性用于常用的权限检查
const isAdmin = computed(() => userRole.value === 'ADMIN');
const isSeller = computed(() => userRole.value === 'SELLER');
const isCustomer = computed(() => userRole.value === 'CUSTOMER');

onMounted(checkUserRole);

// 监听路由变化，重新检查用户角色
watch(() => route.path, checkUserRole);

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/api/login');
};

const routes = computed(() => {
  const baseRoutes = [
    { path: '/api/home', name: 'Home', access: 'all' },
    { path: '/api/products', name: 'Shop', access: 'all' },
    { path: '/api/cart', name: 'Shopping Cart', access: 'authenticated' },
    { path: '/api/user', name: 'My Profile', access: 'authenticated' }
  ];

  if (userRole.value === 'ADMIN') {
    baseRoutes.push(
      { path: '/api/users', name: 'User Management', access: 'admin' },
      { path: '/api/inventory', name: 'Inventory Management', access: 'admin' },
      { path: '/api/categories', name: 'Category Management', access: 'admin' }
    );
  } else if (userRole.value === 'SELLER') {
    baseRoutes.push(
      { path: '/api/merchant/products', name: 'My Products', access: 'seller' },
      { path: '/api/inventory', name: 'Inventory', access: 'seller' }
    );
  }

  return baseRoutes;
});

const checkAccess = (route) => {
  switch (route.access) {
    case 'all':
      return true;
    case 'authenticated':
      return !!userRole.value;
    case 'admin':
      return userRole.value === 'ADMIN';
    case 'seller':
      return userRole.value === 'SELLER';
    default:
      return false;
  }
};

const menuItems = computed(() => [
  { path: '/api/home', label: 'Home', role: 'all' },
  { path: '/api/products', label: 'Shop', role: 'all' },
  { 
    path: '/api/categories', 
    label: 'Categories', 
    role: 'all',
    children: categories.value.map(cat => ({
      path: `/api/products?category=${cat.categoryId}`,
      label: cat.categoryName
    }))
  },
  { path: '/api/cart', label: 'Shopping Cart', role: 'authenticated' },
  { path: '/api/profile', label: 'My Profile', role: 'authenticated' },
  // Admin only items
  { 
    path: '/api/admin', 
    label: 'Admin', 
    role: 'ADMIN',
    children: [
      { path: '/api/users', label: 'Users Management' },
      { path: '/api/category-management', label: 'Categories Management' },
      { path: '/api/inventory', label: 'Inventory Management' }
    ]
  },
  // Seller only items
  { 
    path: '/api/seller', 
    label: 'Seller', 
    role: 'SELLER',
    children: [
      { path: '/api/merchant/products', label: 'My Products' },
      { path: '/api/inventory', label: 'My Inventory' }
    ]
  }
]);

// Add categories loading
const categories = ref([]);

const loadCategories = async () => {
  try {
    const response = await pageQuery({
      page: 1,
      pageSize: 100
    });
    categories.value = response.records;
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};

onMounted(() => {
  if (userRole.value) {
    // 只有用户登录后才加载类别数据
    loadCategories();
  }
});
</script>

<style scoped>
.navbar {
  background-color: #f8f9fa;
  padding: 10px 0;
}

.nav-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap; /* 添加 flex-wrap 支持响应式布局 */
}

.nav-list li {
  margin: 0 10px; /* 添加间距 */
}

.nav-list li a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  padding: 5px 10px; /* 增加可点击区域 */
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-list li a:hover {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

button {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

button:hover {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
}

/* 添加响应式支持 */
@media (max-width: 768px) {
  .nav-list {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-list li {
    margin: 5px 0;
  }
}
</style>