// src/service/cart.js

import { userService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

/**
 * Actual API implementations for cart operations
 */
const cartApi = {
  /**
   * Get cart for user
   * @returns {Promise<Cart>}
   */
  async getCart() {
    try {
      // TODO: Implement when backend is ready
      const response = await userService.get('/api/v1/cart/items', {
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
      //return mockService.getCart();
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw error;
    }
  },

  /**
   * Add item to cart
   * @param {number} productId
   * @param {number} quantity
   * @param {number} price
   */
  async addToCart(productId, quantity, price) {
    try {
      // TODO: Implement when backend is ready
      const response = await userService.post('/api/v1/cart/add-item', {
        productId,
        quantity,
        price
      }, {
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
      //return mockService.addToCart({ productId, quantity, price });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  },

  /**
   * Update item quantity
   * @param {number} cartItemId
   * @param {number} quantity
   */
  async updateItemQuantity(cartItemId, quantity) {
    try {
      // TODO: Implement when backend is ready
      const response = await userService.put('/api/v1/cart/update-item-quantity', {
        cartItemId,
        quantity
      }, {
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
      //return mockService.updateItemQuantity(cartItemId, quantity);
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  /**
   * Update item selection status
   * @param {number} cartItemId 
   * @param {boolean} isSelected
   */
  async updateItemSelected(cartItemId, isSelected) {
    try {
      // TODO: Implement when backend is ready
      const response = await userService.put('/api/v1/cart/update-item-selected', null, {
        headers: { authToken: localStorage.getItem('token') },
        params: { cartItemId, isSelected }
      });
      return response;
      //return mockService.updateItemSelected(cartItemId, isSelected);
    } catch (error) {
      console.error('Failed to update item selection:', error);
      throw error;
    }
  },

  /**
   * Get selected items from cart
   */
  async getSelectedItems() {
    try {
      // TODO: Implement when backend is ready
      const response = await userService.get('/api/v1/cart/selected-items', {
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
      //return mockService.getSelectedItems();
    } catch (error) {
      console.error('Failed to get selected items:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   * @param {number} cartItemId
   */
  async removeItemFromCart(cartItemId) {
    try {
      // TODO: Implement when backend is ready
      await userService.delete(`/api/v1/cart/remove-item/${cartItemId}`, {
        headers: { authToken: localStorage.getItem('token') }
      });
      //await mockService.deleteCartItem(cartItemId);
      return true;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    }
  },

  /**
   * Remove selected items from cart
   */
  async removeSelectedItems() {
    try {
      // TODO: Implement when backend is ready
      await userService.delete('/api/v1/cart/remove-selected-items', {
        headers: { authToken: localStorage.getItem('token') }
      });
      //await mockService.removeSelectedItems();
      return true;
    } catch (error) {
      console.error('Failed to remove selected items:', error);
      throw error;
    }
  },

  /**
   * Clear cart
   */
  async clearCart() {
    try {
      // TODO: Implement when backend is ready
      await userService.delete('/api/v1/cart/clear', {
        headers: { authToken: localStorage.getItem('token') }
      });
      //await mockService.clearCart();
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }
};

// Export based on environment
export const getCart = isUseMock ? mockService.getCart : cartApi.getCart;
export const addToCart = isUseMock ? mockService.addToCart : cartApi.addToCart;
export const updateItemQuantity = isUseMock ? mockService.updateItemQuantity : cartApi.updateItemQuantity;
export const updateItemSelected = isUseMock ? mockService.updateItemSelected : cartApi.updateItemSelected;
export const getSelectedItems = isUseMock ? mockService.getSelectedItems : cartApi.getSelectedItems;
export const removeItemFromCart = isUseMock ? mockService.deleteCartItem : cartApi.removeItemFromCart;
export const removeSelectedItems = isUseMock ? mockService.removeSelectedItems : cartApi.removeSelectedItems;
export const clearCart = isUseMock ? mockService.clearCart : cartApi.clearCart;