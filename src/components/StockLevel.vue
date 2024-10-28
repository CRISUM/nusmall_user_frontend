<!-- src/components/StockLevel.vue -->
<template>
  <div class="stock-level">
    <span 
      class="stock-status"
      :class="{
        'loading': loading,
        'error': error,
        'out-of-stock': !loading && !error && stockCount <= 0,
        'in-stock': !loading && !error && stockCount > 0
      }"
    >
      {{ displayText }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { getInventory } from '@/service/inventory';

const props = defineProps({
  productId: {
    type: Number,
    required: true,
    validator: value => value > 0  // 确保 productId 大于 0
  },
  showCount: {
    type: Boolean,
    default: false
  },
  threshold: {
    type: Number,
    default: 10
  }
});

const stockCount = ref(0);
const loading = ref(false);
const error = ref(null);
const { userRole } = useAuth();
const shouldShowStock = computed(() => {
  return ['SELLER', 'ADMIN'].includes(userRole.value);
});

const displayText = computed(() => {
  if (loading.value) return 'Loading...';
  if (error.value) return 'Failed to get stock';
  if (stockCount.value <= 0) return 'Out of Stock';
  if (stockCount.value <= props.threshold) return 'Low Stock';
  return showCount ? `In Stock (${stockCount.value})` : 'In Stock';
});

// 只在组件挂载时获取一次库存
const fetchStock = async () => {
  if (!shouldShowStock.value) return;
  if (!props.productId) return;
  
  try {
    loading.value = true;
    error.value = null;
    const stock = await getInventory(null, props.productId);
    stockCount.value = stock || 0;
  } catch (err) {
    console.error('Failed to get stock:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// 只在组件挂载时获取一次库存
onMounted(() => {
  if (props.productId > 0) {
    fetchStock();
  }
});
</script>

<style scoped>
.stock-level {
  margin: 4px 0;
  font-size: 0.9em;
}

.stock-status {
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.stock-status.loading {
  background: #f5f5f5;
  color: #666;
}

.stock-status.error {
  background: #fff1f0;
  color: #ff4d4f;
}

.stock-status.out-of-stock {
  background: #ffebee;
  color: #c62828;
}

.stock-status.in-stock {
  background: #e8f5e9;
  color: #2e7d32;
}
</style>