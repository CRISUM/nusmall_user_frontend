<template>
  <div class="user-form">
    <h1>{{ isEditing ? 'Edit User' : 'Create User' }}</h1>
    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label>Username</label>
        <input v-model="user.username" type="text" placeholder="Username" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="user.email" type="email" placeholder="Email" required>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="user.password" type="password" 
               placeholder="Password" 
               :required="!isEditing">
      </div>
      <div class="form-group">
        <label>Role</label>
        <select v-model="user.role" required>
          <option value="CUSTOMER">Customer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div class="form-section">
        <h2>Address Information</h2>
        <div class="form-group">
          <label>Street</label>
          <input v-model="formData.address.street" type="text" placeholder="Street" required>
        </div>
        <div class="form-group">
          <label>City</label>
          <input v-model="formData.address.city" type="text" placeholder="City" required>
        </div>
        <div class="form-group">
          <label>State</label>
          <input v-model="formData.address.state" type="text" placeholder="State" required>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="secondary-btn" @click="goBack">
          Cancel
        </button>
        <button type="submit" class="primary-btn">
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createUser, getUserById, updateUser } from '@/service/user'
import { showMessage } from '@/utils/message'  // 导入message
import { createAddress } from '@/service/address';

const router = useRouter()
const route = useRoute()

const user = ref({
  username: '',
  email: '',
  password: '',
  role: 'CUSTOMER'
})

const isEditing = computed(() => route.name === 'EditUser')

const formData = ref({
  user: {
    userId: 0,
    username: '',
    email: '',
    password: '',
    createDatetime: '',
    updateDatetime: '',
    createUser: '',
    updateUser: ''
  },
  address: {
    addressId: 0,
    street: '',
    city: '',
    state: '',
    createDatetime: '',
    updateDatetime: '',
    createUser: '',
    updateUser: ''
  }
})

// Load user data if editing
const loadUserData = async () => {
  if (!isEditing.value) return
  
  try {
    const userId = parseInt(route.params.id)
    const userData = await getUserById(userId)
    // remove password field from user object
    if (userData && userData.data) {
      // 只填充允许编辑的字段
      formData.value = {
        username: userData.data.username,
        email: userData.data.email,
        password: ''  // 不回填密码
      }
      if (userData.data.addresses?.length > 0) {
        formData.value.address = userData.data.addresses[0]
      }
    }
  } catch (error) {
    showMessage?.(`Failed to load user: ${error.message}`, 'error')
    router.push('/api/users')
  }
}

const goBack = () => {
  router.push('/api/users')
}

const onSubmit = async () => {
  try {
    const currentTime = new Date().toISOString();
    
    // 直接构造符合后端要求的user对象
    const userData = {
      userId: formData.value.user.userId,
      username: formData.value.user.username,
      email: formData.value.user.email,
      password: formData.value.user.password,
      createDatetime: currentTime,
      updateDatetime: currentTime,
      createUser: formData.value.user.username || 'system',
      updateUser: formData.value.user.username || 'system'
    };

    // 地址信息将通过单独的API处理
    const addressData = {
      street: formData.value.address.street,
      city: formData.value.address.city,  
      state: formData.value.address.state,
      createDatetime: currentTime,
      updateDatetime: currentTime,
      createUser: formData.value.user.username || 'system',
      updateUser: formData.value.user.username || 'system'
    };

    if (isEditing.value) {
      await updateUser(route.params.id, userData);
      showMessage?.('User updated successfully', 'success');
    } else {
      const response = await createUser(userData);
      if (response.success && response.data) {
        // 如果用户创建成功，创建关联的地址
        addressData.userId = response.data.userId;
        try {
          await createAddress(addressData);
        } catch (addressError) {
          console.error('Failed to create address:', addressError);
          // 但不影响用户创建的成功提示
        }
      }
      showMessage?.('User created successfully', 'success');
    }
    router.push('/api/users');
  } catch (error) {
    showMessage?.(error.message || 'An error occurred', 'error');
  }
};

onMounted(loadUserData)
</script>

<style scoped>
.user-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.primary-btn {
  background-color: #1baeae;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.secondary-btn {
  background-color: #fff;
  color: #666;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.primary-btn:hover {
  background-color: #158f8f;
}

.secondary-btn:hover {
  background-color: #f5f5f5;
}

.form-section {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.form-section h2 {
  margin: 0 0 16px;
  font-size: 1.2em;
  color: #333;
}
</style>