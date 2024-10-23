// src/store/cart.js
import { getCart, updateItemQuantity, removeItemFromCart, clearCart, 
    updateItemSelected, getSelectedItems, removeSelectedItems } from '@/service/cart';
  
  const state = {
    cart: null,
    cartItems: [],
    selectedItems: [], // New field for selected items
    loading: false,
    error: null,
    hasChanges: false
  };
  
  const mutations = {
    SET_CART(state, cart) {
      state.cart = cart;
    },
    SET_CART_ITEMS(state, items) {
      state.cartItems = items;
    },
    SET_SELECTED_ITEMS(state, items) {
      state.selectedItems = items;
    },
    UPDATE_ITEM_QUANTITY(state, { cartItemId, quantity }) {
      const item = state.cartItems.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.quantity = quantity;
        state.hasChanges = true;
      }
    },
    UPDATE_ITEM_SELECTED(state, { cartItemId, isSelected }) {
      const item = state.cartItems.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.isSelected = isSelected;
      }
    },
    REMOVE_CART_ITEM(state, cartItemId) {
      state.cartItems = state.cartItems.filter(item => item.cartItemId !== cartItemId);
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    CLEAR_CART(state) {
      state.cartItems = [];
      state.selectedItems = [];
      state.hasChanges = false;
    }
  };
  
  const actions = {
    async initializeCart({ commit }) {
      commit('SET_LOADING', true);
      try {
        const cart = await getCart();
        commit('SET_CART', cart);
        commit('SET_CART_ITEMS', cart.cartItems);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchCartItems({ commit }) {
      try {
        const items = await getCart();
        commit('SET_CART_ITEMS', items);
      } catch (error) {
        console.error('Failed to fetch cart items:', error);
      }
    },
  
    async updateQuantity({ commit, state }, { cartItemId, quantity }) {
      commit('SET_LOADING', true);
      try {
        await updateItemQuantity(state.cart.cartId, cartItemId, quantity);
        commit('UPDATE_ITEM_QUANTITY', { cartItemId, quantity });
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  
    async updateSelected({ commit, state }, { cartItemId, isSelected }) {
      commit('SET_LOADING', true);
      try {
        await updateItemSelected(state.cart.cartId, cartItemId, isSelected);
        commit('UPDATE_ITEM_SELECTED', { cartItemId, isSelected });
        
        // Update selected items list
        const selectedItems = await getSelectedItems(state.cart.cartId);
        commit('SET_SELECTED_ITEMS', selectedItems);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  
    async removeItem({ commit, state }, cartItemId) {
      commit('SET_LOADING', true);
      try {
        await removeItemFromCart(state.cart.cartId, cartItemId);
        commit('REMOVE_CART_ITEM', cartItemId);
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  
    async clearCart({ commit, state }) {
      commit('SET_LOADING', true);
      try {
        await clearCart(state.cart.cartId);
        commit('CLEAR_CART');
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  
    async removeSelectedItems({ commit, state }) {
      commit('SET_LOADING', true);
      try {
        await removeSelectedItems(state.cart.cartId);
        const cart = await getCart();
        commit('SET_CART_ITEMS', cart.cartItems);
        commit('SET_SELECTED_ITEMS', []);
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
        return total + (item.quantity * item.price);
      }, 0);
    },
    selectedItemsTotal: state => {
      return state.selectedItems.reduce((total, item) => {
        return total + (item.quantity * item.price);
      }, 0);
    },
    hasSelectedItems: state => state.selectedItems.length > 0,
    cartItemCount: state => state.cartItems.length
  };
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
  };