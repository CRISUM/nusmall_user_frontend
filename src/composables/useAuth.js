// src/composables/useAuth.js
import { computed } from 'vue'
import { UserRoles } from '@/constants/authTypes'
import { useStore } from 'vuex'

export const useAuth = () => {
  const store = useStore()
  
  const user = computed(() => {
    // 优先从 store 获取，如果没有则从 localStorage 获取
    return store.state.user.user || JSON.parse(localStorage.getItem('user'))
  })

  const userRole = computed(() => {
    const userData = user.value;
    return userData?.role || null;
  })

  const isAdmin = computed(() => userRole.value === UserRoles.ADMIN)
  const isSeller = computed(() => userRole.value === UserRoles.SELLER)
  const isCustomer = computed(() => userRole.value === UserRoles.CUSTOMER)


  const hasPermission = (requiredRoles) => {
    const role = userRole.value;
    if (!role) return false;
    if (role === UserRoles.ADMIN) return true;
    return requiredRoles.includes(role);
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