// src/service/category.js
import { userService } from '@/utils/axios';
import * as mockService from '@/utils/mockService';
import { isUseMock } from '@/utils/env';

/**
 * Implementation of category management API endpoints
 * Maps to backend CategoryService.java
 */
const categoryApi = {
  /**
   * Add new category
   * Backend endpoint: POST /api/categories
   * @param {string} authToken
   * @param {Object} categoryDTO
   */
  async save(authToken, categoryDTO) {
    try {
      // TODO: Uncomment when backend is ready
      await userService.post('/api/categories', categoryDTO, {
        headers: { authToken }
      });
      //return mockService.saveCategory(categoryDTO);
    } catch (error) {
      console.error('Failed to save category:', error);
      throw error;
    }
  },

  /**
   * Query categories with pagination
   * Backend endpoint: GET /api/categories
   * @param {Object} categoryPageQueryDTO
   * @returns {Promise<Object>} Paginated category list
   */
  async pageQuery(categoryPageQueryDTO) {
    try {
      // TODO: Uncomment when backend is ready
      const response = await userService.get('/api/categories', {
        params: categoryPageQueryDTO
      });
      return response.data;
      //return mockService.queryCategoryPage(categoryPageQueryDTO);
    } catch (error) {
      console.error('Failed to query categories:', error);
      throw error;
    }
  },

  /**
   * Delete category by ID
   * Backend endpoint: DELETE /api/categories/{id}
   * @param {number} id
   */
  async deleteById(id) {
    try {
      // TODO: Uncomment when backend is ready
      await userService.delete(`/api/categories/${id}`);
      //return mockService.deleteCategory(id);
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  },

  /**
   * Update category
   * Backend endpoint: PUT /api/categories
   * @param {string} authToken
   * @param {Object} categoryDTO
   */
  async update(authToken, categoryDTO) {
    try {
      // TODO: Uncomment when backend is ready
      await userService.put('/api/categories', categoryDTO, {
        headers: { authToken }
      });
      //return mockService.updateCategory(categoryDTO);
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }
};

// Export services based on environment configuration
export const saveCategory = isUseMock() ? mockService.saveCategory : categoryApi.save;
export const pageQuery = isUseMock() ? mockService.queryCategoryPage : categoryApi.pageQuery;
export const deleteCategory = isUseMock() ? mockService.deleteCategory : categoryApi.deleteById;
export const updateCategory = isUseMock() ? mockService.updateCategory : categoryApi.update;

// Type definitions for TypeScript support
/**
 * @typedef {Object} CategoryDTO
 * @property {number} categoryId
 * @property {string} categoryName
 * @property {string} description
 */

/**
 * @typedef {Object} CategoryPageQueryDTO
 * @property {number} page
 * @property {number} pageSize
 * @property {number} [categoryId]
 * @property {string} [categoryName]
 */