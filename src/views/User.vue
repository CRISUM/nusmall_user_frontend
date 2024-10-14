<template>
    <div class="user-box">
      <simple-header :title="'My Profile'"></simple-header>
      <div v-if="!loading" class="user-info">
        <div class="info">
          <img :src="avatarSrc" alt="User Avatar"/>
          <div class="user-desc">
            <span>Username: {{ user.username }}</span>
            <span>Email: {{ user.email }}</span>
            <span>Role: {{ user.role }}</span>
          </div>
        </div>
      </div>
      <ul class="user-list">
        <li v-if="user.role === 'ADMIN'" @click="goTo('/users')">
          <span>User Management</span>
          <span class="arrow">›</span>
        </li>
        <li @click="goTo('/orders')">
          <span>My Orders</span>
          <span class="arrow">›</span>
        </li>
        <li @click="goTo('/account-settings')">
          <span>Account Settings</span>
          <span class="arrow">›</span>
        </li>
        <li @click="goTo('/address-management')">
          <span>Address Management</span>
          <span class="arrow">›</span>
        </li>
        <li @click="goTo('/about')">
          <span>About Us</span>
          <span class="arrow">›</span>
        </li>
      </ul>
      <button class="logout-button" @click="logout">Logout</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import SimpleHeader from '@/components/SimpleHeader.vue'
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
  
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
  </script>

  <style scoped>
  .user-box {
    padding: 20px;
  }
  
  .user-info {
    background-color: #1baeae;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    color: white;
  }
  
  .info {
    display: flex;
    align-items: center;
  }
  
  .info img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 20px;
  }
  
  .user-desc {
    display: flex;
    flex-direction: column;
  }
  
  .user-desc span {
    margin-bottom: 5px;
  }
  
  .user-list {
    list-style: none;
    padding: 0;
  }
  
  .user-list li {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    cursor: pointer;
  }
  
  .arrow {
    color: #999;
  }
  
  .logout-button {
    width: 100%;
    padding: 10px;
    margin-top: 20px;
    background-color: #ff4d4f;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .logout-button:hover {
    background-color: #ff7875;
  }
  </style>