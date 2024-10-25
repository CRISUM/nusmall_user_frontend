// src/service/cart.js

import { userService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

/**
 * Actual API implementations for cart operations
 * Maps to backend CartController endpoints
 */
const cartApi = {
  /**
   * Get cart items for current user
   * Backend endpoint: GET /api/v1/cart/items
   */
  async getCart() {
    try {
      const response = await userService.get('/api/v1/cart/items', {
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw error;
    }
  },

  /**
   * Add item to cart
   * Backend endpoint: POST /api/v1/cart/add-item
   * @param {AddCartItemRequest} cartItem
   */
  async addToCart(cartItem) {
    try {
      const payload = {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.price
      };
      const response = await userService.post('/api/v1/cart/add-item', payload, {
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  },

  /**
   * Update item quantity
   * Backend endpoint: PUT /api/v1/cart/update-item-quantity
   * @param {number} cartItemId 
   * @param {number} quantity
   */
  async updateItemQuantity(cartItemId, quantity) {
    try {
      const response = await userService.put('/api/v1/cart/update-item-quantity', {
        cartItemId,
        quantity
      }, {
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  /**
   * Update item selection status
   * Backend endpoint: PUT /api/v1/cart/update-item-selected
   * @param {number} cartItemId 
   * @param {boolean} isSelected
   */
  async updateItemSelected(cartItemId, isSelected) {
    try {
      const response = await userService.put('/api/v1/cart/update-item-selected', null, {
        params: { cartItemId, isSelected },
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
    } catch (error) {
      console.error('Failed to update item selection:', error);
      throw error;
    }
  },

  /**
   * Get selected items from cart
   * Backend endpoint: GET /api/v1/cart/selected-items
   */
  async getSelectedItems() {
    try {
      const response = await userService.get('/api/v1/cart/selected-items', {
        headers: { authToken: localStorage.getItem('token') }
      });
      return response;
    } catch (error) {
      console.error('Failed to get selected items:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   * Backend endpoint: DELETE /api/v1/cart/remove-item/{cartItemId}
   * @param {number} cartItemId
   */
  async removeItemFromCart(cartItemId) {
    try {
      await userService.delete(`/api/v1/cart/remove-item/${cartItemId}`, {
        headers: { authToken: localStorage.getItem('token') }
      });
      return true;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    }
  },

  /**
   * Remove selected items
   * Backend endpoint: DELETE /api/v1/cart/remove-selected-items
   */
  async removeSelectedItems() {
    try {
      await userService.delete('/api/v1/cart/remove-selected-items', {
        headers: { authToken: localStorage.getItem('token') }
      });
      return true;
    } catch (error) {
      console.error('Failed to remove selected items:', error);
      throw error;
    }
  },

  /**
   * Clear cart
   * Backend endpoint: DELETE /api/v1/cart/clear
   */
  async clearCart() {
    try {
      await userService.delete('/api/v1/cart/clear', {
        headers: { authToken: localStorage.getItem('token') }
      });
      return true;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }
};

// Export services based on environment
export const getCart = isUseMock() ? mockService.getCart : cartApi.getCart;
export const addToCart = isUseMock() ? mockService.addToCart : cartApi.addToCart;
export const updateItemQuantity = isUseMock() ? mockService.updateItemQuantity : cartApi.updateItemQuantity;
export const updateItemSelected = isUseMock() ? mockService.updateItemSelected : cartApi.updateItemSelected;
export const getSelectedItems = isUseMock() ? mockService.getSelectedItems : cartApi.getSelectedItems;
export const removeItemFromCart = isUseMock() ? mockService.deleteCartItem : cartApi.removeItemFromCart;
export const removeSelectedItems = isUseMock() ? mockService.removeSelectedItems : cartApi.removeSelectedItems;
export const clearCart = isUseMock() ? mockService.clearCart : cartApi.clearCart;