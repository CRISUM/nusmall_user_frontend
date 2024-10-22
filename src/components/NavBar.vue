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

const router = useRouter();
const route = useRoute();
const userRole = ref('');

const checkUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  userRole.value = user ? user.role : '';
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