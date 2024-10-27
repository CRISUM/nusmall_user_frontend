<!-- src/views/OrderList.vue -->
<template>
    <div class="order-list">
      <h1>My Orders</h1>
  
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>
  
      <!-- Error State -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="loadOrders" class="retry-btn">Retry</button>
      </div>
  
      <!-- Empty State -->
      <div v-if="!loading && !error && orders.length === 0" class="empty-state">
        <p>No orders found</p>
        <router-link to="/api/products" class="shop-btn">
          Start Shopping
        </router-link>
      </div>
  
      <!-- Orders List -->
      <div v-if="!loading && !error && orders.length > 0" class="orders-container">
        <div v-for="order in orders" :key="order.orderId" class="order-card">
          <div class="order-header">
            <span class="order-id">Order #{{ order.orderId }}</span>
            <span :class="['order-status', order.status.toLowerCase()]">
              {{ order.status }}
            </span>
          </div>
  
          <div class="order-date">
            Ordered on {{ formatDate(order.orderDate) }}
          </div>
  
          <div class="order-items">
            <div v-for="item in order.orderItems" 
                 :key="item.orderItemId" 
                 class="order-item">
              <div class="item-details">
                <span class="item-name">{{ item.productName }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
              <span class="item-price">¥{{ formatPrice(item.price) }}</span>
            </div>
          </div>
  
          <div class="order-footer">
            <div class="total-price">
              Total: ¥{{ formatPrice(order.totalPrice) }}
            </div>
            <div class="order-actions">
              <button 
                v-if="order.status === 'PENDING'" 
                @click="handlePayment(order.orderId)"
                class="pay-btn"
              >
                Pay Now
              </button>
              <button 
                @click="viewOrderDetails(order.orderId)"
                class="details-btn"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { showMessage } from '@/utils/message'
  import { getOrderByUserId, paySuccess } from '@/service/order'
  
  const router = useRouter()
  const orders = ref([])
  const loading = ref(true)
  const error = ref(null)
  
  // Format price to 2 decimal places
  const formatPrice = (price) => {
    return Number(price).toFixed(2)
  }
  
  // Format date to local string
  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }
  
  // Load orders
  const loadOrders = async () => {
    loading.value = true
    error.value = null
    
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user?.userId) {
        throw new Error('User not found')
      }
  
      const response = await getOrderByUserId(user.userId)
      if (Array.isArray(response)) {
        orders.value = response
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Failed to load orders:', err)
      error.value = err.message || 'Failed to load orders'
      showMessage(error.value, 'error')
    } finally {
      loading.value = false
    }
  }
  
  // Handle payment
  const handlePayment = async (orderId) => {
    try {
      await paySuccess(orderId)
      showMessage('Payment successful', 'success')
      loadOrders() // Reload orders to update status
    } catch (err) {
      console.error('Payment failed:', err)
      showMessage(err.message || 'Payment failed', 'error')
    }
  }
  
  // View order details
  const viewOrderDetails = (orderId) => {
    router.push(`/api/orders/${orderId}`)
  }
  
  // Initialize
  onMounted(() => {
    loadOrders()
  })
  </script>
  
  <style scoped>
  .order-list {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .loading-state {
    text-align: center;
    padding: 40px;
  }
  
  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #1baeae;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    color: #ff4d4f;
    text-align: center;
    padding: 20px;
  }
  
  .empty-state {
    text-align: center;
    padding: 40px;
  }
  
  .order-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    padding: 20px;
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .order-id {
    font-weight: bold;
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
  
  .order-date {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 15px;
  }
  
  .order-items {
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    padding: 15px 0;
  }
  
  .order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .item-details {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .item-quantity {
    color: #666;
  }
  
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
  }
  
  .total-price {
    font-weight: bold;
    font-size: 1.1em;
  }
  
  .order-actions {
    display: flex;
    gap: 10px;
  }
  
  .pay-btn {
    background: #1baeae;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .details-btn {
    background: white;
    border: 1px solid #1baeae;
    color: #1baeae;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .pay-btn:hover {
    background: #158f8f;
  }
  
  .details-btn:hover {
    background: #f0f9f9;
  }
  
  .retry-btn {
    background: #1baeae;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
  }
  
  .shop-btn {
    display: inline-block;
    background: #1baeae;
    color: white;
    text-decoration: none;
    padding: 10px 20px;
    border-radius: 4px;
    margin-top: 20px;
  }
  
  @media (max-width: 768px) {
    .order-footer {
      flex-direction: column;
      gap: 10px;
    }
  
    .order-actions {
      width: 100%;
    }
  
    .pay-btn, .details-btn {
      flex: 1;
      text-align: center;
    }
  }
  </style>