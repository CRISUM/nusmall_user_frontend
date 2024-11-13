// src/views/PaymentResult.vue
<template>
  <div class="payment-result">
    <div class="result-content">
      <div v-if="loading" class="loading">
        Processing payment result...
      </div>
      
      <div v-else class="result-message">
        <h2>{{ success ? 'Payment Successful!' : 'Payment Failed' }}</h2>
        <p>{{ message }}</p>
        
        <div class="action-buttons">
          <router-link to="/api/orders" class="primary-btn">
            View Orders
          </router-link>
          <router-link to="/api/products" class="secondary-btn">
            Continue Shopping
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showMessage } from '@/utils/message';
import { paySuccess } from '@/service/order';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const success = ref(false);
const message = ref('');

onMounted(async () => {
  try {
    // Get order info from payment return
    const outTradeNo = route.query.out_trade_no;  // This is our orderId
    const tradeNo = route.query.trade_no;         // Alipay's transaction ID
    const tradeStatus = route.query.trade_status; // Payment status if available
    
    if (!outTradeNo) {
      throw new Error('Invalid payment response');
    }

    // Update order status
    await paySuccess(outTradeNo);
    
    success.value = true;
    message.value = 'Payment processed successfully.';
    showMessage('Payment completed!', 'success');
    
    // Redirect to orders page after 2 seconds
    setTimeout(() => {
      router.push('/api/orders');
    }, 2000);

  } catch (error) {
    success.value = false;
    message.value = error.message || 'Failed to process payment result';
    showMessage(error.message || 'Payment processing failed', 'error');
  } finally {
    loading.value = false;
  }
});
</script>
<style scoped>
.payment-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.result-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading {
  color: #666;
}

h2 {
  color: var(--text-color);
  margin-bottom: 20px;
}

.result-message {
  margin-top: 20px;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.primary-btn, .secondary-btn {
  padding: 10px 24px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.primary-btn {
  background: #1baeae;
  color: white;
}

.secondary-btn {
  background: white;
  border: 1px solid #1baeae;
  color: #1baeae;
}

.primary-btn:hover {
  background: #158f8f;
}

.secondary-btn:hover {
  background: #f0f9f9;
}
</style>