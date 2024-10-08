<template>
  <va-card class="login-card">
    <va-card-title>Login</va-card-title>
    <va-card-content>
      <va-form @submit.prevent="handleLogin">
        <va-input
          v-model="username"
          label="Username"
          class="mb-3"
        />
        <va-input
          v-model="password"
          type="password"
          label="Password"
          class="mb-3"
        />
        <va-button type="submit">Login</va-button>
      </va-form>
    </va-card-content>
  </va-card>
    <div class="mt-3">
    Don't have an account? <router-link to="/register">Register here</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    await userStore.login(username.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed', error)
    // Handle error (e.g., show error message)
  }
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 0 auto;
}
</style>