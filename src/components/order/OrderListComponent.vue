// src/components/order/OrderListComponent.vue
// 将原components/OrderList.vue改名并移动到order子文件夹

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getOrderByUserId } from '@/service/order';

// Props definition
const props = defineProps({
  // 可以传入外部订单数据
  externalOrders: {
    type: Array,
    default: () => []
  },
  // 控制是否自动加载
  autoLoad: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['update:orders', 'error']);

const orders = ref([]);
const loading = ref(false);
const error = ref(null);

// 计算属性：使用外部数据或内部数据
const displayOrders = computed(() => {
  return props.externalOrders.length > 0 ? props.externalOrders : orders.value;
});

// Load orders function
const loadOrders = async () => {
  if (!props.autoLoad) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getOrderByUserId();
    if (response.success && Array.isArray(response.data)) {
      orders.value = response.data.map(order => ({
        ...order,
        orderDate: new Date(order.orderDate),
        status: order.status || 'PENDING'
      }));
      emit('update:orders', orders.value);
    }
  } catch (err) {
    error.value = err.message || 'Failed to load orders';
    emit('error', error.value);
  } finally {
    loading.value = false;
  }
};

// Mounted hook
onMounted(() => {
  if (props.autoLoad) {
    loadOrders();
  }
});

// Expose loadOrders method
defineExpose({
  loadOrders
});
</script>

<template>
  <div class="order-list-component">
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

    <!-- Orders List -->
    <div v-if="!loading && !error" class="orders-container">
      <div v-for="order in displayOrders" 
           :key="order.orderId" 
           class="order-card">
        <!-- 保持原有的订单卡片模板 -->
        <div class="order-header">
          <span class="order-id">Order #{{ order.orderId }}</span>
          <span :class="['order-status', order.status.toLowerCase()]">
            {{ order.status }}
          </span>
        </div>
        
        <!-- ... 其他订单信息显示 ... -->
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && !error && displayOrders.length === 0" 
         class="empty-state">
      <p>No orders found</p>
    </div>
  </div>
</template>

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