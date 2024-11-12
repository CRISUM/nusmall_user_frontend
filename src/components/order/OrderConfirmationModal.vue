// src/components/OrderConfirmationModal.vue
<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content invoice">
      <div class="invoice-header">
        <h2>Order Confirmation</h2>
        <div class="invoice-number">Invoice #{{ generateInvoiceNumber() }}</div>
        <div class="date">{{ getCurrentDate() }}</div>
      </div>

      <div class="invoice-body">
        <table class="invoice-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.cartItemId">
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>¥{{ formatPrice(item.price) }}</td>
              <td>¥{{ formatPrice(item.price * item.quantity) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">Total Amount:</td>
              <td class="total-amount">¥{{ formatPrice(totalAmount) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="invoice-footer">
        <button @click="closeModal" class="cancel-btn">Cancel</button>
        <button 
          @click="confirmOrder" 
          class="confirm-btn" 
          :disabled="processing"
        >
          {{ processing ? 'Processing...' : 'Confirm Payment' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { payOrder } from '@/service/payment';
import { submitOrder } from '@/service/order';
import { showMessage } from '@/utils/message';

const props = defineProps({
  show: Boolean,
  items: Array,
});

const emit = defineEmits(['close', 'order-success']);

const router = useRouter();
const processing = ref(false);

const totalAmount = computed(() => {
  return props.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

const formatPrice = (price) => Number(price).toFixed(2);

const getCurrentDate = () => {
  return new Date().toLocaleDateString();
};

const generateInvoiceNumber = () => {
  return `INV-${Date.now().toString().slice(-8)}`;
};

const closeModal = () => {
  emit('close');
};

const confirmOrder = async () => {
  try {
    processing.value = true;
    
    // 获取用户信息
    const user = JSON.parse(localStorage.getItem('user'));
    
    // 准备订单数据
    const orderData = {
      userId: user.userId,
      totalPrice: totalAmount.value,
      cartInfoList: props.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }))
    };

    // 提交订单
    const orderId = await submitOrder(orderData);
    
    // 重定向到支付服务
    await payOrder(orderId);
    
    emit('order-success', orderId);
  } catch (error) {
    showMessage(error.message || 'Failed to process order', 'error');
  } finally {
    processing.value = false;
  }
};

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content.invoice {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.invoice-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #eee;
}

.invoice-number {
  color: #666;
  margin: 8px 0;
}

.date {
  color: #888;
}

.invoice-items {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.invoice-items th,
.invoice-items td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.invoice-items th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.total-label {
  text-align: right;
  font-weight: bold;
}

.total-amount {
  font-weight: bold;
  color: #1baeae;
}

.invoice-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 2px solid #eee;
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
}

.confirm-btn {
  background: #1baeae;
  color: white;
  border: none;
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>