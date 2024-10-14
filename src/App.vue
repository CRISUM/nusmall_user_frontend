<template>
  <div id="app">
    <Navbar v-if="isLoggedIn" />
    <router-view></router-view>
    <ErrorMessage ref="errorMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';

const isLoggedIn = ref(false);
const router = useRouter();
const errorMessage = ref(null);

const checkAuth = () => {
  isLoggedIn.value = !!localStorage.getItem('token');
};

onMounted(() => {
  checkAuth();
  if (errorMessage.value) {
    provide('showMessage', errorMessage.value.showMessage);
  }
});

watch(() => router.currentRoute.value, checkAuth);
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>