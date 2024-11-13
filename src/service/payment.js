// src/service/payment.js
import { paymentService } from '@/utils/axios';

const paymentApi = {
  /**
   * Process payment for order
   * @param {string} orderId 
   */
  async payOrder(orderId) {
    try {
      // Direct to payment page with return URL
      const returnUrl = `${window.location.origin}/payment/result`;
      const paymentUrl = `http://nusmall.com:8085/api/payment/pay?orderId=${orderId}&returnUrl=${encodeURIComponent(returnUrl)}`;
      window.open(paymentUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  }
};

export const {
  payOrder
} = paymentApi;