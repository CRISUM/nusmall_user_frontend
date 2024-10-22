// src/store/index.js
import { createStore } from 'vuex';
import cart from './cart';
import product from './product';
import inventory from './inventory';

const store = createStore({
    modules: {
        cart,
        product,
        inventory
    },
    // 添加全局错误处理
    mutations: {
        CLEAR_ALL_ERRORS(state) {
            // 清除所有模块的错误
            state.cart.error = null;
            state.product.error = null;
            state.inventory.error = null;
        }
    },
    actions: {
        clearAllErrors({ commit }) {
            commit('CLEAR_ALL_ERRORS');
        }
    }
});

export default store;