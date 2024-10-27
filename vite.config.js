import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env': {}
  },
  server: {
    proxy: {
      '/users': {
        target: 'http://nusmall.com:8070',  // 统一指向网关
        changeOrigin: true
      },
      '/products': {
        target: 'http://nusmall.com:8070',
        changeOrigin: true
      },
      '/order': {
        target: 'http://nusmall.com:8070',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://nusmall.com:8070',
        changeOrigin: true
      }, 
      '/shopping-carts': { // 改为kebab-case风格匹配后端
        target: 'http://nusmall.com:8070',
        changeOrigin: true
      },
      '/inventories': {
        target: 'http://nusmall.com:8070', 
        changeOrigin: true
      },
      '/login': {          // 添加登录路径代理
        target: 'http://nusmall.com:8070',
        changeOrigin: true
      },
      '/getCurrentUserInfo': {  // 添加获取用户信息路径代理 
        target: 'http://nusmall.com:8070',
        changeOrigin: true
      },
      '/category': {
        target: 'http://nusmall.com:8070',
        changeOrigin: true
      }
    }
  }
})