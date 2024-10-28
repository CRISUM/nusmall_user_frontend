// src/views/OrderList.vue

<script setup>
import { ref } from 'vue';
import OrderListComponent from '@/components/order/OrderListComponent.vue';
import { showMessage } from '@/utils/message';

const orderListRef = ref(null);

const handleError = (error) => {
  showMessage(error, 'error');
};
</script>

<template>
  <div class="order-list-page">
    <h1>My Orders</h1>
    
    <!-- 使用组件 -->
    <OrderListComponent
      ref="orderListRef"
      @error="handleError"
    />
  </div>
</template>

<style scoped>
.order-list-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}
</style>