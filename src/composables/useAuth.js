// src/composables/useAuth.js
import { computed } from 'vue'
import { UserRoles } from '@/constants/authTypes'

export const useAuth = () => {
  const user = computed(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })

  const userRole = computed(() => user.value?.role || null)

  const isAdmin = computed(() => userRole.value === UserRoles.ADMIN)
  const isSeller = computed(() => userRole.value === UserRoles.SELLER)
  const isCustomer = computed(() => userRole.value === UserRoles.CUSTOMER)

  const hasPermission = (requiredRoles) => {
    if (!userRole.value) return false
    if (isAdmin.value) return true
    return requiredRoles.includes(userRole.value)
  }

  return {
    user,
    userRole,
    isAdmin,
    isSeller,
    isCustomer,
    hasPermission
  }
}