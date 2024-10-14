<template>
  <nav class="navbar">
    <ul class="nav-list">
      <li><router-link to="/api/home">Home</router-link></li>
      <li v-if="isAdmin"><router-link to="/api/users">User Management</router-link></li>
      <li v-if="isAdmin"><router-link to="/api/products">Product Management</router-link></li>
      <li><router-link to="/api/cart">Shopping Cart</router-link></li>
      <li><router-link to="/api/user">My Profile</router-link></li>
      <li><button @click="logout">Logout</button></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const isAdmin = ref(false);

const checkUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  isAdmin.value = user && user.role === 'ADMIN';
};

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
}

.nav-list li a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

.nav-list li a:hover {
  color: #007bff;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  font-weight: bold;
  color: #333;
}

button:hover {
  color: #007bff;
}
</style>