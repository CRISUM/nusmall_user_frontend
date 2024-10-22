// src/views/Forbidden.vue
<template>
  <div class="forbidden">
    <div class="forbidden-content">
      <h1>403</h1>
      <h2>Access Denied</h2>
      <p>{{ message }}</p>
      <div class="actions">
        <button @click="goBack" class="back-btn">Go Back</button>
        <button @click="goHome" class="home-btn">Go to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const message = ref('');

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  message.value = user 
    ? `Sorry, your role (${user.role}) does not have permission to access this page.`
    : 'Sorry, you do not have permission to access this page.';
});

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/api/home');
};
</script>

<style scoped>
.forbidden {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.forbidden-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

h1 {
  font-size: 4rem;
  color: #ff4444;
  margin: 0;
}

h2 {
  color: #333;
  margin: 1rem 0;
}

p {
  color: #666;
  margin: 1rem 0 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  border: none;
  transition: all 0.3s ease;
}

.back-btn {
  background-color: #666;
  color: white;
}

.home-btn {
  background-color: #1baeae;
  color: white;
}

.back-btn:hover {
  background-color: #555;
}

.home-btn:hover {
  background-color: #158f8f;
}
</style>