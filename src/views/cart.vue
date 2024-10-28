// src/views/cart.vue
<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { ServiceFacade } from '@/service/facade';
import { useAuth } from '@/composables/useAuth';
import { InventoryStatus } from '@/constants/cartTypes';

// Composables and state management
const store = useStore();
const router = useRouter();
const { user } = useAuth();

// Local state
const loading = ref(false);
const processingItems = ref(new Set());
const errorMessage = ref('');
const isProcessingCheckout = ref(false);
const showConfirmDialog = ref(false);
const itemToDelete = ref(null);

const showPaymentSuccess = ref(false);

// Computed properties
const cart = computed(() => store.state.cart.cart);

const cartItems = computed(() => {
  return store.state.cart.cartItems || [];
});

const selectedItems = computed(() => {
  return cartItems.value.filter(item => item.isSelected);
});

const hasSelectedItems = computed(() => {
  store.getters['cart/hasSelectedItems']
  console.log('HAS ITEMS: store.getters', store.getters);
});

const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQuantity = Number(item.quantity) || 0;
    return total + (itemPrice * itemQuantity);
  }, 0);
});

const selectedTotal = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQuantity = Number(item.quantity) || 0;
    return total + (itemPrice * itemQuantity);
  }, 0);
});

const getStockStatusClass = (item) => {
  if (!item.availableStock) return 'out-of-stock';
  if (item.availableStock < item.quantity) return 'insufficient-stock';
  if (item.availableStock < 10) return 'low-stock';
  return 'in-stock';
};

const getStockStatusText = (item) => {
  if (!item.availableStock) return 'Out of Stock';
  if (item.availableStock < item.quantity) 
    return `Insufficient Stock (only ${item.availableStock} available)`;
  if (item.availableStock < 10) 
    return `Low Stock (${item.availableStock} left)`;
  return `In Stock (${item.availableStock})`;
};

// Helper functions
const formatPrice = (price) => {
  // Add null check and default value
  if (price === null || price === undefined) {
    return '0.00';
  }
  return Number(price).toFixed(2);
};

// Add data validation when adding to cart
const handleAddToCart = async () => {
  if (!product.value) return;
  
  try {
    // Validate product data
    const cartItem = {
      productId: product.value.productId,
      quantity: quantity.value || 1,
      price: Number(product.value.price) || 0,
      name: product.value.name || 'Unnamed Product',
      imageUrl: product.value.imageUrl || '/api/placeholder/400/320',
      isSelected: true
    };

    await addToCartService(cartItem);
    await store.dispatch('cart/fetchCartItems');
    
    showSuccessModal.value = true;
  } catch (err) {
    error.value = err.message || 'Failed to add to cart';
  }
};

// Add validation when fetching cart items
const loadCartItems = async () => {
  try {
    await store.dispatch('cart/initializeCart');
    // Validate each cart item
    cartItems.value = cartItems.value.map(item => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      name: item.name || 'Unnamed Product',
      imageUrl: item.imageUrl || '/api/placeholder/400/320'
    }));
  } catch (error) {
    console.error('Failed to load cart items:', error);
    errorMessage.value = error.message;
  }
};

/**
 * Toggle item selection
 * @param {number} cartItemId 
 * @param {boolean} isSelected 
 */
 const toggleItemSelection = async (cartItemId, isSelected) => {
  if (!cartItemId || processingItems.value.has(cartItemId)) return;
  
  processingItems.value.add(cartItemId);
  errorMessage.value = '';
  
  try {
    await store.dispatch('cart/updateSelected', {
      cartItemId: cartItemId,
      isSelected: !isSelected
    });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    processingItems.value.delete(cartItemId);
  }
};

/**
 * Update item quantity
 * @param {number} cartItemId 
 * @param {number} newQuantity 
 */
 const updateQuantity = async (cartItemId, newQuantity) => {
  if (newQuantity < 1 || newQuantity > 99 || processingItems.value.has(cartItemId)) return;
  
  processingItems.value.add(cartItemId);
  errorMessage.value = '';
  
  try {
    // 直接调用更新数量的action
    await store.dispatch('cart/updateQuantity', {
      cartItemId,
      quantity: newQuantity
    });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    processingItems.value.delete(cartItemId);
  }
};

/**
 * Remove item from cart
 * @param {number} cartItemId 
 */

 const removeItem = async (cartItemId) => {
  if (!cartItemId) return;
  
  itemToDelete.value = cartItemId;
  showConfirmDialog.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  
  processingItems.value.add(itemToDelete.value);
  errorMessage.value = '';
  
  try {
    await store.dispatch('cart/removeItem', itemToDelete.value);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    processingItems.value.delete(itemToDelete.value);
    showConfirmDialog.value = false;
    itemToDelete.value = null;
  }
};

/**
 * Remove all selected items
 */
const removeSelectedItems = async () => {
  if (!hasSelectedItems.value) return;
  
  if (!confirm('Are you sure you want to remove all selected items?')) return;
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    await store.dispatch('cart/removeSelectedItems');
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};

const showPaymentPopup = () => {
  return new Promise((resolve) => {
    showPaymentSuccess.value = true;
    setTimeout(() => {
      showPaymentSuccess.value = false;
      resolve();
    }, 3000); // 显示3秒后自动关闭
  });
};
/**
 * Process checkout for selected items
 */
const checkout = async () => {
  // if (!hasSelectedItems.value) {
  //   errorMessage.value = 'Please select items to checkout';
  //   return;
  // }

  isProcessingCheckout.value = true;
  errorMessage.value = '';

  try {
    const checkoutData = {
      userId: user.value.id,
      items: selectedItems.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: selectedTotal.value
    };

    const orderId = await ServiceFacade.processCheckout(checkoutData);
    
    await showPaymentPopup();

    router.push(`/api/orders/${orderId}`);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isProcessingCheckout.value = false;
  }
};

