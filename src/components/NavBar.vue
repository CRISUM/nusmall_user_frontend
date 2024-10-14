<template>
  <nav v-if="isLoggedIn" class="navbar">
    <ul class="nav-list">
      <li><router-link to="/api/home">Home</router-link></li>
      <li v-if="isAdmin"><router-link to="/api/users">User Management</router-link></li>
      <li v-if="isAdmin"><router-link to="/api/products">Product Management</router-link></li>
      <li><router-link to="/api/cart">Shopping Cart</router-link></li>
      <li><router-link to="/api/user">My Profile</router-link></li>
    </ul>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const isAdmin = ref(false)
const router = useRouter()

const checkAuth = () => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  isLoggedIn.value = !!token
  isAdmin.value = user && user.role === 'ADMIN'
}

onMounted(checkAuth)

watch(() => router.currentRoute.value, checkAuth)
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
</style>