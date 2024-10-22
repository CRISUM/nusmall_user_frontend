<template>
  <div class="cart-box">
    <h2>Shopping Cart</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Loading cart...
    </div>

    <!-- Cart Items -->
    <div v-else-if="tempCartItems.length > 0" class="cart-items">
      <div v-for="item in tempCartItems" :key="item.cartItemId" class="cart-item">
        <img :src="item.goodsCoverImg" alt="Product Image" class="product-img" />
        <div class="product-info">
          <h3>{{ item.goodsName }}</h3>
          <p>Price: ¥{{ item.sellingPrice }}</p>
          <div class="quantity-control">
            <button 
              @click="updateQuantity(item.cartItemId, item.goodsCount - 1)" 
              :disabled="item.goodsCount <= 1 || loading">-</button>
            <span>{{ item.goodsCount }}</span>
            <button 
              @click="updateQuantity(item.cartItemId, item.goodsCount + 1)" 
              :disabled="item.goodsCount >= 99 || loading">+</button>
          </div>
          <p class="subtotal">Subtotal: ¥{{ item.goodsCount * item.sellingPrice }}</p>
        </div>
        <div class="delete-control">
          <button @click="deleteItem(item.cartItemId)" class="delete-button" :disabled="loading">
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Empty Cart -->
    <div v-else class="empty-cart">
      <p>Your cart is empty.</p>
      <router-link to="/api/products" class="continue-shopping">Continue Shopping</router-link>
    </div>

    <!-- Cart Footer -->
    <div v-if="tempCartItems.length > 0" class="cart-footer">
      <div v-if="hasUnsavedChanges" class="changes-actions">
        <button @click="cancelChanges" class="secondary-btn" :disabled="loading">
          Cancel
        </button>
        <button @click="saveChanges" class="primary-btn" :disabled="loading">
          Save Changes
        </button>
      </div>
      <div class="cart-summary">
        <p class="total" v-if="hasUnsavedChanges">
          Original Total: ¥{{ cartTotal }}
          <br>
          New Total: ¥{{ tempCartTotal }}
        </p>
        <p class="total" v-else>
          Total: ¥{{ cartTotal }}
        </p>
        <button 
          @click="checkout" 
          class="checkout-button" 
          :disabled="loading || hasUnsavedChanges">
          {{ hasUnsavedChanges ? 'Save changes before checkout' : 'Proceed to Checkout' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { checkStock } from '@/service/product'; // Add this import

const store = useStore();
const router = useRouter();

// Computed properties
const loading = computed(() => store.state.cart.loading);
const tempCartItems = computed(() => store.getters['cart/tempCartItems']);
const cartTotal = computed(() => store.getters['cart/cartTotal']);
const tempCartTotal = computed(() => store.getters['cart/tempCartTotal']);
const hasUnsavedChanges = computed(() => store.getters['cart/hasUnsavedChanges']);
const cartItems = computed(() => store.state.cart.cartItems); // Add this line

// Methods
const updateQuantity = async (cartItemId, newQuantity) => {
  if (newQuantity < 1 || newQuantity > 99) return;
  
  try {
    const item = tempCartItems.value.find(item => item.cartItemId === cartItemId);
    if (!item) return;

    const stockAvailable = await checkStock(cartItemId, newQuantity);
    if (!stockAvailable) {
      throw new Error('Insufficient stock');
    }

    store.dispatch('cart/updateTempQuantity', { 
      cartItemId, 
      goodsCount: newQuantity 
    });
  } catch (error) {
    console.error('Failed to update quantity:', error);
    alert(error.message || 'Failed to update quantity');
  }
};

const saveChanges = async () => {
  try {
    // 检查所有商品的库存
    const stockChecks = tempCartItems.value.map(async item => {
      const stockAvailable = await checkStock(
        item.cartItemId, 
        item.goodsCount
      );
      if (!stockAvailable) {
        throw new Error(`Insufficient stock for ${item.goodsName}`);
      }
    });

    await Promise.all(stockChecks);
    
    // 保存更改
    await store.dispatch('cart/saveChanges');
  } catch (error) {
    console.error('Failed to save changes:', error);
    alert(error.message || 'Failed to save changes');
  }
};


const cancelChanges = () => {
  store.dispatch('cart/revertChanges');
};

const deleteItem = async (cartItemId) => {
  if (!confirm('Are you sure you want to remove this item?')) return;
  
  try {
    await store.dispatch('cart/deleteCartItem', cartItemId);
  } catch (error) {
    console.error('Failed to delete item:', error);
    alert(error.message || 'Failed to delete item');
  }
};

const checkout = async () => {
  if (hasUnsavedChanges.value) {
    alert('Please save your changes before checking out');
    return;
  }

  try {
    // Check stock for all items
    const stockChecks = cartItems.value.map(async item => {
      const stockAvailable = await checkStock(
        item.cartItemId, 
        item.goodsCount
      );
      if (!stockAvailable) {
        throw new Error(`Insufficient stock for ${item.goodsName}`);
      }
    });

    await Promise.all(stockChecks);
    
    // Prepare cart data for checkout
    const checkoutData = {
      items: cartItems.value,
      total: cartTotal.value
    };

    // Process checkout
    await store.dispatch('cart/checkout', checkoutData);
    
    alert('Checkout successful!');
    router.push('/api/orders');
  } catch (error) {
    console.error('Checkout failed:', error);
    alert(error.message || 'Checkout failed');
  }
};

// Initialize
onMounted(() => {
  store.dispatch('cart/fetchCartItems');
});
</script>

<style scoped>

.changes-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.secondary-btn {
  padding: 8px 16px;
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.secondary-btn:hover {
  background-color: #f5f5f5;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.total {
  font-size: 1.1em;
  text-align: right;
}

.checkout-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cart-box {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 20px;
}

.product-info {
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 10px;
  color: #333;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin: 10px 0;
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

.quantity-control span {
  margin: 0 15px;
  min-width: 20px;
  text-align: center;
}

.delete-button {
  padding: 8px 16px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #cc0000;
}

.delete-button:disabled {
  background-color: #ffaaaa;
  cursor: not-allowed;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.cart-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.total {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
}

.checkout-button {
  padding: 12px 24px;
  background-color: #1baeae;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1em;
}

.checkout-button:hover {
  background-color: #158f8f;
}

.checkout-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.subtotal {
  color: #666;
  font-size: 0.9em;
  margin-top: 5px;
}

.empty-cart {
  text-align: center;
  padding: 40px;
}

.continue-shopping {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #1baeae;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

@media (max-width: 600px) {
  .cart-item {
    flex-direction: column;
    text-align: center;
  }
  
  .product-img {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .quantity-control {
    justify-content: center;
  }
  
  .delete-control {
    margin-top: 15px;
  }
  
  .cart-summary {
    flex-direction: column;
    gap: 10px;
  }
}
</style>