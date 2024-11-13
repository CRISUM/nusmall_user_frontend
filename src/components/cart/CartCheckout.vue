// src/components/cart/CartCheckout.vue
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ServiceFacade } from '@/service/facade';
import { formatPrice, CartErrorMessages } from '@/constants/cartTypes';
import { useStore } from 'vuex';
import { submitOrder, paySuccess } from '@/service/order';
import { checkStock } from '@/service/inventory';

const props = defineProps({
  selectedItems: {
    type: Array,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
});

const store = useStore();
const router = useRouter();
const isProcessing = ref(false);
const showConfirmation = ref(false);
const errorMessage = ref('');
const stockCheckResults = ref([]);

// Computed properties
const hasStockIssues = computed(() => {
  return stockCheckResults.value.some(result => !result.available);
});

const hasSelectedItems = computed(() => store.getters['cart/hasSelectedItems']);
const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQuantity = Number(item.quantity) || 0;
    return total + (itemPrice * itemQuantity);
  }, 0);
});

const formattedTotal = computed(() => formatPrice(props.totalAmount));

/**
 * Start checkout process
 */
const startCheckout = async () => {
  if (props.selectedItems.length === 0) {
    errorMessage.value = 'Please select items to checkout';
    return;
  }

  isProcessing.value = true;
  errorMessage.value = '';
  
  try {
    // Check stock for all items
    const stockChecks = await Promise.all(
      props.selectedItems.map(async item => {
        const stockStatus = await ServiceFacade.getProductWithStock(item.productId);
        return {
          item,
          available: stockStatus.availableStock >= item.quantity,
          currentStock: stockStatus.availableStock
        };
      })
    );

    stockCheckResults.value = stockChecks;

    if (hasStockIssues.value) {
      const itemsWithIssues = stockCheckResults.value
        .filter(result => !result.available)
        .map(result => ({
          name: result.item.name,
          requested: result.item.quantity,
          available: result.currentStock
        }));
      
      errorMessage.value = 'Some items have stock issues:';
      itemsWithIssues.forEach(item => {
        errorMessage.value += `\n${item.name}: Only ${item.available} available (requested: ${item.requested})`;
      });
      return;
    }

    // Show confirmation dialog
    showConfirmation.value = true;
  } catch (error) {
    errorMessage.value = error.message || CartErrorMessages.CHECKOUT_FAILED;
  } finally {
    isProcessing.value = false;
  }
};

/**
 * Process checkout confirmation
 */
const confirmCheckout = async () => {
  try {
    isProcessing.value = true;
    
    // Get current user info
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Prepare order data
    const submitOrderParam = {
      userId: user.userId,
      totalPrice: props.totalAmount,
      cartInfoList: props.selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        imgUrl: item.imageUrl,
        productName: item.name,
        isChecked: item.isSelected ? 1 : 0
      }))
    };

    // Submit order
    const orderId = await submitOrder(submitOrderParam);

    if (!orderId) {
      throw new Error('Failed to create order');
    }

    // Remove items from cart first
    await store.dispatch('cart/removeSelectedItems');

    // Show success message
    store.dispatch('notification/show', {
      type: 'success',
      message: 'Order created successfully! Redirecting to payment...'
    });

    // Initiate payment process
    await payOrder(orderId);

    // Close checkout modal
    emit('close');

    // Navigate to orders page
    // Note: User will complete payment in new window and be redirected by Alipay
    // router.push('/api/orders');

  } catch (error) {
    showMessage(error.message || 'Failed to process order', 'error');
  } finally {
    isProcessing.value = false;
  }
};

const validateStock = async () => {
  try {
    const stockChecks = await Promise.all(
      props.selectedItems.map(async item => {
        const available = await checkStock(item.productId, item.quantity);
        if (!available) {
          throw new Error(`Insufficient stock for product ${item.name}`);
        }
        return true;
      })
    );
    return stockChecks.every(check => check === true);
  } catch (error) {
    console.error('Stock validation failed:', error);
    throw error;
  }
};

</script>

<template>
  <div class="checkout-section">
    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <i class="error-icon"></i>
      <div class="error-content">{{ errorMessage }}</div>
    </div>

    <!-- Checkout Summary -->
    <div class="checkout-summary">
      <div class="summary-row">
        <span>Selected Items:</span>
        <span>{{ selectedItems.length }}</span>
      </div>
      <div class="summary-row total">
        <span>Total Amount:</span>
        <span>{{ formattedTotal }}</span>
      </div>
      <button 
        class="checkout-btn"
        @click="startCheckout"
        :disabled="isProcessing || !hasSelectedItems"
      >
        {{ isProcessing ? 'Processing...' : 'Proceed to Checkout' }}
      </button>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmation" class="confirmation-dialog">
      <div class="dialog-content">
        <h3>Confirm Order</h3>
        
        <!-- Order Summary -->
        <div class="order-summary">
          <h4>Order Summary</h4>
          <div class="summary-items">
            <div v-for="item in selectedItems" :key="item.cartItemId" class="summary-item">
              <span>{{ item.name }}</span>
              <span>{{ item.quantity }} × {{ formatPrice(item.price) }}</span>
            </div>
          </div>
          <div class="summary-total">
            <span>Total Amount:</span>
            <span>{{ formattedTotal }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button 
            class="cancel-btn"
            @click="showConfirmation = false"
            :disabled="isProcessing"
          >
            Cancel
          </button>
          <button 
            class="confirm-btn"
            @click="confirmCheckout"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Processing...' : 'Confirm Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-section {
  margin-top: 20px;
}

.error-message {
  display: flex;
  align-items: start;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  color: #ff4d4f;
}

.error-icon {
  margin-right: 8px;
  margin-top: 3px;
}

.error-content {
  white-space: pre-line;
}

.checkout-summary {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.summary-row.total {
  font-size: 1.2em;
  font-weight: bold;
  color: #ff4d4f;
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 12px;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: #1baeae;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1em;
  transition: all 0.3s;
}

.checkout-btn:hover {
  background: #158f8f;
}

.checkout-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.confirmation-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.order-summary {
  margin: 20px 0;
}

.summary-items {
  margin: 12px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}

.confirm-btn {
  background: #1baeae;
  border: none;
  color: white;
}

.cancel-btn:disabled,
.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .dialog-content {
    width: 95%;
    margin: 20px;
  }
}
</style>