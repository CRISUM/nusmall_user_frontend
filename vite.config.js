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
      '/api': {
        target: 'http://localhost:8084',  // 代理后端服务器
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/api/product': {
        target: 'http://nusmall.com:8081',
        changeOrigin: true
      },
      '/api/order': {
        target: 'http://nusmall.com:8082',
        changeOrigin: true
      },
      '/api/inventory': {
        target: 'http://nusmall.com:8083',
        changeOrigin: true
      },
      '/api/user': {
        target: 'http://nusmall.com:8084',
        changeOrigin: true
      },
      '/api/auth': {
        target: 'http://nusmall.com:8085',
        changeOrigin: true
      },
      '/api/cart': {
        target: 'http://nusmall.com:8086',
        changeOrigin: true
      }
    }
  }
})