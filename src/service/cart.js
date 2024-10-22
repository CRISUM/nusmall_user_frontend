// src/service/cart.js
import axios from '@/utils/axios';
import { isUseMock } from '@/utils/axios';
import * as mockService from '@/utils/mockService';

// API Implementation
const cartApi = {
  // Get cart items
  getCart: () => {
    return axios.get('/api/cart');
  },

  // Add item to cart
  addToCart: async (item) => {
    // First check stock
    await axios.get(`/api/inventory/${item.cartItemId}/check?quantity=${item.goodsCount}`);
    // Then add to cart
    return axios.post('/api/cart', item);
  },

  // Modify cart item quantity
  modifyCart: async ({ cartItemId, goodsCount }) => {
    // Check stock first
    await axios.get(`/api/inventory/${cartItemId}/check?quantity=${goodsCount}`);
    // Then update cart
    return axios.put(`/api/cart/${cartItemId}`, { goodsCount });
  },

  // Remove item from cart
  deleteCartItem: (cartItemId) => {
    return axios.delete(`/api/cart/${cartItemId}`);
  },

  // Clear cart
  clearCart: () => {
    return axios.delete('/api/cart');
  },

  // Checkout cart
  checkout: (cartData) => {
    return axios.post('/api/orders', cartData);
  }
};

// Export based on environment
export const getCart = isUseMock ? mockService.getCart : cartApi.getCart;
export const addToCart = isUseMock ? mockService.addToCart : cartApi.addToCart;
export const modifyCart = isUseMock ? mockService.modifyCart : cartApi.modifyCart;
export const deleteCartItem = isUseMock ? mockService.deleteCartItem : cartApi.deleteCartItem;
export const clearCart = isUseMock ? mockService.clearCart : cartApi.clearCart;
export const checkout = isUseMock ? mockService.checkout : cartApi.checkout;

// Helper functions
export const validateCartItem = async (productId, quantity) => {
  try {
    const response = await (isUseMock ? 
      mockService.checkStock(productId, quantity) : 
      cartApi.checkStock(productId, quantity));
    return response;
  } catch (error) {
    throw new Error('Stock validation failed');
  }
};