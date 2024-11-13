// src/views/PaymentResult.vue
<template>
  <div class="payment-result">
    <div class="result-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Processing payment result...</p>
      </div>
      
      <template v-else>
        <div class="result-header" :class="{ 'success': success, 'error': !success }">
          <h2>{{ success ? 'Payment Successful!' : 'Payment Status' }}</h2>
          <p>{{ message }}</p>
        </div>

        <div class="order-info" v-if="success">
          <p>Order ID: {{ orderId }}</p>
          <p>Amount: ¥{{ amount }}</p>
          <p>Trade No: {{ tradeNo }}</p>
        </div>

        <div class="action-buttons">
          <router-link to="/api/orders" class="primary-btn">
            View Orders
          </router-link>
          <router-link to="/api/products" class="secondary-btn">
            Continue Shopping
          </router-link>
        </div>
      </template>
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
const orderId = ref('');
const amount = ref('');
const tradeNo = ref('');

onMounted(async () => {
  try {
    // Get parameters from URL
    const params = route.query;
    orderId.value = params.out_trade_no;
    amount.value = params.total_amount;
    tradeNo.value = params.trade_no;

    // Validate required parameters
    if (!orderId.value || !params.sign) {
      throw new Error('Invalid payment response');
    }

    // Check if this is a successful payment return
    if (params.method === 'alipay.trade.page.pay.return') {
      // Call paySuccess API
      const response = await paySuccess(orderId.value);
      
      if (response.success) {
        success.value = true;
        message.value = 'Your payment has been processed successfully.';
        showMessage('Payment completed successfully!', 'success');
        
        // Wait a bit before redirecting
        setTimeout(() => {
          router.push('/api/orders');
        }, 3000);
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } else {
      throw new Error('Invalid payment response');
    }
  } catch (error) {
    success.value = false;
    message.value = error.message || 'Failed to process payment';
    showMessage(error.message || 'Payment processing failed', 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.payment-result {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
}

.result-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.result-header {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.result-header.success h2 {
  color: #52c41a;
}

.result-header.error h2 {
  color: #ff4d4f;
}

.order-info {
  background: #f8f8f8;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 24px;
  text-align: left;
}

.order-info p {
  margin: 8px 0;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.primary-btn,
.secondary-btn {
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
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

.loading {
  padding: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1baeae;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>