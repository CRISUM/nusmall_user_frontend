<template>
  <div class="user-form">
    <h1>{{ isEditing ? 'Edit User' : 'Create User' }}</h1>
    <form @submit.prevent="onSubmit">
      <input v-model="user.username" type="text" placeholder="Username" required>
      <input v-model="user.email" type="email" placeholder="Email" required>
      <input v-model="user.password" type="password" placeholder="Password" :required="!isEditing">
      <select v-model="user.role" required>
        <option value="CUSTOMER">Customer</option>
        <option value="SELLER">Seller</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button type="submit">{{ isEditing ? 'Update' : 'Create' }}</button>
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

const isEditing = computed(() => route.params.id !== 'new')

onMounted(async () => {
  if (isEditing.value) {
    try {
      user.value = await getUserById(route.params.id)
      user.value.password = '' // Clear password for security
    } catch (error) {
      showMessage('Failed to fetch user data', 'error')
      router.push('/api/users')
    }
  }
})

const onSubmit = async () => {
  try {
    if (isEditing.value) {
      await updateUser(route.params.id, user.value)
      showMessage('User updated successfully', 'success')
    } else {
      await createUser(user.value)
      showMessage('User created successfully', 'success')
    }
    router.push('/api/users')
  } catch (error) {
    showMessage(error.message || 'An error occurred', 'error')
  }
}
</script>

<style scoped>
.user-form {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}
h1 {
  margin-bottom: 20px;
}
form {
  display: flex;
  flex-direction: column;
}
input, select {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  background-color: #4CAF50;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}
button:hover {
  opacity: 0.8;
}
</style>