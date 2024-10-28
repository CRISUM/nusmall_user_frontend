// src/components/cart/CartItem.vue
<script setup>
import { computed } from 'vue';
import { CartItemStatus, CartValidation, formatPrice } from '@/constants/cartTypes';

const props = defineProps({
  item: {
    type: Object,
    required: true,
    // Define the expected shape based on backend entity
    validator: (value) => {
      return [
        'cartItemId',
        'productId',
        'price',
        'quantity',
        'isSelected',
        'createUser',
        'updateUser',
        'createDatetime',
        'updateDatetime'
      ].every(key => key in value)
    }
  }
});

const emit = defineEmits(['update:quantity', 'toggle-selection', 'remove']);

const subtotal = computed(() => {
  return parseFloat((props.item.price * props.item.quantity).toFixed(2));
});

const handleQuantityChange = (value) => {
  const quantity = parseInt(value);
  if (isNaN(quantity)) return;
  
  if (quantity >= CartValidation.MIN_QUANTITY && 
      quantity <= CartValidation.MAX_QUANTITY) {
    emit('update:quantity', quantity);
  }
};

const incrementQuantity = () => {
  if (props.item.quantity < CartValidation.MAX_QUANTITY) {
    emit('update:quantity', props.item.quantity + 1);
  }
};

const decrementQuantity = () => {
  if (props.item.quantity > CartValidation.MIN_QUANTITY) {
    emit('update:quantity', props.item.quantity - 1);
  }
};

const stockStatusClass = computed(() => {
  if (!item.value?.availableStock) return 'out-of-stock';
  if (item.value.availableStock < 10) return 'low-stock';
  return 'in-stock';
});

const stockStatusText = computed(() => {
  if (!item.value?.availableStock) return 'Out of Stock';
  if (item.value.availableStock < 10) return `Low Stock (${item.value.availableStock} left)`;
  return `In Stock (${item.value.availableStock})`;
});
</script>

<template>
  <div 
    class="cart-item"
    :class="{
      'processing': processing,
      'selected': item.isSelected
    }"
  >
    <!-- Selection Checkbox -->
    <div class="item-select">
      <input 
        type="checkbox"
        :checked="item.isSelected"
        @change="$emit('toggle-selection', !item.isSelected)"
        :disabled="processing"
      >
    </div>

    <!-- Item Content -->
    <div class="item-content">
      <!-- Product Image -->
      <div class="item-image">
        <img :src="item.imageUrl" :alt="item.name">
        <div v-if="processing" class="processing-overlay">
          <div class="spinner"></div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="item-info">
        <h3 class="item-name">{{ item.name }}</h3>
        <p class="item-price">{{ formatPrice(item.price) }}</p>

        <!-- Stock Status -->
        <div class="stock-status" :class="stockStatusClass">
          {{ stockStatusText }}
        </div>

        <!-- Quantity Control -->
        <div class="quantity-control">
          <button 
            @click="decrementQuantity"
            :disabled="processing || item.quantity <= CartValidation.MIN_QUANTITY"
          >-</button>
          <input 
            type="number"
            v-model="item.quantity"
            @change="handleQuantityChange"
            :min="CartValidation.MIN_QUANTITY"
            :max="CartValidation.MAX_QUANTITY"
            :disabled="processing"
          >
          <button 
            @click="incrementQuantity"
            :disabled="processing || item.quantity >= CartValidation.MAX_QUANTITY"
          >+</button>
        </div>

        <!-- Subtotal -->
        <p class="subtotal">
          Subtotal: <span>{{ subtotal }}</span>
        </p>
      </div>

      <!-- Remove Button -->
      <button 
        class="remove-btn"
        @click="$emit('remove')"
        :disabled="processing"
      >
        <i class="delete-icon"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cart-item {
  display: flex;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
  transition: all 0.3s ease;
}

.cart-item.processing {
  opacity: 0.7;
  pointer-events: none;
}

.cart-item.selected {
  border-color: #1baeae;
  background-color: #f6ffed;
}

.item-select {
  padding: 0 16px;
  display: flex;
  align-items: center;
}

.item-content {
  display: flex;
  flex: 1;
  gap: 16px;
}

.item-image {
  position: relative;
  width: 120px;
  height: 120px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
}

.item-price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 8px;
}

.stock-status {
  margin-bottom: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.quantity-control button {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-control button:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.quantity-control input {
  width: 50px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.subtotal {
  font-size: 14px;
  color: #666;
}

.subtotal span {
  color: #ff4d4f;
  font-weight: bold;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 8px;
  transition: color 0.3s;
}

.remove-btn:hover {
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .item-content {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }
}
</style>