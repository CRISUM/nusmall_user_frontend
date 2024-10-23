// src/components/order/OrderList.vue
<template>
  <div class="order-list">
    <div v-if="loading" class="loading">
      Loading orders...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else>
      <div class="order-filters">
        <select v-model="statusFilter">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div class="orders">
        <div v-for="order in filteredOrders" 
             :key="order.orderId" 
             class="order-card">
          <div class="order-header">
            <span class="order-id">Order #{{ order.orderId }}</span>
            <span class="order-status" :class="order.status.toLowerCase()">
              {{ order.status }}
            </span>
          </div>
          
          <div class="order-items">
            <div v-for="item in order.orderItems" 
                 :key="item.orderItemId" 
                 class="order-item">
              <span class="item-name">{{ item.productId }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
              <span class="item-price">¥{{ item.price }}</span>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-total">
              Total: ¥{{ order.totalPrice }}
            </div>
            <div class="order-date">
              {{ new Date(order.orderDate).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getOrderByUserId } from '@/service/order';

const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const statusFilter = ref('');

const user = JSON.parse(localStorage.getItem('user'));

const filteredOrders = computed(() => {
  if (!statusFilter.value) return orders.value;
  return orders.value.filter(order => order.status === statusFilter.value);
});

const loadOrders = async () => {
  try {
    loading.value = true;
    error.value = null;
    orders.value = await getOrderByUserId(user.id);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.order-list {
  padding: 20px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-status {
  padding: 4px 8px;
  border-radius: 4px;
}

.order-status.pending {
  background: #fff7e6;
  color: #d46b08;
}

.order-status.paid {
  background: #f6ffed;
  color: #52c41a;
}

.order-items {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.order-total {
  font-weight: bold;
}

.order-filters {
  margin-bottom: 20px;
}

.order-filters select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>