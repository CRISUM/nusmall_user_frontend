// src/service/facade.js
import * as userService from './user';
import * as productService from './product';
import * as inventoryService from './inventory';
import * as orderService from './order';
import * as permissionService from './permission';
import store from '@/store';
import { useAuth } from '@/composables/useAuth';

/**
 * Service facade for handling complex business operations
 */
export const ServiceFacade = {
    /**
   * Check inventory status for a product
   * @param {number} productId 
   * @returns {Promise<Object>} Stock status
   */
    async checkInventoryStatus(productId) {
      try {
        const stock = await getInventory(productId);
        
        // 根据库存状态返回对应的状态对象
        if (!stock || stock === 0) {
          return {
            status: InventoryStatus.OUT_OF_STOCK,
            availableStock: 0
          };
        }
        
        return {
          status: stock < 10 ? InventoryStatus.LOW_STOCK : InventoryStatus.IN_STOCK,
          availableStock: stock
        };
      } catch (error) {
        console.error('Failed to check inventory status:', error);
        throw error;
      }
    },
  
    /**
     * Get product with inventory status
     * @param {number} productId 
     * @returns {Promise<Object>}
     */
    async getProductWithStock(productId) {
      try {
        const [product, stock] = await Promise.all([
          getProductById(productId),
          getInventory(productId)
        ]);
  
        return {
          ...product,
          availableStock: stock
        };
      } catch (error) {
        console.error('Failed to get product with stock:', error);
        throw error;
      }
    },
  /**
   * Process order checkout
   * @param {Object} cartData 
   * @returns {Promise<number>} orderId
   */
  async processCheckout(cartData) {
    try {
      // // 1. Validate stock for all items
      // const stockValidations = await Promise.all(
      //   cartData.items.map(item => 
      //     inventoryService.checkStock(item.productId, item.quantity)
      //   )
      // );

      // if (stockValidations.some(result => !result)) {
      //   throw new Error('Some items are out of stock');
      // }

      // 2. Submit order
      // const orderId = await orderService.submitOrder({
      //   userId: cartData.userId,
      //   totalPrice: cartData.total,
      //   cartInfoList: cartData.items
      // });
      const orderId = 1;
      

      // 3. Clear cart
      const { authToken } = useAuth();
      await store.dispatch('cart/remove-selected-items', authToken);

      return orderId;
    } catch (error) {
      console.error('Checkout process failed:', error);
      throw error;
    }
  },

  /**
   * Handle product creation with inventory
   * @param {string} authToken 
   * @param {Object} productData 
   * @returns {Promise<Object>}
   */
  async createProductWithInventory(authToken, productData) {
    try {
      // 1. Create product
      const product = await productService.createProduct(authToken, productData);

      // 2. Initialize inventory
      await inventoryService.addInventory(
        authToken,
        product.productId,
        productData.initialStock || 0
      );

      return product;
    } catch (error) {
      console.error('Product creation failed:', error);
      throw error;
    }
  },

  /**
   * Update product and inventory
   * @param {string} authToken 
   * @param {number} productId 
   * @param {Object} productData 
   * @returns {Promise<Object>}
   */
  async updateProductWithInventory(authToken, productId, productData) {
    try {
      // 1. Update product
      await productService.updateProduct(authToken, productId, productData);

      // 2. Update inventory if stock is provided
      if (productData.hasOwnProperty('availableStock')) {
        await inventoryService.updateInventory(
          authToken,
          productId,
          productData.availableStock
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Product update failed:', error);
      throw error;
    }
  },

  /**
   * Delete product and related data
   * @param {string} authToken 
   * @param {number} productId 
   * @returns {Promise<void>}
   */
  async deleteProductComplete(authToken, productId) {
    try {
      // 1. Delete inventory first
      await inventoryService.deleteInventory(productId);

      // 2. Delete product
      await productService.deleteProduct(authToken, productId);
    } catch (error) {
      console.error('Product deletion failed:', error);
      throw error;
    }
  },

  /**
   * Get product with inventory status
   * @param {number} productId 
   * @returns {Promise<Object>}
   */
  async getProductWithStock(productId) {
    try {
      const [product, stock] = await Promise.all([
        productService.getProductById(productId),
        inventoryService.getInventoryStatus(productId)
      ]);

      return {
        ...product,
        availableStock: stock
      };
    } catch (error) {
      console.error('Failed to get product with stock:', error);
      throw error;
    }
  }
};

export default ServiceFacade;