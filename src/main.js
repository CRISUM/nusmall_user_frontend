// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';  // 引入 Vuex store
import ErrorMessage from './components/ErrorMessage.vue';
import axios from 'axios';

const app = createApp(App);

// 创建一个全局的 ErrorMessage 实例
const errorMessageInstance = createApp(ErrorMessage).mount(document.createElement('div'));
document.body.appendChild(errorMessageInstance.$el);

// 提供全局的 showMessage 方法
app.provide('showMessage', errorMessageInstance.showMessage);

app.use(router);
app.use(store);  // 使用 Vuex store
app.mount('#app');

axios.defaults.baseURL = import.meta.env.VITE_APP_API_BASE_URL;

axios.interceptors.request.use(
    config => {
      // 如果是注册请求，不添加token
      if (config.url === '/api/user' && config.method.toLowerCase() === 'post') {
        return {
          ...config,
          headers: {
            'Content-Type': 'application/json'
          }
        };
      }
      
      // 其他请求添加token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['authToken'] = token;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
  
  // 添加响应拦截器
  axios.interceptors.response.use(
    response => response,
    error => {
      console.error('Request failed:', {
        url: error.config?.url,
        method: error.config?.method,
        error: error.response?.data || error.message
      });
      return Promise.reject(error);
    }
  );