const goToOrderPage = () => {
  showPaymentSuccess.value = false;
  router.push(`/api/orders/${orderId}`);
};

// Initialize cart
onMounted(async () => {
  try {
    loading.value = true;
    await store.dispatch('cart/initializeCart');
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="cart-page">
    <!-- Success checkout -->
    <div v-if="showPaymentSuccess" class="payment-success-modal">
      <div class="modal-content">
        <h2>Payment Success</h2>
        <p>Your order has been placed successfully!</p>
        <button @click="goToOrderPage">Go to Order</button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <i class="error-icon"></i>
      {{ errorMessage }}
      <button class="close-btn" @click="errorMessage = ''">×</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading your cart...</p>
    </div>

    <!-- Cart Content -->
    <template v-else>
      <div v-if="cartItems && cartItems.length > 0" class="cart-content">
        <!-- Cart Header -->
        <div class="cart-header">
          <h1>Shopping Cart</h1>
          <button v-if="hasSelectedItems"
                  class="danger-btn"
                  @click="removeSelectedItems"
                  :disabled="loading">
            Remove Selected
          </button>
        </div>

        <!-- Cart Items -->
        <div class="cart-items">
          <div v-for="item in cartItems"
               :key="item.cartItemId"
               class="cart-item"
               :class="{
                 'processing': processingItems.has(item.cartItemId),
                 'selected': item.isSelected
               }">
            
            <!-- Item Selection -->
            <div class="item-select">
              <input type="checkbox"
                     :checked="item.isSelected"
                     @change="toggleItemSelection(item.cartItemId, item.isSelected)"
                     :disabled="processingItems.has(item.cartItemId)">
            </div>

            <!-- Item Details -->
            <div class="item-content">
              <img :src="item.imageUrl" :alt="item.name" class="item-image">
              
              <div class="item-info">
                <h3>{{ item.name || 'Unnamed Product' }}</h3>
                <p class="price">¥{{ formatPrice(item.price) }}</p>
                
                <div class="quantity-control">
                  <button @click="updateQuantity(item.cartItemId, item.quantity - 1)"
                          :disabled="item.quantity <= 1 || processingItems.has(item.cartItemId)">-</button>
                  <input type="number"
                         v-model.number="item.quantity"
                         @change="updateQuantity(item.cartItemId, item.quantity)"
                         :disabled="processingItems.has(item.cartItemId)"
                         min="1"
                         max="99">
                  <button @click="updateQuantity(item.cartItemId, item.quantity + 1)"
                          :disabled="processingItems.has(item.cartItemId)">+</button>
                </div>

                <div class="stock-status" :class="getStockStatusClass(item)">
                  {{ getStockStatusText(item) }}
                </div>
                
                <p class="subtotal">
                  Subtotal: <span>¥{{ formatPrice(item.price * (item.quantity || 1)) }}</span>
                </p>
              </div>

              <button class="remove-btn"
                      @click="removeItem(item.cartItemId)"
                      :disabled="processingItems.has(item.cartItemId)">
                <i class="delete-icon"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="cart-summary">
          <div class="summary-content">
            <div class="summary-row">
              <span>Selected Items:</span>
              <span>{{ selectedItems.length }}</span>
            </div>
            <div class="summary-row">
              <span>Selected Total:</span>
              <span class="total">¥{{ formatPrice(selectedTotal) }}</span>
            </div>
          </div>

          <button class="checkout-btn"
                  @click="checkout"
                  :disabled="false">
            {{ isProcessingCheckout ? 'Processing...' : 'Proceed to Checkout' }}
          </button>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="empty-cart">
        <img src="@/assets/pic/empty-cart.svg" alt="Empty Cart">
        <p>Your cart is empty</p>
        <router-link to="/api/products" class="shopping-btn">
          Continue Shopping
        </router-link>
      </div>
    </template>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="confirm-dialog">
      <div class="dialog-content">
        <h3>Remove Item</h3>
        <p>Are you sure you want to remove this item from your cart?</p>
        <div class="dialog-actions">
          <button class="secondary-btn" 
                  @click="showConfirmDialog = false">Cancel</button>
          <button class="danger-btn" 
                  @click="confirmDelete"
                  :disabled="loading">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Error Message Styles */
.error-message {
  display: flex;
  align-items: center;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 4px;
  color: #ff4d4f;
}

.error-icon {
  margin-right: 8px;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

/* Loading State Styles */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1baeae;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Cart Header Styles */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Cart Item Styles */
.cart-item {
  display: flex;
  border: 1px solid #eee;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 8px;
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
}

.item-content {
  display: flex;
  flex: 1;
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

/* Summary Styles */
.cart-summary {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 20px;
  border-top: 1px solid #eee;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.total {
  color: #ff4d4f;
  font-size: 1.2em;
  font-weight: bold;
}

/* Button Styles */
.checkout-btn {
  width: 100%;
  padding: 12px;
  background: #1baeae;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1em;
  transition: all 0.3s ease;
}

.checkout-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.danger-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.danger-btn:hover {
  background: #ff7875;
}

/* Responsive Design */
@media (max-width: 768px) {
  .item-content {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: 200px;
    margin-bottom: 16px;
  }

  .cart-summary {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .payment-success-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    width: 300px;
  }

  .modal-content h2 {
    margin-bottom: 10px;
  }

  .modal-content button {
    margin-top: 20px;
    padding: 8px 16px;
    border: none;
    background-color: #1baeae;
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }
}
</style>