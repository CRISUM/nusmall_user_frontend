<template>
  <div id="app">
    <!-- 使用 v-show 根据路由来控制 Navbar 的显示 -->
    <Navbar v-show="showNavbar" />
    <router-view></router-view>
    <ErrorMessage ref="errorMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted, provide, computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '@/components/NavBar.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import { onErrorCaptured } from 'vue';

const errorMessage = ref(null);
const route = useRoute();

const showNavbar = computed(() => {
  const hideNavbarRoutes = ['/api/login'];
  return !hideNavbarRoutes.includes(route.path);
});

onMounted(() => {
  if (errorMessage.value) {
    provide('showMessage', errorMessage.value.showMessage);
  }
});

onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err, info);
  return false; // 阻止错误继续向上传播
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