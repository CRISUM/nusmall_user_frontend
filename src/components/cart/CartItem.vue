// src/components/cart/CartItem.vue
<script setup>
import { computed } from 'vue';
import { CartItemStatus, CartValidation, formatPrice } from '@/constants/cartTypes';

const defaultProductImage = '/api/placeholder/200/200';


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
        'name',
        'quantity',
        'isSelected',
        'createUser',
        'updateUser',
        'imageUrl',
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

const stockStatus = computed(() => {
  if (!props.item.availableStock) return 'out-of-stock';
  if (props.item.availableStock < props.item.quantity) return 'insufficient';
  if (props.item.availableStock < 10) return 'low-stock';
  return 'in-stock';
});

const handleImageError = (event) => {
  event.target.src = defaultProductImage;
};

const stockStatusText = computed(() => {
  switch (stockStatus.value) {
    case 'out-of-stock':
      return 'Out of Stock';
    case 'insufficient':
      return `Only ${props.item.availableStock} available`;
    case 'low-stock':
      return `Low Stock (${props.item.availableStock} left)`;
    default:
      return `In Stock (${props.item.availableStock})`;
  }
});
</script>

<template>
  <div class="cart-item" :class="{ 'selected': item.isSelected }">
    <!-- Item Selection -->
    <div class="item-select">
      <input 
        type="checkbox"
        :checked="item.isSelected"
        @change="$emit('toggle-selection', !item.isSelected)"
      >
    </div>

    <!-- Item Content -->
    <div class="item-content">
      <div class="item-image-container">
        <img 
          :src="defaultProductImage" 
          :alt="item.name"
          class="item-image"
          @error="handleImageError"
        >
      </div>

      <div class="item-info">
        <h3 class="item-name">{{ item.name }}</h3>
        <p class="item-price">¥{{ formatPrice(item.price) }}</p>
        
        <div class="quantity-control">
          <button 
            @click="decrementQuantity"
            :disabled="item.quantity <= 1"
          >-</button>
          <input 
            type="number"
            v-model.number="item.quantity"
            @change="handleQuantityChange"
            min="1"
            max="99"
          >
          <button 
            @click="incrementQuantity"
            :disabled="item.quantity >= 99"
          >+</button>
        </div>

        <p class="item-subtotal">
          Subtotal: <span>¥{{ formatPrice(item.price * item.quantity) }}</span>
        </p>
      </div>

      <!-- Remove Button -->
      <button 
        class="remove-btn"
        @click="$emit('remove')"
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

.item-image-container {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #eee;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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