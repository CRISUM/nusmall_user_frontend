// src/service/cart.js

import { userService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';
import { cartService } from '../utils/axios';

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
      const response = await cartService.get('/api/v1/cart/items', {
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
      const response = await cartService.post('/api/v1/cart/add-item', {
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
      const response = await cartService.put('/api/v1/cart/update-item-quantity', {
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
      const response = await cartService.put('/api/v1/cart/update-item-selected', null, {
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
      const response = await cartService.get('/api/v1/cart/selected-items', {
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
      await cartService.delete(`/api/v1/cart/remove-item/${cartItemId}`, {
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
      await cartService.delete('/api/v1/cart/remove-selected-items', {
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
      await cartService.delete('/api/v1/cart/clear', {
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

console.log('isUseMock:', isUseMock);

export const {
  getCart,
  addToCart,
  updateItemQuantity,
  updateItemSelected,
  getSelectedItems,
  removeItemFromCart,
  removeSelectedItems,
  clearCart
} = cartApi;