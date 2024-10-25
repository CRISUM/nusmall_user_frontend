// src/service/product.js
import { productService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

// API Implementation
const apiService = {
  /**
   * Get all products with pagination
   * Backend endpoint: GET /product/page/consumer
   */
  getAllProducts: async (queryParams) => {
    try {
      const response = await productService.get('/product/page/consumer', {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  },
  
  /**
   * Get merchant products with pagination
   * Backend endpoint: GET /product/page/merchant
   */
  getProductsByMerchant: async (authToken, queryParams) => {
    try {
      const response = await productService.get('/product/page/merchant', {
        headers: { authToken },
        params: queryParams
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
      const response = await productService.put('/product', productDTO, {
        headers: { authToken }
      });
      return response.data;
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
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await productService.post('/product/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  },

  /**
   * Delete product image
   * Backend endpoint: DELETE /product/image?file={file}
   */
  deleteImage: async (file) => {
    try {
      const response = await productService.delete('/product/image', {
        params: { file }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }
};

// Export all services using environment check
const services = {
  getAllProducts: isUseMock() ? mockService.getAllProducts : apiService.getAllProducts,
  getProductsByMerchant: isUseMock() ? mockService.getProductsByMerchant : apiService.getProductsByMerchant,
  createProduct: isUseMock() ? mockService.createProduct : apiService.createProduct,
  updateProduct: isUseMock() ? mockService.updateProduct : apiService.updateProduct,
  deleteProduct: isUseMock() ? mockService.deleteProduct : apiService.deleteProduct,
  uploadImage: isUseMock() ? mockService.uploadImage : apiService.uploadImage,
  deleteImage: isUseMock() ? mockService.deleteImage : apiService.deleteImage
};

export const {
  getAllProducts,
  getProductsByMerchant,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  deleteImage
} = services;