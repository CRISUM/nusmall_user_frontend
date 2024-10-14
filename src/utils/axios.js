import axios from 'axios';

  const instance = axios.create({
    baseURL: 'http://localhost:5173', // 或者你的后端 API 的实际 URL
    timeout: 5000
  })

   // 请求拦截器
   instance.interceptors.request.use(
     config => {
       const token = localStorage.getItem('token');
       if (token) {
         config.headers['Authorization'] = `Bearer ${token}`;
       }
       return config;
     },
     error => Promise.reject(error)
   );

   // 响应拦截器
   instance.interceptors.response.use(
     response => response,
     error => {
       if (error.response && error.response.status === 401) {
         // 处理未授权错误，例如重定向到登录页面
         router.push('/login');
       }
       return Promise.reject(error);
     }
   );

   export default instance;