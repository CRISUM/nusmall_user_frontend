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
        window.open('http://167.71.195.130:8085/api/payment/pay?orderId=' + orderId);
    //   // 确保orderId是简单类型而不是对象
    //   const response = await paymentService.get('/api/payment/pay', {
    //     params: { 
    //       orderId: orderId // 强制转换为字符串
    //     }
    //   });
    //   console.log('orderid:', orderId);
    //   return response;
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