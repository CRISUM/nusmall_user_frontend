// src/service/product.js
import { productService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

// API Implementation
const apiService = {
  /**
   * Get products for consumers with pagination
   * Backend endpoint: GET /product/page/consumer 
   * @param {Object} queryParams Query parameters
   * @returns {Promise<Object>} Paginated products
   */
  getAllProducts: async (queryParams = {}) => {
    try {
      const response = await productService.get('/product/page/consumer', {
        params: {
          page: queryParams.page || 0,
          pageSize: queryParams.pageSize || 30,
          name: queryParams.name,
          description: queryParams.description,
          categoryId: queryParams.categoryId
        }
      });

      // 确保返回正确的数据结构
      if (response?.data) {
        return response;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Product service error:', error);
      throw error;
    }
  },
  
  /**
   * Get products for merchants with pagination
   * Backend endpoint: GET /product/page/merchant
   * Only returns products created by the merchant
   * @param {string} authToken Merchant auth token
   * @param {Object} queryParams Query parameters
   * @returns {Promise<Object>} Paginated products
   */
  getProductsByMerchant: async (authToken, queryParams = {}) => {
    try {
      // Merchant pagination params - includes sellerId from token
      const params = {
        page: queryParams.page || 1,
        pageSize: queryParams.pageSize || 30,
        name: queryParams.name,      // 支持模糊查询
        categoryId: queryParams.categoryId,  // 精确匹配
      };

      const response = await productService.get('/product/page/merchant', {
        headers: { authToken },
        params: params
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get merchant products:', error);
      throw error;
    }
  },
  
  /**
   * Create new product
   * Backend endpoint: POST /product
   */
  createProduct: async (authToken, productDTO) => {
    try {
      const response = await productService.post('/product', productDTO, {
        headers: { authToken }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  },
  
  /**
   * Update product
   * Backend endpoint: PUT /product
   */
  updateProduct: async (authToken, productDTO) => {
    try {
      // 确保必要的字段存在
      const payload = {
        productId: Number(productDTO.productId),
        name: productDTO.name,
        description: productDTO.description,
        price: Number(productDTO.price),
        categoryId: Number(productDTO.categoryId),
        sellerId: Number(productDTO.sellerId),
        availableStock: Number(productDTO.availableStock) || 0,
        imageUrls: Array.isArray(productDTO.imageUrls) ? productDTO.imageUrls : [],
        updateDatetime: new Date().toISOString(),
        updateUser: JSON.parse(localStorage.getItem('user'))?.username || 'system'
      };

            // 验证数据
      if (!payload.productId || isNaN(payload.productId)) {
        throw new Error('Invalid product ID');
      }

      const response = await productService.put('/product', payload, {
        headers: { authToken }
      });
      return response;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  },
  
  /**
   * Delete product
   * Backend endpoint: DELETE /product?id={id}
   */
  deleteProduct: async (id) => {
    try {
      const response = await productService.delete('/product', {
        params: { id }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  },

  /**
   * Upload product image
   * Backend endpoint: POST /product/image
   */
  uploadImage: async (authToken, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await productService.post('/product/image', formData, {
        headers: { 
          authToken,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  },

  /**
   * Delete product image
   * Backend endpoint: DELETE /product/image?file={file}
   */
  deleteImage: async (authToken, imageUrl) => {
    try {
      const response = await productService.delete('/product/image', {
        headers: { authToken },
        params: { file: imageUrl }
      });
      return response;
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  },
  /**
   * Get product by ID
   * Backend endpoint: GET /product
   * @param {number} id Product ID
   * @returns {Promise<Object>} Product details
   */
  getProductById: async (id) => {
    try {
      const response = await productService.get(`/product/${id}`);
      if (response?.data) {
        return {
          ...response.data,
          // 提供基本的库存状态信息给普通用户
          availableStock: response.data.availableStock > 0
        };
      }
      throw new Error('Product not found');
    } catch (error) {
      console.error('Failed to get product:', error);
      throw error;
    }
  },
};

// Export all services using environment check
export const {
  getAllProducts,
  getProductsByMerchant,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  deleteImage,
  getProductById  // 添加这一行
} = apiService;