// src/service/order.js
import { userService } from '@/utils/axios';
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
      // TODO: Uncomment when backend is ready
      // const response = await userService.get(`/api/orders/user/${userId}`);
      // return response.data;
      return mockService.getOrderByUserId(userId);
    } catch (error) {
      console.error('Failed to get user orders:', error);
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
      // TODO: Uncomment when backend is ready
      // const response = await userService.post('/api/orders/submit', submitOrderParam);
      // return response.data;
      return mockService.submitOrder(submitOrderParam);
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
  async paySuccess(orderId) {
    try {
      // TODO: Uncomment when backend is ready
      // await userService.put(`/api/orders/${orderId}/pay`);
      await mockService.paySuccess(orderId);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  }
};

// Export services based on environment configuration
export const addOrder = isUseMock() ? mockService.addOrder : orderApi.addOrder;
export const getOrderByUserId = isUseMock() ? mockService.getOrderByUserId : orderApi.getOrderByUserId;
export const submitOrder = isUseMock() ? mockService.submitOrder : orderApi.submitOrder;
export const paySuccess = isUseMock() ? mockService.paySuccess : orderApi.paySuccess;

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