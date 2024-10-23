<!-- src/components/order/OrderDetails.vue -->
<template>
    <div class="order-details">
      <div v-if="loading" class="loading">Loading order details...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="order-content">
        <!-- Order Header -->
        <div class="order-header">
          <h2>Order #{{ order.orderId }}</h2>
          <span class="order-status" :class="order.status.toLowerCase()">
            {{ order.status }}
          </span>
        </div>
  
        <!-- Order Info -->
        <div class="order-info">
          <div class="info-row">
            <span>Order Date:</span>
            <span>{{ formatDate(order.orderDate) }}</span>
          </div>
          <div class="info-row">
            <span>Total Amount:</span>
            <span>¥{{ order.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
  
        <!-- Order Items -->
        <div class="order-items">
          <h3>Order Items</h3>
          <div v-for="item in order.orderItems" 
               :key="item.orderItemId" 
               class="order-item">
            <div class="item-info">
              <div class="item-name">{{ item.productName }}</div>
              <div class="item-price">
                ¥{{ item.price.toFixed(2) }} × {{ item.quantity }}
              </div>
            </div>
            <div class="item-total">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { getOrderByUserId } from '@/service/order';
  
  const route = useRoute();
  const order = ref(null);
  const loading = ref(true);
  const error = ref(null);
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  
  onMounted(async () => {
    try {
      const orderId = parseInt(route.params.orderId);
      const user = JSON.parse(localStorage.getItem('user'));
      const orders = await getOrderByUserId(user.id);
      order.value = orders.find(o => o.orderId === orderId);
      
      if (!order.value) {
        throw new Error('Order not found');
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  });
  </script>
  
  <style scoped>
  .order-details {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .order-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  .order-status.pending {
    background: #fff7e6;
    color: #d46b08;
  }
  
  .order-status.paid {
    background: #f6ffed;
    color: #52c41a;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .order-items {
    margin-top: 20px;
  }
  
  .order-item {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .item-total {
    font-weight: bold;
  }
  </style>