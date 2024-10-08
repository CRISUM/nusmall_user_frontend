<template>
  <va-card class="register-card">
    <va-card-title>Register</va-card-title>
    <va-card-content>
      <va-form @submit.prevent="handleRegister">
        <va-input
          v-model="username"
          label="Username"
          class="mb-3"
        />
        <va-input
          v-model="email"
          label="Email"
          type="email"
          class="mb-3"
        />
        <va-input
          v-model="password"
          type="password"
          label="Password"
          class="mb-3"
        />
        <va-input
          v-model="confirmPassword"
          type="password"
          label="Confirm Password"
          class="mb-3"
        />
        <va-button type="submit">Register</va-button>
      </va-form>
    </va-card-content>
  </va-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    // Show error message
    return
  }

  try {
    await userStore.register({
      username: username.value,
      email: email.value,
      password: password.value
    })
    router.push('/dashboard')
  } catch (error) {
    console.error('Registration failed', error)
    // Handle error (e.g., show error message)
  }
}
</script>

<style scoped>
.register-card {
  max-width: 400px;
  margin: 0 auto;
}
</style>