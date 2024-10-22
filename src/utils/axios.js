// src/utils/axios.js

import axios from 'axios';
import { handleApiResponse, handleApiError } from './apiResponseHandler';
import { ENV, isUseMock } from './env';

// Export mock service flag
export { isUseMock };
export const API_BASE_URL = ENV.API_BASE_URL;

const instance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem(ENV.TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `${ENV.TOKEN_PREFIX} ${token}`;
      config.headers['authToken'] = token;
    }
    
    // Special handling for batch inventory operations
    if (config.url.includes('/inventory/batch')) {
      config.timeout = ENV.API_BATCH_TIMEOUT;
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  response => {
    return handleApiResponse(response.data);
  },
  error => {
    // Special handling for inventory related errors
    if (error.config.url.includes('/inventory')) {
      if (error.response?.status === 409) {
        return Promise.reject(new Error('Stock level has changed. Please refresh and try again.'));
      }
      if (error.response?.status === 400) {
        return Promise.reject(new Error('Invalid stock operation. Please check your input.'));
      }
    }
    return Promise.reject(handleApiError(error));
  }
);

export default instance;