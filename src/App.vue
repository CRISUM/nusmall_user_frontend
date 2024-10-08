<template>
  <div id="app">
    <va-layout>
      <va-navbar class="mb-4">
        <template #left>
          <va-navbar-item>NUSMall User Management</va-navbar-item>
        </template>
        <template #center>
          <va-navbar-item>
            <router-link to="/" class="nav-link">Home</router-link>
          </va-navbar-item>
          <va-navbar-item v-if="isAuthenticated">
            <router-link to="/profile" class="nav-link">Profile</router-link>
          </va-navbar-item>
          <va-navbar-item v-if="isAdmin">
            <router-link to="/users" class="nav-link">User List</router-link>
          </va-navbar-item>
        </template>
        <template #right>
          <va-navbar-item v-if="!isAuthenticated">
            <router-link to="/login" class="nav-link">Login</router-link>
          </va-navbar-item>
          <va-navbar-item v-if="!isAuthenticated">
            <router-link to="/register" class="nav-link">Register</router-link>
          </va-navbar-item>
          <va-navbar-item v-if="isAuthenticated">
            <va-button @click="handleLogout" color="danger">Logout</va-button>
          </va-navbar-item>
        </template>
      </va-navbar>

      <va-content>
        <router-view></router-view>
      </va-content>

      <va-footer>
        <div class="text-center">
          © {{ new Date().getFullYear() }} NUSMall User Management. All rights reserved.
        </div>
      </va-footer>
    </va-layout>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const isAuthenticated = computed(() => userStore.isAuthenticated)
const isAdmin = computed(() => userStore.currentUser?.role === 'admin')

const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed', error)
    // Handle error (e.g., show error message)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.nav-link {
  color: inherit;
  text-decoration: none;
}

.nav-link:hover {
  text-decoration: underline;
}
</style>