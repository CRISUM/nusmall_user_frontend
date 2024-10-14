import { getCart, modifyCart, deleteCartItem as deleteCartItemApi } from '@/service/cart';

const state = {
    cartItems: [],
};

const mutations = {
    SET_CART_ITEMS(state, items) {
        state.cartItems = items;
    },
    UPDATE_CART_ITEM(state, updatedItem) {
        const index = state.cartItems.findIndex(item => item.cartItemId === updatedItem.cartItemId);
        if (index !== -1) {
            state.cartItems[index] = updatedItem;
        }
    },
    REMOVE_CART_ITEM(state, cartItemId) {
        state.cartItems = state.cartItems.filter(item => item.cartItemId !== cartItemId);
    },
};

const actions = {
    async fetchCartItems({ commit }) {
        const data = await getCart();
        commit('SET_CART_ITEMS', data);
    },
    async modifyCartItem({ commit }, { cartItemId, goodsCount }) {
        const updatedItem = await modifyCart({ cartItemId, goodsCount });
        commit('UPDATE_CART_ITEM', updatedItem);
    },
    async deleteCartItem({ commit }, cartItemId) {
        await deleteCartItemApi(cartItemId);
        commit('REMOVE_CART_ITEM', cartItemId);
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
};
