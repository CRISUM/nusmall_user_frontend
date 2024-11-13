// src/service/cart.js

import { userService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';
import { cartService } from '../utils/axios';

/**
 * Actual API implementations for cart operations
 */
const cartApi = {
  // 修改添加到购物车的方法
  addToCart: async (cartItem) => {
    try {
      // 确保图片URL使用正确的格式
      const formattedCartItem = {
        ...cartItem,
        imageUrl: cartItem.imageUrl || '/api/placeholder/400/320',
        productName: cartItem.name || cartItem.productName, // 添加商品名称
        quantity: Number(cartItem.quantity) || 1,
        price: Number(cartItem.price) || 0
      };
  
      const response = await cartService.post('/api/v1/cart/add-item', formattedCartItem, {
        headers: { 
          'authToken': localStorage.getItem('token')
        }
      });
      return {
        ...response,
        name: cartItem.name,
        productName: cartItem.name,
        imageUrl: cartItem.imageUrl,
        isSelected: cartItem.isSelected
      };
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  },

  // 修改获取购物车数据的方法
  getCart: async () => {
    try {
      const response = await cartService.get('/api/v1/cart/items', {
        headers: { 'authToken': localStorage.getItem('token') }
      });
      
      // 处理返回的数据，确保字段映射正确
      return response.map(item => ({
        ...item,
        name: item.productName || item.name, // 确保name字段存在
        imageUrl: item.imageUrl || '/api/placeholder/400/320',
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0
      }));
    } catch (error) {
      console.error('Failed to get cart:', error);
      throw error;
    }
  },

  // updateInventoryAfterAdd: async (productId, quantity) => {
  //   try {
  //     // 先检查库存
  //     const currentStock = await inventoryService.get(`/inventory?productId=${productId}`);
      
  //     // 确保有足够库存
  //     if (currentStock < quantity) {
  //       throw new Error('Insufficient stock');
  //     }
  
  //     // 更新库存
  //     await inventoryService.put('/inventory', {
  //       productId,
  //       availableStock: currentStock - quantity
  //     }, {
  //       headers: { 'authToken': localStorage.getItem('token') }
  //     });
  //   } catch (error) {
  //     console.error('Failed to update inventory:', error);
  //     throw error;
  //   }
  // },

  /**
   * Update item quantity
   * Backend endpoint: PUT /api/v1/cart/update-item-quantity 
   * @param {UpdateCartItemQuantityRequest} request
   */
  updateItemQuantity: async (cartItemId, quantity) => {
    try {
      const response = await cartService.put('/api/v1/cart/update-item-quantity', {
        cartItemId: cartItemId,
        quantity: quantity
      }, {
        headers: { 'authToken': localStorage.getItem('token') }
      });
      return response;
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    }
  },

  /**
   * Update item selection status
   * Backend endpoint: PUT /api/v1/cart/update-item-selected
   */
  updateItemSelected: async (cartItemId, isSelected) => {
    try {
      const response = await cartService.put('/api/v1/cart/update-item-selected', null, {
        headers: { 'authToken': localStorage.getItem('token') },
        params: {
          cartItemId: cartItemId,  // 确保cartItemId正确传递
          isSelected: isSelected
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to update item selection:', error);
      throw error;
    }
  },

  /**
   * Get selected items
   * Backend endpoint: GET /api/v1/cart/selected-items
   */
  getSelectedItems: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await cartService.get('/api/v1/cart/selected-items', {
        headers: { authToken: token }
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
   */
  removeItemFromCart: async (cartItemId) => {
    try {
      if (!cartItemId) {
        throw new Error('Invalid cart item ID');
      }
      const response = await cartService.delete(`/api/v1/cart/remove-item/${cartItemId}`, {
        headers: { 'authToken': localStorage.getItem('token') }
      });
      return response;
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  },

  /**
   * Remove selected items
   * Backend endpoint: DELETE /api/v1/cart/remove-selected-items
   */
  removeSelectedItems: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await cartService.delete('/api/v1/cart/remove-selected-items', {
        headers: { authToken: token }
      });
      return response;
    } catch (error) {
      console.error('Failed to remove selected items:', error);
      throw error;
    }
  },

  /**
   * Clear cart
   * Backend endpoint: DELETE /api/v1/cart/clear
   */
  clearCart: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await cartService.delete('/api/v1/cart/clear', {
        headers: { authToken: token }
      });
      return response;
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
  // updateInventoryAfterAdd,
  clearCart
} = cartApi;