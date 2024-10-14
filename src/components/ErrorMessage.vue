<!-- ErrorMessage.vue -->
<template>
  <transition name="fade">
    <div v-if="message" class="error-message" :class="{ 'success': type === 'success' }">
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('');
const type = ref('error');

const showMessage = (msg, msgType = 'error', duration = 3000) => {
  message.value = msg;
  type.value = msgType;
  setTimeout(() => {
    message.value = '';
  }, duration);
};

defineExpose({ showMessage });
</script>

<style scoped>
.error-message {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ff4d4f;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 1000;
}

.error-message.success {
  background-color: #52c41a;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>