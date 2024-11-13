// src/utils/axios.js
import axios from 'axios';
import { ENV, isUseMock} from './env';

/**
 * Create axios instance with specified base URL
 * @param {string} baseURL - Base URL for service
 * @returns {import('axios').AxiosInstance} Axios instance
 */
const createServiceInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: ENV.API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*'
    }
  });

  // Add request interceptor
  instance.interceptors.request.use(
    config => {
      const token = localStorage.getItem(ENV.TOKEN_KEY);
      if (token) {
        // config.headers['Authorization'] = `${ENV.TOKEN_PREFIX} ${token}`;
        config.headers['authToken'] = token;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Add response interceptor
  instance.interceptors.response.use(
    response => {
      // Log response for debugging
      console.log(`API Response [${response.config.url}]:`, response.data);
      return response.data;
    },
    error => {
      if (error.response?.status === 401) {
        store.dispatch('user/logout');
        router.push('/login');
      }
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

export { isUseMock };

// Create service instances with different base URLs
export const userService = createServiceInstance(ENV.USER_SERVICE_URL);
export const productService = createServiceInstance(ENV.PRODUCT_SERVICE_URL);
export const orderService = createServiceInstance(ENV.ORDER_SERVICE_URL); 
export const inventoryService = createServiceInstance(ENV.INVENTORY_SERVICE_URL);
export const cartService = createServiceInstance(ENV.CART_SERVICE_URL);
export const authService = createServiceInstance(ENV.AUTH_SERVICE_URL);
export const categoryService = createServiceInstance(ENV.CATEGORY_SERVICE_URL);
export const paymentService = createServiceInstance(ENV.PAYMENT_SERVICE_URL); 

// 默认实例
export default createServiceInstance(ENV.API_BASE_URL);

// Export batch request helpers
export const batchRequest = (requests) => {
  return Promise.all(requests.map(request => {
    const service = request.service || userService;
    return service(request);
  }));
};