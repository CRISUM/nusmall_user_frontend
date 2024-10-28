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
        <!-- 修改点击事件，使用router-link替代click事件 -->
        <li v-if="user.role === 'ADMIN'">
          <router-link to="/api/users" class="nav-link">
            User Management
          </router-link>
        </li>
        
        <li v-if="['ADMIN', 'SELLER'].includes(user.role)">
          <router-link to="/api/inventory" class="nav-link">
            Inventory Management
          </router-link>
        </li>
        
        <li v-if="user.role === 'SELLER'">
          <router-link to="/api/products" class="nav-link">
            My Products
          </router-link>
        </li>
        
        <li>
          <router-link to="/api/orders" class="nav-link">
            My Orders
          </router-link>
        </li>
        
        <li>
          <router-link to="/api/user/settings" class="nav-link">
            Account Settings
          </router-link>
        </li>
        
        <li>
          <router-link to="/api/user/addresses" class="nav-link">
            Address Management
          </router-link>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { getUserById } from '@/service/user'
  import avatarImage from '@/assets/pic/useravatar.png'
  import { UserRoles } from '@/constants/authTypes' 
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
      const userInfo = JSON.parse(localStorage.getItem('user'));
      
      // 如果是管理员，直接返回true
      if (userInfo?.role === UserRoles.ADMIN) {
        return true;
      }
      
      return await permissionService.checkPermission(path, 'GET');
    } catch (error) {
      console.error('Permission check failed:', error);
      showMessage?.('Permission check failed: ' + error.message, 'error');
      return false;
    }
  };
  
  const goTo = async (route) => {
    try {
      if (await checkPermission(route)) {
        router.push(route);
      } else {
        showMessage?.('Access denied', 'error');
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      showMessage?.('Navigation failed', 'error');
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
  }

  .nav-link {
    display: block;
    padding: 10px 0;
    color: #333;
    text-decoration: none;
    transition: color 0.3s;
  }

  .nav-link:hover {
    color: #1baeae;
    background-color: #f8f9fa;
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