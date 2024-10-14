<template>
    <div class="user-profile">
      <h1>My Profile</h1>
      <div v-if="!loading" class="user-info">
        <div class="info">
          <img :src="avatarSrc" alt="User Avatar"/>
          <div class="user-desc">
            <p>Username: {{ user.username }}</p>
            <p>Email: {{ user.email }}</p>
            <p>Role: {{ user.role }}</p>
          </div>
        </div>
      </div>
      <ul class="user-actions">
        <li v-if="user.role === 'ADMIN'" @click="goTo('/api/users')">User Management</li>
        <li @click="goTo('/api/orders')">My Orders</li>
        <li @click="goTo('/api/account-settings')">Account Settings</li>
        <li @click="goTo('/api/address-management')">Address Management</li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { getUserById } from '@/service/user'
  import avatarImage from '@/assets/pic/useravatar.png'
  
  const router = useRouter()
  const user = ref({})
  const loading = ref(true)
  const avatarSrc = avatarImage
  
  onMounted(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'))
      if (storedUser && storedUser.id) {
        const userData = await getUserById(storedUser.id)
        user.value = userData
      } else {
        throw new Error('User data not found')
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      loading.value = false
    }
  })
  
  const goTo = (route) => {
    router.push(route)
  }
  </script>
  
  <style scoped>
  .user-profile {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .user-info {
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .info {
    display: flex;
    align-items: center;
  }
  
  .info img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-right: 20px;
  }
  
  .user-desc p {
    margin: 5px 0;
  }
  
  .user-actions {
    list-style: none;
    padding: 0;
  }
  
  .user-actions li {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    cursor: pointer;
  }
  
  .user-actions li:hover {
    background-color: #f0f0f0;
  }
  </style>