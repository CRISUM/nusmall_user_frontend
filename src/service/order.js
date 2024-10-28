// src/service/order.js
import { orderService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

/**
 * Implementation of order management API endpoints
 * Maps to backend OrderService.java
 */
const orderApi = {
  /**
   * Add new order
   * Backend endpoint: POST /api/orders
   * @param {Object} order - Order object
   * @returns {Promise<number>} order id
   */
  async addOrder(order) {
    try {
      // TODO: Uncomment when backend is ready
      // const response = await userService.post('/api/orders', order);
      // return response.data;
      return mockService.addOrder(order);
    } catch (error) {
      console.error('Failed to add order:', error);
      throw error;
    }
  },

  /**
   * Get orders by user ID
   * Backend endpoint: GET /api/orders/user/{userId}
   * @param {number} userId
   * @returns {Promise<Array>} list of orders
   */
  async getOrderByUserId(userId) {
    try {
      const response = await orderService.get('/order/index', {
        headers: {
          'authToken': localStorage.getItem('token')
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to get orders:', error);
      throw error;
    }
  },

  /**
   * Submit order from cart items
   * Backend endpoint: POST /api/orders/submit
   * @param {Object} submitOrderParam - Order submission parameters
   * @returns {Promise<number>} order id
   */
  async submitOrder(submitOrderParam) {
    try {
      const response = await userService.post('/orders/submit', submitOrderParam);
      return response.data;
    } catch (error) {
      console.error('Failed to submit order:', error);
      throw error;
    }
  },

  /**
   * Update order status after payment success
   * Backend endpoint: PUT /api/orders/{orderId}/pay
   * @param {number} orderId
   */
  async getOrderDetails(orderId) {
    try {
      const response = await orderService.get(`/order/trade`);
      return response;
    } catch (error) {
      console.error('Failed to get order details:', error);
      throw error;
    }
  },
  async getTradeInfo() {
    try {
      const response = await orderService.get('/order/trade');
      return response.data;
    } catch (error) {
      console.error('Failed to get trade info:', error);
      throw error;
    }
  },

  // 修改 - 提交订单
  async submitOrder(orderData) {
    try {
      const response = await orderService.post('/order/submitOrder', orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to submit order:', error);
      throw error;
    }
  },
  
  // 修改 - 支付成功回调
  async paySuccess(orderId) {
    try {
      await orderService.put(`/order/inner/paySuccess?orderId=${orderId}`);
      return true;
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  }
};

// Export services based on environment configuration
export const {
  addOrder,
  getOrderByUserId,
  getTradeInfo,
  submitOrder,
  paySuccess,
  getOrderDetails
} = orderApi;

// Type definitions for TypeScript support
/**
 * @typedef {Object} OrderItem
 * @property {number} orderId
 * @property {number} productId
 * @property {number} quantity
 * @property {number} price
 */

/**
 * @typedef {Object} Order
 * @property {number} orderId
 * @property {number} userId
 * @property {Date} orderDate
 * @property {string} status
 * @property {number} totalPrice
 * @property {Array<OrderItem>} orderItems
 */

/**
 * @typedef {Object} SubmitOrderParam
 * @property {number} userId
 * @property {number} totalPrice
 * @property {Array<CartInfoDTO>} cartInfoList
 */