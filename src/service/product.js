// src/service/product.js
import axios from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/axios';

// API Implementation
const productApi = {
  getAllProducts: () => {
    return axios.get('/api/products').then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    });
  },
  
  getProductsByMerchant: (authToken) => {
    return axios.get('/api/merchant/products', {
      headers: { Authorization: `Bearer ${authToken}` }
    }).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    });
  },
  
  getProductById: (id) => {
    return axios.get(`/api/products/${id}`).then(response => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    });
  },
  
  createProduct: (authToken, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, productData[key]);
      }
    });
    if (productData.image) {
      formData.append('image', productData.image);
    }

    return axios.post('/api/products', formData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  updateProduct: (authToken, productId, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, productData[key]);
      }
    });
    if (productData.image) {
      formData.append('image', productData.image);
    }

    return axios.put(`/api/products/${productId}`, formData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  deleteProduct: (authToken, productId) => {
    return axios.delete(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  },
  
  getInventory: (authToken, productId) => {
    return axios.get(`/api/inventory/${productId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
  },
  
  updateInventory: (authToken, productId, quantity) => {
    return axios.put(`/api/inventory/${productId}`, 
      { availableStock: quantity },
      { headers: { Authorization: `Bearer ${authToken}` }}
    );
  },
  
  checkStock: (productId, quantity) => {
    return axios.get(`/api/inventory/${productId}/check?quantity=${quantity}`);
  },
  
  uploadImage: (authToken, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('/api/upload', formData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

// Export all services using environment check
const services = {
  getAllProducts: isUseMock ? mockService.getAllProducts : productApi.getAllProducts,
  getProductsByMerchant: isUseMock ? mockService.getProductsByMerchant : productApi.getProductsByMerchant,
  getProductById: isUseMock ? mockService.getProductById : productApi.getProductById,
  createProduct: isUseMock ? mockService.createProduct : productApi.createProduct,
  updateProduct: isUseMock ? mockService.updateProduct : productApi.updateProduct,
  deleteProduct: isUseMock ? mockService.deleteProduct : productApi.deleteProduct,
  getInventory: isUseMock ? mockService.getInventory : productApi.getInventory,
  updateInventory: isUseMock ? mockService.updateInventory : productApi.updateInventory,
  checkStock: isUseMock ? mockService.checkStock : productApi.checkStock,
  uploadImage: isUseMock ? mockService.uploadImage : productApi.uploadImage
};

// Export all services
export const {
  getAllProducts,
  getProductsByMerchant,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventory,
  updateInventory,
  checkStock,
  uploadImage
} = services;