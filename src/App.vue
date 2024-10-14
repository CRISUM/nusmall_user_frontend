<template>
  <div id="app">
    <Navbar />
    <router-view></router-view>
    <ErrorMessage ref="errorMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue';
import Navbar from '@/components/Navbar.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';

const errorMessage = ref(null);

onMounted(() => {
  if (errorMessage.value) {
    provide('showMessage', errorMessage.value.showMessage);
  }
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