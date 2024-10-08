import { defineStore } from 'pinia'
import { api } from '@/services/api'

interface User {
  id: number;
  // 添加其他用户属性
}

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null,
    isAuthenticated: false,
    users: [],
  }),
  actions: {
    async login(username: string, password: string) {
      const response = await api.post('/login', { username, password })
      this.currentUser = response.data.user
      this.isAuthenticated = true
    },
    async register(userData: object) {
      const response = await api.post('/register', userData)
      this.currentUser = response.data.user
      this.isAuthenticated = true
    },
    async logout() {
      await api.post('/logout')
      this.currentUser = null
      this.isAuthenticated = false
    },
    async fetchUserProfile() {
      const response = await api.get('/user/profile')
      this.currentUser = response.data
      return response.data
    },
    async updateProfile(profileData: object) {
      const response = await api.put('/user/profile', profileData)
      this.currentUser = response.data
      return response.data
    },
    async fetchUsers() {
      const response = await api.get('/users')
      this.users = response.data
      return response.data
    },
    async deleteUser(userId: number) {
      await api.delete(`/users/${userId}`)
      this.users = this.users.filter(user => user.id !== userId)
    },
  },
})