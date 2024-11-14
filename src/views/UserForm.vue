<template>
  <div class="user-form">
    <h1>{{ isEditing ? 'Edit User' : 'Create User' }}</h1>
    <form @submit.prevent="onSubmit">
      <!-- 用户基本信息部分 -->
      <div class="form-section">
        <h2>Basic Information</h2>
        <div class="form-group">
          <label>Username</label>
          <input 
            v-model="formData.user.username" 
            type="text" 
            placeholder="Username"
            required
          >
        </div>
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="formData.user.email" 
            type="email" 
            placeholder="Email"
            required
          >
        </div>
        <div class="form-group">
          <label>Password</label>
          <input 
            v-model="formData.user.password" 
            type="password" 
            placeholder="Password"
            :required="!isEditing"
          >
          <small v-if="isEditing">Leave blank to keep current password</small>
        </div>
        <div class="form-group">
          <label>Role</label>
          <select 
            v-model="formData.user.role"
            required
          >
            <option value="">Select role</option>
            <option v-for="role in availableRoles" 
                    :key="role.value" 
                    :value="role.value">
              {{ role.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 地址信息部分 -->
      <div class="form-section">
        <h2>Address Information</h2>
        <div class="form-group">
          <label>Street</label>
          <input 
            v-model="formData.address.street" 
            type="text" 
            placeholder="Street (N.A. if not available)"
          >
        </div>
        <div class="form-group">
          <label>City</label>
          <input 
            v-model="formData.address.city" 
            type="text" 
            placeholder="City (N.A. if not available)"
          >
        </div>
        <div class="form-group">
          <label>State</label>
          <input 
            v-model="formData.address.state" 
            type="text" 
            placeholder="State (N.A. if not available)"
          >
        </div>
      </div>

      <!-- 表单操作按钮 -->
      <div class="form-actions">
        <button type="button" class="secondary-btn" @click="router.push('/api/users')">
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

const availableRoles = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'SELLER', label: 'Seller' },
  { value: 'ADMIN', label: 'Admin' }
];

// 设置默认值
const defaultFormData = {
  user: {
    userId: 0,
    username: '',
    email: '',
    password: '',
    role: '',
    createDatetime: '',
    updateDatetime: '',
    createUser: '',
    updateUser: ''
  },
  address: {
    addressId: 0,
    street: 'N.A.',
    city: 'N.A.',
    state: 'N.A.',
    createDatetime: '',
    updateDatetime: '',
    createUser: '',
    updateUser: ''
  }
};

const roleOptions = [
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'SELLER', label: 'Seller' },
  { value: 'ADMIN', label: 'Admin' }
];

// 使用默认值初始化表单数据
const formData = ref({...defaultFormData});

// Load user data if editing
const loadUserData = async () => {
  if (!isEditing.value) {
    // 新建用户时设置默认role为CUSTOMER
    formData.value.user.role = 'CUSTOMER';
    return;
  }

  try {
    const userId = parseInt(route.params.id);
    const userData = await getUserById(userId);
    console.log('Loaded user data:', userData);

    if (userData && userData.data) {
      console.log('Loaded user data:', userData.data);  

      formData.value = {
        user: {
          ...defaultFormData.user,
          ...userData.data,
          role: userData.data.role || 'CUSTOMER',  // 确保role存在
          password: ''
        },
        address: {
          ...defaultFormData.address,
          ...(userData.data.addresses?.[0] || {}),
          // 保留已存在的地址值
          street: userData.data.addresses?.[0]?.street || 'N.A.',
          city: userData.data.addresses?.[0]?.city || 'N.A.',
          state: userData.data.addresses?.[0]?.state || 'N.A.'
        }
      };
      console.log('Form data after loading:', formData.value);
    }
  } catch (error) {
    showMessage(`Failed to load user: ${error.message}`, 'error');
    router.push('/api/users');
  }
};

const goBack = () => {
  router.push('/api/users')
}

const onSubmit = async () => {
  try {

    if (!formData.value.user.role) {
      throw new Error('User role is required');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authorization token found');
    }

    const currentTime = new Date().toISOString();
    const currentUser = JSON.parse(localStorage.getItem('user'))?.username || 'system';

    // 准备用户数据
    const userData = {
      username: formData.value.user.username,
      email: formData.value.user.email,
      password: formData.value.user.password,
      role: formData.value.user.role,
      createDatetime: currentTime,
      updateDatetime: currentTime,
      createUser: currentUser,
      updateUser: currentUser
    };

    // 准备地址数据，确保使用默认值
    const addressData = {
      ...defaultFormData.address, // 先应用默认值
      ...formData.value.address, // 再覆盖用户输入的值
      street: formData.value.address.street || 'N.A.',
      city: formData.value.address.city || 'N.A.',
      state: formData.value.address.state || 'N.A.',
      createDatetime: currentTime,
      updateDatetime: currentTime,
      createUser: currentUser,
      updateUser: currentUser
    };

    if (isEditing.value) {
      await updateUser(userData);
      showMessage('User updated successfully', 'success');
    } else {
      const response = await createUser(userData);
      if (response.success && response.data) {
        // 创建关联的地址
        addressData.userId = response.data.userId;
        try {
          await createAddress(addressData);
        } catch (addressError) {
          console.error('Failed to create address:', addressError);
          // 不影响用户创建的成功提示
        }
      }
      showMessage('User created successfully', 'success');
    }
    router.push('/api/users');
  } catch (error) {
    showMessage(error.message || 'An error occurred', 'error');
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


.role-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  background-color: white;
}

.role-select:focus {
  outline: none;
  border-color: #1baeae;
}

.role-select option {
  padding: 8px;
}

.form-group small {
  color: #666;
  font-size: 0.8em;
  margin-top: 4px;
  display: block;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>