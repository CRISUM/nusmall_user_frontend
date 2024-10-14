<template>
    <div class="home">
      <h1>Welcome to Our Online Store</h1>
      <p>Here you can find the latest products and great deals!</p>
      <div v-if="isAdmin" class="admin-section">
        <h2>Admin Quick Links</h2>
        <ul>
          <li><router-link to="/api/users">Manage Users</router-link></li>
          <li><router-link to="/api/products">Manage Products</router-link></li>
        </ul>
      </div>
      <div class="featured-products">
        <h2>Featured Products</h2>
        <!-- Add a list or grid of featured products here -->
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  
  const isAdmin = ref(false);
  
  onMounted(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    isAdmin.value = user && user.role === 'ADMIN';
  });
  </script>
  
  <style scoped>
  .home {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1, h2 {
    color: #333;
  }
  
  .admin-section {
    background-color: #f0f0f0;
    padding: 15px;
    margin-top: 20px;
    border-radius: 5px;
  }
  
  .admin-section ul {
    list-style-type: none;
    padding: 0;
  }
  
  .admin-section li {
    margin-bottom: 10px;
  }
  
  .featured-products {
    margin-top: 30px;
  }
  </style>