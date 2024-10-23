// src/service/cart.js
import { userService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

/**
 * Actual API implementations for cart operations
 */
const cartApi = {
  /**
   * Get or create cart for user
   * @returns {Promise<Cart>}
   */
  async getCart() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // Currently using mock service
      // TODO: Uncomment when backend is ready
      // const response = await userService.get(`/api/cart/user/${user.id}`);
      const response = await mockService.getCart();
      return response;
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw error;
    }
  },

  /**
   * Add item to cart
   * Backend endpoint: POST /api/cart/{cartId}/items
   */
  async addToCart(productId, quantity, price) {
    try {
      const cart = await this.getCart();
      // TODO: Uncomment when backend is ready
      // const response = await userService.post(`/api/cart/${cart.cartId}/items`, {
      //   productId,
      //   quantity,
      //   price
      // });
      const response = await mockService.addToCart({
        productId,
        quantity,
        price
      });
      return response;
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  },

  /**
   * Update item quantity
   * Backend endpoint: PUT /api/cart/{cartId}/items/{cartItemId}
   */
  async updateItemQuantity(cartId, cartItemId, quantity) {
    try {
      // TODO: Uncomment when backend is ready
      // const response = await userService.put(
      //   `/api/cart/${cartId}/items/${cartItemId}`,
      //   { quantity }
      // );
      const response = await mockService.updateItemQuantity(cartId, cartItemId, quantity);
      return response;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart
   * Backend endpoint: DELETE /api/cart/{cartId}/items/{cartItemId}
   */
  async removeItemFromCart(cartId, cartItemId) {
    try {
      // TODO: Uncomment when backend is ready
      // await userService.delete(`/api/cart/${cartId}/items/${cartItemId}`);
      await mockService.deleteCartItem(cartItemId);
      return true;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      throw error;
    }
  },

  /**
   * Clear cart
   * Backend endpoint: DELETE /api/cart/{cartId}
   */
  async clearCart(cartId) {
    try {
      // TODO: Uncomment when backend is ready
      // await userService.delete(`/api/cart/${cartId}`);
      await mockService.clearCart();
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
export const removeItemFromCart = isUseMock ? mockService.deleteCartItem : cartApi.removeItemFromCart;
export const clearCart = isUseMock ? mockService.clearCart : cartApi.clearCart;