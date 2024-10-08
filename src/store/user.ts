import { defineStore } from 'pinia'
import { api } from '@/services/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await api.post('/login', { username, password })
        this.currentUser = response.data.user
        this.isAuthenticated = true
      } catch (error) {
        console.error('Login failed', error)
        throw error
      }
    },
    async register(userData: object) {
      try {
        const response = await api.post('/register', userData)
        this.currentUser = response.data.user
        this.isAuthenticated = true
      } catch (error) {
        console.error('Registration failed', error)
        throw error
      }
    },
    async logout() {
      try {
        await api.post('/logout')
        this.currentUser = null
        this.isAuthenticated = false
      } catch (error) {
        console.error('Logout failed', error)
        throw error
      }
    },
    async fetchUserProfile() {
      try {
        const response = await api.get('/user/profile')
        this.currentUser = response.data
      } catch (error) {
        console.error('Failed to fetch user profile', error)
        throw error
      }
    },
  },
})