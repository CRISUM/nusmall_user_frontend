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

const baseInstance = axios.create({
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

baseInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem(ENV.TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `${ENV.TOKEN_PREFIX} ${token}`;
      config.headers['authToken'] = token;
    }
    return config;
  },
  error => Promise.reject(error)
);

baseInstance.interceptors.response.use(
  response => handleApiResponse(response.data),
  error => Promise.reject(handleApiError(error))
);

// Create service instances
export const productService = baseInstance.create({
  baseURL: ENV.PRODUCT_SERVICE_URL
});

export const orderService = baseInstance.create({
  baseURL: ENV.ORDER_SERVICE_URL
});

export const inventoryService = baseInstance.create({
  baseURL: ENV.INVENTORY_SERVICE_URL
});

export const userService = baseInstance.create({
  baseURL: ENV.USER_SERVICE_URL
});

export const cartService = baseInstance.create({
  baseURL: ENV.CART_SERVICE_URL
});

// Export default instance for backward compatibility
export default baseInstance;

// // Request interceptor
// instance.interceptors.request.use(
//   config => {
//     const token = localStorage.getItem(ENV.TOKEN_KEY);
//     if (token) {
//       config.headers['Authorization'] = `${ENV.TOKEN_PREFIX} ${token}`;
//       config.headers['authToken'] = token;
//     }

//     // Special handling for batch inventory operations
//     if (config.url.includes('/inventory/batch')) {
//       config.timeout = ENV.API_BATCH_TIMEOUT;
//     }

//     return config;
//   },
//   error => Promise.reject(error)
// );

// // Response interceptor
// instance.interceptors.response.use(
//   response => {
//     return handleApiResponse(response.data);
//   },
//   error => {
//     // Special handling for inventory related errors
//     if (error.config.url.includes('/inventory')) {
//       if (error.response?.status === 409) {
//         return Promise.reject(new Error('Stock level has changed. Please refresh and try again.'));
//       }
//       if (error.response?.status === 400) {
//         return Promise.reject(new Error('Invalid stock operation. Please check your input.'));
//       }
//     }
//     return Promise.reject(handleApiError(error));
//   }
// );

// // Export both default axios instance and named userService
// //export const userService = instance;
// //export default instance;

// export const productService = axios.create({
//   baseURL: ENV.PRODUCT_SERVICE_URL,
//   timeout: ENV.API_TIMEOUT
// });

// export const orderService = axios.create({
//   baseURL: ENV.ORDER_SERVICE_URL,
//   timeout: ENV.API_TIMEOUT
// });

// export const inventoryService = axios.create({
//   baseURL: ENV.INVENTORY_SERVICE_URL,
//   timeout: ENV.API_TIMEOUT
// });

// export const userService = axios.create({
//   baseURL: ENV.USER_SERVICE_URL,
//   timeout: ENV.API_TIMEOUT
// });

// export const authService = axios.create({
//   baseURL: ENV.AUTH_SERVICE_URL,
//   timeout: ENV.API_TIMEOUT
// });

// export const cartService = axios.create({
//   baseURL: ENV.CART_SERVICE_URL,
//   timeout: ENV.API_TIMEOUT
// });

// // Add interceptors to each service instance
// const addInterceptors = (instance) => {
//   instance.interceptors.request.use(
//     config => {
//       const token = localStorage.getItem(ENV.TOKEN_KEY);
//       if (token) {
//         config.headers['Authorization'] = `${ENV.TOKEN_PREFIX} ${token}`;
//         config.headers['authToken'] = token;
//       }
//       return config;
//     },
//     error => Promise.reject(error)
//   );

//   instance.interceptors.response.use(
//     response => response.data,
//     error => Promise.reject(error)
//   );
// };

// [productService, orderService, inventoryService, 
//  userService, authService, cartService].forEach(addInterceptors);
