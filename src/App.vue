<template>
  <div id="app">
    <Navbar v-show="showNavbar" />
    <router-view></router-view>
    <ErrorMessage ref="errorMessage" />
  </div>
</template>

<script setup>
import { ref, provide, computed, watch, onMounted, onErrorCaptured } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import Navbar from '@/components/NavBar.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';

const errorMessage = ref(null);
const route = useRoute();
const router = useRouter();
const store = useStore();

// Computed properties
const showNavbar = computed(() => {
  const hideNavbarRoutes = ['/api/login'];
  return !hideNavbarRoutes.includes(route.path);
});

// Watch route changes
watch(
  () => router.currentRoute.value, 
  (to, from) => {
    console.log('Route changed:', {
      from: from?.path,
      to: to.path,
      meta: to.meta,
      requiresAuth: to.meta.requiresAuth
    });

    // 每次路由变化时检查权限
    if (to.meta.requiresAuth) {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      console.log('Auth check on route change:', {
        path: to.path,
        hasToken: !!token,
        userRole: user?.role,
        allowedRoles: to.meta.allowedRoles
      });
    }
  }, 
  { immediate: true }
);

// Lifecycle hooks
onMounted(async () => {
  // 检查用户状态
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  console.log('App mounted:', {
    hasUser: !!user,
    userRole: user?.role,
    hasToken: !!token,
    currentRoute: router.currentRoute.value.path
  });

  // 初始化 store 和错误提示
  try {
    await store.dispatch('user/initializeUser'); // 确保您的 store 中有这个 action
    if (errorMessage.value) {
      provide('showMessage', errorMessage.value.showMessage);
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
});

// Error handling
onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', {
    error: err,
    info,
    instance: instance?.$options?.name || 'unknown'
  });
  return false;
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>