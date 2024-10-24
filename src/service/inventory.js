// src/service/inventory.js
import { userService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

/**
 * Implementation of inventory management API endpoints
 * Maps to backend InventoryService.java
 */
const inventoryApi = {
  /**
   * Add new inventory
   * Backend endpoint: POST /api/inventory
   * @param {string} authToken
   * @param {number} productId
   * @param {number} availableStock
   */
  async addInventory(authToken, productId, availableStock) {
    try {
      // TODO: Uncomment when backend is ready
      const response = await userService.post('/api/inventory', {
        productId,
        availableStock
      }, {
        headers: { authToken }
      });
      //const response = await mockService.updateInventory(productId, availableStock);
      return response;
    } catch (error) {
      console.error('Failed to add inventory:', error);
      throw error;
    }
  },

  /**
   * Get inventory status by product ID
   * Backend endpoint: GET /api/inventory/query/{productId}
   * @param {number} productId
   */
  async getInventoryStatus(productId) {
    try {
      // TODO: Uncomment when backend is ready
      const response = await userService.get(`/api/inventory/query/${productId}`);
      //const response = await mockService.getInventory(null, productId);
      return response;
    } catch (error) {
      console.error('Failed to get inventory status:', error);
      throw error;
    }
  },

  /**
   * Delete inventory record
   * Backend endpoint: DELETE /api/inventory/{productId}
   * @param {number} productId
   */
  async deleteInventory(productId) {
    try {
      // TODO: Uncomment when backend is ready
      await userService.delete(`/api/inventory/${productId}`);
      //await mockService.deleteInventory(productId);
      return true;
    } catch (error) {
      console.error('Failed to delete inventory:', error);
      throw error;
    }
  },

  /**
   * Update inventory stock level
   * Backend endpoint: PUT /api/inventory
   * @param {string} authToken
   * @param {number} productId
   * @param {number} availableStock
   */
  async updateInventory(authToken, productId, availableStock) {
    try {
      // TODO: Uncomment when backend is ready
      const response = await userService.put('/api/inventory', {
        productId,
        availableStock
      }, {
        headers: { authToken }
      });
      //const response = await mockService.updateInventory(productId, availableStock);
      return response;
    } catch (error) {
      console.error('Failed to update inventory:', error);
      throw error;
    }
  },

  /**
   * Check if stock level is sufficient
   * Backend endpoint: GET /api/inventory/check
   * @param {number} productId
   * @param {number} quantity
   */
  async checkStock(productId, quantity) {
    try {
      // TODO: Uncomment when backend is ready
      const response = await userService.get('/api/inventory/check', {
        params: { productId, quantity }
      });
      //const response = await mockService.checkStock(productId, quantity);
      return response;
    } catch (error) {
      console.error('Failed to check stock:', error);
      throw error;
    }
  },

  /**
   * Deduct stock after order confirmation
   * Backend endpoint: POST /api/inventory/deduct
   * @param {number} productId
   * @param {number} quantity
   */
  async deductStock(productId, quantity) {
    try {
      // TODO: Uncomment when backend is ready
      const response = await userService.post('/api/inventory/deduct', {
        productId,
        quantity
      });
      //const response = await mockService.deductStock(productId, quantity);
      return response;
    } catch (error) {
      console.error('Failed to deduct stock:', error);
      throw error;
    }
  },

  /**
   * Add stock (for order rollback)
   * Backend endpoint: POST /api/inventory/add
   * @param {number} productId
   * @param {number} quantity
   */
  async addStock(productId, quantity) {
    try {
      // TODO: Uncomment when backend is ready
      const response = await userService.post('/api/inventory/add', {
        productId,
        quantity
      });
      //const response = await mockService.addStock(productId, quantity);
      return response;
    } catch (error) {
      console.error('Failed to add stock:', error);
      throw error;
    }
  }
};

// Export services based on environment configuration
export const addInventory = isUseMock() ? mockService.updateInventory : inventoryApi.addInventory;
export const getInventoryStatus = isUseMock() ? mockService.getInventory : inventoryApi.getInventoryStatus;
export const deleteInventory = isUseMock() ? mockService.deleteInventory : inventoryApi.deleteInventory;
export const updateInventory = isUseMock() ? mockService.updateInventory : inventoryApi.updateInventory;
export const checkStock = isUseMock() ? mockService.checkStock : inventoryApi.checkStock;
export const deductStock = isUseMock() ? mockService.deductStock : inventoryApi.deductStock;
export const addStock = isUseMock() ? mockService.addStock : inventoryApi.addStock;
export const getInventory = isUseMock() ? mockService.getInventory : inventoryApi.getInventoryStatus;
