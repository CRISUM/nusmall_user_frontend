// src/service/inventory.js
import axios from '@/utils/axios';
import { isUseMock } from '@/utils/axios';
import * as mockService from '@/utils/mockService';

// API Implementation
const inventoryApi = {
  // Get inventory status
  getInventoryStatus: (productId) => {
    return axios.get(`/api/inventory/${productId}`);
  },

  // Update inventory
  updateInventory: (productId, quantity) => {
    return axios.put(`/api/inventory/${productId}`, { availableStock: quantity });
  },

  // Get inventory history
  getInventoryHistory: (productId) => {
    return axios.get(`/api/inventory/${productId}/history`);
  },

  // Check stock availability
  checkStock: (productId, quantity) => {
    return axios.get(`/api/inventory/${productId}/check?quantity=${quantity}`);
  },

  // Batch update inventory
  batchUpdateInventory: (updates) => {
    return axios.put('/api/inventory/batch', updates);
  },

  // Get low stock alerts
  getLowStockAlerts: () => {
    return axios.get('/api/inventory/alerts');
  }
};

// Export based on environment
export const getInventoryStatus = isUseMock ? mockService.getInventoryStatus : inventoryApi.getInventoryStatus;
export const updateInventory = isUseMock ? mockService.updateInventory : inventoryApi.updateInventory;
export const getInventoryHistory = isUseMock ? mockService.getInventoryHistory : inventoryApi.getInventoryHistory;
export const checkStock = isUseMock ? mockService.checkStock : inventoryApi.checkStock;
export const batchUpdateInventory = isUseMock ? mockService.batchUpdateInventory : inventoryApi.batchUpdateInventory;
export const getLowStockAlerts = isUseMock ? mockService.getLowStockAlerts : inventoryApi.getLowStockAlerts;

// Helper functions
export const validateStock = async (productId, requestedQuantity) => {
  try {
    const response = await checkStock(productId, requestedQuantity);
    return response;
  } catch (error) {
    console.error('Stock validation failed:', error);
    return false;
  }
};

export const calculateStockLevel = (currentStock, threshold) => {
  if (currentStock <= 0) return 'out_of_stock';
  if (currentStock <= threshold) return 'low_stock';
  return 'in_stock';
};

// Stock update types
export const StockUpdateTypes = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  ADJUSTMENT: 'ADJUSTMENT',
  RETURN: 'RETURN'
};

// Inventory status codes
export const InventoryStatus = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
};