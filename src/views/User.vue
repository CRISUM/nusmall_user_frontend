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
        <!-- Add new actions based on role -->
        <li v-if="user.role === 'ADMIN'" @click="goTo('/api/users')">
          User Management
        </li>
        <li v-if="['SELLER', 'ADMIN'].includes(user.role)" @click="goTo('/inventory')">
          Inventory Management
        </li>
        <li v-if="user.role === 'SELLER'" @click="goTo('/products?seller=true')">
          My Products
        </li>
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
  import { getCurrentUserInfo } from '@/service/user';
  import { permissionService } from '@/service/permission';
  import { showMessage } from '@/utils/message'
  
  const user = ref({});
  const loading = ref(true);
  const error = ref(null);

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await getCurrentUserInfo(token);
      if (response.success) {
        user.value = response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
      error.value = error.message;
      showMessage?.('Failed to load user info: ' + error.message, 'error')
    } finally {
      loading.value = false;
    }
  };

  const checkPermission = async (path) => {
    try {
      return await permissionService.checkPermission(path, 'GET');
    } catch {
      showMessage?.('Permission check failed: ' + error.message, 'error')
      return false;
    }
  };
  
  const goTo = async (route) => {
    if (await checkPermission(route)) {
      router.push(route);
    } else {
      showMessage?.('Access denied', 'error')
    }
  };

  onMounted(() => {
    loadUserInfo();
  });
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