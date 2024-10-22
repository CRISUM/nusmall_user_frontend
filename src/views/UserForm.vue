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

const router = useRouter()
const route = useRoute()
const showMessage = inject('showMessage')

const user = ref({
  username: '',
  email: '',
  password: '',
  role: 'CUSTOMER'
})

const isEditing = computed(() => route.name === 'EditUser')

// Load user data if editing
const loadUserData = async () => {
  if (!isEditing.value) return
  
  try {
    const userId = parseInt(route.params.id)
    const userData = await getUserById(userId)
    // remove password field from user object
    const { password, ...userWithoutPassword } = userData
    user.value = { ...userWithoutPassword, password: '' }
  } catch (error) {
    showMessage(`Failed to load user: ${error.message}`, 'error')
    router.push('/api/users')
  }
}

const goBack = () => {
  router.push('/api/users')
}

const onSubmit = async () => {
  try {
    // remove password field if not editing
    const userData = { ...user.value }
    if (isEditing.value && !userData.password) {
      delete userData.password
    }

    if (isEditing.value) {
      await updateUser(parseInt(route.params.id), userData)
      showMessage('User updated successfully', 'success')
    } else {
      await createUser(userData)
      showMessage('User created successfully', 'success')
    }
    router.push('/api/users')
  } catch (error) {
    showMessage(error.message || 'An error occurred', 'error')
  }
}

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
</style>