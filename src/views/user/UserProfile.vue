<template>
  <va-card class="profile-card">
    <va-card-title>User Profile</va-card-title>
    <va-card-content>
      <va-form @submit.prevent="handleUpdateProfile">
        <va-input
          v-model="profile.username"
          label="Username"
          class="mb-3"
          :readonly="true"
        />
        <va-input
          v-model="profile.email"
          label="Email"
          type="email"
          class="mb-3"
        />
        <va-input
          v-model="profile.fullName"
          label="Full Name"
          class="mb-3"
        />
        <va-select
          v-model="profile.country"
          label="Country"
          :options="countries"
          class="mb-3"
        />
        <va-button type="submit">Update Profile</va-button>
      </va-form>
    </va-card-content>
  </va-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const profile = ref({
  username: '',
  email: '',
  fullName: '',
  country: ''
})

const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'China']

onMounted(async () => {
  try {
    const userProfile = await userStore.fetchUserProfile()
    profile.value = { ...userProfile }
  } catch (error) {
    console.error('Failed to fetch user profile', error)
    // Handle error (e.g., show error message)
  }
})

const handleUpdateProfile = async () => {
  try {
    await userStore.updateProfile(profile.value)
    // Show success message
  } catch (error) {
    console.error('Failed to update profile', error)
    // Handle error (e.g., show error message)
  }
}
</script>

<style scoped>
.profile-card {
  max-width: 600px;
  margin: 0 auto;
}
</style>