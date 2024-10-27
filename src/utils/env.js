// src/utils/env.js

// Use import.meta.env for Vite environment variables
export const ENV = {
  // API configuration
  API_BASE_URL: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8080',
  NODE_ENV: import.meta.env.MODE,

  // Feature flags
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true',  // 从环境变量中读取 VITE_USE_MOCK 值

  IS_PRODUCTION: import.meta.env.MODE === 'production',
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',

  // Other environment specific values
  API_TIMEOUT: 10000,
  API_BATCH_TIMEOUT: 20000,

  // Auth configuration 
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  TOKEN_PREFIX: 'Bearer',

  // Add new service URLs
  PRODUCT_SERVICE_URL: (import.meta.env.VITE_APP_PRODUCT_SERVICE_URL || 'http://nusmall.com:8070') + '/products',
  ORDER_SERVICE_URL: (import.meta.env.VITE_APP_ORDER_SERVICE_URL || 'http://nusmall.com:8070') + '/orders',
  INVENTORY_SERVICE_URL: (import.meta.env.VITE_APP_INVENTORY_SERVICE_URL || 'http://nusmall.com:8070') + '/inventories',
  USER_SERVICE_URL: (import.meta.env.VITE_APP_USER_SERVICE_URL || 'http://nusmall.com:8070') + '/users',
  AUTH_SERVICE_URL: import.meta.env.VITE_APP_AUTH_SERVICE_URL || 'http://nusmall.com:8070',
  CART_SERVICE_URL: (import.meta.env.VITE_APP_CART_SERVICE_URL || 'http://nusmall.com:8070') + '/shoppingcarts',
  CATEGORY_SERVICE_URL: import.meta.env.VITE_APP_CATEGORY_SERVICE_URL || 'http://nusmall.com:8070',
};

// Helper functions for environment checks
export const isDevelopment = () => ENV.NODE_ENV === 'development';
export const isProduction = () => ENV.NODE_ENV === 'production';
export const isUseMock = () => ENV.USE_MOCK;