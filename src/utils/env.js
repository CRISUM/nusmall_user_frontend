// src/utils/env.js

// Use import.meta.env for Vite environment variables
export const ENV = {
    // API configuration
    API_BASE_URL: import.meta.env.VITE_APP_API_BASE_URL || 'http://localhost:8080',
    NODE_ENV: import.meta.env.MODE,
    
    // Feature flags
    USE_MOCK: import.meta.env.MODE === 'development',
    IS_PRODUCTION: import.meta.env.MODE === 'production',
    IS_DEVELOPMENT: import.meta.env.MODE === 'development',
    
    // Other environment specific values
    API_TIMEOUT: 10000,
    API_BATCH_TIMEOUT: 20000,
    
    // Auth configuration 
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    TOKEN_PREFIX: 'Bearer'
  };
  
  // Helper functions for environment checks
  export const isDevelopment = () => ENV.NODE_ENV === 'development';
  export const isProduction = () => ENV.NODE_ENV === 'production';
  export const isUseMock = () => ENV.USE_MOCK;