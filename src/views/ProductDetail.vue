// src/views/ProductDetail.vue
<template>
  <div class="product-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading product details...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadProduct" class="retry-btn">Retry</button>
    </div>

    <!-- Product Content -->
    <div v-if="product && !loading" class="product-container">
      <!-- Left Section - Product Image -->
      <div class="product-image-section">
        <div class="main-image">
          <img 
            :src="product.productImages?.[0]?.imageUrl || '/api/placeholder/400/320'" 
            :alt="product.name"
            class="product-img"
          >
        </div>
      </div>

      <!-- Right Section - Product Info -->
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        
        <div class="price-section">
          <span class="price">¥{{ formatPrice(product.price) }}</span>
        </div>

        <div class="stock-status" :class="stockStatusClass">
          {{ stockStatusText }}
        </div>

        <div class="description-section">
          <h3>Product Description</h3>
          <p>{{ product.description || 'No description available' }}</p>
        </div>

        <!-- Add to Cart Section (Only for CUSTOMER role) -->
        <div v-if="userRole === 'CUSTOMER'" class="cart-actions">
          <div class="quantity-control">
            <button 
              @click="decreaseQuantity" 
              :disabled="quantity <= 1 || !product.availableStock"
            >-</button>
            <input 
              type="number" 
              v-model.number="quantity"
              min="1"
              :max="product.availableStock"
              :disabled="!product.availableStock"
            >
            <button 
              @click="increaseQuantity"
              :disabled="quantity >= product.availableStock || !product.availableStock"
            >+</button>
          </div>

          <button 
            @click="handleAddToCart"
            class="add-to-cart-btn"
            :disabled="!product.availableStock"
          >
            {{ addToCartButtonText }}
          </button>
        </div>

        <!-- Meta Information -->
        <div class="meta-info">
          <p class="category">Category: {{ product.categoryName || 'Uncategorized' }}</p>
          <p class="sku">Product ID: {{ product.productId }}</p>
          <p class="seller">Seller: {{ product.createUser }}</p>
          <p class="date">Listed on: {{ formatDate(product.createDatetime) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useAuth } from '@/composables/useAuth';
import { showMessage } from '@/utils/message';

// Initialize all required composables
const route = useRoute();
const router = useRouter();
const store = useStore();
const { userRole } = useAuth();

// State

const loading = ref(true);
const error = ref(null);
const quantity = ref(1);
const defaultProductImage = '/api/placeholder/400/400';

const product = computed(() => {
  const productId = parseInt(route.params.id);
  return store.getters['product/getProductById'](productId);
});
// Computed properties
const stockStatusClass = computed(() => {
  if (!product.value?.availableStock) return 'out-of-stock';
  if (product.value.availableStock < 10) return 'low-stock';
  return 'in-stock';
});

const stockStatusText = computed(() => {
  if (!product.value?.availableStock) return 'Out of Stock';
  if (product.value.availableStock < 10) {
    return `Low Stock (${product.value.availableStock} left)`;
  }
  return `In Stock (${product.value.availableStock})`;
});

const addToCartButtonText = computed(() => {
  if (!product.value?.availableStock) return 'Out of Stock';
  return 'Add to Cart';
});

// Methods
const formatPrice = (price) => {
  return Number(price).toFixed(2);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const increaseQuantity = () => {
  if (product.value && quantity.value < product.value.availableStock) {
    quantity.value++;
  }
};

const handleAddToCart = async () => {
  try {
    if (!product.value) return;

    const cartItem = {
      productId: product.value.productId,
      quantity: quantity.value,
      price: product.value.price,
      name: product.value.name,
      imageUrl: product.value.imageUrl || '/api/placeholder/400/320',
      isSelected: true
    };

    await store.dispatch('cart/addToCart', cartItem);
    showMessage('Added to cart successfully!', 'success');
  } catch (error) {
    showMessage(error.message || 'Failed to add to cart', 'error');
  }
};

const loadProduct = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const productId = parseInt(route.params.id);
    if (!productId) {
      throw new Error('Invalid product ID');
    }

    // If products are not loaded yet, fetch them
    if (store.state.product.products.length === 0) {
      await store.dispatch('product/fetchProducts');
    }
    
    // Get product from store
    const foundProduct = store.getters['product/getProductById'](productId);
    if (!foundProduct) {
      throw new Error('Product not found');
    }

    // Set as current product
    store.dispatch('product/setCurrentProduct', productId);
    
  } catch (err) {
    console.error('Failed to load product:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Initialize on mount
onMounted(() => {
  loadProduct();
});
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 20px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-image-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  aspect-ratio: 1;
  width: 100%;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-name {
  font-size: 24px;
  margin-bottom: 16px;
}

.price-section {
  margin: 20px 0;
}

.price {
  font-size: 28px;
  color: #ff4d4f;
  font-weight: bold;
}

.stock-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  margin: 12px 0;
}

.out-of-stock {
  background: #fff2f0;
  color: #ff4d4f;
}

.low-stock {
  background: #fffbe6;
  color: #faad14;
}

.in-stock {
  background: #f6ffed;
  color: #52c41a;
}

.cart-actions {
  margin: 24px 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.quantity-control button {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-control input {
  width: 60px;
  text-align: center;
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-to-cart-btn {
  width: 100%;
  padding: 12px;
  background: #1baeae;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.add-to-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.meta-info {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.meta-info p {
  margin: 8px 0;
  color: #666;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #1baeae;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
  }
}
</style>