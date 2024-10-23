// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';  // 引入 Vuex store
import ErrorMessage from './components/ErrorMessage.vue';
import StockLevel from '@/components/StockLevel.vue';

const app = createApp(App);

app.component('StockLevel', StockLevel);

// 创建一个全局的 ErrorMessage 实例
const errorMessageInstance = createApp(ErrorMessage).mount(document.createElement('div'));
document.body.appendChild(errorMessageInstance.$el);

// 提供全局的 showMessage 方法
app.provide('showMessage', errorMessageInstance.showMessage);

app.use(router);
app.use(store);  // 使用 Vuex store
app.mount('#app');
