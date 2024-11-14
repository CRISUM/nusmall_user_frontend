// src/utils/axios.js
import axios from 'axios';
import { ENV, isUseMock} from './env';
import router from '@/router';  // 添加这行
import store from '@/store'; 

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
      // 不需要 token 的接口列表
      const noTokenRequired = [
        '/api/user',  // 注册
        '/login',     // 登录
      ];
  
      // 判断当前请求是否需要 token
      const needsToken = !noTokenRequired.some(path => 
        config.url.includes(path) && config.method === 'post'
      );
  
      if (needsToken) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['authToken'] = token;
        }
      }
  
      console.log('Request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
  
      return config;
    },
    error => Promise.reject(error)
  );

  // Add response interceptor
  instance.interceptors.response.use(
    response => {
      console.log('Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
      return response.data;
    },
    error => {
      // 401处理
      if (error.response?.status === 401) {
        // 使用导入的store
        store.dispatch('user/clearUser');
        router.push('/api/login');
      }
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
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