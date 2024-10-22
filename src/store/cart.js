// src/store/cart.js
import { getCart, modifyCart, deleteCartItem as deleteCartItemApi, 
    addToCart as addToCartApi, checkout as checkoutApi } from '@/service/cart';

const state = {
    cartItems: [],
    tempCartItems: [],
    loading: false,
    error: null,
    hasChanges: false
    };
      

const mutations = {
    SET_CART_ITEMS(state, items) {
        state.cartItems = items;
        state.tempCartItems = JSON.parse(JSON.stringify(items)); // 深拷贝到临时数据
        state.hasChanges = false;
    },
    UPDATE_TEMP_CART_ITEM(state, { cartItemId, goodsCount }) {
        const item = state.tempCartItems.find(item => item.cartItemId === cartItemId);
        if (item) {
            item.goodsCount = goodsCount;
            state.hasChanges = true;
        }
    },
    SAVE_TEMP_CHANGES(state) {
        state.cartItems = JSON.parse(JSON.stringify(state.tempCartItems));
        state.hasChanges = false;
    },
    REVERT_CHANGES(state) {
        state.tempCartItems = JSON.parse(JSON.stringify(state.cartItems));
        state.hasChanges = false;
    },
    REMOVE_CART_ITEM(state, cartItemId) {
        state.cartItems = state.cartItems.filter(item => item.cartItemId !== cartItemId);
        state.tempCartItems = state.tempCartItems.filter(item => item.cartItemId !== cartItemId);
    },
    SET_LOADING(state, status) {
        state.loading = status;
    },
    SET_ERROR(state, error) {
        state.error = error;
    },
    SET_CART_ITEMS(state, items) {
        state.cartItems = items;
        state.tempCartItems = JSON.parse(JSON.stringify(items));
        state.hasChanges = false;
    },

    CLEAR_CART(state) {
    state.cartItems = [];
    state.tempCartItems = [];
    state.hasChanges = false;
    }
};

const actions = {
    async fetchCartItems({ commit }) {
        commit('SET_LOADING', true);
        try {
            const data = await getCart();
            commit('SET_CART_ITEMS', data);
        } catch (error) {
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    updateTempQuantity({ commit }, { cartItemId, goodsCount }) {
        commit('UPDATE_TEMP_CART_ITEM', { cartItemId, goodsCount });
    },

    async saveChanges({ commit, state }) {
        commit('SET_LOADING', true);
        try {
            // 保存所有更改过的项目
            const promises = state.tempCartItems.map(async (tempItem) => {
                const originalItem = state.cartItems.find(item => item.cartItemId === tempItem.cartItemId);
                if (originalItem && originalItem.goodsCount !== tempItem.goodsCount) {
                    await modifyCart({
                        cartItemId: tempItem.cartItemId,
                        goodsCount: tempItem.goodsCount
                    });
                }
            });

            await Promise.all(promises);
            commit('SAVE_TEMP_CHANGES');
        } catch (error) {
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    revertChanges({ commit }) {
        commit('REVERT_CHANGES');
    },

    async deleteCartItem({ commit }, cartItemId) {
        commit('SET_LOADING', true);
        try {
            await deleteCartItemApi(cartItemId);
            commit('REMOVE_CART_ITEM', cartItemId);
        } catch (error) {
            commit('SET_ERROR', error.message);
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },

    async checkout({ commit }, checkoutData) {
        commit('SET_LOADING', true);
        try {
          await checkoutApi(checkoutData);
          commit('CLEAR_CART');
        } catch (error) {
          commit('SET_ERROR', error.message);
          throw error;
        } finally {
          commit('SET_LOADING', false);
        }
      }
};

const getters = {
    cartTotal: state => {
        return state.cartItems.reduce((total, item) => {
            return total + (item.goodsCount * item.sellingPrice);
        }, 0);
    },
    tempCartTotal: state => {
        return state.tempCartItems.reduce((total, item) => {
            return total + (item.goodsCount * item.sellingPrice);
        }, 0);
    },
    hasUnsavedChanges: state => state.hasChanges,
    tempCartItems: state => state.tempCartItems,
    cartItems: state => state.cartItems,
    tempCartItems: state => state.tempCartItems,
    cartTotal: state => {
        return state.cartItems.reduce((total, item) => {
        return total + (item.goodsCount * item.sellingPrice);
        }, 0);
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};