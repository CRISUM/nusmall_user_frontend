// src/service/stockCheck.js
import { inventoryService } from '@/utils/axios';
import { CartErrorMessages, InventoryStatus } from '@/constants/cartTypes';

/**
 * @typedef {Object} StockCheckResult
 * @property {boolean} available
 * @property {number} currentStock
 * @property {string} [message]
 */

/**
 * Stock check service for handling inventory validation
 */
export const StockCheckService = {
  /**
   * Check stock availability for single item
   * @param {number} productId 
   * @param {number} requestedQuantity 
   * @returns {Promise<StockCheckResult>}
   */
  async checkSingleItem(productId, requestedQuantity) {
    try {
      const stockStatus = await inventoryService.getInventoryStatus(productId);
      
      return {
        available: stockStatus >= requestedQuantity,
        currentStock: stockStatus,
        message: stockStatus < requestedQuantity ? 
          `Only ${stockStatus} items available` : null
      };
    } catch (error) {
      console.error('Stock check failed:', error);
      throw new Error(CartErrorMessages.STOCK_ERROR);
    }
  },

  /**
   * Check stock availability for multiple items
   * @param {Array<{productId: number, quantity: number}>} items 
   * @returns {Promise<Array<StockCheckResult>>}
   */
  async checkMultipleItems(items) {
    try {
      const checks = await Promise.all(
        items.map(async item => {
          const result = await this.checkSingleItem(item.productId, item.quantity);
          return {
            ...result,
            productId: item.productId,
            requestedQuantity: item.quantity
          };
        })
      );

      return checks;
    } catch (error) {
      console.error('Batch stock check failed:', error);
      throw new Error(CartErrorMessages.STOCK_ERROR);
    }
  },

  /**
   * Validate stock levels before checkout
   * @param {Array<{productId: number, quantity: number}>} items 
   * @returns {Promise<{valid: boolean, issues: Array}>}
   */
  async validateCheckout(items) {
    try {
      const stockChecks = await this.checkMultipleItems(items);
      const issues = stockChecks.filter(check => !check.available);

      return {
        valid: issues.length === 0,
        issues: issues.map(issue => ({
          productId: issue.productId,
          requested: issue.requestedQuantity,
          available: issue.currentStock,
          message: issue.message
        }))
      };
    } catch (error) {
      console.error('Checkout validation failed:', error);
      throw new Error(CartErrorMessages.VALIDATION_FAILED);
    }
  },

  /**
   * Monitor stock changes in real-time
   * @param {number} productId 
   * @param {function} callback 
   */
  watchStockChanges(productId, callback) {
    const intervalId = setInterval(async () => {
      try {
        const stockStatus = await inventoryService.getInventoryStatus(productId);
        callback(null, stockStatus);
      } catch (error) {
        callback(error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  },

  /**
   * Get stock status with threshold check
   * @param {number} productId 
   * @param {number} threshold 
   * @returns {Promise<{status: string, stock: number}>}
   */
  async getStockStatus(productId, threshold = 10) {
    try {
      const stock = await inventoryService.getInventoryStatus(productId);
      
      let status;
      if (stock <= 0) {
        status = InventoryStatus.OUT_OF_STOCK;
      } else if (stock <= threshold) {
        status = InventoryStatus.LOW_STOCK;
      } else {
        status = InventoryStatus.IN_STOCK;
      }

      return { status, stock };
    } catch (error) {
      console.error('Failed to get stock status:', error);
      throw new Error(CartErrorMessages.STOCK_ERROR);
    }
  }
};

export default StockCheckService;