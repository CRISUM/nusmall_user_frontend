// src/service/category.js
import { categoryService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

/**
 * Implementation of category management API endpoints
 * Maps to backend CategoryController endpoints
 */
const categoryApi = {
  /**
   * Add new category
   * Backend endpoint: POST /category
   * @param {string} authToken
   * @param {CategoryDTO} categoryDTO
   */
  async saveCategory(authToken, categoryDTO) {
    try {
      const response = await categoryService.post('/category', categoryDTO, {
        headers: { authToken }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to save category:', error);
      throw error;
    }
  },

  /**
   * Query categories with pagination
   * Backend endpoint: GET /category/page
   * @param {CategoryPageQueryDTO} queryParams
   */
  async pageQuery(queryParams) {
    try {
      const response = await categoryService.get('/category/page', {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      console.error('Failed to query categories:', error);
      throw error;
    }
  },

  /**
   * Delete category by ID
   * Backend endpoint: DELETE /category?id={id}
   * @param {number} id
   */
  async deleteCategory(id) {
    try {
      const response = await categoryService.delete('/category', {
        params: { id }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  },

  /**
   * Update category
   * Backend endpoint: PUT /category
   * @param {string} authToken
   * @param {CategoryDTO} categoryDTO
   */
  async updateCategory(authToken, categoryDTO) {
    try {
      const response = await categoryService.put('/category', categoryDTO, {
        headers: { authToken }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }
};

// Export services based on environment configuration
export const saveCategory = isUseMock() ? mockService.saveCategory : categoryApi.saveCategory;
/**
 * Query categories with pagination
 * @param {Object} queryParams
 * @returns {Promise<Object>}
 */
export const pageQuery = async (queryParams = {}) => {
  try {
    // 确保所有必需的参数都有默认值
    const params = {
      page: queryParams.page || 0,
      pageSize: queryParams.pageSize || 30,
      categoryId: queryParams.categoryId || 0,
      categoryName: queryParams.categoryName || ''
    };

    const response = await categoryService.get('/category/page', {
      params,
      headers: {
        'accept': '*/*',
        // 如果需要的话添加其他headers
      }
    });

    console.log('Category API response:', response);
    return response;
  } catch (error) {
    console.error('Failed to query categories:', error);
    throw error;
  }
};
export const deleteCategory = isUseMock() ? mockService.deleteCategory : categoryApi.deleteCategory;
export const updateCategory = isUseMock() ? mockService.updateCategory : categoryApi.updateCategory;

/**
 * @typedef {Object} CategoryDTO
 * @property {number} categoryId
 * @property {string} categoryName
 */

/**
 * @typedef {Object} CategoryPageQueryDTO
 * @property {number} page
 * @property {number} pageSize
 * @property {number} [categoryId]
 * @property {string} [categoryName]
 */