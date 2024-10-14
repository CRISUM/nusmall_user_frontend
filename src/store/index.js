// store/index.js
import { createStore } from 'vuex';
import cart from './cart';  // 引入 cart 模块

const store = createStore({
    modules: {
        cart  // 注册 cart 模块
    }
});

export default store;
