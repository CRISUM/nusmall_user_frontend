// src/components/cart/CartToolbar.vue
<script setup>
import { computed } from 'vue';
import { CartOperation } from '@/constants/cartTypes';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  selectedItems: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select-all', 'batch-operation']);

const isAllSelected = computed(() => {
  return props.items.length > 0 && props.items.length === props.selectedItems.length;
});

const isIndeterminate = computed(() => {
  return props.selectedItems.length > 0 && props.selectedItems.length < props.items.length;
});

const handleSelectAll = (checked) => {
  emit('select-all', checked);
};

const handleBatchDelete = () => {
  if (props.selectedItems.length === 0) return;
  emit('batch-operation', CartOperation.REMOVE);
};

const checkBatchStock = async (items) => {
  try {
    const checks = await Promise.all(
      items.map(item => 
        checkStock(item.productId, item.quantity)
      )
    );
    
    return checks.every(result => result);
  } catch (error) {
    console.error('Batch stock check failed:', error);
    return false;
  }
};

const handleBatchSelection = async (selected) => {
  if (selected) {
    // 选中前先检查库存
    const stockAvailable = await checkBatchStock(props.items);
    if (!stockAvailable) {
      showMessage('Some items are out of stock', 'error');
      return;
    }
  }
  emit('select-all', selected);
};
</script>

<template>
  <div class="cart-toolbar">
    <div class="toolbar-left">
      <label class="select-all">
        <input 
          type="checkbox" 
          :checked="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="e => handleSelectAll(e.target.checked)"
          :disabled="loading || items.length === 0"
        >
        <span>Select All</span>
      </label>
    </div>

    <div class="toolbar-right">
      <button 
        class="batch-delete-btn"
        @click="handleBatchDelete"
        :disabled="loading || selectedItems.length === 0"
      >
        Delete Selected ({{ selectedItems.length }})
      </button>
    </div>
  </div>
</template>

<style scoped>
.cart-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.select-all {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.select-all input[type="checkbox"] {
  margin-right: 8px;
}

.batch-delete-btn {
  padding: 6px 12px;
  color: #ff4d4f;
  background: white;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.batch-delete-btn:hover {
  background: #fff1f0;
}

.batch-delete-btn:disabled {
  color: #d9d9d9;
  border-color: #d9d9d9;
  cursor: not-allowed;
  background: #f5f5f5;
}
</style>