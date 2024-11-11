// src/service/payment.js
import { paymentService } from '@/utils/axios';

const paymentApi = {
  /**
   * Process payment for order
   * Backend endpoint: GET /api/payment/pay
   * @param {string} orderId 
   * @returns {Promise} 
   */
  async payOrder(orderId) {
    try {
      // 打开支付页面
      window.open('http://nusmall.com:8070/api/payment/pay?orderId=' + orderId);
      
      // 监听支付状态
      return new Promise((resolve, reject) => {
        const checkPaymentStatus = async () => {
          try {
            const response = await paymentService.get(
              `/api/payment/status?orderId=${orderId}`
            );
            if (response.success && response.data.status === 'PAID') {
              resolve(true);
            } else if (response.data.status === 'FAILED') {
              reject(new Error('Payment failed'));
            } else {
              setTimeout(checkPaymentStatus, 2000); // 每2秒检查一次
            }
          } catch (error) {
            reject(error);
          }
        };
        
        // Start checking
        checkPaymentStatus();
      });
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  },

  /**
   * Handle payment notification
   * Backend endpoint: POST /api/payment/notify
   * @param {Object} notifyData
   * @returns {Promise}
   */
  async payNotify(notifyData) {
    try {
      const response = await paymentService.post('/api/payment/notify', notifyData);
      return response;
    } catch (error) {
      console.error('Payment notification failed:', error);
      throw error;
    }
  }
};

export const {
  payOrder,
  payNotify
} = paymentApi;