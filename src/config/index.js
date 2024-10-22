// src/config/index.js

// API 配置
export const API_CONFIG = {
    BASE_URL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080',
    TIMEOUT: 10000,
    BATCH_TIMEOUT: 20000
  };
  
  // 环境配置
  export const ENV_CONFIG = {
    USE_MOCK: process.env.NODE_ENV === 'development', // 或者根据你的需求设置
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development'
  };
  
  // 认证配置
  export const AUTH_CONFIG = {
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    TOKEN_PREFIX: 'Bearer'
  };
  
  // 库存配置
  export const INVENTORY_CONFIG = {
    LOW_STOCK_THRESHOLD: 10,
    MAX_BATCH_SIZE: 100
  };