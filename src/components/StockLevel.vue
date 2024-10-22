// src/components/StockLevel.vue

<template>
  <div class="stock-level" :class="stockLevelClass">
    <span class="stock-count">{{ stockText }}</span>
    <div v-if="showAlert" class="stock-alert">
      {{ alertMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const props = defineProps({
  productId: {
    type: Number,
    required: true
  },
  showCount: {
    type: Boolean,
    default: true
  },
  threshold: {
    type: Number,
    default: 10
  }
});

const store = useStore();

const stock = computed(() => 
  store.getters['inventory/getProductStock'](props.productId)
);

const stockLevelClass = computed(() => {
  if (stock.value <= 0) return 'out-of-stock';
  if (stock.value <= props.threshold) return 'low-stock';
  return 'in-stock';
});

const stockText = computed(() => {
  if (!props.showCount) {
    if (stock.value <= 0) return 'Out of Stock';
    if (stock.value <= props.threshold) return 'Low Stock';
    return 'In Stock';
  }
  return `${stock.value} in stock`;
});

const showAlert = computed(() => 
  stock.value <= props.threshold && stock.value > 0
);

const alertMessage = computed(() => 
  `Only ${stock.value} items left!`
);
</script>

<style scoped>
.stock-level {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.in-stock {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.low-stock {
  background-color: #fff3e0;
  color: #e65100;
}

.out-of-stock {
  background-color: #ffebee;
  color: #c62828;
}

.stock-alert {
  margin-left: 8px;
  font-size: 0.8em;
  color: #e65100;
}
</style>