// src/store/cart.js
import { getCart, updateItemQuantity, removeItemFromCart, clearCart, 
    updateItemSelected, getSelectedItems, removeSelectedItems } from '@/service/cart';
import { addToCart as addToCartService } from '@/service/cart';
  
  const state = {
    cart: {
      cartId: null,
      userId: null,
      cartItems: []
    },
    cartItems: [],
    selectedItems: [],
    loading: false,
    error: null,
    hasChanges: false
  };
    
  
  const mutations = {
    SET_CART(state, cart) {
      state.cart = cart || {
        cartId: Date.now(), // Generate temporary cartId if none exists
        userId: null,
        cartItems: []
      };
    },
    SET_CART_ITEMS(state, items) {
      // Ensure items is always an array
      state.cartItems = Array.isArray(items) ? items : [];
      // Also update cart object
      if (state.cart) {
        state.cart.cartItems = state.cartItems;
      }
    },
    SET_SELECTED_ITEMS(state, items) {
      state.selectedItems = Array.isArray(items) ? items : [];
    },  
    UPDATE_ITEM_QUANTITY(state, { cartItemId, quantity }) {
      const item = state.cartItems.find(item => item.cartItemId === cartItemId);
      if (item) {
        item.quantity = quantity;
        state.hasChanges = true;
      }
    },
    ADD_CART_ITEM(state, item) {
      const existingItem = state.cartItems.find(i => i.productId === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        state.cartItems.push(item);
      }
      // Also update cart object
      state.cart.cartItems = state.cartItems;
      state.hasChanges = true;
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
        const cartData = await getCart();
        
        // Ensure we have a valid cart structure
        const cart = {
          cartId: cartData?.cartId || Date.now(),
          userId: cartData?.userId || null,
          cartItems: Array.isArray(cartData?.cartItems) ? cartData.cartItems : []
        };
        
        commit('SET_CART', cart);
        commit('SET_CART_ITEMS', cart.cartItems);
        
        // Update selected items - ensure we're working with an array
        const selectedItems = Array.isArray(cart.cartItems) 
          ? cart.cartItems.filter(item => item.isSelected)
          : [];
        commit('SET_SELECTED_ITEMS', selectedItems);
      } catch (error) {
        console.error('Failed to initialize cart:', error);
        // Initialize with empty cart on error
        commit('SET_CART', {
          cartId: Date.now(),
          userId: null,
          cartItems: []
        });
        commit('SET_CART_ITEMS', []);
        commit('SET_SELECTED_ITEMS', []);
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async addToCart({ commit, dispatch }, cartItem) {
      commit('SET_LOADING', true);
      try {
        await addToCartService(cartItem);
        await dispatch('initializeCart'); // Refresh cart data
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
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);
    },
    
    selectedItemsTotal: state => {
      return state.selectedItems.reduce((total, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);
    },
    
    cartItemCount: state => state.cartItems.length,
    
    getCartItemById: state => productId => {
      return state.cartItems.find(item => item.productId === productId);
    },

    getCartItemQuantity: (state) => (productId) => {
      // Ensure we're working with an array
      const items = Array.isArray(state.cartItems) ? state.cartItems : [];
      const item = items.find(item => item.productId === productId);
      return item ? item.quantity : 0;
    },
  };
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
  };