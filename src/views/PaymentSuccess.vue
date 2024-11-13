// src/views/PaymentSuccess.vue
<template>
  <div class="payment-success">
    <div class="success-content">
      <h1>Payment Successful!</h1>
      <p>Your order has been processed successfully.</p>
      <div class="action-buttons">
        <router-link to="/api/orders" class="primary-btn">
          View Orders
        </router-link>
        <router-link to="/api/products" class="secondary-btn">
          Continue Shopping
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showMessage } from '@/utils/message';

const router = useRouter();

onMounted(() => {
  showMessage('Payment completed successfully!', 'success');
});
</script>

<style scoped>
.payment-success {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.success-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h1 {
  color: #52c41a;
  margin-bottom: 20px;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.primary-btn, .secondary-btn {
  padding: 10px 24px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.primary-btn {
  background: #1baeae;
  color: white;
}

.secondary-btn {
  background: white;
  border: 1px solid #1baeae;
  color: #1baeae;
}

.primary-btn:hover {
  background: #158f8f;
}

.secondary-btn:hover {
  background: #f0f9f9;
}
</style>