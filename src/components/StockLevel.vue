// src/components/StockLevel.vue
<script setup>
import { ref, computed, onMounted, watch } from 'vue';  // 添加 watch 导入
import { useStore } from 'vuex';
import { getInventory } from '@/service/inventory';

const store = useStore();
const props = defineProps({
  productId: {
    type: Number,
    required: true,
    default: 0
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

const stockStatus = computed(() => {
  if (loading.value) return 'Loading...';
  if (error.value) return 'Error';
  
  if (stockCount.value <= 0) return 'Out of Stock';
  if (stockCount.value <= props.threshold) return 'Low Stock';
  return 'In Stock';
});

const fetchStock = async () => {
  // Skip fetching if productId is invalid
  if (!props.productId) {
    stockCount.value = 0;
    return;
  }
  
  try {
    loading.value = true;
    error.value = null;
    const stock = await getInventory(null, props.productId);
    stockCount.value = stock;
  } catch (err) {
    console.error('Failed to get stock:', err);
    error.value = err.message;
    stockCount.value = 0;
  } finally {
    loading.value = false;
  }
};

// Watch for changes in productId
watch(() => props.productId, (newId, oldId) => {
  if (newId !== oldId && newId) {
    fetchStock();
  }
}, { immediate: true }); // Add immediate:true to fetch on mount

</script>

<template>
  <div class="stock-level" :class="{ 'is-loading': loading }">
    <span 
      :class="[
        'stock-status',
        {
          'out-of-stock': stockCount <= 0,
          'low-stock': stockCount > 0 && stockCount <= threshold,
          'in-stock': stockCount > threshold
        }
      ]"
    >
      {{ stockStatus }}
      <template v-if="showCount && !loading && !error">
        ({{ stockCount }} available)
      </template>
    </span>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.stock-level {
  margin: 8px 0;
}

.stock-level.is-loading {
  opacity: 0.7;
}

.stock-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.stock-status.out-of-stock {
  background: #ffebee;
  color: #c62828;
}

.stock-status.low-stock {
  background: #fff3e0;
  color: #ef6c00;
}

.stock-status.in-stock {
  background: #e8f5e9;
  color: #2e7d32;
}

.error-message {
  color: #c62828;
  font-size: 0.8em;
  margin-top: 4px;
}
</style>